import { jsPDF } from 'jspdf';
export const generateDecoratePDF = async (shouldPrint = false, preferences = {}, firstVerse = '') => {
  console.log("Starting PDF generation with:", {
    preferences,
    firstVerse
  });

  try {
    // Create canvas for Quran verse
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
    
    // Load font for PDF
    const fontStack = '"QuranFont", "Noto Sans Arabic", Arial, sans-serif';
    const fontSize = '120px';
    
    // Wait for font to load
    await document.fonts.load(`${fontSize} ${fontStack}`);
    
    // Configure text style for Arabic
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize} ${fontStack}`;
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

    // Define page dimensions and margins early
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;

    // Load and initialize Noto Nastaliq Urdu font with error handling
    try {
      console.log('Loading Noto Nastaliq Urdu font...');
      const fontResponse = await fetch('/fonts/NotoNastaliqUrdu-VariableFont_wght.ttf');
      
      if (!fontResponse.ok) {
        throw new Error(`Font fetch failed: ${fontResponse.status} ${fontResponse.statusText}`);
      }
      
      const fontArrayBuffer = await fontResponse.arrayBuffer();
      console.log('Font loaded successfully, converting to base64...');
      
      const fontBase64 = btoa(
        new Uint8Array(fontArrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Add font to PDF with validation
      console.log('Adding font to PDF...');
      pdf.addFileToVFS('NotoNastaliqUrdu.ttf', fontBase64);
      pdf.addFont('NotoNastaliqUrdu.ttf', 'NotoNastaliqUrdu', 'normal', 'Identity-H');

      // Verify font was added
      const fonts = pdf.getFontList();
      console.log('Available fonts:', fonts);

      // Set up PDF header text with corrected encoding
      pdf.setFont('NotoNastaliqUrdu', 'normal');
      pdf.setFontSize(16);
      pdf.setR2L(true);
      pdf.setCharSpace(0);

      // Add header text with additional encoding options
      if (preferences.masjidName) {
        console.log('Adding masjid name:', preferences.masjidName);
        pdf.text(preferences.masjidName, margin + 15, margin + 15, {
          align: 'right',
          direction: 'rtl',
          isOutputRtl: true,
          renderingMode: 'fill',
          charSpace: 0,
          lang: 'ar',
          flags: {
            isOutputVisual: true,
            isOutputRtl: true,
            isVertical: false
          }
        });
      }

      if (preferences.className) {
        console.log('Adding class name:', preferences.className);
        pdf.text(preferences.className, pageWidth - margin - 15, margin + 15, {
          align: 'right',
          direction: 'rtl',
          isOutputRtl: true,
          renderingMode: 'fill',
          charSpace: 0,
          lang: 'ar',
          flags: {
            isOutputVisual: true,
            isOutputRtl: true,
            isVertical: false
          }
        });
      }

    } catch (fontError) {
      console.error('Font loading or rendering error:', fontError);
      // Continue with PDF generation even if font fails
    }

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

    if (shouldPrint) {
      pdf.output('dataurlnewwindow');
    } else {
      const pdfOutput = pdf.output('datauristring');
      window.open(pdfOutput, '_blank');
    }

    return pdf;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};