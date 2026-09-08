'use strict';

const PDFDocument = require('pdfkit');

const formatDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : 'Not recorded');

const heading = (doc, text) => {
  doc.moveDown(0.8).fontSize(13).fillColor('#0f172a').text(text);
  doc.moveTo(doc.x, doc.y + 2).lineTo(555, doc.y + 2).strokeColor('#cbd5f5').stroke();
  doc.moveDown(0.4).fontSize(10).fillColor('#111827');
};

/**
 * Renders the stored report snapshot only. Nothing is re-queried here, so a PDF
 * can never expose data that was not part of the authorized report.
 */
const renderReport = (report) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const snapshot = report.snapshot;

    doc.fontSize(20).fillColor('#1d4ed8').text('DrugSafe');
    doc.fontSize(11).fillColor('#111827').text('Medication Safety Report');
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Report ID: ${report.reportNumber}`);
    doc.text(`Status: ${report.status}`);
    doc.text(`Generated: ${formatDate(snapshot.generatedAt)}`);

    heading(doc, 'Patient summary');
    doc.text(`Name: ${snapshot.patient.name}`);
    doc.text(`Date of birth: ${formatDate(snapshot.patient.dateOfBirth)}`);
    doc.text(`Sex: ${snapshot.patient.sex || 'Not recorded'}`);
    doc.text(
      `Height: ${snapshot.patient.heightCm ? `${snapshot.patient.heightCm} cm` : 'Not recorded'} | Weight: ${
        snapshot.patient.weightKg ? `${snapshot.patient.weightKg} kg` : 'Not recorded'
      }`
    );

    heading(doc, `Active medications (${snapshot.medications.length})`);
    if (snapshot.medications.length === 0) doc.text('No active medications recorded.');
    for (const med of snapshot.medications) {
      doc.text(
        `• ${med.name}${med.brandName ? ` (${med.brandName})` : ''} ${med.strength || ''} ${med.doseForm || ''} ${
          med.frequency || ''
        } [${med.source}]`.replace(/\s+/g, ' ')
      );
    }

    heading(doc, 'Conditions and allergies');
    doc.text(
      `Conditions: ${
        snapshot.conditions.length
          ? snapshot.conditions.map((c) => `${c.name} (${c.status})`).join(', ')
          : 'None recorded'
      }`
    );
    doc.text(
      `Allergies: ${
        snapshot.allergies.length
          ? snapshot.allergies.map((a) => `${a.allergen} (${a.severity})`).join(', ')
          : 'None recorded'
      }`
    );

    heading(doc, `Safety findings (${snapshot.findings.length})`);
    if (snapshot.findings.length === 0) {
      doc.text('No findings were produced by the safety engine for this medication list.');
    }
    for (const finding of snapshot.findings) {
      doc.moveDown(0.3);
      doc.fillColor('#111827').text(`${finding.severity} — ${finding.title}`, { continued: false });
      doc.fillColor('#374151').text(finding.description);
      if (finding.mechanism) doc.text(`Mechanism: ${finding.mechanism}`);
      if (finding.management) doc.text(`Management: ${finding.management}`);
      doc.text(`Status: ${finding.status}`);
      if (finding.evidence.length > 0) {
        doc.text(
          `Evidence: ${finding.evidence
            .map((item) => `${item.sourceName}${item.reference ? ` — ${item.reference}` : ''}`)
            .join('; ')}`
        );
      } else {
        doc.text('Evidence: none attached; this finding requires clinician verification.');
      }
      for (const review of finding.reviews) {
        doc.text(
          `Clinician review: ${review.decision} by ${review.reviewer} (${review.reviewerRole})${
            review.clinicalNote ? ` — ${review.clinicalNote}` : ''
          }`
        );
      }
    }

    doc.moveDown(1);
    doc
      .fontSize(8)
      .fillColor('#6b7280')
      .text(
        'DrugSafe is a clinical decision-support tool. It does not diagnose, prescribe, or replace clinical judgement.',
        { align: 'center' }
      );

    doc.end();
  });

module.exports = { renderReport };
