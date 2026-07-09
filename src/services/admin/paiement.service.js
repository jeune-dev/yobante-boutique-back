// ─────────────────────────────────────────────────────────────
// services/admin/paiement.service.js
// ─────────────────────────────────────────────────────────────
const { Op } = require('sequelize');
const { Paiement, Commande, User } = require('../../models');
const paginate = require('../../utils/paginate');

class GestionPaiementService {
  static async getAllPaiements({ page, limit, statut, methode, userId, dateDebut, dateFin } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);

    const where = {};
    if (statut) where.statut = statut;
    if (methode) where.methode = methode;
    if (userId) where.userId = userId;
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt[Op.gte] = new Date(dateDebut);
      if (dateFin) where.createdAt[Op.lte] = new Date(dateFin);
    }

    const { count, rows } = await Paiement.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: Commande, as: 'commande' },
      ],
      order: [['createdAt', 'DESC']],
      limit: l,
      offset,
    });

    return {
      success: true,
      paiements: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async getPaiementById(id) {
    const paiement = await Paiement.findByPk(id, {
      include: [
        { model: Commande, as: 'commande' },
        { model: User, as: 'user' },
      ],
    });

    if (!paiement) {
      return { success: false, message: 'Paiement introuvable' };
    }

    return { success: true, paiement };
  }

  static async getPaiementByCommande(commandeId) {
    const paiement = await Paiement.findOne({
      where: { commandeId },
      include: [
        { model: Commande, as: 'commande' },
        { model: User, as: 'user' },
      ],
    });

    if (!paiement) {
      return { success: false, message: 'Aucun paiement trouvé pour cette commande' };
    }

    return { success: true, paiement };
  }

  static async confirmerPaiement(id, transactionId) {
    const paiement = await Paiement.findByPk(id);
    if (!paiement) {
      return { success: false, message: 'Paiement introuvable' };
    }

    if (paiement.statut !== 'en_attente') {
      return { success: false, message: 'Seul un paiement en attente peut être confirmé' };
    }

    // NOTE : confirmation manuelle en attendant une vraie intégration webhook
    // avec l'opérateur de paiement (Wave / Orange Money / carte).
    await paiement.update({
      statut: 'succes',
      transactionId: transactionId || null,
      payeAt: new Date(),
    });

    return { success: true, message: 'Paiement confirmé avec succès', paiement };
  }

  static async rembourserPaiement(id, raison) {
    const paiement = await Paiement.findByPk(id);
    if (!paiement) {
      return { success: false, message: 'Paiement introuvable' };
    }

    if (paiement.statut !== 'succes') {
      return { success: false, message: 'Seul un paiement réussi peut être remboursé' };
    }

    // NOTE : l'appel à l'API de l'opérateur de paiement (Wave / Orange Money / carte)
    // n'est pas implémenté ici — à brancher selon le prestataire retenu.
    await paiement.update({ statut: 'rembourse' });

    return { success: true, message: 'Paiement remboursé avec succès', paiement };
  }

  static async getRevenusTotal({ dateDebut, dateFin } = {}) {
    const where = { statut: 'succes' };
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt[Op.gte] = new Date(dateDebut);
      if (dateFin) where.createdAt[Op.lte] = new Date(dateFin);
    }

    const [total, nbTransactions] = await Promise.all([
      Paiement.sum('montant', { where }),
      Paiement.count({ where }),
    ]);

    return { success: true, total: Math.round((total || 0) * 100) / 100, nbTransactions };
  }
}

module.exports = GestionPaiementService;
