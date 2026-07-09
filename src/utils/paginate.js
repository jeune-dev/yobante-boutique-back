const { PAGINATION } = require('../constants');

const paginate = (page, limit) => {
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  return { page: p, limit: l, offset: (p - 1) * l };
};

module.exports = paginate;
