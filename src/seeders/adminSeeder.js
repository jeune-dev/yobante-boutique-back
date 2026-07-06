// ─────────────────────────────────────────────────────────────
// seeders/adminSeeder.js — Création du compte admin initial
// ─────────────────────────────────────────────────────────────
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');
const { bcryptConfig } = require('../config/security');
const logger = require('../config/logger');

/**
 * Seed admin user
 * Crée un compte admin s'il n'existe pas déjà
 * N'appelle jamais process.exit() pour ne pas tuer le serveur
 */
async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@yobante.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin1234!';
    const nom = process.env.ADMIN_NOM || 'Admin';
    const prenom = process.env.ADMIN_PRENOM || 'Yobante';

    // Vérifier si admin existe déjà
    const existant = await User.findOne({ where: { email } });
    if (existant) {
      logger.debug(`Admin existe déjà : ${email}`);
      return;
    }

    // Créer l'admin
    const hashedPassword = await bcrypt.hash(password, bcryptConfig.saltRounds);
    await User.create({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    });

    logger.info(`✅ Admin créé : ${email}`);
  } catch (err) {
    logger.error('❌ Erreur seed admin', { error: err.message });
    throw err;
  }
}

module.exports = seedAdmin;
