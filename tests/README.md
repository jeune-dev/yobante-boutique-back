# Guide des Tests - Yobante Boutique Backend

## 📋 Configuration

### Installation des dépendances de test

```bash
npm install
```

Cela installera Jest, Supertest et autres dépendances de test automatiquement.

## 🧪 Exécuter les tests

### Tous les tests
```bash
npm test
```

### Tests en mode watch (développement)
```bash
npm run test:watch
```

### Tests unitaires uniquement
```bash
npm run test:unit
```

### Tests d'intégration uniquement
```bash
npm run test:integration
```

### Couverture de code
```bash
npm run test:coverage
```

## 📁 Structure des tests

```
tests/
├── setup.js                          # Configuration globale des tests
├── fixtures/
│   └── user.fixture.js              # Données de test pour les utilisateurs
├── unit/
│   ├── services/
│   │   └── auth.service.test.js    # Tests du service d'authentification
│   ├── middlewares/
│   │   └── auth.middleware.test.js # Tests du middleware d'auth
│   └── models/
│       └── user.model.test.js       # Tests du modèle User
└── integration/
    └── auth.integration.test.js      # Tests d'intégration API auth
```

## ✅ Couverture actuelle

### Tests unitaires
- ✅ `AuthService` - Inscription, connexion, refresh token, changement mot de passe
- ✅ `Auth Middleware` - Validation token, utilisateur actif, permissions
- ✅ `User Model` - Schéma et contraintes

### Tests d'intégration
- ✅ `Auth API` - Endpoints complets (register, login, logout, refresh, reset password)

## 🚀 Ajouter de nouveaux tests

### Exemple : Test unitaire simple

```javascript
// tests/unit/services/myService.test.js
const MyService = require('../../../src/services/myService');

describe('MyService', () => {
  it('devrait faire quelque chose', async () => {
    const result = await MyService.doSomething();
    expect(result).toBeDefined();
  });
});
```

### Exemple : Test d'intégration API

```javascript
// tests/integration/myApi.integration.test.js
const request = require('supertest');
const app = require('../../../src/index');

describe('My API', () => {
  it('GET /api/my-endpoint devrait retourner 200', async () => {
    const res = await request(app).get('/api/my-endpoint');
    expect(res.status).toBe(200);
  });
});
```

## 🔧 Configuration Jest

La configuration se trouve dans `jest.config.js` :
- **Timeout** : 10 secondes par test
- **Coverage** : Exclut les fichiers config et documentation
- **Setup** : `tests/setup.js` exécuté avant chaque test

## 📊 Couverture cible

Nous visons :
- **Services** : 90%+
- **Controllers** : 80%+
- **Middlewares** : 95%+
- **Modèles** : 85%+
- **Routes** : 70%+
- **Global** : 80%+

## ⚠️ Notes importantes

1. **Mocking** : Les dépendances externes (DB, API) sont mockées
2. **Isolation** : Chaque test est indépendant
3. **Cleanup** : Les mocks sont réinitialisés avant chaque test
4. **Base de données test** : Configurée dans `.env.test`

## 🐛 Dépannage

### Les tests prennent trop longtemps
- Vérifier que `NODE_ENV=test` dans `.env.test`
- Utiliser `npm run test:unit` pour tests rapides

### Les tests échouent avec erreur de connexion DB
- Vérifier les variables d'environnement dans `.env.test`
- Les tests devraient être isolés (mocks, pas DB réelle)

### Besoin de déboguer un test
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🎯 Prochaines étapes

Tests à ajouter :
1. ✅ Services d'authentification
2. ✅ Middlewares d'authentification
3. ⏳ Controllers
4. ⏳ Services métier (produits, commandes, paniers)
5. ⏳ Validation middleware
6. ⏳ Rate limiting
7. ⏳ Upload middleware
