// src/app/utils/pdfGenerator.js
import jsPDF from 'jspdf';

export const generateDecoratePDF = (shouldPrint = false) => {
  // Create PDF with A4 dimensions (210 x 297 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // PDF dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  // Draw decorative border
  pdf.setDrawColor(28, 40, 51); // Dark blue border
  pdf.setLineWidth(0.5);

  // Outer border
  pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

  // Inner border with double line effect
  pdf.setLineWidth(0.2);
  pdf.rect(margin + 3, margin + 3, pageWidth - 2 * (margin + 3), pageHeight - 2 * (margin + 3));

  // Add corner decorations
  const cornerSize = 10;
  
  // Top left corner
  pdf.line(margin, margin + cornerSize, margin + cornerSize, margin);
  // Top right corner
  pdf.line(pageWidth - margin - cornerSize, margin, pageWidth - margin, margin + cornerSize);
  // Bottom left corner
  pdf.line(margin, pageHeight - margin - cornerSize, margin + cornerSize, pageHeight - margin);
  // Bottom right corner
  pdf.line(pageWidth - margin - cornerSize, pageHeight - margin, pageWidth - margin, pageHeight - margin - cornerSize);

  if (shouldPrint) {
    pdf.output('dataurlnewwindow'); // Opens in new window with print dialog
  } else {
    pdf.save('quiz.pdf');
  }

  return pdf;
};