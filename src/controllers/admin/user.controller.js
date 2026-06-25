// ─────────────────────────────────────────────────────────────
// controllers/admin/user.controller.js
// ─────────────────────────────────────────────────────────────
// const userService = require('../../services/admin/user.service')

// TODO: getAll(req, res, next)
//   - Extraire filtres et pagination depuis req.query
//   - Appeler userService.getAllUsers(filters, pagination)
//   - Retourner 200 + { users, totalPages, count }

// TODO: getOne(req, res, next)
//   - Appeler userService.getUserById(req.params.id)
//   - Retourner 200 + user

// TODO: bloquer(req, res, next)
//   - Appeler userService.bloquerUser(req.params.id, req.body.raison)
//   - Retourner 200 + user mis à jour

// TODO: activer(req, res, next)
//   - Appeler userService.activerUser(req.params.id)
//   - Retourner 200 + user mis à jour

// TODO: remove(req, res, next)
//   - Appeler userService.deleteUser(req.params.id)
//   - Retourner 200 + message

// TODO: exportUsers(req, res, next)
//   - Appeler userService.exportUsers(req.query.format)
//   - Définir les headers Content-Type et Content-Disposition
//   - Retourner le fichier en réponse
