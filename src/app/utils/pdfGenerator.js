import { jsPDF } from 'jspdf';
export const generateDecoratePDF = async (shouldPrint = false, preferences = {}, firstVerse = '') => {
  try {
    // Create high-resolution canvas
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 500;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configure text style for Arabic
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '120px "QuranFont", "Noto Sans Arabic", Arial, sans-serif';
    ctx.direction = 'rtl';
    
    // Draw the Arabic text
    ctx.fillText(firstVerse, canvas.width / 2, canvas.height / 2);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false
    });

    // PDF dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    
    // Draw decorative border
    pdf.setDrawColor(28, 40, 51);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Inner border
    pdf.setLineWidth(0.2);
    pdf.rect(margin + 3, margin + 3, pageWidth - 2 * (margin + 3), pageHeight - 2 * (margin + 3));

    // Add corner decorations
    const cornerSize = 10;
    pdf.line(margin, margin + cornerSize, margin + cornerSize, margin);
    pdf.line(pageWidth - margin - cornerSize, margin, pageWidth - margin, margin + cornerSize);
    pdf.line(margin, pageHeight - margin - cornerSize, margin + cornerSize, pageHeight - margin);
    pdf.line(pageWidth - margin - cornerSize, pageHeight - margin, pageWidth - margin, pageHeight - margin - cornerSize);

    // Calculate image dimensions
    const imgWidth = pageWidth * 0.8;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pageWidth - imgWidth) / 2;
    const y = 40; // Positioned below header

    // Add canvas image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');

    // Add header text
    pdf.setFontSize(16);
    if (preferences.masjidName) {
      pdf.text(preferences.masjidName, margin + 5, margin + 10, { align: 'left' });
    }
    if (preferences.className) {
      pdf.text(preferences.className, pageWidth - margin - 5, margin + 10, { align: 'right' });
    }

    if (shouldPrint) {
      pdf.output('dataurlnewwindow');
    } else {
      const pdfOutput = pdf.output('datauristring');
      window.open(pdfOutput, '_blank');
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};