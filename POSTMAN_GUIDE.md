# 📮 Guide Postman - Yobante Boutique API

## 📥 Installation

### 1. Importer la collection dans Postman

1. **Télécharger Postman** : https://www.postman.com/downloads/
2. **Ouvrir Postman**
3. **File** → **Import**
4. **Sélectionner le fichier** : `Yobante-API.postman_collection.json`
5. **Cliquer sur "Import"**

La collection `Yobante Boutique API` est maintenant disponible dans Postman ! 🎉

---

## 🔧 Configuration des Variables

Avant de faire des requêtes, configure les variables :

1. **Ouvrir la collection** → Onglet **Variables**
2. **Remplir** :
   - `base_url` : `http://localhost:5000` (ou ton domaine)
   - `access_token` : Récupéré après login (voir ci-dessous)
   - `refresh_token` : Récupéré après login

---

## 🚀 Workflow Typique

### 1️⃣ Inscription
```
POST /api/auth/register
Body (JSON):
{
  "nom": "Doe",
  "prenom": "John",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "telephone": "+33612345678"
}
```
✅ Réponse : `201 Created` + données utilisateur

---

### 2️⃣ Connexion
```
POST /api/auth/login
Body (JSON):
{
  "identifiant": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```
✅ Réponse : 
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

**Copier le `token`** et le coller dans la variable `access_token` de Postman ! 

---

### 3️⃣ Utiliser l'API avec le Token

**Tous les endpoints clients/protégés nécessitent un header** :
```
Authorization: Bearer {{access_token}}
```

Postman remplace automatiquement `{{access_token}}` par la valeur de la variable.

---

## 📋 Endpoints par Domaine

### 🔐 Authentication
| Méthode | Endpoint | Authen. | Description |
|---------|----------|---------|-------------|
| POST | `/api/auth/register` | ❌ | Inscription |
| POST | `/api/auth/login` | ❌ | Connexion |
| POST | `/api/auth/refresh` | ❌ | Nouveau token |
| POST | `/api/auth/logout` | ❌ | Déconnexion |
| POST | `/api/auth/forgot-password` | ❌ | Mot de passe oublié |
| POST | `/api/auth/reset-password` | ❌ | Réinitialiser mot de passe |
| POST | `/api/auth/change-password` | ✅ | Changer mot de passe |

### 🛍️ Products
| Méthode | Endpoint | Authen. | Description |
|---------|----------|---------|-------------|
| GET | `/api/produits` | ❌ | Liste des produits |
| GET | `/api/produits/:id` | ❌ | Détails produit |

### 🛒 Cart
| Méthode | Endpoint | Authen. | Description |
|---------|----------|---------|-------------|
| GET | `/api/panier` | ✅ | Mon panier |
| POST | `/api/panier` | ✅ | Ajouter au panier |
| DELETE | `/api/panier/:id` | ✅ | Supprimer du panier |

### 📦 Orders
| Méthode | Endpoint | Authen. | Description |
|---------|----------|---------|-------------|
| GET | `/api/commandes` | ✅ | Mes commandes |
| POST | `/api/commandes` | ✅ | Créer commande |
| GET | `/api/commandes/:id` | ✅ | Détails commande |

### ⭐ Reviews
| Méthode | Endpoint | Authen. | Description |
|---------|----------|---------|-------------|
| GET | `/api/avis` | ❌ | Avis d'un produit |
| POST | `/api/avis` | ✅ | Créer un avis |

### 👤 Profile
| Méthode | Endpoint | Authen. | Description |
|---------|----------|---------|-------------|
| GET | `/api/profile` | ✅ | Mon profil |
| PUT | `/api/profile` | ✅ | Modifier profil |

---

## 💡 Astuces Postman

### 🔄 Auto-sauvegarder les Tokens
Après un login réussi, tu peux extraire les tokens automatiquement :

1. **Onglet "Tests"** de la requête login
2. **Ajouter** :
```javascript
pm.environment.set("access_token", pm.response.json().token);
pm.environment.set("refresh_token", pm.response.json().refreshToken);
```

### 📝 Pré-requêtes
Certaines requêtes peuvent avoir des dépendances (ex: besoin du token avant). Use l'onglet **Pre-request Script** pour :
```javascript
// Exemple : vérifier le token avant d'appeler
if (!pm.environment.get("access_token")) {
  console.log("⚠️ Token manquant ! Faites login d'abord");
}
```

### 📊 Tests Automatisés
Tu peux valider les réponses :
```javascript
pm.test("Status is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has token", function () {
    pm.expect(pm.response.json()).to.have.property('token');
});
```

### 🌍 Environnements
Crée des environnements pour différentes envs :
- **Development** : `http://localhost:5000`
- **Staging** : `https://staging.yobante.com`
- **Production** : `https://api.yobante.com`

Switch facile en haut à droite ! 🔄

---

## ❌ Codes d'Erreur Courants

| Code | Erreur | Solution |
|------|--------|----------|
| 400 | Bad Request | Vérifier les données envoyées |
| 401 | Unauthorized | Token manquant ou expiré |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource n'existe pas |
| 409 | Conflict | Email déjà utilisé (register) |
| 429 | Too Many Requests | Rate limit atteint (attendre 15 min) |
| 500 | Server Error | Erreur serveur (vérifier les logs) |

---

## 🔐 Sécurité

✅ **À faire** :
- Jamais partager le `access_token` publiquement
- Utiliser des **variables** au lieu de hard-coder les tokens
- Tester en **dev** avant production
- Utiliser HTTPS en production

❌ **À ne pas faire** :
- Committer les tokens en Git
- Envoyer les tokens par email
- Utiliser le même token pour tous les tests

---

## 🆘 Besoin d'aide ?

- **API doc** : http://localhost:5000/api-docs (Swagger)
- **Logs serveur** : `npm run dev` dans le terminal
- **Postman doc** : https://learning.postman.com/

---

**Bon testing ! 🚀**
