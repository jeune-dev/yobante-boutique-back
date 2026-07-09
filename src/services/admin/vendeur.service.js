const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, ProfilVendeur, Produit, sequelize } = require('../../models');
const { bcryptConfig } = require('../../config/security');
const { ROLES } = require('../../constants');
const paginate = require('../../utils/paginate');

class GestionVendeurService {
  static async creerVendeur(data, adminId) {
    const t = await sequelize.transaction();
    try {
      const emailClean = data.email.trim().toLowerCase();
      const exist = await User.findOne({ where: { email: emailClean }, transaction: t });
      if (exist) {
        await t.rollback();
        return { success: false, message: 'Cet email est déjà utilisé' };
      }

      const hashedPassword = await bcrypt.hash(data.password, bcryptConfig.saltRounds);

      const user = await User.create(
        {
          nom: data.nom,
          prenom: data.prenom,
          email: emailClean,
          password: hashedPassword,
          telephone: data.telephone,
          role: ROLES.VENDEUR,
          isVerified: true,
          isActive: false,
        },
        { transaction: t }
      );

      const profil = await ProfilVendeur.create(
        {
          userId: user.id,
          nomBoutique: data.nomBoutique,
          description: data.description,
          infoLegale: data.infoLegale,
          adresseBoutique: data.adresseBoutique,
          telephone: data.telephone,
        },
        { transaction: t }
      );

      await t.commit();
      return { success: true, message: 'Compte vendeur créé avec succès', user, profil };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async listerVendeurs({ page, limit, search, statut } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);

    const whereUser = { role: ROLES.VENDEUR };
    if (search) {
      whereUser[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { prenom: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const whereProfil = {};
    if (statut === 'en_attente') {
      whereProfil.isValidatedStep1 = false;
      whereProfil.isValidatedStep2 = false;
    } else if (statut === 'step1') {
      whereProfil.isValidatedStep1 = true;
      whereProfil.isValidatedStep2 = false;
    } else if (statut === 'valide') {
      whereProfil.isActive = true;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereUser,
      include: [
        {
          model: ProfilVendeur,
          as: 'profilVendeur',
          where: Object.keys(whereProfil).length ? whereProfil : undefined,
          required: false,
        },
      ],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: l,
      offset,
    });

    return {
      success: true,
      vendeurs: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async getVendeur(id) {
    const user = await User.findOne({
      where: { id, role: ROLES.VENDEUR },
      attributes: { exclude: ['password'] },
      include: [
        { model: ProfilVendeur, as: 'profilVendeur' },
        { model: Produit, as: 'produits', limit: 5, order: [['createdAt', 'DESC']] },
      ],
    });
    if (!user) return { success: false, message: 'Vendeur introuvable' };
    return { success: true, vendeur: user };
  }

  /**
   * Première validation admin — protégée contre la double validation simultanée.
   * UPDATE atomique WHERE isValidatedStep1 = false : si deux admins cliquent en même temps,
   * un seul verra nbRows=1 (succès), l'autre verra nbRows=0 (déjà fait).
   */
  static async validerStep1(id, adminId) {
    const [nbRows] = await ProfilVendeur.update(
      { isValidatedStep1: true, noteStep1By: adminId },
      { where: { userId: id, isValidatedStep1: false } }
    );

    if (nbRows === 0) {
      const profil = await ProfilVendeur.findOne({ where: { userId: id } });
      if (!profil) return { success: false, message: 'Profil vendeur introuvable' };
      return { success: false, message: 'Étape 1 déjà validée' };
    }

    const profil = await ProfilVendeur.findOne({ where: { userId: id } });
    return { success: true, message: 'Étape 1 de validation effectuée', profil };
  }

  /**
   * Deuxième validation admin — idem : WHERE isValidatedStep1=true AND isValidatedStep2=false.
   * Active le compte utilisateur dans la même transaction.
   */
  static async validerStep2(id, adminId) {
    const t = await sequelize.transaction();
    try {
      const [nbRows] = await ProfilVendeur.update(
        { isValidatedStep2: true, isActive: true, noteStep2By: adminId },
        { where: { userId: id, isValidatedStep1: true, isValidatedStep2: false }, transaction: t }
      );

      if (nbRows === 0) {
        await t.rollback();
        const profil = await ProfilVendeur.findOne({ where: { userId: id } });
        if (!profil) return { success: false, message: 'Profil vendeur introuvable' };
        if (!profil.isValidatedStep1)
          return { success: false, message: "L'étape 1 doit être validée d'abord" };
        return { success: false, message: 'Étape 2 déjà validée' };
      }

      await User.update({ isActive: true }, { where: { id }, transaction: t });
      await t.commit();

      const profil = await ProfilVendeur.findOne({ where: { userId: id } });
      return { success: true, message: 'Vendeur entièrement validé et activé', profil };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async rejeterVendeur(id, motifRejet) {
    const t = await sequelize.transaction();
    try {
      const [nbRows] = await ProfilVendeur.update(
        { isValidatedStep1: false, isValidatedStep2: false, isActive: false, motifRejet },
        { where: { userId: id }, transaction: t }
      );
      if (nbRows === 0) {
        await t.rollback();
        return { success: false, message: 'Profil vendeur introuvable' };
      }
      await User.update({ isActive: false }, { where: { id }, transaction: t });
      await t.commit();
      return { success: true, message: 'Vendeur rejeté' };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async toggleActivation(id) {
    const t = await sequelize.transaction();
    try {
      const user = await User.findOne({
        where: { id, role: ROLES.VENDEUR },
        transaction: t,
        lock: true,
      });
      if (!user) {
        await t.rollback();
        return { success: false, message: 'Vendeur introuvable' };
      }

      const newState = !user.isActive;
      await User.update({ isActive: newState }, { where: { id }, transaction: t });
      await ProfilVendeur.update({ isActive: newState }, { where: { userId: id }, transaction: t });
      await t.commit();

      return { success: true, message: `Vendeur ${newState ? 'activé' : 'désactivé'}` };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async updateProfil(id, data) {
    const profil = await ProfilVendeur.findOne({ where: { userId: id } });
    if (!profil) return { success: false, message: 'Profil vendeur introuvable' };
    await profil.update(data);
    return { success: true, message: 'Profil mis à jour', profil };
  }
}

module.exports = GestionVendeurService;
