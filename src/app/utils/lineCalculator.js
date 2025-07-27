/**
 * Utility function to calculate the number of lines needed for verse translation
 * Extracted from pdfGenerator.js to be reusable across components
 */

export const calculateTranslationLines = (verse, pageSize = 'a4') => {
  if (!verse || !verse.translation) return 2; // Default minimum lines if no translation
  
  const urduTranslation = verse.translation;
  
  // Define page size dimensions (in mm for calculations)
  const pageSizes = {
    'a4': { width: 210, height: 297 },
    'a3': { width: 297, height: 420 },
    'a5': { width: 148, height: 210 },
    'letter': { width: 216, height: 279 },
    'legal': { width: 216, height: 356 }
  };
  
  const selectedPageSize = pageSizes[pageSize.toLowerCase()] || pageSizes['a4'];
  
  // Calculate available writing width based on page layout
  const pageMargins = 15; // Left and right margins (15mm each side)
  const availableWidth = selectedPageSize.width - (pageMargins * 2); // Total writing width in mm
  
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

/**
 * Add translation lines property to verse objects
 * This function enhances verse objects with a `translationLines` property
 */
export const enhanceVersesWithLineCount = (verses, pageSize = 'a4') => {
  return verses.map(verse => ({
    ...verse,
    translationLines: calculateTranslationLines(verse, pageSize)
  }));
};
