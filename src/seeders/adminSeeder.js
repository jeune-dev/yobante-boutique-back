require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const User = require('../models/User.model');

async function seedAdmin() {
  try {
    await sequelize.authenticate();

    const existing = await User.findOne({ where: { role: 'admin' } });
    if (existing) {
      console.log('Un compte admin existe déjà :', existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    const admin = await User.create({
      nom: process.env.ADMIN_NOM || 'Admin',
      prenom: process.env.ADMIN_PRENOM || 'Super',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
    });

    console.log('Admin créé avec succès :', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin :', error.message);
    process.exit(1);
  }
}

seedAdmin();
