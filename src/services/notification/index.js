'use strict';

const { Notification, DeviceToken } = require('../../models');
const paginate = require('../../utils/paginate');
const logger = require('../../config/logger');
const { pousser } = require('./push');

/**
 * Notifications utilisateur.
 *
 * `creer` enregistre en base **puis** tente la poussée : la notification reste
 * consultable dans l'application même si le push échoue ou n'est pas configuré.
 */
class NotificationService {
  static async creer({ userId, titre, message, type, donnees = {} }) {
    const notification = await Notification.create({ userId, titre, message, type, donnees });
    await pousser({ userId, titre, message, donnees: { ...donnees, type } });
    return notification;
  }

  /**
   * Notifie plusieurs destinataires. Utilisé quand un même évènement concerne
   * plusieurs vendeurs (commande multi-boutiques).
   */
  static creerPour(userIds, contenu) {
    const uniques = [...new Set(userIds.filter(Boolean))];
    return Promise.all(uniques.map((userId) => this.creer({ ...contenu, userId })));
  }

  /**
   * Émission « au mieux » : à utiliser depuis un flux métier, où l'échec d'une
   * notification ne doit jamais faire échouer l'opération principale.
   */
  static async emettre(contenu) {
    try {
      if (Array.isArray(contenu.userIds)) {
        const { userIds, ...reste } = contenu;
        return await this.creerPour(userIds, reste);
      }
      return await this.creer(contenu);
    } catch (err) {
      logger.error('Notification non émise', { error: err.message, type: contenu.type });
      return null;
    }
  }

  static async lister(userId, { page, limit, nonLues } = {}) {
    const { page: p, limit: l, offset } = paginate(page, limit);
    const where = { userId };
    if (nonLues === true || nonLues === 'true') where.lu = false;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: l,
      offset,
    });

    return {
      success: true,
      notifications: rows,
      pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l },
    };
  }

  static async compterNonLues(userId) {
    const total = await Notification.count({ where: { userId, lu: false } });
    return { success: true, total };
  }

  static async marquerLue(userId, id) {
    const [nb] = await Notification.update(
      { lu: true, luAt: new Date() },
      { where: { id, userId, lu: false } }
    );
    // Marquer deux fois n'est pas une erreur : l'appel doit rester idempotent.
    if (nb === 0) {
      const existe = await Notification.findOne({ where: { id, userId } });
      if (!existe) return { success: false, message: 'Notification introuvable' };
    }
    return { success: true, message: 'Notification lue' };
  }

  /** Appelé à l'ouverture de l'application : vide le bandeau de notifications. */
  static async toutMarquerLu(userId) {
    const [nb] = await Notification.update(
      { lu: true, luAt: new Date() },
      { where: { userId, lu: false } }
    );
    return { success: true, message: `${nb} notification(s) marquée(s) comme lue(s)`, total: nb };
  }

  // ── Appareils ───────────────────────────────────────────────────────────
  static async enregistrerAppareil(userId, { token, plateforme = 'android' }) {
    if (!token) return { success: false, message: 'Jeton manquant' };

    // Un appareil peut changer de compte : le jeton est réattribué, jamais dupliqué.
    const [appareil] = await DeviceToken.findOrCreate({
      where: { token },
      defaults: { userId, token, plateforme },
    });
    if (appareil.userId !== userId) await appareil.update({ userId, plateforme });

    return { success: true, message: 'Appareil enregistré' };
  }

  static async supprimerAppareil(userId, token) {
    await DeviceToken.destroy({ where: { token, userId } });
    return { success: true, message: 'Appareil retiré' };
  }
}

module.exports = NotificationService;
