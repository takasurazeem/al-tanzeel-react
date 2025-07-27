'use client';
import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { ChapterList } from './FirstRow/ChapterList/ChapterList';
import { VerseList } from './FirstRow/VerseList/VerseList';
import { SelectedVersesList } from './FirstRow/SelectedVersesList/SelectedVersesList';
import { SelectVersesForWordsMeanings } from './SecondRow/SelectVersesForWordsMeanings/SelectVersesForWordsMeanings';
import { WordsFromSelectedVerses } from './SecondRow/WordsFromSelectedVerses/WordsFromSelectedVerses';
import { SelectedWordsForTranslation } from './SecondRow/SelectedWordsForTranslation/SelectedWordsForTranslation';
import { generateDecoratePDF } from './utils/pdfGenerator';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useLanguage } from './contexts/LanguageContext';
import { calculateTranslationLines } from './utils/lineCalculator';
import { serverLogger } from './utils/serverLogger';

export default function Home() {
  const { language, t, isRTL } = useLanguage();
  const [chapters, setChapters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [verseSearchTerm, setVerseSearchTerm] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [secondRowSelectedVerses, setSecondRowSelectedVerses] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    className: '',
    masjidName: '',
    selectedDate: new Date().toISOString().split('T')[0],
    calendarType: 'gregorian',
    hijriDate: null,
    pageSize: 'a4'
  });

  useEffect(() => {
    // Initialize server logging for mobile Safari debugging
    if (typeof window !== 'undefined') {
      console.log('🚀 Al-Tanzeel React app initialized with server logging');
      serverLogger.safariLog('App initialization', {
        userAgent: navigator.userAgent,
        screenWidth: window.screen?.width,
        screenHeight: window.screen?.height,
        devicePixelRatio: window.devicePixelRatio
      });
    }
    
    const loadChapters = async () => {
      try {
        const response = await fetch('Quran_ur.json');
        const data = await response.json();
        setChapters(data);
        console.log('📖 Quran data loaded successfully');
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };
    loadChapters();
  }, []);

  // Dev mode effect - auto-select first chapter, all verses, and all words
  useEffect(() => {
    // Only run in development mode and when chapters are loaded
    if (process.env.NODE_ENV === 'development' && chapters.length > 0) {
      console.log('🔧 DEV MODE: Auto-selecting first chapter for regression testing');
      
      const firstChapter = chapters[0];
      if (firstChapter) {
        // Select the first chapter
        setSelectedChapter(firstChapter);
        console.log('🔧 DEV MODE: Selected first chapter:', firstChapter.transliteration);
        
        // Select all verses from the first chapter (with enhanced properties)
        const allVersesWithLines = firstChapter.verses.map(verse => ({
          ...verse,
          translationLines: calculateTranslationLines(verse, preferences.pageSize || 'a4')
        }));
        
        setSelectedVerses(allVersesWithLines);
        setSecondRowSelectedVerses(firstChapter.verses);
        console.log('🔧 DEV MODE: Selected all verses from first chapter:', allVersesWithLines.length, 'verses');
        
        // Extract and select all unique words from the first chapter
        const allWords = firstChapter.verses
          .map(verse => verse.text.split(' '))
          .flat()
          .filter(word => word.trim() !== ''); // Remove empty strings
        
        const uniqueWords = [...new Set(allWords)];
        setSelectedWords(uniqueWords);
        console.log('🔧 DEV MODE: Selected all unique words from first chapter:', uniqueWords.length, 'words');
        
        // Log dev mode completion
        serverLogger.safariLog('DEV MODE Auto-selection completed', {
          chapterSelected: firstChapter.transliteration,
          versesSelected: allVersesWithLines.length,
          wordsSelected: uniqueWords.length,
          sampleWords: uniqueWords.slice(0, 10) // First 10 words for debugging
        });
        
        console.log('✅ DEV MODE: Auto-selection completed - Ready for regression testing!');
      }
    }
  }, [chapters, preferences.pageSize]); // Re-run if chapters load or page size changes

  const filteredChapters = chapters.filter(chapter =>
    chapter.id.toString().includes(searchTerm) ||
    chapter.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVerses = selectedChapter?.verses?.filter(verse =>
    verse.id.toString().includes(verseSearchTerm)
  );

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
  };

  const handleVerseSelect = (verse) => {
    setSelectedVerses(prev => {
      const existingVerse = prev.find(v => v.id === verse.id);
      if (existingVerse) {
        return prev.filter(v => v.id !== verse.id);
      }
      
      // Add translationLines property when selecting a verse
      const enhancedVerse = {
        ...verse,
        translationLines: calculateTranslationLines(verse, preferences.pageSize || 'a4')
      };
      
      return [...prev, enhancedVerse];
    });
  };

  const handleSecondRowVerseSelect = (verse) => {
    setSecondRowSelectedVerses(prev => {
      if (prev.find(v => v.id === verse.id)) {
        return prev.filter(v => v.id !== verse.id);
      }
      return [...prev, verse];
    });
  };

  const handleWordSelect = (word) => {
    setSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      }
      return [...prev, word];
    });
  };

  const handleLineCountChange = (verseId, newLineCount) => {
    setSelectedVerses(prev => 
      prev.map(verse => 
        verse.id === verseId 
          ? { ...verse, translationLines: newLineCount }
          : verse
      )
    );
  };

  const handleReset = () => {
    if (window.confirm(t('resetConfirmation'))) {
      setSelectedChapter(null);
      setSelectedVerses([]);
      setSearchTerm('');
      setVerseSearchTerm('');
    }
  };

  const getDisplayDate = () => {
    if (preferences.calendarType === 'hijri' && preferences.hijriDate) {
      // For UI display, use localized month names
      const monthNames = t('hijriMonths');
      const monthName = monthNames[preferences.hijriDate.month - 1];
      return `${preferences.hijriDate.day} ${monthName} ${preferences.hijriDate.year} AH`;
    } else {
      return new Date(preferences.selectedDate || new Date()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const getPDFDate = () => {
    if (preferences.calendarType === 'hijri' && preferences.hijriDate) {
      // For PDF, use Urdu/Arabic format
      const monthNames = [
        'محرم', 'صفر', 'ربیع الاول', 'ربیع الآخر', 
        'جمادی الاولیٰ', 'جمادی الآخرہ', 'رجب', 'شعبان', 
        'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ'
      ];
      const monthName = monthNames[preferences.hijriDate.month - 1];
      return `${preferences.hijriDate.day} ${monthName} ${preferences.hijriDate.year} ہجری`;
    } else {
      return new Date(preferences.selectedDate || new Date()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const handleGeneratePDF = () => {
    // Log Safari debugging info before PDF generation
    console.log('📄 Starting PDF generation process');
    serverLogger.safariLog('PDF Generation Started', {
      selectedVersesCount: selectedVerses.length,
      selectedWordsCount: selectedWords.length,
      preferences: preferences,
      deviceInfo: {
        userAgent: navigator.userAgent,
        isSafari: /Safari/i.test(navigator.userAgent),
        isIPhone: /iPhone/i.test(navigator.userAgent),
        isIPad: /iPad/i.test(navigator.userAgent),
        screenWidth: window.screen?.width,
        screenHeight: window.screen?.height
      }
    });
    
    // Use the first selected verse if available, otherwise use empty string
    // Load firstVerse from chapters, first chapter, first verse
    const firstChapter = chapters[0];
    const firstVerse = firstChapter?.verses[0]?.text || '';
    
    // Pass the selected verses for translation, selected words, and PDF-formatted date to the PDF generator
    const pdfDate = getPDFDate();
    
    try {
      generateDecoratePDF(true, preferences, firstVerse, selectedVerses, selectedWords, pdfDate);
      console.log('✅ PDF generation call completed');
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      serverLogger.safariLog('PDF Generation Error', { error: error.message, stack: error.stack });
    }
  };

  const handleSidebarToggle = (value) => {
    if (typeof value === 'boolean') {
      setSidebarOpen(value);
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  return (
    <div className={`${styles.container} ${isRTL ? styles.rtl : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar 
        onPreferencesChange={setPreferences} 
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
      />
      <div className={styles.topControls}>
        <div className={styles.leftControls}>
          <button 
            className={styles.resetButton}
            onClick={handleReset}
          >
            {t('reset')}
          </button>
          <button
            className={styles.pdfButton}
            onClick={handleGeneratePDF}
          >
            {t('generatePdf')}
          </button>
        </div>
        <div className={styles.rightControls}>
          <button 
            className={styles.menuButton}
            onClick={() => handleSidebarToggle()}
            aria-label={t('toggleSettings')}
          >
            <span className={`${styles.menuIcon} ${sidebarOpen ? styles.open : ''}`} />
          </button>
        </div>
      </div>
      {/* Title Row */}
      <h2 className={styles.rowTitle}>{t('versesForTranslation')}</h2>
      {/* First Row - Remove duplicate title */}
      <div className={styles.grid}>
        <ChapterList
          chapters={filteredChapters}
          selectedChapter={selectedChapter}
          onChapterSelect={handleChapterClick}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
        />
        <VerseList
          verses={filteredVerses}
          fontSize={fontSize}
          onVerseSelect={handleVerseSelect}
          selectedVerses={selectedVerses}
          searchTerm={verseSearchTerm}
          onSearchChange={(e) => setVerseSearchTerm(e.target.value)}
          className={!selectedChapter ? styles.hiddenOnMobileWhenNoChapter : ''}
        />
        <SelectedVersesList
          verses={selectedVerses}
          fontSize={fontSize}
          onRemoveVerse={handleVerseSelect}
          onLineCountChange={handleLineCountChange}
          className={!selectedChapter ? styles.hiddenOnMobileWhenNoChapter : ''}
        />
      </div>
      {/* Second Row */}
      <h2 className={`${styles.rowTitle} ${!selectedChapter ? styles.hiddenOnMobileWhenNoChapter : ''}`}>{t('versesForWordsMeanings')}</h2>
      <div className={`${styles.grid} ${!selectedChapter ? styles.hiddenOnMobileWhenNoChapter : ''}`}>
        <SelectVersesForWordsMeanings
          verses={filteredVerses}
          fontSize={fontSize}
          onVerseSelect={handleSecondRowVerseSelect}
          selectedVerses={secondRowSelectedVerses}
        />
        <WordsFromSelectedVerses
          selectedVerses={secondRowSelectedVerses}
          selectedWords={selectedWords}
          onWordSelect={handleWordSelect}
          fontSize={fontSize}
        />
        <SelectedWordsForTranslation
          selectedWords={selectedWords}
          onRemoveWord={handleWordSelect}
          fontSize={fontSize}
        />
      </div>
    </div>
  );
}


