function paginate(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginateResult(count, page, limit) {
  const totalPages = Math.ceil(count / limit);
  return {
    totalItems: count,
    totalPages,
    currentPage: page,
  };
}

module.exports = { paginate, paginateResult };
