import { jsPDF } from 'jspdf';
export const generateDecoratePDF = async (shouldPrint = false, preferences = {}, firstVerse = '', selectedVerses = [], selectedWords = [], selectedDate = null) => {
  console.log("Starting PDF generation with:", {
    preferences,
    firstVerse,
    selectedVerses,
    versesCount: selectedVerses.length,
    selectedWords,
    wordsCount: selectedWords.length,
    masjidName: preferences.masjidName,
    className: preferences.className,
    selectedDate
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
    const y = 12; // Reduced from 25 to 12 for less space between header and Bismillah

    // Add canvas image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');

    // Add "Silsila war test" text in Urdu after Bismillah
    const urduTestText = 'سلسلہ وار ٹیسٹ';
    const urduCanvas = document.createElement('canvas');
    urduCanvas.width = 1500;
    urduCanvas.height = 80; // Reduced from 120 to 80 to minimize padding
    const urduCtx = urduCanvas.getContext('2d', { alpha: false });
    
    // Enable high-quality rendering
    urduCtx.imageSmoothingEnabled = true;
    urduCtx.imageSmoothingQuality = 'high';
    
    // Set white background
    urduCtx.fillStyle = 'white';
    urduCtx.fillRect(0, 0, urduCanvas.width, urduCanvas.height);
    
    // Configure text style for Urdu
    urduCtx.fillStyle = 'black';
    urduCtx.textAlign = 'center';
    urduCtx.textBaseline = 'top'; // Changed from 'middle' to 'top' to reduce top padding
    urduCtx.font = '60px "QuranFont", "Noto Sans Arabic", Arial, sans-serif';
    urduCtx.direction = 'rtl';
    
    // Draw the Urdu text closer to top
    urduCtx.fillText(urduTestText, urduCanvas.width / 2, 5); // Start at y=5 instead of middle
    
    // Add Urdu text canvas to PDF
    const urduImgData = urduCanvas.toDataURL('image/png', 1.0);
    const urduImgWidth = pageWidth * 0.6; // Smaller than main verse
    const urduImgHeight = (urduCanvas.height * urduImgWidth) / urduCanvas.width;
    const urduX = (pageWidth - urduImgWidth) / 2;
    const urduY = y + imgHeight; // No gap - directly touching Bismillah
    pdf.addImage(urduImgData, 'PNG', urduX, urduY, urduImgWidth, urduImgHeight, undefined, 'FAST');

    // Add student name and date row below Urdu text
    const nameFieldY = urduY + urduImgHeight + 10; // Slightly more gap after Urdu text
    
    // Format the selected date or use current date
    const dateToUse = selectedDate ? selectedDate : new Date().toISOString().split('T')[0];
    
    // Create date field (left side) - "بتاریخ:"
    const dateFieldCanvas = document.createElement('canvas');
    dateFieldCanvas.width = 1200; // Increased width to match name field
    dateFieldCanvas.height = 120; // Increased height to match header fields
    const dateFieldCtx = dateFieldCanvas.getContext('2d', { alpha: false });
    
    // Configure date field canvas
    dateFieldCtx.imageSmoothingEnabled = true;
    dateFieldCtx.imageSmoothingQuality = 'high';
    dateFieldCtx.fillStyle = 'white';
    dateFieldCtx.fillRect(0, 0, dateFieldCanvas.width, dateFieldCanvas.height);
    dateFieldCtx.fillStyle = 'black';
    dateFieldCtx.textAlign = 'left';
    dateFieldCtx.textBaseline = 'middle';
    dateFieldCtx.font = '60px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Reduced to 60px for better size
    dateFieldCtx.direction = 'rtl';
    dateFieldCtx.fillText(`بتاریخ: ${dateToUse}`, 20, dateFieldCanvas.height / 2);
    
    // Add date field to PDF (left side)
    const dateFieldImgData = dateFieldCanvas.toDataURL('image/png', 1.0);
    const dateFieldWidth = 100; // Increased to accommodate larger text
    const dateFieldHeight = (dateFieldCanvas.height * dateFieldWidth) / dateFieldCanvas.width;
    pdf.addImage(dateFieldImgData, 'PNG', 10, nameFieldY, dateFieldWidth, dateFieldHeight, undefined, 'FAST');
    
    // Create student name field (right side) - "نام طالب علم:" - SAME SIZE AS HEADERS
    const nameFieldCanvas = document.createElement('canvas');
    nameFieldCanvas.width = 1200; // Same as date field
    nameFieldCanvas.height = 120; // Increased to match header fields and date field
    const nameFieldCtx = nameFieldCanvas.getContext('2d', { alpha: false });
    
    // Configure name field canvas
    nameFieldCtx.imageSmoothingEnabled = true;
    nameFieldCtx.imageSmoothingQuality = 'high';
    nameFieldCtx.fillStyle = 'white';
    nameFieldCtx.fillRect(0, 0, nameFieldCanvas.width, nameFieldCanvas.height);
    nameFieldCtx.fillStyle = 'black';
    nameFieldCtx.textAlign = 'right';
    nameFieldCtx.textBaseline = 'middle';
    nameFieldCtx.font = '60px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Reduced to 60px for better size
    nameFieldCtx.direction = 'rtl';
    nameFieldCtx.fillText('نام طالب علم:', nameFieldCanvas.width - 20, nameFieldCanvas.height / 2);
    
    // Add name field to PDF (right side) - SAME SIZE AS DATE
    const nameFieldImgData = nameFieldCanvas.toDataURL('image/png', 1.0);
    const nameFieldWidth = 100; // Increased to match date field
    const nameFieldHeight = (nameFieldCanvas.height * nameFieldWidth) / nameFieldCanvas.width;
    const nameFieldX = pageWidth - nameFieldWidth - 10;
    pdf.addImage(nameFieldImgData, 'PNG', nameFieldX, nameFieldY, nameFieldWidth, nameFieldHeight, undefined, 'FAST');
    
    // Draw single full-width horizontal line beneath both fields
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    const fullLineY = nameFieldY + Math.max(dateFieldHeight, nameFieldHeight); // No gap - directly below fields
    pdf.line(10, fullLineY, pageWidth - 10, fullLineY); // Full width line from margin to margin

    // Create canvases for header texts FIRST (before verses and words)
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
      textCtx.font = '90px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Increased from 72px to 90px
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

    // Add selected verses for translation below the main verse
    if (selectedVerses && selectedVerses.length > 0) {
      console.log(`Adding ${selectedVerses.length} selected verses for translation`);
      
      // Calculate position after Urdu text and name/date fields
      const urduImgWidth = pageWidth * 0.6;
      const urduImgHeight = (80 * urduImgWidth) / 1500; // Updated to use new canvas height
      const urduY = y + imgHeight; // No gap - directly touching Bismillah
      const nameFieldY = urduY + urduImgHeight + 8;
      const nameFieldHeight = 12; // Approximate height of name/date row
      
      let currentY = nameFieldY + nameFieldHeight + 8; // Start after name/date fields with gap
      const lineHeight = 4; // Very tight line spacing
      const verseSpacing = 8; // Minimal verse spacing
      const verseWidth = pageWidth - 20; // Wider text area
      
      // Function to create verse canvas (Arabic text only) with MUCH larger font
      const createVerseCanvas = (verseText) => {
        const verseCanvas = document.createElement('canvas');
        verseCanvas.width = 3200; // Much wider canvas
        verseCanvas.height = 220; // Much taller for bigger font
        const verseCtx = verseCanvas.getContext('2d', { alpha: false });
        
        // Enable high-quality rendering
        verseCtx.imageSmoothingEnabled = true;
        verseCtx.imageSmoothingQuality = 'high';
        
        // Set white background
        verseCtx.fillStyle = 'white';
        verseCtx.fillRect(0, 0, verseCanvas.width, verseCanvas.height);
        
        // Configure text style for Arabic - MUCH BIGGER FONT
        verseCtx.fillStyle = 'black';
        verseCtx.textAlign = 'right';
        verseCtx.textBaseline = 'middle';
        verseCtx.font = '90px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Increased from 64px to 90px
        verseCtx.direction = 'rtl';
        
        // Draw the Arabic text
        const xPos = verseCanvas.width - 20;
        verseCtx.fillText(verseText, xPos, verseCanvas.height / 2);
        
        return verseCanvas;
      };
      
      // Function to estimate lines needed based on translation length
      const estimateLines = (translation) => {
        if (!translation) return 1; // Just 1 line default
        const charCount = translation.length;
        const charsPerLine = 100; // More characters per line
        const estimatedLines = Math.ceil(charCount / charsPerLine);
        return Math.max(1, Math.min(estimatedLines, 3)); // Between 1-3 lines only
      };
      
      selectedVerses.forEach((verse, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = 15; // Start closer to top on new page
          
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
          const arabicImgWidth = verseWidth - 15;
          const arabicImgHeight = (arabicCanvas.height * arabicImgWidth) / arabicCanvas.width;
          pdf.addImage(arabicImgData, 'PNG', 15, currentY, arabicImgWidth, arabicImgHeight, undefined, 'FAST');
          
          // Add simple circle symbol on the RIGHT side (✤ doesn't work in jsPDF)
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(20); // Bigger symbol
          pdf.setTextColor(0, 0, 0);
          pdf.text('○', pageWidth - 15, currentY + (arabicImgHeight / 2)); // Use simple circle
          
          currentY += arabicImgHeight + 2; // Minimal spacing
        }
        
        // Add empty lines for translation based on estimated length
        const linesNeeded = estimateLines(verse.translation);
        pdf.setDrawColor(100, 100, 100); // Darker grey for lines
        pdf.setLineWidth(0.5); // Thicker lines
        
        for (let i = 0; i < linesNeeded; i++) {
          currentY += lineHeight;
          // Draw horizontal line for writing
          pdf.line(15, currentY, pageWidth - 15, currentY);
        }
        
        currentY += verseSpacing; // Minimal space before next verse
      });
      
      // Add minimal space before word meanings section
      currentY += 10;
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
      const wordHeight = 30; // Increased height for bigger words
      const wordSpacing = 6; // Reduced spacing between word rows
      
      // Function to create word canvas with MUCH bigger font
      const createWordCanvas = (word) => {
        const wordCanvas = document.createElement('canvas');
        wordCanvas.width = 1000; // Wider canvas
        wordCanvas.height = 160; // Taller canvas
        const wordCtx = wordCanvas.getContext('2d', { alpha: false });
        
        // Enable high-quality rendering
        wordCtx.imageSmoothingEnabled = true;
        wordCtx.imageSmoothingQuality = 'high';
        
        // Set white background
        wordCtx.fillStyle = 'white';
        wordCtx.fillRect(0, 0, wordCanvas.width, wordCanvas.height);
        
        // Configure text style for Arabic word - MUCH BIGGER FONT
        wordCtx.fillStyle = 'black';
        wordCtx.textAlign = 'center';
        wordCtx.textBaseline = 'middle';
        wordCtx.font = '80px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Increased from 56px to 80px
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
        const wordWidth = (pageWidth - 30) / wordsPerRow; // Reduced margins
        
        // Add words in current row
        rowWords.forEach((word, colIndex) => {
          const wordCanvas = createWordCanvas(word);
          const wordImgData = wordCanvas.toDataURL('image/png', 1.0);
          const wordImgWidth = wordWidth - 5; // Minimal margin
          const wordImgHeight = (wordCanvas.height * wordImgWidth) / wordCanvas.width;
          const xPos = 15 + (colIndex * wordWidth); // Reduced margin
          
          pdf.addImage(wordImgData, 'PNG', xPos, currentY, wordImgWidth, wordImgHeight, undefined, 'FAST');
        });
        
        currentY += wordHeight;
        
        // Add empty lines for meanings under each word
        pdf.setDrawColor(100, 100, 100); // Darker lines
        pdf.setLineWidth(0.5); // Thicker lines
        
        for (let lineIndex = 0; lineIndex < 2; lineIndex++) { // 2 lines per word
          currentY += 4; // Reduced line spacing
          // Draw lines under each word position
          rowWords.forEach((word, colIndex) => {
            const wordWidth = (pageWidth - 30) / wordsPerRow; // Reduced margins
            const xStart = 15 + (colIndex * wordWidth);
            const xEnd = xStart + wordWidth - 5;
            pdf.line(xStart, currentY, xEnd, currentY);
          });
        }
        
        currentY += wordSpacing;
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