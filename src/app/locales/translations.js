export const translations = {
  en: {
    // Main page titles and buttons
    versesForTranslation: "Verses for Translation",
    versesForWordsMeanings: "Verses for Words Meanings",
    reset: "Reset",
    generatePdf: "Generate PDF",
    toggleSettings: "Toggle Settings",
    
    // Confirmation messages
    resetConfirmation: "Are you sure you want to reset all selections?",
    
    // Settings/Sidebar
    settings: "Settings",
    className: "Class Name",
    masjidName: "Masjid Name",
    pageSize: "Page Size",
    fontSize: "Font Size",
    language: "Language",
    dateSettings: "Date Settings",
    gregorian: "Gregorian",
    hijri: "Hijri",
    selectHijriDate: "Select Hijri date",
    
    // Page size options
    pageSizes: {
      a4: "A4 (210 × 297 mm)",
      a3: "A3 (297 × 420 mm)",
      a5: "A5 (148 × 210 mm)",
      letter: "Letter (8.5 × 11 in)",
      legal: "Legal (8.5 × 14 in)"
    },
    
    // Chapter/Surah selection
    selectSurah: "Select Surah",
    searchSurahPlaceholder: "Search by Surah number or name",
    expandSurahList: "Expand surah list",
    collapseSurahList: "Collapse surah list",
    
    // Verse selection
    verseList: "Verse List",
    selectedVerses: "Selected Verses",
    searchVersePlaceholder: "Search verses...",
    versesSelected: "verses selected",
    verseSelected: "verse selected",
    expandVerseList: "Expand verse list",
    collapseVerseList: "Collapse verse list",
    expandSelectedVerses: "Expand selected verses",
    collapseSelectedVerses: "Collapse selected verses",
    
    // Word selection
    wordsFromVerses: "Words from Verses",
    selectedWords: "Selected Words",
    wordsSelected: "words selected",
    wordSelected: "word selected",
    expand: "Expand",
    collapse: "Collapse",
    
    // Common UI elements
    remove: "×",
    
    // Hijri month names (for UI display)
    hijriMonths: [
      'Muharram', 'Safar', "Rabi' I", "Rabi' II", 
      'Jumada I', 'Jumada II', 'Rajab', "Sha'ban", 
      'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
    ],
    
    // Placeholder texts
    placeholders: {
      className: "Enter class name",
      masjidName: "Enter masjid name"
    },
    
    // Calendar and date picker
    today: "Today",
    selectMonth: "Select Month"
  },
  
  ur: {
    // Main page titles and buttons
    versesForTranslation: "ترجمے کے لیے آیات",
    versesForWordsMeanings: "الفاظ کے معانی کے لیے آیات",
    reset: "دوبارہ سیٹ کریں",
    generatePdf: "پی ڈی ایف بنائیں",
    toggleSettings: "سیٹنگز",
    
    // Confirmation messages
    resetConfirmation: "کیا آپ واقعی تمام انتخابات کو دوبارہ سیٹ کرنا چاہتے ہیں؟",
    
    // Settings/Sidebar
    settings: "سیٹنگز",
    className: "کلاس کا نام",
    masjidName: "مسجد کا نام",
    pageSize: "صفحہ کا سائز",
    fontSize: "فونٹ کا سائز",
    language: "زبان",
    dateSettings: "تاریخ کی سیٹنگز",
    gregorian: "عیسوی",
    hijri: "ہجری",
    selectHijriDate: "ہجری تاریخ منتخب کریں",
    
    // Page size options
    pageSizes: {
      a4: "A4 (210 × 297 mm)",
      a3: "A3 (297 × 420 mm)",
      a5: "A5 (148 × 210 mm)",
      letter: "Letter (8.5 × 11 in)",
      legal: "Legal (8.5 × 14 in)"
    },
    
    // Chapter/Surah selection
    selectSurah: "سورہ منتخب کریں",
    searchSurahPlaceholder: "سورہ نمبر یا نام سے تلاش کریں",
    expandSurahList: "سورہ کی فہرست کھولیں",
    collapseSurahList: "سورہ کی فہرست بند کریں",
    
    // Verse selection
    verseList: "آیات کی فہرست",
    selectedVerses: "منتخب آیات",
    searchVersePlaceholder: "آیات تلاش کریں...",
    versesSelected: "آیات منتخب",
    verseSelected: "آیت منتخب",
    expandVerseList: "آیات کی فہرست کھولیں",
    collapseVerseList: "آیات کی فہرست بند کریں",
    expandSelectedVerses: "منتخب آیات کھولیں",
    collapseSelectedVerses: "منتخب آیات بند کریں",
    
    // Word selection
    wordsFromVerses: "آیات سے الفاظ",
    selectedWords: "منتخب الفاظ",
    wordsSelected: "الفاظ منتخب",
    wordSelected: "لفظ منتخب",
    expand: "کھولیں",
    collapse: "بند کریں",
    
    // Common UI elements
    remove: "×",
    
    // Hijri month names (for UI display in Urdu)
    hijriMonths: [
      'محرم', 'صفر', 'ربیع الاول', 'ربیع الآخر', 
      'جمادی الاولیٰ', 'جمادی الآخرہ', 'رجب', 'شعبان', 
      'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ'
    ],
    
    // Placeholder texts
    placeholders: {
      className: "کلاس کا نام درج کریں",
      masjidName: "مسجد کا نام درج کریں"
    },
    
    // Calendar and date picker
    today: "آج",
    selectMonth: "مہینہ منتخب کریں"
  }
};

// Helper function to get translation based on current language
export const getTranslation = (key, language = 'en') => {
  const keys = key.split('.');
  let translation = translations[language];
  
  for (const k of keys) {
    if (translation && typeof translation === 'object') {
      translation = translation[k];
    } else {
      // Fallback to English if key not found
      translation = translations.en;
      for (const fallbackKey of keys) {
        if (translation && typeof translation === 'object') {
          translation = translation[fallbackKey];
        } else {
          return key; // Return key itself if no translation found
        }
      }
      break;
    }
  }
  
  return translation || key;
};

// Hook for using translations in components
export const useTranslation = (language = 'en') => {
  const t = (key) => getTranslation(key, language);
  return { t };
};
