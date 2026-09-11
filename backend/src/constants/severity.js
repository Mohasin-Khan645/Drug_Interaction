export const SeverityLevel = {
  CONTRAINDICATED: 'CONTRAINDICATED',
  CRITICAL: 'CRITICAL',
  MAJOR: 'MAJOR',
  MODERATE: 'MODERATE',
  MINOR: 'MINOR',
  INFORMATIONAL: 'INFORMATIONAL',
};

// Priority weight: Higher numerical value means higher clinical priority
export const SEVERITY_PRIORITY_WEIGHT = {
  [SeverityLevel.CONTRAINDICATED]: 6,
  [SeverityLevel.CRITICAL]: 5,
  [SeverityLevel.MAJOR]: 4,
  [SeverityLevel.MODERATE]: 3,
  [SeverityLevel.MINOR]: 2,
  [SeverityLevel.INFORMATIONAL]: 1,
};

