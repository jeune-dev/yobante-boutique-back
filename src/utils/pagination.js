const getPagination = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page)   || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10));
  return { limit: l, offset: (p - 1) * l, page: p };
};

const paginateResult = (count, rows, page, limit) => ({
  total:  count,
  page:   parseInt(page),
  limit:  parseInt(limit),
  pages:  Math.ceil(count / limit),
  items:  rows,
});

module.exports = { getPagination, paginateResult };
