/**
 * PDF / Print generation helper for clinical safety reports
 */
export function triggerReportPrint(reportElementId = 'clinical-report-content') {
  window.print();
}
