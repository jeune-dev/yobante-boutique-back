const success = (res, data, message = 'Succès', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = 'Créé avec succès') =>
  success(res, data, message, 201);

const error = (res, message = 'Erreur serveur', status = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

const notFound = (res, message = 'Ressource introuvable') => error(res, message, 404);
const forbidden = (res, message = 'Accès interdit') => error(res, message, 403);

module.exports = { success, created, error, notFound, forbidden };
