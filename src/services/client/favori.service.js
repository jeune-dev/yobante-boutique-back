// ─────────────────────────────────────────────────────────────
// services/client/favori.service.js
// Favoris client : boutiques (ProfilVendeur) mises en favori par un utilisateur.
// ─────────────────────────────────────────────────────────────
const { Favori, ProfilVendeur, User } = require('../../models');
const BoutiqueClientService = require('./boutique.service');

class FavoriClientService {
  /** Liste des boutiques favorites de l'utilisateur (format BoutiqueModel). */
  static async mesFavoris(userId) {
    const favoris = await Favori.findAll({
      where: { userId },
      include: [
        {
          model: ProfilVendeur,
          as: 'boutique',
          include: [{ model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'telephone'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const boutiques = favoris
      .filter((f) => f.boutique)
      .map((f) => BoutiqueClientService.serialiser(f.boutique));

    return { success: true, boutiques };
  }

  /** Ajoute une boutique aux favoris (idempotent). */
  static async ajouter(userId, profilVendeurId) {
    if (!profilVendeurId) {
      return { success: false, message: 'boutiqueId requis' };
    }
    const boutique = await ProfilVendeur.findByPk(profilVendeurId);
    if (!boutique) {
      return { success: false, message: 'Boutique introuvable' };
    }
    await Favori.findOrCreate({ where: { userId, profilVendeurId } });
    return { success: true, message: 'Boutique ajoutée aux favoris' };
  }

  /** Retire une boutique des favoris. */
  static async supprimer(userId, profilVendeurId) {
    await Favori.destroy({ where: { userId, profilVendeurId } });
    return { success: true, message: 'Boutique retirée des favoris' };
  }
}

module.exports = FavoriClientService;
