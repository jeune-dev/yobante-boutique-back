const produitService = require('../../services/admin/produit.service');
const { paginate } = require('../../utils/paginate');
const { success } = require('../../utils/formatResponse');

async function create(req, res, next) {
	try {
		const produit = await produitService.createProduit(req.body, req.files);
		return success(res, produit, 'Produit créé', 201);
	} catch (err) {
		next(err);
	}
}

async function getAll(req, res, next) {
	try {
		const pagination = paginate(req.query);
		const result = await produitService.getAllProduits(req.query, pagination);
		return success(res, result, 'Produits récupérés');
	} catch (err) {
		next(err);
	}
}

async function getOne(req, res, next) {
	try {
		const produit = await produitService.getProduitById(req.params.id);
		return success(res, produit, 'Produit récupéré');
	} catch (err) {
		next(err);
	}
}

async function update(req, res, next) {
	try {
		const produit = await produitService.updateProduit(req.params.id, req.body, req.files);
		return success(res, produit, 'Produit mis à jour');
	} catch (err) {
		next(err);
	}
}

async function remove(req, res, next) {
	try {
		const result = await produitService.deleteProduit(req.params.id);
		return success(res, null, result.message);
	} catch (err) {
		next(err);
	}
}

async function updateStock(req, res, next) {
	try {
		const produit = await produitService.updateStock(req.params.id, req.body.quantite);
		return success(res, produit, 'Stock mis à jour');
	} catch (err) {
		next(err);
	}
}

async function toggleFeatured(req, res, next) {
	try {
		const produit = await produitService.toggleFeatured(req.params.id);
		return success(res, produit, 'Statut featured inversé');
	} catch (err) {
		next(err);
	}
}

async function toggleVisibilite(req, res, next) {
	try {
		const produit = await produitService.toggleVisibilite(req.params.id);
		return success(res, produit, 'Visibilité inversée');
	} catch (err) {
		next(err);
	}
}

module.exports = {
	create,
	getAll,
	getOne,
	update,
	remove,
	updateStock,
	toggleFeatured,
	toggleVisibilite,
};

async function importProduits(req, res, next) {
	try {
		if (!req.file) {
			const err = new Error('Fichier CSV requis');
			err.status = 400;
			throw err;
		}
		const result = await produitService.importProduits(req.file.buffer);
		return success(res, result, `Import terminé : ${result.created} produit(s) créé(s)`);
	} catch (err) {
		next(err);
	}
}

module.exports.importProduits = importProduits;

