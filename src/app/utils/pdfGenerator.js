import jsPDF from 'jspdf';

export const generateDecoratePDF = (shouldPrint = false, preferences = {}, firstVerse = '') => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Register fonts
  pdf.addFont('/NotoNastaliqUrdu-VariableFont_wght.ttf', 'NotoNastaliq', 'normal');
  pdf.addFont('/pdms-saleem-quranfont.ttf', 'QuranFont', 'normal');

  // PDF dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const headerY = margin + 10; // Position for header text

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

  // Add header text
  pdf.setFont('helvetica');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);

  // Add Masjid name on left with Nastaliq font
  pdf.setFont('NotoNastaliq', 'normal');
  pdf.setFontSize(16);
  pdf.text(preferences.masjidName || '', margin + 5, headerY, { align: 'left' });

  // Add class name on right with Nastaliq font
  pdf.text(preferences.className || '', pageWidth - margin - 5, headerY, { align: 'right' });

  // Add first verse in center with Quran font
  pdf.setFont('QuranFont', 'normal');
  pdf.setFontSize(18);
  const centerX = pageWidth / 2;
  pdf.text(firstVerse, centerX, headerY, { align: 'center' });

  if (shouldPrint) {
    pdf.output('dataurlnewwindow'); // Opens in new window with print dialog
  } else {
    pdf.save('quiz.pdf');
  }

  return pdf;
};