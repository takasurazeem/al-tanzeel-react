import { jsPDF } from 'jspdf';
export const generateDecoratePDF = async (shouldPrint = false, preferences = {}, firstVerse = '') => {
  try {
    // Create high-resolution canvas
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 400; // Reduced height
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

    // PDF dimensions with minimal margins
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5; // Reduced from 10 to 5mm
    
    // Draw single stylish dashed border with softer color
    pdf.setDrawColor(67, 82, 96); // Softer blue-grey color
    pdf.setLineWidth(0.8); // Reduced thickness for more delicate look
    
    // Set smaller dashed line pattern
    pdf.setLineDashPattern([4, 2], 0); // 4mm dash, 2mm gap - smaller pattern
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    // Reset line style for other elements
    pdf.setLineDashPattern([], 0);

    // Adjust content positioning for smaller margins
    const imgWidth = pageWidth * 0.9; // Increased to 90% for better use of space
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pageWidth - imgWidth) / 2;
    const y = 20; // Reduced top margin to 20mm

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