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

    // PDF dimensions with adjusted margins
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // Reduced margin for better space usage
    
    // Draw single stylish dashed border
    pdf.setDrawColor(28, 40, 51); // Dark blue-grey color
    pdf.setLineWidth(1.5); // Thicker line for emphasis
    
    // Set dashed line pattern
    pdf.setLineDashPattern([8, 4], 0); // 8mm dash, 4mm gap
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    // Reset line style for other elements
    pdf.setLineDashPattern([], 0);

    // Adjust content positioning
    const imgWidth = pageWidth * 0.85; // Increased width for better proportions
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pageWidth - imgWidth) / 2;
    const y = 25; // Slightly reduced top margin

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