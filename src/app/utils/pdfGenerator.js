import { jsPDF } from 'jspdf';
export const generateDecoratePDF = async (shouldPrint = false, preferences = {}, firstVerse = '', selectedVerses = [], selectedWords = []) => {
  console.log("Starting PDF generation with:", {
    preferences,
    firstVerse,
    selectedVerses,
    versesCount: selectedVerses.length,
    selectedWords,
    wordsCount: selectedWords.length,
    masjidName: preferences.masjidName,
    className: preferences.className
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

    // Draw clean, elegant single border
    pdf.setDrawColor(60, 60, 60); // Clean dark grey
    pdf.setLineWidth(1.0); // Clean medium thickness
    
    const borderMargin = 5; // Reduced margin for border closer to edges
    
    // Single elegant border
    pdf.setLineDashPattern([], 0); // Solid line for clean look
    pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);

    // Adjust content positioning to avoid border overlap
    const imgWidth = pageWidth * 0.85; // Slightly smaller to give border breathing room
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pageWidth - imgWidth) / 2;
    const y = 25; // More space from top for header text

    // Add canvas image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');

    // Add selected verses for translation below the main verse
    if (selectedVerses && selectedVerses.length > 0) {
      console.log(`Adding ${selectedVerses.length} selected verses for translation`);
      
      let currentY = y + imgHeight + 10; // Reduced spacing
      const lineHeight = 6; // Reduced space between lines
      const verseSpacing = 12; // Reduced space between verses
      const verseWidth = pageWidth - 30; // Width for verse text (with margins)
      
      // Function to create verse canvas (Arabic text only) with larger font
      const createVerseCanvas = (verseText) => {
        const verseCanvas = document.createElement('canvas');
        verseCanvas.width = 2800; // Wider canvas
        verseCanvas.height = 180; // Taller for bigger font
        const verseCtx = verseCanvas.getContext('2d', { alpha: false });
        
        // Enable high-quality rendering
        verseCtx.imageSmoothingEnabled = true;
        verseCtx.imageSmoothingQuality = 'high';
        
        // Set white background
        verseCtx.fillStyle = 'white';
        verseCtx.fillRect(0, 0, verseCanvas.width, verseCanvas.height);
        
        // Configure text style for Arabic - BIGGER FONT
        verseCtx.fillStyle = 'black';
        verseCtx.textAlign = 'right';
        verseCtx.textBaseline = 'middle';
        verseCtx.font = '64px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Increased from 48px
        verseCtx.direction = 'rtl';
        
        // Draw the Arabic text
        const xPos = verseCanvas.width - 20;
        verseCtx.fillText(verseText, xPos, verseCanvas.height / 2);
        
        return verseCanvas;
      };
      
      // Function to estimate lines needed based on translation length
      const estimateLines = (translation) => {
        if (!translation) return 2; // Reduced default lines
        const charCount = translation.length;
        const charsPerLine = 90; // More characters per line
        const estimatedLines = Math.ceil(charCount / charsPerLine);
        return Math.max(1, Math.min(estimatedLines, 4)); // Between 1-4 lines
      };
      
      selectedVerses.forEach((verse, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = 20; // Reset Y position on new page
          
          // Redraw border on new page
          pdf.setDrawColor(60, 60, 60);
          pdf.setLineWidth(1.0);
          pdf.setLineDashPattern([], 0);
          pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
        }
        
        // Add Arabic verse using canvas (proper Arabic rendering)
        if (verse.text) {
          const arabicCanvas = createVerseCanvas(verse.text);
          const arabicImgData = arabicCanvas.toDataURL('image/png', 1.0);
          const arabicImgWidth = verseWidth - 30;
          const arabicImgHeight = (arabicCanvas.height * arabicImgWidth) / arabicCanvas.width;
          pdf.addImage(arabicImgData, 'PNG', 20, currentY, arabicImgWidth, arabicImgHeight, undefined, 'FAST');
          
          // Add ✤ symbol on the RIGHT side of the verse
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(16); // Bigger symbol
          pdf.setTextColor(0, 0, 0);
          pdf.text('✤', pageWidth - 20, currentY + (arabicImgHeight / 2));
          
          currentY += arabicImgHeight + 3; // Reduced spacing
        }
        
        // Add empty lines for translation based on estimated length
        const linesNeeded = estimateLines(verse.translation);
        pdf.setDrawColor(120, 120, 120); // Darker grey for lines
        pdf.setLineWidth(0.4); // Slightly thicker lines
        
        for (let i = 0; i < linesNeeded; i++) {
          currentY += lineHeight;
          // Draw horizontal line for writing
          pdf.line(20, currentY, pageWidth - 20, currentY);
        }
        
        currentY += verseSpacing; // Space before next verse
      });
      
      // Add some space before word meanings section
      currentY += 15;
    }

    // Add selected words for meanings below the verses
    if (selectedWords && selectedWords.length > 0) {
      console.log(`Adding ${selectedWords.length} selected words for meanings`);
      
      let currentY = selectedVerses.length > 0 ? (y + imgHeight + 10) : (y + imgHeight + 10);
      
      // Calculate starting position after verses if verses exist
      if (selectedVerses && selectedVerses.length > 0) {
        // Skip calculation, currentY will be set from verses section
        // Find where verses section ended
        let estimatedY = y + imgHeight + 10;
        selectedVerses.forEach((verse) => {
          estimatedY += 60; // Approximate height per verse with lines
        });
        currentY = estimatedY + 20;
      }
      
      const wordsPerRow = 3; // 3 words per row like in screenshot
      const wordHeight = 25; // Height for each word row
      const wordSpacing = 8; // Space between word rows
      
      // Function to create word canvas
      const createWordCanvas = (word) => {
        const wordCanvas = document.createElement('canvas');
        wordCanvas.width = 800;
        wordCanvas.height = 120;
        const wordCtx = wordCanvas.getContext('2d', { alpha: false });
        
        // Enable high-quality rendering
        wordCtx.imageSmoothingEnabled = true;
        wordCtx.imageSmoothingQuality = 'high';
        
        // Set white background
        wordCtx.fillStyle = 'white';
        wordCtx.fillRect(0, 0, wordCanvas.width, wordCanvas.height);
        
        // Configure text style for Arabic word - BIGGER FONT
        wordCtx.fillStyle = 'black';
        wordCtx.textAlign = 'center';
        wordCtx.textBaseline = 'middle';
        wordCtx.font = '56px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Big font for words
        wordCtx.direction = 'rtl';
        
        // Draw the word
        wordCtx.fillText(word, wordCanvas.width / 2, wordCanvas.height / 2);
        
        return wordCanvas;
      };
      
      // Process words in groups of 3
      for (let i = 0; i < selectedWords.length; i += wordsPerRow) {
        // Check if we need a new page
        if (currentY > pageHeight - 80) {
          pdf.addPage();
          currentY = 20;
          
          // Redraw border on new page
          pdf.setDrawColor(60, 60, 60);
          pdf.setLineWidth(1.0);
          pdf.setLineDashPattern([], 0);
          pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
        }
        
        const rowWords = selectedWords.slice(i, i + wordsPerRow);
        const wordWidth = (pageWidth - 40) / wordsPerRow; // Divide available width
        
        // Add words in current row
        rowWords.forEach((word, colIndex) => {
          const wordCanvas = createWordCanvas(word);
          const wordImgData = wordCanvas.toDataURL('image/png', 1.0);
          const wordImgWidth = wordWidth - 10; // Leave some margin
          const wordImgHeight = (wordCanvas.height * wordImgWidth) / wordCanvas.width;
          const xPos = 20 + (colIndex * wordWidth);
          
          pdf.addImage(wordImgData, 'PNG', xPos, currentY, wordImgWidth, wordImgHeight, undefined, 'FAST');
        });
        
        currentY += wordHeight;
        
        // Add empty lines for meanings under each word
        pdf.setDrawColor(120, 120, 120);
        pdf.setLineWidth(0.4);
        
        for (let lineIndex = 0; lineIndex < 2; lineIndex++) { // 2 lines per word
          currentY += 6;
          // Draw lines under each word position
          rowWords.forEach((word, colIndex) => {
            const wordWidth = (pageWidth - 40) / wordsPerRow;
            const xStart = 20 + (colIndex * wordWidth);
            const xEnd = xStart + wordWidth - 10;
            pdf.line(xStart, currentY, xEnd, currentY);
          });
        }
        
        currentY += wordSpacing;
      }
    }

    // Create canvases for header texts (same approach as main verse)
    console.log('Creating header text canvases...');
    console.log('Masjid name:', preferences.masjidName);
    console.log('Class name:', preferences.className);
    
    // Function to create text canvas
    const createTextCanvas = (text, textAlign = 'right') => {
      if (!text || text.trim() === '') return null;
      
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 1200; // Increased width for larger text
      textCanvas.height = 150; // Increased height
      const textCtx = textCanvas.getContext('2d', { alpha: false });
      
      // Enable high-quality rendering
      textCtx.imageSmoothingEnabled = true;
      textCtx.imageSmoothingQuality = 'high';
      
      // Set white background
      textCtx.fillStyle = 'white';
      textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);
      
      // Configure text style with larger font
      textCtx.fillStyle = 'black';
      textCtx.textAlign = textAlign;
      textCtx.textBaseline = 'middle';
      textCtx.font = '72px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Increased from 48px to 72px
      textCtx.direction = 'rtl';
      
      // Draw the text at edges (no padding)
      const xPos = textAlign === 'right' ? textCanvas.width - 10 : 10; // Minimal margin
      textCtx.fillText(text, xPos, textCanvas.height / 2);
      
      return textCanvas;
    };
    
    // Create and add masjid name canvas (left side, inside border)
    if (preferences.masjidName && preferences.masjidName.trim() !== '') {
      console.log('Adding masjid name as canvas image');
      const masjidCanvas = createTextCanvas(preferences.masjidName, 'left');
      if (masjidCanvas) {
        const masjidImgData = masjidCanvas.toDataURL('image/png', 1.0);
        const masjidImgWidth = 75;
        const masjidImgHeight = (masjidCanvas.height * masjidImgWidth) / masjidCanvas.width;
        pdf.addImage(masjidImgData, 'PNG', 12, 8, masjidImgWidth, masjidImgHeight, undefined, 'FAST'); // Adjusted for smaller border
      }
    }
    
    // Create and add class name canvas (right side, inside border)
    if (preferences.className && preferences.className.trim() !== '') {
      console.log('Adding class name as canvas image');
      const classCanvas = createTextCanvas(preferences.className, 'right');
      if (classCanvas) {
        const classImgData = classCanvas.toDataURL('image/png', 1.0);
        const classImgWidth = 75;
        const classImgHeight = (classCanvas.height * classImgWidth) / classCanvas.width;
        const classXPos = pageWidth - classImgWidth - 12; // Adjusted for smaller border
        pdf.addImage(classImgData, 'PNG', classXPos, 8, classImgWidth, classImgHeight, undefined, 'FAST');
      }
    }
    
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