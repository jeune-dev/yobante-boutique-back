// ─────────────────────────────────────────────────────────────
// scripts/create-test-admin.js — Crée un admin de test
// Usage : node scripts/create-test-admin.js
// ─────────────────────────────────────────────────────────────
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function main() {
  const { User, sequelize } = require('../src/models');

  try {
    const email = 'test@gmil.com';
    const password = 'Passer';

    const existant = await User.findOne({ where: { email } });
    if (existant) {
      console.log(`✅ Admin de test existe déjà : ${email}`);
      await sequelize.close();
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      nom: 'Test',
      prenom: 'Admin',
      email,
      password: hashed,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    });

    console.log(`✅ Admin de test créé avec succès !`);
    console.log(`   Email    : ${email}`);
    console.log(`   Password : ${password}`);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  } finally {
    const { sequelize } = require('../src/models');
    await sequelize.close();
  }
}

main();
