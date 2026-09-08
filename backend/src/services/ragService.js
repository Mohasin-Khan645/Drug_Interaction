'use strict';

const evidenceRepository = require('../repositories/evidenceRepository');
const safetyRepository = require('../repositories/safetyRepository');
const { tokenize } = require('./normalizationService');

const STOP_WORDS = new Set(['what', 'why', 'how', 'the', 'and', 'for', 'with', 'does', 'this', 'that', 'are', 'can']);

const questionTerms = (question) =>
  [...new Set(tokenize(question).filter((token) => !STOP_WORDS.has(token)))].slice(0, 8);

/**
 * Builds a grounded context from verified findings and stored evidence only.
 * If nothing verified matches, the context is empty and the caller must refuse
 * to answer rather than improvise.
 */
const buildContext = async ({ question, findingId, safetyCheckId }) => {
  const findings = [];

  if (findingId) {
    const finding = await safetyRepository.findFindingById(findingId);
    if (finding) findings.push(finding);
  } else if (safetyCheckId) {
    const check = await safetyRepository.findCheckById(safetyCheckId);
    if (check) findings.push(...check.findings);
  }

  const terms = questionTerms(question);
  const documents = terms.length > 0 ? await evidenceRepository.searchDocuments(terms) : [];

  const evidenceFromFindings = findings.flatMap((finding) =>
    (finding.evidence || []).map((item) => ({
      title: item.document ? item.document.title : item.sourceName,
      sourceName: item.sourceName,
      reference: item.reference,
      version: item.version,
      evidenceLevel: item.evidenceLevel,
      content: item.document ? item.document.content : null,
    }))
  );

  const evidence = [
    ...evidenceFromFindings,
    ...documents.map((doc) => ({
      title: doc.title,
      sourceName: doc.source.name,
      reference: doc.reference || doc.source.url,
      version: doc.version,
      evidenceLevel: doc.evidenceLevel,
      content: doc.content,
    })),
  ];

  return {
    findings: findings.map((finding) => ({
      id: finding.id,
      category: finding.category,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      mechanism: finding.mechanism,
      management: finding.management,
      status: finding.status,
    })),
    evidence,
    grounded: findings.length > 0 && evidence.length > 0,
  };
};

module.exports = { buildContext, questionTerms };
