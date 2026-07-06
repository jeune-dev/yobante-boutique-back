// ─────────────────────────────────────────────────────────────
// services/client/panier.service.js
// ─────────────────────────────────────────────────────────────
const { Panier, Produit } = require('../../models');

const FRAIS_LIVRAISON = 2000; // FCFA, forfait fixe

class PanierService {

  static async _buildPanier(userId) {
    const items = await Panier.findAll({
      where: { userId },
      include: [{ model: Produit, as: 'produit' }],
      order: [['createdAt', 'ASC']],
    });

    const lignes = items.map((item) => ({
      id: item.id,
      produit: item.produit,
      quantite: item.quantite,
      sousTotal: Number(item.produit.prix) * item.quantite,
    }));

    const sousTotal = lignes.reduce((sum, l) => sum + l.sousTotal, 0);
    const fraisLivraison = lignes.length ? FRAIS_LIVRAISON : 0;

    return { items: lignes, sousTotal, fraisLivraison, total: sousTotal + fraisLivraison };
  }

  static async getPanier(userId) {
    const panier = await PanierService._buildPanier(userId);
    return { success: true, ...panier };
  }

  static async ajouterAuPanier(userId, produitId, quantite = 1) {
    const produit = await Produit.findOne({ where: { id: produitId, isActive: true } });
    if (!produit) {
      return { success: false, message: "Produit introuvable" };
    }

    if (produit.stock < quantite) {
      return { success: false, message: "Stock insuffisant" };
    }

    const ligne = await Panier.findOne({ where: { userId, produitId } });
    if (ligne) {
      const nouvelleQuantite = ligne.quantite + quantite;
      if (produit.stock < nouvelleQuantite) {
        return { success: false, message: "Stock insuffisant" };
      }
      await ligne.update({ quantite: nouvelleQuantite });
    } else {
      await Panier.create({ userId, produitId, quantite });
    }

    const panier = await PanierService._buildPanier(userId);
    return { success: true, message: "Produit ajouté au panier", ...panier };
  }

  static async modifierQuantite(userId, produitId, quantite) {
    const ligne = await Panier.findOne({ where: { userId, produitId } });
    if (!ligne) {
      return { success: false, message: "Ce produit n'est pas dans votre panier" };
    }

    if (quantite === 0) {
      await ligne.destroy();
    } else {
      const produit = await Produit.findByPk(produitId);
      if (produit.stock < quantite) {
        return { success: false, message: "Stock insuffisant" };
      }
      await ligne.update({ quantite });
    }

    const panier = await PanierService._buildPanier(userId);
    return { success: true, message: "Panier mis à jour", ...panier };
  }

  static async retirerDuPanier(userId, produitId) {
    const ligne = await Panier.findOne({ where: { userId, produitId } });
    if (!ligne) {
      return { success: false, message: "Ce produit n'est pas dans votre panier" };
    }

    await ligne.destroy();
    return { success: true, message: "Produit retiré du panier" };
  }

  static async viderPanier(userId) {
    await Panier.destroy({ where: { userId } });
    return { success: true, message: "Panier vidé" };
  }
}

module.exports = PanierService;
