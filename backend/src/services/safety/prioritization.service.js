import { SEVERITY_PRIORITY_WEIGHT, SeverityLevel } from '../../constants/severity.js';

export const PrioritizationService = {
  /**
   * Sorts findings strictly by clinical priority without suppressing any lower severity findings
   */
  prioritizeFindings(findings = []) {
    return [...findings].sort((a, b) => {
      const weightA = SEVERITY_PRIORITY_WEIGHT[a.severity] || 0;
      const weightB = SEVERITY_PRIORITY_WEIGHT[b.severity] || 0;
      return weightB - weightA;
    });
  },

  /**
   * Groups findings by severity level while preserving complete visibility
   */
  groupBySeverity(findings = []) {
    const grouped = {
      [SeverityLevel.CONTRAINDICATED]: [],
      [SeverityLevel.CRITICAL]: [],
      [SeverityLevel.MAJOR]: [],
      [SeverityLevel.MODERATE]: [],
      [SeverityLevel.MINOR]: [],
      [SeverityLevel.INFORMATIONAL]: [],
    };

    for (const f of findings) {
      if (grouped[f.severity]) {
        grouped[f.severity].push(f);
      } else {
        grouped[SeverityLevel.INFORMATIONAL].push(f);
      }
    }

    return grouped;
  },

  /**
   * Calculates overall safety classification from prioritized findings
   */
  calculateOverallStatus(grouped) {
    if (grouped[SeverityLevel.CONTRAINDICATED]?.length > 0) return 'CONTRAINDICATED';
    if (grouped[SeverityLevel.CRITICAL]?.length > 0) return 'CRITICAL_CONCERN';
    if (grouped[SeverityLevel.MAJOR]?.length > 0) return 'MAJOR_CONCERN';
    if (grouped[SeverityLevel.MODERATE]?.length > 0) return 'MODERATE_PRECAUTION';
    if (grouped[SeverityLevel.MINOR]?.length > 0) return 'MINOR_PRECAUTION';
    return 'VERIFIED_SAFE';
  },
};

