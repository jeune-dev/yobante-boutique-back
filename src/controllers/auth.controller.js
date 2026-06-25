// ─────────────────────────────────────────────────────────────
// controllers/auth.controller.js
// ─────────────────────────────────────────────────────────────
// const authService = require('../services/auth.service')

// TODO: register(req, res, next)
//   - Récupérer req.body (nom, prenom, email, password, telephone)
//   - Appeler authService.register(data)
//   - Retourner 201 + message de succès

// TODO: verifyEmail(req, res, next)
//   - Récupérer req.body (userId ou email, code)
//   - Appeler authService.verifyEmail(userId, code)
//   - Retourner 200 + message

// TODO: login(req, res, next)
//   - Récupérer req.body (email, password)
//   - Appeler authService.login(email, password)
//   - Poser le refresh token en cookie httpOnly
//   - Retourner 200 + { accessToken, user }

// TODO: refreshToken(req, res, next)
//   - Lire le refresh token depuis req.cookies
//   - Appeler authService.refreshToken(token)
//   - Retourner 200 + { accessToken }

// TODO: logout(req, res, next)
//   - Lire le refresh token depuis req.cookies
//   - Appeler authService.logout(req.user.id, token)
//   - Effacer le cookie
//   - Retourner 200 + message

// TODO: forgotPassword(req, res, next)
//   - Récupérer req.body.email
//   - Appeler authService.forgotPassword(email)
//   - Retourner 200 + message générique

// TODO: resetPassword(req, res, next)
//   - Récupérer req.body (userId ou email, code, newPassword)
//   - Appeler authService.resetPassword(...)
//   - Retourner 200 + message

// TODO: changePassword(req, res, next)
//   - Récupérer req.body (oldPassword, newPassword)
//   - Appeler authService.changePassword(req.user.id, oldPassword, newPassword)
//   - Retourner 200 + message
