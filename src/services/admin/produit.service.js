const slugify = require('slugify');
const cloudinary = require('../../config/cloudinary');
const { Op } = require('sequelize');
const { Produit, Categorie } = require('../../models');
const { paginateResult } = require('../../utils/paginate');

async function createProduit(data, files = []) {
	const categorie = await Categorie.findByPk(data.categorieId);
	if (!categorie) {
		const err = new Error('Catégorie introuvable');
		err.status = 404;
		throw err;
	}

	const baseSlug = slugify(data.nom || 'produit', { lower: true, strict: true }).slice(0, 200);
	let slug = baseSlug;
	let i = 1;
	while (await Produit.findOne({ where: { slug } })) {
		slug = `${baseSlug}-${i++}`;
	}

	const images = [];
	if (files && files.length) {
		for (const f of files) {
			try {
				const uploaded = await new Promise((resolve, reject) => {
					const stream = cloudinary.uploader.upload_stream({ folder: 'yobante/produits' }, (err, res) => (err ? reject(err) : resolve(res)));
					require('streamifier').createReadStream(f.buffer).pipe(stream);
				});
				images.push(uploaded.secure_url);
			} catch (e) {
				console.error('[Cloudinary] upload échoué:', e.message);
			}
		}
	}

	const produit = await Produit.create({
		nom: data.nom,
		slug,
		description: data.description || null,
		prix: data.prix || 0,
		prixPromo: data.prixPromo || null,
		stock: data.stock || 0,
		categorieId: data.categorieId,
		images: images.length ? images : null,
		poids: data.poids || null,
		reference: data.reference || null,
		isActive: data.isActive !== undefined ? data.isActive : true,
		isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
	});

	return produit;
}

async function getProduitById(id) {
	const produit = await Produit.findByPk(id);
	if (!produit) {
		const err = new Error('Produit introuvable');
		err.status = 404;
		throw err;
	}
	return produit;
}

async function getAllProduits(filters = {}, pagination) {
	const where = {};
	if (filters.categorieId) where.categorieId = filters.categorieId;
	if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true' || filters.isActive === true;
	if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured === 'true' || filters.isFeatured === true;
	if (filters.prixMin) where.prix = { ...(where.prix || {}), [Op.gte]: Number(filters.prixMin) };
	if (filters.prixMax) where.prix = { ...(where.prix || {}), [Op.lte]: Number(filters.prixMax) };
	if (filters.search) where[Op.or] = [{ nom: { [Op.iLike]: `%${filters.search}%` } }, { description: { [Op.iLike]: `%${filters.search}%` } }];

	const { page, limit, offset } = pagination;
	const { rows, count } = await Produit.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset });
	return { rows, count, totalPages: paginateResult(count, page, limit).totalPages };
}

async function updateProduit(id, data, files = []) {
	const produit = await Produit.findByPk(id);
	if (!produit) {
		const err = new Error('Produit introuvable');
		err.status = 404;
		throw err;
	}

	if (data.nom && data.nom !== produit.nom) {
		const baseSlug = slugify(data.nom, { lower: true, strict: true }).slice(0, 200);
		let slug = baseSlug;
		let i = 1;
		while (await Produit.findOne({ where: { slug, id: { [Op.ne]: id } } })) {
			slug = `${baseSlug}-${i++}`;
		}
		produit.slug = slug;
		produit.nom = data.nom;
	}

	['description', 'prix', 'prixPromo', 'stock', 'categorieId', 'poids', 'reference', 'isActive', 'isFeatured'].forEach((k) => {
		if (data[k] !== undefined) produit[k] = data[k];
	});

	if (files && files.length) {
		const imgs = [];
		for (const f of files) {
			try {
				const uploaded = await new Promise((resolve, reject) => {
					const stream = cloudinary.uploader.upload_stream({ folder: 'yobante/produits' }, (err, res) => (err ? reject(err) : resolve(res)));
					require('streamifier').createReadStream(f.buffer).pipe(stream);
				});
				imgs.push(uploaded.secure_url);
			} catch (e) {
				console.error('[Cloudinary] upload échoué:', e.message);
			}
		}
		if (imgs.length) produit.images = imgs;
	}

	await produit.save();
	return produit;
}

async function deleteProduit(id) {
	const produit = await Produit.findByPk(id);
	if (!produit) {
		const err = new Error('Produit introuvable');
		err.status = 404;
		throw err;
	}
	produit.isActive = false;
	await produit.save();
	return { message: 'Produit désactivé' };
}

async function updateStock(id, quantite) {
	const produit = await Produit.findByPk(id);
	if (!produit) {
		const err = new Error('Produit introuvable');
		err.status = 404;
		throw err;
	}
	produit.stock = Number(quantite);
	await produit.save();
	return produit;
}

async function toggleFeatured(id) {
	const produit = await Produit.findByPk(id);
	if (!produit) throw Object.assign(new Error('Produit introuvable'), { status: 404 });
	produit.isFeatured = !produit.isFeatured;
	await produit.save();
	return produit;
}

async function toggleVisibilite(id) {
	const produit = await Produit.findByPk(id);
	if (!produit) throw Object.assign(new Error('Produit introuvable'), { status: 404 });
	produit.isActive = !produit.isActive;
	await produit.save();
	return produit;
}

async function importProduits(buffer) {
	const lines = buffer.toString('utf-8').split('\n').filter(Boolean);
	const headers = lines[0].split(',').map((h) => h.trim());
	const required = ['nom', 'prix', 'stock', 'categorieId'];
	const missing = required.filter((h) => !headers.includes(h));
	if (missing.length) {
		const error = new Error(`Colonnes manquantes dans le CSV : ${missing.join(', ')}`);
		error.status = 400;
		throw error;
	}

	const results = { created: 0, errors: [] };
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',').map((v) => v.trim());
		const row = {};
		headers.forEach((h, idx) => { row[h] = values[idx]; });
		try {
			await createProduit(row, []);
			results.created++;
		} catch (err) {
			results.errors.push({ ligne: i + 1, erreur: err.message });
		}
	}
	return results;
}

module.exports = {
	createProduit,
	getProduitById,
	getAllProduits,
	updateProduit,
	deleteProduit,
	updateStock,
	toggleFeatured,
	toggleVisibilite,
	importProduits,
};
