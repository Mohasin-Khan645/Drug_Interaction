'use strict';

const evidenceRepository = require('../../repositories/evidenceRepository');

/**
 * Turns the rule references collected by the engines into stored evidence rows.
 * Only references that resolve to a real source or document are attached; no
 * placeholder evidence is ever generated.
 */
const attachEvidence = async (findings) => {
  const documentIds = [
    ...new Set(
      findings.flatMap((finding) => (finding.evidenceRefs || []).map((ref) => ref.documentId).filter(Boolean))
    ),
  ];
  const documents = documentIds.length ? await evidenceRepository.findDocumentsByIds(documentIds) : [];
  const documentById = new Map(documents.map((doc) => [doc.id, doc]));

  return findings.map((finding) => {
    const { evidenceRefs = [], ...rest } = finding;
    const evidence = [];

    for (const ref of evidenceRefs) {
      const document = ref.documentId ? documentById.get(ref.documentId) : null;
      if (document) {
        evidence.push({
          documentId: document.id,
          sourceName: document.source.name,
          reference: document.reference || document.source.url,
          version: document.version || document.source.version,
          evidenceLevel: ref.evidenceLevel || document.evidenceLevel,
          retrievedAt: document.retrievedAt,
          reviewedAt: document.reviewedAt,
        });
        continue;
      }
      if (ref.source) {
        evidence.push({
          sourceName: ref.source.name,
          reference: ref.source.url,
          version: ref.source.version,
          evidenceLevel: ref.evidenceLevel,
        });
      }
    }

    return { ...rest, evidence };
  });
};

module.exports = { attachEvidence };
