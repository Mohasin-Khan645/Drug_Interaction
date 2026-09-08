'use strict';

const { z, idParam, pagination } = require('./common');

const SORT_FIELDS = z.enum(['genericName', 'brandName', 'createdAt']);

const list = {
  query: pagination.extend({
    classId: z.string().uuid().optional(),
    ingredientId: z.string().uuid().optional(),
    sortBy: SORT_FIELDS.optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

const search = {
  query: pagination.extend({
    q: z.string().min(2).max(120),
    classId: z.string().uuid().optional(),
    sortBy: SORT_FIELDS.optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

const byId = { params: idParam('drugId') };

const normalize = {
  body: z.object({
    names: z.array(z.string().min(1).max(200)).min(1).max(50),
  }),
};

module.exports = { list, search, byId, normalize };
