import { jsPDF } from 'jspdf';

// Import server logger for mobile Safari debugging
const sendSafariLog = async (message, data = null) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'info',
          message: `[SAFARI-PDF] ${message}`,
          data: data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (e) {
      // Fail silently to avoid breaking PDF generation
    }
  }
};

export const generateDecoratePDF = async (shouldPrint = false, preferences = {}, firstVerse = '', selectedVerses = [], selectedWords = [], selectedDate = null, pageSize = 'a4') => {
  // Send initial Safari log
  await sendSafariLog('PDF generation started', {
    versesCount: selectedVerses.length,
    wordsCount: selectedWords.length,
    pageSize: pageSize,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  });

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
    
    // Create canvas for Quran verse with dynamic width and height based on text measurement
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidthFactor;
    
    // Calculate dynamic height based on actual text measurement
    const baseFontSize = 120;
    
    // Create temporary canvas to measure text dimensions
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${baseFontSize}px "QuranFont", "Noto Sans Arabic", Arial, sans-serif`;
    tempCtx.direction = 'rtl';
    
    // Measure the actual text
    const textMetrics = tempCtx.measureText(firstVerse);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    
    // Calculate canvas height with generous padding to prevent any clipping
    const textPadding = Math.max(120, textHeight * 0.8); // Adaptive padding based on text height
    canvas.height = Math.max((baseFontSize * 2) + textPadding, textHeight + textPadding); // Ensure minimum height
    
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load font for PDF and ensure it's ready
    const fontStack = '"QuranFont", "Noto Sans Arabic", Arial, sans-serif';
    const fontSize = `${baseFontSize}px`;
    
    // Wait for font to load with multiple attempts
    try {
      await document.fonts.load(`${fontSize} ${fontStack}`);
      // Small delay to ensure font is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn('Font loading failed, continuing with fallback:', error);
    }
    
    // Configure text style for Arabic with precise alignment
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize} ${fontStack}`;
    ctx.direction = 'rtl';
    
    // Draw the Arabic text with verified positioning
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.fillText(firstVerse, centerX, centerY);
    
    // Debug: Log canvas dimensions and text metrics
    console.log('Main verse canvas dimensions:', {
      width: canvas.width,
      height: canvas.height,
      textWidth: textWidth,
      textHeight: textHeight,
      fontSize: baseFontSize,
      padding: textPadding
    });
    
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
    
    // Calculate dynamic height based on font size and content
    const urduFontSize = 60;
    const urduTextPadding = 40; // Increased padding to prevent clipping
    urduCanvas.height = (urduFontSize * 1.5) + urduTextPadding; // 1.5x font size + padding for proper spacing
    
    const urduCtx = urduCanvas.getContext('2d', { alpha: false });
    
    // Enable high-quality rendering
    urduCtx.imageSmoothingEnabled = true;
    urduCtx.imageSmoothingQuality = 'high';
    
    // Set white background
    urduCtx.fillStyle = 'white';
    urduCtx.fillRect(0, 0, urduCanvas.width, urduCanvas.height);
    
    // Configure text style for Urdu with proper baseline
    urduCtx.fillStyle = 'black';
    urduCtx.textAlign = 'center';
    urduCtx.textBaseline = 'middle'; // Use middle for proper centering
    urduCtx.font = '60px "QuranFont", "Noto Sans Arabic", Arial, sans-serif';
    urduCtx.direction = 'rtl';
    
    // Draw the Urdu text with proper positioning
    urduCtx.fillText(urduTestText, urduCanvas.width / 2, (urduCanvas.height / 2));
    
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
    dateFieldCanvas.width = 1200;
    
    // Calculate dynamic height based on font size
    const dateFieldFontSize = 60;
    const dateFieldPadding = 60; // Increased padding to prevent clipping
    dateFieldCanvas.height = (dateFieldFontSize * 1.5) + dateFieldPadding; // 1.5x font size + padding for proper spacing
    
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
    
    // Create student name field (right side) - "نام طالب علم:" with dynamic height
    const nameFieldCanvas = document.createElement('canvas');
    nameFieldCanvas.width = 1200;
    
    // Calculate dynamic height based on font size (same as date field)
    const nameFieldFontSize = 60;
    const nameFieldPadding = 60; // Increased padding to prevent clipping
    nameFieldCanvas.height = (nameFieldFontSize * 1.5) + nameFieldPadding; // 1.5x font size + padding matching date field
    
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
    
    // Function to create text canvas with dynamic sizing
    const createTextCanvas = (text, textAlign = 'right') => {
      if (!text || text.trim() === '') return null;
      
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 1200;
      
      // Calculate dynamic height based on font size and content
      const headerFontSize = 90;
      const headerPadding = 80; // Increased padding to prevent clipping of large text
      textCanvas.height = (headerFontSize * 1.5) + headerPadding; // 1.5x font size + padding for proper spacing
      
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
    let currentY; // Declare currentY at a higher scope so it's available for words section
    
    if (selectedVerses && selectedVerses.length > 0) {
      console.log(`Adding ${selectedVerses.length} selected verses for translation`);
      
      // Calculate position after Urdu text and name/date fields
      const urduImgWidth = pageWidth * 0.6;
      const urduImgHeight = (urduCanvas.height * urduImgWidth) / urduCanvas.width; // Use actual canvas height
      const urduY = y + imgHeight; // No gap - directly touching Bismillah
      const nameFieldY = urduY + urduImgHeight + 8;
      const nameFieldHeight = 12; // Approximate height of name/date row
      
      currentY = nameFieldY + nameFieldHeight + 8; // Start after name/date fields with gap
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
      
      // Function to calculate accurate lines needed based on Urdu translation and page layout
      const estimateLines = (verse) => {
        // If verse already has translationLines property set by user, use that
        if (verse.translationLines && typeof verse.translationLines === 'number') {
          return verse.translationLines;
        }
        
        // Fallback to original calculation if translationLines is not set
        if (!verse || !verse.translation) return 2; // Default minimum lines if no translation
        
        const urduTranslation = verse.translation;
        
        // Calculate available writing width based on page layout
        const pageMargins = 15; // Left and right margins (15mm each side)
        const availableWidth = pageWidth - (pageMargins * 2); // Total writing width in mm
        
        // Convert to pixels for accurate calculation (3.78 pixels per mm at 96 DPI)
        const availableWidthPx = availableWidth * 3.78;
        
        // Average handwriting characteristics for Urdu/Arabic script
        const avgCharWidthPx = 8; // Average character width for normal handwriting in pixels
        const charsPerLine = Math.floor(availableWidthPx / avgCharWidthPx);
        
        // Calculate lines needed based on translation length
        const translationLength = urduTranslation.length;
        const baseLinesNeeded = Math.ceil(translationLength / charsPerLine);
        
        // Add buffer for natural line breaks and punctuation
        const bufferMultiplier = 1.2; // 20% extra space for natural writing flow
        const linesWithBuffer = Math.ceil(baseLinesNeeded * bufferMultiplier);
        
        // Page size adjustments for different formats
        let pageSizeMultiplier = 1.0;
        if (selectedPageSize.width >= 297) { // A3 and larger
          pageSizeMultiplier = 1.3; // 30% more generous spacing
        } else if (selectedPageSize.width <= 148) { // A5 and smaller
          pageSizeMultiplier = 0.8; // 20% more compact
        }
        
        const adjustedLines = Math.ceil(linesWithBuffer * pageSizeMultiplier);
        
        // Reasonable bounds based on translation length
        const minLines = Math.max(2, Math.ceil(translationLength / 150)); // Minimum based on text length
        const maxLines = Math.min(8, Math.ceil(translationLength / 50)); // Maximum with tighter packing
        
        return Math.max(minLines, Math.min(adjustedLines, maxLines));
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
          
          // Use reference mark (※) with canvas rendering and QuranFont with dynamic sizing
          const markerCanvas = document.createElement('canvas');
          
          // Calculate dynamic dimensions based on font size
          const markerFontSize = 36;
          const markerPadding = 30; // Increased padding around the marker to prevent clipping
          markerCanvas.width = (markerFontSize * 1.5) + markerPadding; // 1.5x font size + padding
          markerCanvas.height = (markerFontSize * 1.5) + markerPadding; // 1.5x font size + padding
          
          const markerCtx = markerCanvas.getContext('2d', { alpha: false });
          
          // Configure marker canvas
          markerCtx.imageSmoothingEnabled = true;
          markerCtx.imageSmoothingQuality = 'high';
          markerCtx.fillStyle = 'white';
          markerCtx.fillRect(0, 0, markerCanvas.width, markerCanvas.height);
          markerCtx.fillStyle = 'black';
          markerCtx.textAlign = 'center';
          markerCtx.textBaseline = 'middle';
          markerCtx.font = `${markerFontSize}px "QuranFont", "Noto Sans Arabic", Arial, sans-serif`; // Use calculated font size
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
        
        // Add empty lines for translation based on verse content and length
        const linesNeeded = estimateLines(verse);
        pdf.setDrawColor(100, 100, 100); // Darker grey for lines
        pdf.setLineWidth(0.5); // Thicker lines
        
        for (let i = 0; i < linesNeeded; i++) {
          currentY += lineHeight;
          
          // Check if the line would go beyond the page border
          if (currentY > pageHeight - borderMargin - 5) { // Leave 5mm buffer from border
            // Start new page
            pdf.addPage();
            currentY = borderMargin + 15; // Start after border with some margin
            
            // Redraw border on new page
            pdf.setDrawColor(60, 60, 60);
            pdf.setLineWidth(1.0);
            pdf.setLineDashPattern([], 0);
            pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
            
            // Reset line drawing properties
            pdf.setDrawColor(100, 100, 100);
            pdf.setLineWidth(0.5);
          }
          
          // Draw horizontal line for writing - full width touching borders for maximum writing space
          pdf.line(borderMargin, currentY, pageWidth - borderMargin, currentY);
        }
        
        currentY += verseSpacing; // Minimal space before next verse
      });
      
      // Add minimal space before word meanings section
      currentY += 10;
    } else {
      // If no verses, initialize currentY for words section
      const urduImgWidth = pageWidth * 0.6;
      const urduImgHeight = (urduCanvas.height * urduImgWidth) / urduCanvas.width;
      const urduY = y + imgHeight;
      const nameFieldY = urduY + urduImgHeight + 8;
      const nameFieldHeight = 12;
      currentY = nameFieldY + nameFieldHeight + 20; // Start after name/date fields with more gap
    }

    // Add selected words for meanings below the verses in simple grid layout
    if (selectedWords && selectedWords.length > 0) {
      console.log(`Adding ${selectedWords.length} selected words for meanings in clean grid layout`);
      console.log('Current device info:', {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        isMobile: typeof window !== 'undefined' ? /Mobi|Android/i.test(navigator.userAgent) : false,
        screenWidth: typeof window !== 'undefined' ? window.screen.width : 'Unknown'
      });
      
      // Use the currentY from verses section or initialize if no verses
      if (selectedVerses && selectedVerses.length > 0) {
        // currentY is already set from the verses loop above
        console.log('Words will start after verses at currentY:', currentY);
      } else {
        // If no verses, initialize currentY for words section
        const urduImgWidth = pageWidth * 0.6;
        const urduImgHeight = (urduCanvas.height * urduImgWidth) / urduCanvas.width;
        const urduY = y + imgHeight;
        const nameFieldY = urduY + urduImgHeight + 8;
        const nameFieldHeight = 12;
        currentY = nameFieldY + nameFieldHeight + 20; // Start after name/date fields with more gap
      }
      
      // Validate currentY before proceeding
      if (isNaN(currentY) || currentY < 0) {
        console.error('Invalid currentY detected:', currentY);
        currentY = borderMargin + 100; // Safe fallback position
      }
      
      // Simple 4-column layout: Meaning | Word | Meaning | Word
      const columnsPerRow = 4;
      const wordsPerRow = 2; // 2 words per row
      const columnWidth = (pageWidth - 40) / columnsPerRow; // Smaller columns for tighter spacing
      const baseFontSize = 56; // Reduced from 60px to 56px (4 points smaller)
      const wordRowHeight = (baseFontSize * 1.05) * 0.3528; // Much tighter - reduced from 1.2 to 1.05
      const meaningRowHeight = 10; // Reduced height for meaning lines section
      const rowSpacing = 0.5; // Even more minimal space between word-meaning pairs
      
      // Calculate total height needed for all words to determine if we need a new page
      const totalWordsRows = Math.ceil(selectedWords.length / wordsPerRow);
      const estimatedWordsHeight = totalWordsRows * (wordRowHeight + meaningRowHeight + rowSpacing) + 20; // Extra margin
      
      // Check if words section can fit on current page
      const availableSpace = pageHeight - borderMargin - 5 - currentY; // Space available from currentY to page bottom
      
      console.log('Words section space check:', {
        currentY: currentY,
        availableSpace: availableSpace,
        estimatedWordsHeight: estimatedWordsHeight,
        pageHeight: pageHeight,
        borderMargin: borderMargin,
        totalWordsRows: totalWordsRows,
        selectedWordsLength: selectedWords.length
      });
      
      // Enhanced mobile device detection including Safari-specific patterns
      const isMobileDevice = typeof navigator !== 'undefined' && 
        (/Mobi|Android|iPhone|iPad|Safari.*Mobile|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent) ||
         (typeof window !== 'undefined' && window.screen && window.screen.width <= 768));
      
      // More specific Safari mobile detection
      const isSafariMobile = typeof navigator !== 'undefined' && 
        (/iPhone|iPad/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent));
      
      console.log('Mobile detection details:', {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        screenWidth: typeof window !== 'undefined' && window.screen ? window.screen.width : 'N/A',
        isMobileDevice: isMobileDevice,
        isSafariMobile: isSafariMobile
      });
      
      // Send Safari debugging info
      await sendSafariLog('Mobile detection completed', {
        isMobileDevice,
        isSafariMobile,
        availableSpace,
        estimatedWordsHeight,
        selectedWordsLength: selectedWords.length
      });
      
      if (estimatedWordsHeight > availableSpace) {
        console.log(`Starting new page for words section due to space constraint. Available: ${availableSpace}mm, Needed: ${estimatedWordsHeight}mm`);
        await sendSafariLog('Creating new page - space constraint', { availableSpace, estimatedWordsHeight });
        pdf.addPage();
        currentY = borderMargin + 15; // Start after border with some margin
        console.log('New page created, currentY reset to:', currentY);
        
        // Redraw border on new page
        pdf.setDrawColor(60, 60, 60);
        pdf.setLineWidth(1.0);
        pdf.setLineDashPattern([], 0);
        pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
      } else if (isSafariMobile || (isMobileDevice && selectedWords.length > 0)) {
        // ALWAYS force new page for Safari mobile or any mobile device with words to prevent rendering issues
        console.log(`FORCE: Starting new page for Safari mobile or mobile device with ${selectedWords.length} words`);
        await sendSafariLog('FORCE creating new page - Safari mobile', { selectedWordsLength: selectedWords.length, isSafariMobile, isMobileDevice });
        pdf.addPage();
        currentY = borderMargin + 15; // Start after border with some margin
        console.log('FORCED Mobile new page created, currentY reset to:', currentY);
        
        // Redraw border on new page
        pdf.setDrawColor(60, 60, 60);
        pdf.setLineWidth(1.0);
        pdf.setLineDashPattern([], 0);
        pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
      } else {
        console.log(`Words section fits on current page. Available: ${availableSpace}mm, Needed: ${estimatedWordsHeight}mm`);
        await sendSafariLog('Words section fits on current page', { availableSpace, estimatedWordsHeight });
        // Add some spacing from the last verse's translation lines
        currentY += 15;
        console.log('After adding 15mm spacing, currentY is now:', currentY);
      }
      
      // Function to create word canvas for clean grid
      const createWordCanvas = (word) => {
        try {
          // Calculate optimal canvas dimensions based on font size and text content
          const fontSize = baseFontSize; // Use reduced font size (56px)
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
          // More conservative sizing for Safari mobile
          const isMobileDevice = typeof navigator !== 'undefined' && 
            (/Mobi|Android|iPhone|iPad|Safari.*Mobile|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent) ||
             (typeof window !== 'undefined' && window.screen && window.screen.width <= 768));
          
          // Even more conservative for Safari mobile
          const isSafariMobile = typeof navigator !== 'undefined' && 
            (/iPhone|iPad/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent));
          
          // Ultra-conservative scale factors for Safari
          let scaleFactor = 1.2; // Default
          if (isSafariMobile) {
            scaleFactor = 0.6; // Very conservative for Safari mobile
          } else if (isMobileDevice) {
            scaleFactor = 0.8; // Conservative for other mobile
          }
          
          const canvasWidth = Math.max(textWidth + (padding * 2), 200) * scaleFactor;
          const canvasHeight = fontSize * 1.8 * scaleFactor; // Even more reduced for Safari
          
          console.log(`Creating word canvas for "${word}": ${canvasWidth}x${canvasHeight}, mobile: ${isMobileDevice}, Safari: ${isSafariMobile}, scale: ${scaleFactor}`);
          
          const wordCanvas = document.createElement('canvas');
          
          // Very conservative canvas limits for Safari
          const maxCanvasSize = isSafariMobile ? 1024 : 2048;
          if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
            console.warn(`Canvas dimensions too large for Safari mobile, reducing from ${canvasWidth}x${canvasHeight} to max ${maxCanvasSize}`);
            wordCanvas.width = Math.min(canvasWidth, maxCanvasSize);
            wordCanvas.height = Math.min(canvasHeight, maxCanvasSize);
          } else {
            wordCanvas.width = canvasWidth;
            wordCanvas.height = canvasHeight;
          }
          
          const wordCtx = wordCanvas.getContext('2d', { alpha: false });
          
          if (!wordCtx) {
            console.error('Failed to get 2D context for word canvas');
            return null;
          }
          
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
        } catch (error) {
          console.error('Error creating word canvas:', error);
          return null;
        }
      };
      
      // Process words in pairs (2 words per row for clean 4-column layout)
      console.log('Starting word processing loop with currentY:', currentY);
      for (let i = 0; i < selectedWords.length; i += wordsPerRow) {
        // Robust currentY validation for Safari compatibility
        if (isNaN(currentY) || currentY < borderMargin || currentY > pageHeight - borderMargin) {
          console.error('Invalid currentY detected, resetting:', currentY);
          currentY = borderMargin + 20; // Reset to safe value
        }
        
        console.log(`Processing word row ${i / wordsPerRow + 1} at currentY: ${currentY}`);
        
        // Check if we need a new page - more conservative for Safari
        const spaceNeeded = wordRowHeight + meaningRowHeight + rowSpacing + 20; // Buffer for Safari
        if (currentY + spaceNeeded > pageHeight - borderMargin - 10) {
          console.log(`Creating new page for words: currentY (${currentY}) + spaceNeeded (${spaceNeeded}) > pageHeight limit (${pageHeight - borderMargin - 10})`);
          pdf.addPage();
          currentY = borderMargin + 15; // Consistent with other new page logic
          console.log('New page created for words, currentY reset to:', currentY);
          
          // Redraw border on new page
          pdf.setDrawColor(60, 60, 60);
          pdf.setLineWidth(1.0);
          pdf.setLineDashPattern([], 0);
          pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
        }
        
        const rowWords = selectedWords.slice(i, i + wordsPerRow);
        console.log(`Processing words:`, rowWords.map(w => w.substring(0, 10) + '...'), 'at currentY:', currentY);
        
        // Add words in their respective columns
        rowWords.forEach((word, wordIndex) => {
          try {
            // Calculate word column position - RTL layout: first column is rightmost (column 3)
            const totalWordIndex = i + wordIndex;
            // For RTL: 0,2,4,6,8,10 -> column 3 (rightmost/first); 1,3,5,7,9 -> column 1 (leftmost/second)
            const isEvenIndex = totalWordIndex % 2 === 0;
            const wordColumnIndex = isEvenIndex ? 3 : 1; // Even indices go to column 3 (rightmost), odd indices go to column 1
            
            // Add word in its column with coordinate validation
            const wordCanvas = createWordCanvas(word);
            
            if (!wordCanvas) {
              console.error(`Failed to create canvas for word: ${word}`);
              return; // Skip this word if canvas creation failed
            }
            
            const wordImgData = wordCanvas.toDataURL('image/png', 1.0);
            const wordImgWidth = columnWidth - 2; // Very minimal margin for maximum tightness
            const wordImgHeight = (wordCanvas.height * wordImgWidth) / wordCanvas.width;
            const wordXPos = 20 + (wordColumnIndex * columnWidth); // Centered positioning with equal margins
            
            // Enhanced coordinate validation for Safari
            if (isNaN(wordXPos) || isNaN(currentY) || isNaN(wordImgWidth) || isNaN(wordImgHeight) ||
                wordXPos < 0 || currentY < 0 || wordImgWidth <= 0 || wordImgHeight <= 0) {
              console.error('Invalid coordinates for word:', { 
                word, 
                wordXPos, 
                currentY, 
                wordImgWidth, 
                wordImgHeight,
                columnWidth,
                wordColumnIndex 
              });
              return;
            }
            
            console.log(`Adding word "${word}" at position:`, { x: wordXPos, y: currentY, width: wordImgWidth, height: wordImgHeight });
            
            // Add comprehensive error handling for Safari mobile
            try {
              pdf.addImage(wordImgData, 'PNG', wordXPos, currentY, wordImgWidth, wordImgHeight, undefined, 'FAST');
              console.log(`✅ Successfully added word "${word}" to PDF`);
            } catch (pdfError) {
              console.error(`❌ Failed to add word "${word}" to PDF:`, pdfError);
              // Try alternative approach for Safari
              try {
                pdf.addImage(wordImgData, 'PNG', wordXPos, currentY, wordImgWidth, wordImgHeight, undefined, 'NONE');
                console.log(`✅ Successfully added word "${word}" to PDF with NONE compression`);
              } catch (fallbackError) {
                console.error(`❌ Complete failure adding word "${word}":`, fallbackError);
                return; // Skip this word completely
              }
            }
            
            // Clean up canvas for Safari memory management
            if (isMobileDevice || isSafariMobile) {
              // More aggressive cleanup for mobile Safari
              try {
                wordCanvas.width = 1;
                wordCanvas.height = 1;
                const ctx = wordCanvas.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, 1, 1);
                }
                console.log(`🧹 Cleaned up canvas for word "${word}"`);
              } catch (cleanupError) {
                console.warn('Canvas cleanup failed:', cleanupError);
              }
            }
            
          } catch (error) {
            console.error(`Error processing word "${word}":`, error);
            // Continue with next word instead of breaking the entire loop
          }
        });
        
        currentY += wordRowHeight;
        console.log('After adding wordRowHeight, currentY is now:', currentY);
        
        // Add empty space for meanings in columns 0 and 2 (meaning columns on the left)
        currentY += 2; // Very minimal vertical spacing with optimized canvas
        console.log('After adding meaning space, currentY is now:', currentY);
        
        currentY += rowSpacing; // Very minimal space before next word pair
        console.log('After adding rowSpacing, currentY is now:', currentY);
        
        // Validate currentY after each increment for Safari
        if (isNaN(currentY) || currentY < 0) {
          console.error('currentY became invalid during loop:', currentY);
          currentY = borderMargin + 20; // Reset to safe value
        }
      }
      
      console.log('Finished processing all words. Final currentY:', currentY);
      
      // Safari mobile safety check - ensure we actually have a second page if words were processed
      const totalPages = pdf.internal.getNumberOfPages();
      console.log(`📄 PDF has ${totalPages} pages after processing ${selectedWords.length} words`);
      await sendSafariLog('PDF page count check', { totalPages, selectedWordsLength: selectedWords.length });
      
      if (selectedWords.length > 0 && totalPages === 1) {
        console.warn('⚠️ Safari mobile issue detected - only 1 page despite having words. Force creating second page.');
        await sendSafariLog('CRITICAL: Only 1 page detected - force creating second page', { totalPages, selectedWordsLength: selectedWords.length });
        pdf.addPage();
        
        // Redraw border on forced page
        pdf.setDrawColor(60, 60, 60);
        pdf.setLineWidth(1.0);
        pdf.setLineDashPattern([], 0);
        pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
        
        // Add a debug message to the forced page
        pdf.setFontSize(12);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Safari mobile compatibility page - words section', 20, 30);
        
        console.log('✅ Forced second page created for Safari mobile compatibility');
        await sendSafariLog('Forced second page created successfully', { finalPages: pdf.internal.getNumberOfPages() });
      }
      
      // Add safety check before proceeding to PDF display
      console.log('🔍 Preparing to exit words section and proceed to PDF display...');
      await sendSafariLog('Exiting words section, proceeding to PDF display', { 
        wordsProcessed: selectedWords.length, 
        finalPages: pdf.internal.getNumberOfPages() 
      });
    }
    
    // Additional safety check after words section
    console.log('📋 Words section completed, PDF object status check...');
    await sendSafariLog('PDF object status check', { 
      pdfExists: !!pdf,
      pdfType: typeof pdf,
      pageCount: pdf ? pdf.internal.getNumberOfPages() : 'N/A'
    });

    // Log final PDF generation step with detailed flow monitoring
    console.log('🔥 PDF generation completed, attempting to display PDF...');
    await sendSafariLog('PDF generation completed, attempting to display', { 
      totalPages: pdf.internal.getNumberOfPages(),
      shouldPrint,
      timestamp: new Date().toISOString()
    });

    try {
      console.log('📍 Entering PDF display logic...');
      await sendSafariLog('Entering PDF display logic', { shouldPrint });
      
      if (shouldPrint) {
        console.log('📄 Opening PDF for printing...');
        await sendSafariLog('Opening PDF for printing');
        
        console.log('📄 Calling pdf.output(dataurlnewwindow)...');
        await sendSafariLog('About to call pdf.output dataurlnewwindow');
        
        const printResult = pdf.output('dataurlnewwindow');
        
        console.log('📄 pdf.output(dataurlnewwindow) completed, result:', printResult);
        await sendSafariLog('pdf.output dataurlnewwindow completed', { 
          resultType: typeof printResult,
          resultValue: printResult 
        });
        
        // Check if printing failed (result is null) and provide fallback
        if (printResult === null || printResult === undefined) {
          console.log('📄 Print mode failed, falling back to new window mode...');
          await sendSafariLog('Print mode failed, falling back to new window');
          
          const pdfOutput = pdf.output('datauristring');
          console.log('📄 PDF fallback output generated, length:', pdfOutput.length);
          await sendSafariLog('PDF fallback output generated', { 
            outputLength: pdfOutput.length 
          });
          
          let downloadInitiated = false;
          try {
            const newWindow = window.open(pdfOutput, '_blank');
            console.log('📄 Fallback window.open called, result:', newWindow);
            await sendSafariLog('Fallback window.open called', { 
              windowResult: newWindow ? 'success' : 'failed' 
            });
            if (!newWindow) {
              throw new Error('window.open failed');
            }
          } catch (e) {
            // Always try download if window.open fails
            console.log('📄 Fallback window.open failed, trying download...');
            await sendSafariLog('Fallback window.open failed, trying download');
            const link = document.createElement('a');
            link.href = pdfOutput;
            link.download = `Al-Tanzeel-${new Date().toISOString().split('T')[0]}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => document.body.removeChild(link), 100);
            downloadInitiated = true;
            console.log('📄 Download link fallback triggered');
            await sendSafariLog('Download link fallback triggered');
          }
          // If download was not initiated, force it as last resort
          if (!downloadInitiated) {
            const link = document.createElement('a');
            link.href = pdfOutput;
            link.download = `Al-Tanzeel-${new Date().toISOString().split('T')[0]}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => document.body.removeChild(link), 100);
            console.log('📄 Forced download link fallback triggered');
            await sendSafariLog('Forced download link fallback triggered');
          }
        }
        
      } else {
        console.log('📄 Opening PDF in new window...');
        await sendSafariLog('Opening PDF in new window');
        
        console.log('📄 Calling pdf.output(datauristring)...');
        await sendSafariLog('About to call pdf.output datauristring');
        
        const pdfOutput = pdf.output('datauristring');
        
        console.log('📄 PDF output generated, length:', pdfOutput.length);
        await sendSafariLog('PDF output generated, calling window.open', { 
          outputLength: pdfOutput.length,
          outputPreview: pdfOutput.substring(0, 100) + '...'
        });
        
        console.log('📄 Calling window.open...');
        await sendSafariLog('About to call window.open');
        
        const newWindow = window.open(pdfOutput, '_blank');
        
        console.log('📄 window.open called, result:', newWindow);
        await sendSafariLog('window.open called', { 
          windowResult: newWindow ? 'success' : 'failed',
          windowType: typeof newWindow
        });
        
        // Additional Safari mobile fallback
        if (!newWindow) {
          console.log('📄 window.open failed, trying alternative approach...');
          await sendSafariLog('window.open failed, trying alternative');
          // Safari requires the link to be in the DOM for download to work
          const link = document.createElement('a');
          link.href = pdfOutput;
          link.download = `Al-Tanzeel-${new Date().toISOString().split('T')[0]}.pdf`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 100);
          console.log('📄 Download link fallback triggered');
          await sendSafariLog('Download link fallback triggered');
        }
      }
      
      console.log('✅ PDF display process completed successfully');
      await sendSafariLog('PDF display process completed successfully');
    } catch (displayError) {
      console.error('❌ PDF display failed:', displayError);
      await sendSafariLog('PDF display failed', { 
        error: displayError.message,
        stack: displayError.stack,
        name: displayError.name
      });
      throw displayError;
    }

    return pdf;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};