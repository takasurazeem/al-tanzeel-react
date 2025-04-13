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
  const [preferences, setPreferences] = useState({
    className: '',
    masjidName: ''
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

  const handleGeneratePDF = () => {
    // Use the first selected verse if available, otherwise use empty string
    // Load firstVerse from chapters, first chapter, first verse
    const firstChapter = chapters[0];
    const firstVerse = firstChapter?.verses[0]?.text || '';
    generateDecoratePDF(true, preferences, firstVerse);
  };

  return (
    <div className={styles.container}>
      <Sidebar onPreferencesChange={setPreferences} />
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
        <h2 className={styles.rowTitle}>Verses for Translation</h2>
        <div className={styles.fontControls}>
          <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))}>A-</button>
          <span>{fontSize}px</span>
          <button onClick={() => setFontSize(prev => Math.min(48, prev + 2))}>A+</button>
        </div>
      </div>
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
        />
        <SelectedVersesList
          verses={selectedVerses}
          fontSize={fontSize}
          onRemoveVerse={handleVerseSelect}
        />
      </div>
      {/* Second Row */}
      <h2 className={styles.rowTitle}>Verses for Words Meanings</h2>
      <div className={styles.grid}>
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


