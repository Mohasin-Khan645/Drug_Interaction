'use strict';

const drugRepository = require('../repositories/drugRepository');
const ruleRepository = require('../repositories/ruleRepository');
const ApiError = require('../utils/apiError');
const { paginatedResult } = require('../utils/pagination');

const listDrugs = async (filters) => {
  const { items, total, pagination } = await drugRepository.list(filters);
  return paginatedResult(items, total, pagination);
};

const searchDrugs = async (filters) => {
  const { items, total, pagination } = await drugRepository.search(filters);
  return paginatedResult(items, total, pagination);
};

const getDrug = async (id) => {
  const drug = await drugRepository.findById(id);
  if (!drug) throw ApiError.notFound('Drug not found');
  return drug;
};

const getDrugInteractions = async (id) => {
  await getDrug(id);
  const interactions = await ruleRepository.listInteractionsForDrug(id);
  return interactions.map((interaction) => ({
    id: interaction.id,
    severity: interaction.severity,
    interactionType: interaction.interactionType,
    clinicalEffect: interaction.clinicalEffect,
    mechanism: interaction.mechanism,
    management: interaction.management,
    evidenceLevel: interaction.evidenceLevel,
    version: interaction.version,
    source: interaction.source ? { name: interaction.source.name, url: interaction.source.url } : null,
    otherDrug: interaction.drugAId === id ? interaction.drugB : interaction.drugA,
  }));
};

const listClasses = () => drugRepository.listClasses();

const listIngredients = () => drugRepository.listIngredients();

module.exports = { listDrugs, searchDrugs, getDrug, getDrugInteractions, listClasses, listIngredients };
