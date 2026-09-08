'use strict';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const buildPagination = ({ page = 1, limit = DEFAULT_LIMIT } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const safePage = Math.max(Number(page) || 1, 1);
  return { skip: (safePage - 1) * safeLimit, take: safeLimit, page: safePage, limit: safeLimit };
};

const paginatedResult = (items, total, { page, limit }) => ({
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  },
});

module.exports = { buildPagination, paginatedResult, DEFAULT_LIMIT, MAX_LIMIT };
