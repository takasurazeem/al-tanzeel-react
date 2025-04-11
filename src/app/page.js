'use client';
import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { ChapterList } from './ChapterList';
import { VerseList } from './VerseList';
import { SelectedVersesList } from './SelectedVersesList';

export default function Home() {
  const [chapters, setChapters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [verseSearchTerm, setVerseSearchTerm] = useState('');
  const [fontSize, setFontSize] = useState(32);

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

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all selections?')) {
      setSelectedChapter(null);
      setSelectedVerses([]);
      setSearchTerm('');
      setVerseSearchTerm('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topControls}>
        <button 
          className={styles.resetButton}
          onClick={handleReset}
        >
          Reset
        </button>
        <div className={styles.fontControls}>
          <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))}>A-</button>
          <span>{fontSize}px</span>
          <button onClick={() => setFontSize(prev => Math.min(48, prev + 2))}>A+</button>
        </div>
      </div>
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
    </div>
  );
}


