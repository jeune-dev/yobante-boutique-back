const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, ProfilVendeur, Produit, sequelize } = require('../../models');
const { bcryptConfig } = require('../../config/security');
const { ROLES } = require('../../constants');
const paginate = require('../../utils/paginate');

class GestionVendeurService {
  static _generatePassword(length = 7) {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const all = upper + lower + digits;
    let pwd = upper[Math.floor(Math.random() * upper.length)];
    pwd += digits[Math.floor(Math.random() * digits.length)];
    for (let i = 2; i < length; i++) pwd += all[Math.floor(Math.random() * all.length)];
    return pwd
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  static async creerVendeur(data, adminId) {
    const t = await sequelize.transaction();
    try {
      const emailClean = data.email.trim().toLowerCase();
      const exist = await User.findOne({ where: { email: emailClean }, transaction: t });
      if (exist) {
        await t.rollback();
        return { success: false, message: 'Cet email est déjà utilisé' };
      }

      const plainPassword = GestionVendeurService._generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, bcryptConfig.saltRounds);

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
          mustChangePassword: true,
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

      // Envoyer l'email après commit (hors transaction)
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'Yobante Boutique <noreply@yobante.com>',
          to: emailClean,
          subject: 'Bienvenue sur Yobante Boutique — Vos accès vendeur',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2>Bonjour ${data.prenom} ${data.nom},</h2>
              <p>Nous avons créé un compte <strong>vendeur</strong> pour vous sur <strong>Yobante Boutique</strong>.</p>
              <p>Voici vos identifiants de connexion :</p>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;font-weight:bold">Lien de connexion</td><td style="padding:8px"><a href="${process.env.FRONTEND_URL || '#'}">${process.env.FRONTEND_URL || 'https://yobante.com'}</a></td></tr>
                <tr><td style="padding:8px;font-weight:bold">Identifiant (email)</td><td style="padding:8px">${emailClean}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Téléphone</td><td style="padding:8px">${data.telephone || '—'}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Mot de passe temporaire</td><td style="padding:8px;font-family:monospace;font-size:18px;letter-spacing:2px"><strong>${plainPassword}</strong></td></tr>
              </table>
              <p style="margin-top:16px;color:#e53e3e"><strong>Important :</strong> Lors de votre première connexion, vous devrez obligatoirement changer ce mot de passe.</p>
              <p>À bientôt sur Yobante Boutique !</p>
            </div>
          `,
        });
      } catch (mailErr) {
        require('../config/logger').error('[Vendeur] Email non envoyé', { error: mailErr.message });
      }

      const { password: _pw, ...userSafe } = user.toJSON();
      return { success: true, message: 'Compte vendeur créé avec succès', user: userSafe, profil };
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
