import { drugRepository } from '../repositories/drug.repository.js';
import { NotFoundError } from '../utils/errors.js';

export const drugService = {
  async searchDrugs(params = {}) {
    return drugRepository.search(params);
  },

  async getDrugById(id) {
    const drug = await drugRepository.findById(id);
    if (!drug) {
      throw new NotFoundError(`Drug with ID '${id}' was not found in the pharmaceutical formulary.`);
    }
    return drug;
  },

  async getDrugClasses() {
    return drugRepository.findAllClasses();
  },

  async getDrugInteractions(drugId) {
    const drug = await drugRepository.findById(drugId);
    if (!drug) {
      throw new NotFoundError(`Drug with ID '${drugId}' not found.`);
    }
    return drugRepository.getInteractions(drugId);
  },

  async createDrug(data) {
    return drugRepository.create(data);
  },
};

