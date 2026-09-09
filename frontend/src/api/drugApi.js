import { get, post } from './client';

export const drugApi = {
  list: (params) => get('/drugs', params),
  search: (params) => get('/drugs/search', params),
  get: (drugId) => get(`/drugs/${drugId}`),
  interactions: (drugId) => get(`/drugs/${drugId}/interactions`),
  classes: () => get('/drugs/classes'),
  ingredients: () => get('/drugs/ingredients'),
};

export const normalizationApi = {
  normalize: (names) => post('/drugs/normalize', { names }),
};

export const interactionApi = {
  forDrug: (drugId) => drugApi.interactions(drugId),
};
