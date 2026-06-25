const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { rateLimit } = require('./middlewares/rateLimit.middleware');
const { corsConfig } = require('./config/security');
const errorMiddleware = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.route');
const adminCategorieRoutes = require('./routes/admin/categorie.route');
const adminAvisRoutes = require('./routes/admin/avis.route');
const adminCommandeRoutes = require('./routes/admin/commande.route');
const adminDashboardRoutes = require('./routes/admin/dashboard.route');
const adminPaiementRoutes = require('./routes/admin/paiement.route');
const adminProduitRoutes = require('./routes/admin/produit.route');
const adminUserRoutes = require('./routes/admin/user.route');
const clientCommandeRoutes = require('./routes/client/commande.route');
const clientPanierRoutes = require('./routes/client/panier.route');
const clientProduitRoutes = require('./routes/client/produit.route');
const clientProfilRoutes = require('./routes/client/profil.route');
const clientAvisRoutes = require('./routes/client/avis.route');
const clientCategorieRoutes = require('./routes/client/categorie.route');
const paiementRoutes = require('./routes/paiement.route');

const app = express();

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit);

app.use('/api/auth', authRoutes);
app.use('/api/admin/categories', adminCategorieRoutes);
app.use('/api/admin/avis', adminAvisRoutes);
app.use('/api/admin/commandes', adminCommandeRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/paiements', adminPaiementRoutes);
app.use('/api/admin/produits', adminProduitRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/client/commandes', clientCommandeRoutes);
app.use('/api/client/panier', clientPanierRoutes);
app.use('/api/client/produits', clientProduitRoutes);
app.use('/api/client/profil', clientProfilRoutes);
app.use('/api/client/avis', clientAvisRoutes);
app.use('/api/client/categories', clientCategorieRoutes);
app.use('/api/paiement', paiementRoutes);

app.use((req, res, next) => {
  const error = new Error('Ressource non trouvée');
  error.status = 404;
  next(error);
});

app.use(errorMiddleware);

module.exports = app;
