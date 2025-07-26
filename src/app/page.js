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

export default function Home() {
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
    hijriDate: null
  });

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const response = await fetch('/Quran_ur.json');
        const data = await response.json();
        setChapters(data);
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };
    loadChapters();
  }, []);

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
      if (prev.find(v => v.id === verse.id)) {
        return prev.filter(v => v.id !== verse.id);
      }
      return [...prev, verse];
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

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all selections?')) {
      setSelectedChapter(null);
      setSelectedVerses([]);
      setSearchTerm('');
      setVerseSearchTerm('');
    }
  };

  const getDisplayDate = () => {
    if (preferences.calendarType === 'hijri' && preferences.hijriDate) {
      // For UI display, use English
      const monthNames = ['Muharram', 'Safar', "Rabi' I", "Rabi' II", 'Jumada I', 'Jumada II', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'];
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
    // Use the first selected verse if available, otherwise use empty string
    // Load firstVerse from chapters, first chapter, first verse
    const firstChapter = chapters[0];
    const firstVerse = firstChapter?.verses[0]?.text || '';
    
    // Pass the selected verses for translation, selected words, and PDF-formatted date to the PDF generator
    const pdfDate = getPDFDate();
    generateDecoratePDF(true, preferences, firstVerse, selectedVerses, selectedWords, pdfDate);
  };

  const handleSidebarToggle = (value) => {
    if (typeof value === 'boolean') {
      setSidebarOpen(value);
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  return (
    <div className={styles.container}>
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
            Reset
          </button>
          <button
            className={styles.pdfButton}
            onClick={handleGeneratePDF}
          >
            Generate PDF
          </button>
        </div>
        <div className={styles.rightControls}>
          <button 
            className={styles.menuButton}
            onClick={() => handleSidebarToggle()}
            aria-label="Toggle Settings"
          >
            <span className={`${styles.menuIcon} ${sidebarOpen ? styles.open : ''}`} />
          </button>
        </div>
      </div>
      {/* Title Row */}
      <h2 className={styles.rowTitle}>Verses for Translation</h2>
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
          className={!selectedChapter ? styles.hiddenOnMobileWhenNoChapter : ''}
        />
      </div>
      {/* Second Row */}
      <h2 className={`${styles.rowTitle} ${!selectedChapter ? styles.hiddenOnMobileWhenNoChapter : ''}`}>Verses for Words Meanings</h2>
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


