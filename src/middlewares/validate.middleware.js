const Joi = require('joi');
const { error } = require('../utils/formatResponse');

function validate(schema, target = 'body') {
  return (req, res, next) => {
    const data = req[target];
    const { error: validationError, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationError) {
      const errors = validationError.details.map((detail) => detail.message);
      return error(res, 'Données invalides', 400, errors);
    }

    req[target] = value;
    next();
  };
}

module.exports = { validate };
