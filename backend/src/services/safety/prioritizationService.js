'use strict';

const { SEVERITY_PRIORITY, severityRank, FINDING_STATUS } = require('../../constants');

/**
 * Removes exact duplicates (same dedupeKey), keeping the most severe variant.
 * Nothing is filtered out by severity: lower severity findings stay visible.
 */
const deduplicate = (findings) => {
  const byKey = new Map();
  for (const finding of findings) {
    const existing = byKey.get(finding.dedupeKey);
    if (!existing || severityRank(finding.severity) < severityRank(existing.severity)) {
      byKey.set(finding.dedupeKey, finding);
    }
  }
  return [...byKey.values()];
};

const prioritize = (findings) =>
  [...findings].sort((a, b) => {
    const bySeverity = severityRank(a.severity) - severityRank(b.severity);
    if (bySeverity !== 0) return bySeverity;
    // Items awaiting a human decision float above resolved ones of equal severity.
    const reviewWeight = (finding) => (finding.status === FINDING_STATUS.REVIEW_REQUIRED ? 0 : 1);
    const byReview = reviewWeight(a) - reviewWeight(b);
    if (byReview !== 0) return byReview;
    return a.title.localeCompare(b.title);
  });

const summarize = (findings) => {
  const bySeverity = Object.fromEntries(SEVERITY_PRIORITY.map((severity) => [severity, 0]));
  const byCategory = {};
  let reviewRequired = 0;

  for (const finding of findings) {
    bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
    byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
    if (finding.status === FINDING_STATUS.REVIEW_REQUIRED) reviewRequired += 1;
  }

  const highest = findings.length
    ? SEVERITY_PRIORITY.find((severity) => bySeverity[severity] > 0) || null
    : null;

  return {
    totalFindings: findings.length,
    highestSeverity: highest,
    reviewRequired,
    bySeverity,
    byCategory,
  };
};

module.exports = { deduplicate, prioritize, summarize };
