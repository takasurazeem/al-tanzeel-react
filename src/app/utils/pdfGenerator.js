import { jsPDF } from 'jspdf';
export const generateDecoratePDF = async (shouldPrint = false, preferences = {}, firstVerse = '', selectedVerses = [], selectedWords = [], selectedDate = null, pageSize = 'a4') => {
  console.log("Starting PDF generation with:", {
    preferences,
    firstVerse,
    selectedVerses,
    versesCount: selectedVerses.length,
    selectedWords,
    wordsCount: selectedWords.length,
    masjidName: preferences.masjidName,
    className: preferences.className,
    selectedDate,
    pageSize
  });

  try {
    // Define page size dimensions (in mm for jsPDF)
    const pageSizes = {
      'a4': { width: 210, height: 297 },
      'a3': { width: 297, height: 420 },
      'a5': { width: 148, height: 210 },
      'letter': { width: 216, height: 279 },
      'legal': { width: 216, height: 356 }
    };
    
    const selectedPageSize = pageSizes[pageSize.toLowerCase()] || pageSizes['a4'];
    
    // Calculate canvas width based on page size (convert mm to pixels approximately)
    // Using 3.78 pixels per mm (96 DPI conversion)
    const canvasWidthFactor = selectedPageSize.width * 3.78 * 2.5; // Scale factor for high quality
    
    // Create canvas for Quran verse with dynamic width
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidthFactor;
    canvas.height = 400; // Keep height proportional
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
    
    // Create PDF with specified page size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize.toLowerCase(), // Use the passed page size
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
    dateFieldCtx.font = '60px "NotoNastaliqUrdu", "Noto Sans Arabic", Arial, sans-serif'; // Use NotoNastaliqUrdu for Urdu text
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
    nameFieldCtx.font = '60px "NotoNastaliqUrdu", "Noto Sans Arabic", Arial, sans-serif'; // Use NotoNastaliqUrdu for Urdu text
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
      textCtx.font = '90px "NotoNastaliqUrdu", "Noto Sans Arabic", Arial, sans-serif'; // Use NotoNastaliqUrdu for Urdu text (masjid/class names)
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
      const lineHeight = 8; // Notebook-style line spacing for better writing experience
      const verseSpacing = 8; // Minimal verse spacing
      const verseWidth = pageWidth - 20; // Wider text area
      
      // Function to create verse canvas (Arabic text only) with multi-line text wrapping
      const createVerseCanvas = (verseText) => {
        const baseFontSize = 120; // Keep standard font size
        const padding = 40; // Padding for verses
        const lineHeight = baseFontSize * 1.2; // Line height for multi-line text
        const maxWidth = canvasWidthFactor - (padding * 2); // Maximum width per line
        
        // Create temporary canvas to measure text and break into lines
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `${baseFontSize}px "QuranFont", "Noto Sans Arabic", Arial, sans-serif`;
        tempCtx.direction = 'rtl';
        
        // Function to break text into lines that fit within maxWidth
        const wrapText = (text, maxWidth) => {
          const words = text.split(' ');
          const lines = [];
          let currentLine = '';
          
          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
            const testWidth = tempCtx.measureText(testLine).width;
            
            if (testWidth > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine) {
            lines.push(currentLine);
          }
          
          return lines;
        };
        
        // Break text into lines
        const lines = wrapText(verseText, maxWidth);
        
        // Add verse ending character to the last line
        if (lines.length > 0) {
          lines[lines.length - 1] += ' ۞'; // Add traditional Quranic verse ending marker
        }
        
        // Calculate canvas dimensions based on number of lines
        const canvasWidth = canvasWidthFactor; // Use full page-based width
        const canvasHeight = (lines.length * lineHeight) + (padding * 2); // Dynamic height based on lines
        
        const verseCanvas = document.createElement('canvas');
        verseCanvas.width = canvasWidth;
        verseCanvas.height = canvasHeight;
        const verseCtx = verseCanvas.getContext('2d', { alpha: false });
        
        // Enable high-quality rendering
        verseCtx.imageSmoothingEnabled = true;
        verseCtx.imageSmoothingQuality = 'high';
        
        // Set white background
        verseCtx.fillStyle = 'white';
        verseCtx.fillRect(0, 0, verseCanvas.width, verseCanvas.height);
        
        // Configure text style for Arabic
        verseCtx.fillStyle = 'black';
        verseCtx.textAlign = 'right';
        verseCtx.textBaseline = 'top';
        verseCtx.font = `${baseFontSize}px "QuranFont", "Noto Sans Arabic", Arial, sans-serif`;
        verseCtx.direction = 'rtl';
        
        // Draw each line of text
        const startX = verseCanvas.width - padding;
        const startY = padding;
        
        lines.forEach((line, index) => {
          const yPos = startY + (index * lineHeight);
          verseCtx.fillText(line, startX, yPos);
        });
        
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
          
          // Use reference mark (※) with canvas rendering and QuranFont
          const markerCanvas = document.createElement('canvas');
          markerCanvas.width = 120; // Smaller width to prevent border overlap
          markerCanvas.height = 60; // Smaller height
          const markerCtx = markerCanvas.getContext('2d', { alpha: false });
          
          // Configure marker canvas
          markerCtx.imageSmoothingEnabled = true;
          markerCtx.imageSmoothingQuality = 'high';
          markerCtx.fillStyle = 'white';
          markerCtx.fillRect(0, 0, markerCanvas.width, markerCanvas.height);
          markerCtx.fillStyle = 'black';
          markerCtx.textAlign = 'center';
          markerCtx.textBaseline = 'middle';
          markerCtx.font = '36px "QuranFont", "Noto Sans Arabic", Arial, sans-serif'; // Match verse font size ratio
          markerCtx.direction = 'rtl';
          
          // Use reference mark
          const markerText = '※';
          
          // Draw marker text on canvas
          markerCtx.fillText(markerText, markerCanvas.width / 2, markerCanvas.height / 2);
          
          // Add marker canvas to PDF with smaller size to prevent overlap
          const markerImgData = markerCanvas.toDataURL('image/png', 1.0);
          const markerImgWidth = 12; // Smaller width to prevent border overlap
          const markerImgHeight = (markerCanvas.height * markerImgWidth) / markerCanvas.width;
          pdf.addImage(markerImgData, 'PNG', pageWidth - 18, currentY + (arabicImgHeight / 2) - (markerImgHeight / 2), markerImgWidth, markerImgHeight, undefined, 'FAST');
          
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

    // Add selected words for meanings below the verses in simple grid layout
    if (selectedWords && selectedWords.length > 0) {
      console.log(`Adding ${selectedWords.length} selected words for meanings in clean grid layout`);
      
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
      
      // Simple 4-column layout: Meaning | Word | Meaning | Word
      const columnsPerRow = 4;
      const wordsPerRow = 2; // 2 words per row
      const columnWidth = (pageWidth - 40) / columnsPerRow; // Smaller columns for tighter spacing
      const baseFontSize = 56; // Reduced from 60px to 56px (4 points smaller)
      const wordRowHeight = (baseFontSize * 1.05) * 0.3528; // Much tighter - reduced from 1.2 to 1.05
      const meaningRowHeight = 10; // Reduced height for meaning lines section
      const rowSpacing = 0.5; // Even more minimal space between word-meaning pairs
      
      // Function to create word canvas for clean grid
      const createWordCanvas = (word) => {
        // Calculate optimal canvas dimensions based on font size and text content
        const fontSize = baseFontSize; // Use reduced font size (60px)
        const padding = 15; // Reduced padding for smaller font size
        
        // Create temporary canvas to measure text dimensions
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `${fontSize}px "QuranFont", "Noto Sans Arabic", Arial, sans-serif`;
        tempCtx.direction = 'rtl';
        
        // Measure text width
        const textMetrics = tempCtx.measureText(word);
        const textWidth = textMetrics.width;
        
        // Calculate optimal canvas dimensions - prevent clipping
        const canvasWidth = Math.max(textWidth + (padding * 2), 200); // Reduced minimum width for smaller font
        const canvasHeight = fontSize * 2.5; // Increased to 150% extra height to completely prevent clipping
        
        const wordCanvas = document.createElement('canvas');
        wordCanvas.width = canvasWidth;
        wordCanvas.height = canvasHeight;
        const wordCtx = wordCanvas.getContext('2d', { alpha: false });
        
        // Enable high-quality rendering
        wordCtx.imageSmoothingEnabled = true;
        wordCtx.imageSmoothingQuality = 'high';
        
        // Set white background
        wordCtx.fillStyle = 'white';
        wordCtx.fillRect(0, 0, wordCanvas.width, wordCanvas.height);
        
        // Configure text style for Arabic word - RTL alignment with calculated font size
        wordCtx.fillStyle = 'black';
        wordCtx.textAlign = 'right'; // Right align for RTL text
        wordCtx.textBaseline = 'middle';
        wordCtx.font = `${fontSize}px "QuranFont", "Noto Sans Arabic", Arial, sans-serif`;
        wordCtx.direction = 'rtl';
        
        // Draw the word aligned to the right with calculated padding
        wordCtx.fillText(word, wordCanvas.width - padding, wordCanvas.height / 2);
        
        return wordCanvas;
      };
      
      // Process words in pairs (2 words per row for clean 4-column layout)
      for (let i = 0; i < selectedWords.length; i += wordsPerRow) {
        // Check if we need a new page
        if (currentY > pageHeight - 120) {
          pdf.addPage();
          currentY = 20;
          
          // Redraw border on new page
          pdf.setDrawColor(60, 60, 60);
          pdf.setLineWidth(1.0);
          pdf.setLineDashPattern([], 0);
          pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
        }
        
        const rowWords = selectedWords.slice(i, i + wordsPerRow);
        
        // Add words in their respective columns
        rowWords.forEach((word, wordIndex) => {
          // Calculate word column position - RTL layout: first column is rightmost (column 3)
          const totalWordIndex = i + wordIndex;
          // For RTL: 0,2,4,6,8,10 -> column 3 (rightmost/first); 1,3,5,7,9 -> column 1 (leftmost/second)
          const isEvenIndex = totalWordIndex % 2 === 0;
          const wordColumnIndex = isEvenIndex ? 3 : 1; // Even indices go to column 3 (rightmost), odd indices go to column 1
          
          // Add word in its column
          const wordCanvas = createWordCanvas(word);
          const wordImgData = wordCanvas.toDataURL('image/png', 1.0);
          const wordImgWidth = columnWidth - 2; // Very minimal margin for maximum tightness
          const wordImgHeight = (wordCanvas.height * wordImgWidth) / wordCanvas.width;
          const wordXPos = 20 + (wordColumnIndex * columnWidth); // Centered positioning with equal margins
          
          pdf.addImage(wordImgData, 'PNG', wordXPos, currentY, wordImgWidth, wordImgHeight, undefined, 'FAST');
        });
        
        currentY += wordRowHeight;
        
        // Add empty space for meanings in columns 0 and 2 (meaning columns on the left)
        currentY += 2; // Very minimal vertical spacing with optimized canvas
        
        currentY += rowSpacing; // Very minimal space before next word pair
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