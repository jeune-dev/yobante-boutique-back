/**
 * Entry point du serveur Yobante Boutique
 * 
 * Importe et démarre le serveur depuis server.js
 * Cela permet une meilleure séparation des concerns:
 * - app.js = configuration Express
 * - server.js = démarrage et logique applicative
 * - index.js = point d'entrée
 */

require('./server');
