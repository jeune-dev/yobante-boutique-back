// ─────────────────────────────────────────────────────────────
// services/auth.service.js
// ─────────────────────────────────────────────────────────────

// TODO: register(data)
//   - Vérifier que l'email n'existe pas déjà
//   - Hasher le mot de passe avec bcrypt (saltRounds=12)
//   - Créer l'utilisateur en base (isVerified=false)
//   - Générer un OTP 6 chiffres, le hasher, l'enregistrer en UserOtp (expire 10min)
//   - Envoyer l'OTP par email via mailer
//   - Retourner l'utilisateur créé (sans password)

// TODO: verifyEmail(userId, code)
//   - Récupérer l'OTP non utilisé de type 'email_verification' pour cet user
//   - Vérifier que l'OTP n'est pas expiré
//   - Comparer le code fourni avec le hash stocké
//   - Marquer isVerified=true sur l'user et isUsed=true sur l'OTP
//   - Retourner un message de succès

// TODO: login(email, password)
//   - Trouver l'user par email
//   - Vérifier que isActive=true et isVerified=true
//   - Comparer le password avec bcrypt.compare
//   - Générer access token (JWT, expire 15min) et refresh token (expire 7j)
//   - Sauvegarder le refresh token hashé en base (RefreshToken)
//   - Retourner { accessToken, user }  — refresh token via cookie httpOnly

// TODO: refreshToken(token)
//   - Trouver le RefreshToken en base (non expiré)
//   - Vérifier la signature JWT avec JWT_REFRESH_SECRET
//   - Générer un nouvel access token
//   - Retourner { accessToken }

// TODO: logout(userId, token)
//   - Supprimer le RefreshToken correspondant en base
//   - Retourner un message de succès

// TODO: forgotPassword(email)
//   - Trouver l'user par email (ne pas révéler si inexistant)
//   - Générer un OTP de type 'reset_password', le hasher, le stocker
//   - Envoyer l'OTP par email
//   - Retourner un message générique

// TODO: resetPassword(userId, code, newPassword)
//   - Récupérer l'OTP non utilisé de type 'reset_password'
//   - Vérifier expiration et correspondance du code
//   - Hasher le nouveau mot de passe et mettre à jour l'user
//   - Marquer l'OTP isUsed=true
//   - Invalider tous les refresh tokens de cet user

// TODO: changePassword(userId, oldPassword, newPassword)
//   - Récupérer l'user
//   - Vérifier que oldPassword correspond au hash actuel
//   - Hasher newPassword et mettre à jour
//   - Invalider tous les refresh tokens
