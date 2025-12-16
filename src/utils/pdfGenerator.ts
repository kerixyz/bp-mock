import { jsPDF } from 'jspdf';
import { FormData, FormField } from '../types';

export function generatePDF(formData: FormData): void {
  const doc = new jsPDF();

  let yPosition = 20;
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 40;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Delaware Benefits Assistance', leftMargin, yPosition);
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('SNAP & WIC Application', leftMargin, yPosition);
  yPosition += 15;

  // Application date
  doc.setFontSize(10);
  doc.text(`Application Date: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, leftMargin, yPosition);
  yPosition += 10;

  // Applicant type
  const applicantType = formData.userRole === 'self' ? 'Self Application' : 'Application on Behalf of Parent';
  doc.text(`Applicant Type: ${applicantType}`, leftMargin, yPosition);
  yPosition += 15;

  // Iterate through each section
  formData.sections.forEach(section => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, leftMargin, yPosition);
    yPosition += 8;

    // Section divider line
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPosition, pageWidth - leftMargin, yPosition);
    yPosition += 8;

    // Fields
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    section.fields.forEach(field => {
      // Check if we need a new page
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      const fieldLabel = field.label + ':';
      const fieldValue = formatFieldValue(field);

      // Field label (bold)
      doc.setFont('helvetica', 'bold');
      doc.text(fieldLabel, leftMargin, yPosition);

      // Field value (normal)
      doc.setFont('helvetica', 'normal');
      const valueLines = doc.splitTextToSize(fieldValue, maxWidth - 60);
      doc.text(valueLines, leftMargin + 60, yPosition);

      yPosition += (valueLines.length * 5) + 3;
    });

    yPosition += 5;
  });

  // Eligibility section if available
  if (formData.eligibility.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Selected Benefits', leftMargin, yPosition);
    yPosition += 8;

    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPosition, pageWidth - leftMargin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    formData.eligibility.forEach(benefit => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${benefit.program}`, leftMargin, yPosition);
      yPosition += 6;
    });
  }

  // Footer on last page
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'This is an unofficial copy for your records. Please submit the official application through the Delaware ASSIST portal.',
    leftMargin,
    doc.internal.pageSize.getHeight() - 10,
    { maxWidth: maxWidth }
  );

  // Download the PDF
  const fileName = `Delaware_Benefits_Application_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function formatFieldValue(field: FormField): string {
  if (field.value === null || field.value === undefined) {
    return 'Not provided';
  }

  if (Array.isArray(field.value)) {
    return field.value.join(', ');
  }

  if (typeof field.value === 'boolean') {
    return field.value ? 'Yes' : 'No';
  }

  if (field.id === 'date-of-birth' && typeof field.value === 'string') {
    const date = new Date(field.value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (field.id === 'monthly-income' && typeof field.value === 'number') {
    return '$' + field.value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return String(field.value);
}
