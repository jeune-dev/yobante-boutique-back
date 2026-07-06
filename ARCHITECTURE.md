# 🏗️ Architecture Yobante Boutique Backend

Document décrivant les décisions architecturales et patterns utilisés.

---

## 📐 Principes de Conception

### 1. **Separation of Concerns**
- **Controllers** = requête/réponse uniquement
- **Services** = business logic isolée
- **Models** = couche données
- **Middlewares** = cross-cutting concerns

Avantage: Testabilité, réutilisabilité, maintenabilité.

### 2. **DRY (Don't Repeat Yourself)**
- **ApiResponse** class pour uniformiser réponses
- **AppError** pour gérer erreurs métier
- **asyncHandler** pour wrapper try-catch
- **Validations** centralisées (Joi)

### 3. **Fail Fast**
- Validation au démarrage (secrets JWT, CORS prod)
- Authentification avant traitement
- Erreurs explicites > erreurs silencieuses

### 4. **Security by Default**
- Helmet pour headers HTTP
- Rate limiting activé globalement
- CORS restrictif par défaut
- Passwords hachés (bcrypt 12 rounds)

---

## 🔀 Request Flow

```
Client
  ↓
[Express] → CORS, Helmet, Rate Limit
  ↓
[Routes] → Route matching
  ↓
[Validation Middleware] → Joi schema validation
  ↓
[Auth Middleware] (si protégé) → JWT verification
  ↓
[Controller] → Appel service
  ↓
[Service] → Business logic + DB queries
  ↓
[Controller] → ApiResponse.success() / .error()
  ↓
[Error Middleware] (si erreur)
  ↓
Client ← JSON response { success, message, data }
```

---

## 📁 Structure Détaillée

### `/config`
Fichiers de configuration centrale.

```
config/
├── db.js           # Sequelize + PostgreSQL + SSL prod
├── logger.js       # Winston logger factory
├── security.js     # JWT, CORS, rate-limit, validation startup
└── cloudinary.js   # CDN images
```

**Pattern**: Charger en startup, valider immédiatement, utiliser partout.

### `/models`
Sequelize models avec associations.

```
models/
├── index.js        # Charger tous les models + define associations
├── User.model.js   # Utilisateurs + roles (ADMIN, CLIENT)
├── Produit.model.js
├── Commande.model.js
└── ...
```

**Pattern**: 
- Associations dans `index.js` (évite circular deps)
- Indexes sur colonnes fréquemment recherchées
- Timestamps (createdAt, updatedAt) par défaut

### `/routes`
Express Router avec validation et authentification.

```
routes/
├── auth.routes.js             # Publique: register, login, reset-password
├── admin/
│   ├── index.js              # Router principal
│   ├── produit.route.js      # Protégé: CRUD produits
│   ├── commande.route.js     # Protégé: gestion commandes
│   └── ...
└── client/
    ├── produit.route.js      # Publique: catalogue
    ├── panier.route.js       # Protégé: shopping cart
    ├── commande.route.js     # Protégé: mes commandes
    └── ...
```

**Pattern**:
- Routes publiques = pas d'auth middleware
- Routes protégées = auth.middleware.js
- Routes admin = auth.middleware.js + admin.middleware.js
- Validation Joi sur chaque endpoint

### `/controllers`
Request handlers — transforment requêtes en réponses.

```
controllers/
├── auth.controller.js
│   ├── register()
│   ├── login()
│   ├── refresh()
│   └── logout()
└── ...
```

**Pattern**:
```javascript
exports.myAction = async (req, res) => {
  const { param } = req.body;
  
  try {
    const result = await MyService.action(param);
    
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    
    return ApiResponse.success(200, res, result.message, result.data);
  } catch (err) {
    logger.error('Error:', err);
    return ApiResponse.internalServerError(res);
  }
};
```

### `/services`
Business logic isolée des HTTP concerns.

```
services/
├── auth.service.js
│   ├── static register()
│   ├── static login()
│   ├── static refresh()
│   └── static logout()
└── ...
```

**Pattern**:
- Retourne `{ success, message, data }`
- Throw AppError pour erreurs métier
- Transactions pour opérations critiques
- NO req/res — données pures

### `/middlewares`
Cross-cutting concerns.

```
middlewares/
├── auth.middleware.js        # JWT verification
├── admin.middleware.js       # Admin role check
├── validate.middleware.js    # Joi schema wrapper
├── error.middleware.js       # Global error handler ✨
├── rateLimit.middleware.js   # Express rate-limit
├── upload.middleware.js      # Multer config
└── ...
```

**Pattern**: 
- `auth.middleware.js` → `req.user = user`
- `error.middleware.js` → last middleware (appelle next 4 args)
- Pas de response.json() → throw AppError

### `/utils`
Utilitaires réutilisables.

```
utils/
├── ApiResponse.js     # ✨ Uniformiser réponses
├── AppError.js        # ✨ Classe erreur personnalisée
├── asyncHandler.js    # ✨ Wrapper async/catch
├── logger.js          # Winston wrapper
├── mailer.js          # Email (Resend)
├── slugify.js         # Unique slugs
├── formatUser.js      # Remove password from user object
└── paginate.js        # Pagination helper
```

### `/validations`
Joi schemas centralisés.

```
validations/
├── auth.validation.js
├── produit.validation.js
├── commande.validation.js
└── ...
```

**Pattern**:
```javascript
// validations/auth.validation.js
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  ...
});

// routes/auth.routes.js
router.post('/register', 
  validate(registerSchema),
  authController.register
);
```

---

## 🔐 Authentification & Autorisation

### JWT Flow

```
1. Register/Login → generate access + refresh tokens
2. Access token (1h) → Authorization: Bearer <token>
3. Refresh token (7d) → stored hashed in DB
4. Token expired → POST /api/auth/refresh with refreshToken
5. Logout → revoke refreshToken (delete from DB)
```

### Token Secrets

**3 secrets différents** pour:
- `JWT_SECRET` — Access tokens
- `JWT_REFRESH_SECRET` — Refresh tokens
- `JWT_RESET_SECRET` — Password reset tokens

Validation au démarrage → pas de secrets identiques.

### Role-Based Access Control (RBAC)

```javascript
// User.model.js
role: {
  type: DataTypes.ENUM('CLIENT', 'ADMIN'),
  defaultValue: 'CLIENT'
}

// middlewares/admin.middleware.js
if (req.user.role !== 'ADMIN') {
  return res.status(403).json({ message: 'Unauthorized' });
}
```

---

## 🗄️ Database Patterns

### Sequelize Transactions

Opérations atomiques (tout réussit ou tout échoue):

```javascript
const transaction = await sequelize.transaction();
try {
  await User.create({...}, { transaction });
  await RefreshToken.create({...}, { transaction });
  await transaction.commit();
} catch (err) {
  await transaction.rollback();
  throw err;
}
```

**Utilisé pour**:
- Register (user + refresh token)
- Login (update lastLogin + create token)
- Commandes (créer commande + items + décrement stock)

### Model Associations

```javascript
// models/index.js
User.hasMany(Commande);
Commande.belongsTo(User);
Commande.hasMany(CommandeItem);
CommandeItem.belongsTo(Commande);
Produit.hasMany(CommandeItem);
// ... etc
```

**Automatique**:
- `.include(Commande)` — LEFT OUTER JOIN
- `.destroy()` → cascade delete (if configured)

### Indexes

```javascript
// Colonnes recherchées fréquemment
email: {
  type: DataTypes.STRING,
  unique: true,   // Index
  allowNull: false
}

slug: {
  type: DataTypes.STRING,
  unique: true    // Index
}
```

---

## ✅ Erreur Handling

### 3 Niveaux

```javascript
// 1. Joi Validation Error
try {
  const { error, value } = schema.validate(data);
  if (error) throw error; // → error.isJoi = true
} catch (err) {
  // error.middleware gère → 400 Bad Request
}

// 2. AppError (métier)
throw new AppError('Email already used', 409);
// → error.middleware gère → 409 Conflict

// 3. Non-operational (bug)
undefined.someMethod();
// → error.middleware gère → 500 Internal Server Error
```

### Pattern

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// services/auth.service.js
if (existingUser) {
  throw new AppError('Email déjà utilisé', 409);
}

// middlewares/error.middleware.js
if (err instanceof AppError) {
  return ApiResponse.error(err.statusCode, res, err.message);
}
```

---

## 🚀 Deployment Checklist

### Avant Production

```
☐ NODE_ENV=production
☐ JWT_SECRET, JWT_REFRESH_SECRET, JWT_RESET_SECRET ≠ (cryptographiquement forts)
☐ ADMIN_EMAIL et ADMIN_PASSWORD changés
☐ DB_SSL=true
☐ CORS_ORIGIN = domaines réels (jamais *)
☐ CLOUDINARY_* et RESEND_API_KEY configurés
☐ Erreurs serveur ne révèlent PAS les détails internes
☐ Logs centralisés (fichiers ou service tiers)
☐ Monitoring des erreurs (Sentry, DataDog, etc.)
☐ Backups automatiques de la DB
☐ Rate limits appropriés pour la charge prévue
```

### Render Deployment

```
Build Command: npm install
Start Command: npm start

Environment Variables:
- NODE_ENV=production
- All JWT secrets
- All API keys (Cloudinary, Resend)
- DB_HOST=external_db_url
- DB_SSL=true
```

---

## 📊 Performance Considerations

### Actuellement
- PostgreSQL avec indexes sur email, slug
- Sequelize eager loading (`.include()`) pour éviter N+1
- Pagination (limit/offset) implémentée
- Rate limiting global
- Cloudinary CDN pour images

### À ajouter
- Redis caching (produits, catégories)
- Per-user rate limits
- Query optimizations (.select(), .attributes`)
- Database query logging (debug mode)
- APM (Application Performance Monitoring)

---

## 🔄 Migrations Futures

### Phase 1 (Court terme)
- [ ] Refresh token rotation
- [ ] 2FA optionnel
- [ ] Audit trail (logs des modifications)

### Phase 2 (Moyen terme)
- [ ] Redis caching
- [ ] Full-text search (Elasticsearch)
- [ ] Intégration paiements réelle (Wave, Orange Money)

### Phase 3 (Long terme)
- [ ] GraphQL API alternative
- [ ] Real-time notifications (WebSockets)
- [ ] Multi-vendor marketplace

---

## 📚 References

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated**: July 2025
**Backend Version**: 2.0.0 (Refactored)
