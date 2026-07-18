/**
 * Script CLI pour promouvoir un utilisateur en ADMIN.
 * Usage : node scripts/grant-admin.js email@example.com
 */
require('dotenv').config();
const sequelize = require('../src/config/db');
require('../src/models');
const { User } = require('../src/models');

const email = process.argv[2];
if (!email) {
  console.error('Usage : node scripts/grant-admin.js <email>');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error(`Aucun utilisateur trouvé avec l'email : ${email}`);
      process.exit(1);
    }

    await user.update({ role: 'ADMIN', isActive: true });
    console.log(`✔ ${user.prenom} ${user.nom} (${email}) est maintenant ADMIN.`);
    process.exit(0);
  } catch (err) {
    console.error('Erreur :', err.message);
    process.exit(1);
  }
})();
