// ─────────────────────────────────────────────────────────────
// services/client/boutique.service.js
// Liste publique des boutiques (profils vendeurs) pour l'app cliente.
// ─────────────────────────────────────────────────────────────
const { ProfilVendeur, User } = require('../../models');

// Include commun pour charger le vendeur (User) d'une boutique.
const USER_INCLUDE = [
  { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'telephone'] },
];

class BoutiqueClientService {
  /**
   * Sérialise un ProfilVendeur (avec son `user`) au format attendu par l'app
   * mobile (BoutiqueModel) : { id, nom, description, localisation, telephone, logo, vendeur }.
   */
  static serialiser(p) {
    return {
      id: p.id,
      nom: p.nomBoutique,
      description: p.description || '',
      localisation: p.adresseBoutique || '',
      telephone: p.telephone || (p.user && p.user.telephone) || null,
      logo: p.logo || null,
      heure_ouverture: null,
      heure_fermeture: null,
      vendeur: p.user
        ? {
            id: p.user.id,
            nom: p.user.nom,
            prenom: p.user.prenom,
            telephone: p.user.telephone,
          }
        : null,
    };
  }

  /** Liste des boutiques (profils vendeurs). */
  static async listeBoutiques() {
    const profils = await ProfilVendeur.findAll({
      include: USER_INCLUDE,
      order: [['createdAt', 'DESC']],
    });

    return { success: true, boutiques: profils.map(BoutiqueClientService.serialiser) };
  }
}

module.exports = BoutiqueClientService;
