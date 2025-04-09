'use client';
import { useState, useEffect } from 'react';
import styles from "./page.module.css";

export default function Home() {
  const [chapters, setChapters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [verseSearchTerm, setVerseSearchTerm] = useState('');

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
    setSelectedVerse(null); // Reset selected verse
  };

  const handleVerseSelect = (verse) => {
    setSelectedVerses(prev => {
      if (prev.find(v => v.id === verse.id)) {
        return prev.filter(v => v.id !== verse.id);
      }
      return [...prev, verse];
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* First Column - Chapters */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Select Surah</h3>
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.chapterList}>
            {filteredChapters.map((chapter) => (
              <div 
                key={chapter.id} 
                className={`${styles.chapterItem} ${selectedChapter?.id === chapter.id ? styles.selected : ''}`}
                onClick={() => handleChapterClick(chapter)}
              >
                {chapter.id}. {chapter.transliteration}
              </div>
            ))}
          </div>
        </div>
        
        {/* Second Column - Verses */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Select Verses</h3>
          <input
            type="text"
            placeholder="Search verse by ID..."
            value={verseSearchTerm}
            onChange={(e) => setVerseSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.verseList}>
            {filteredVerses?.map((verse) => (
              <div key={verse.id} className={styles.verseItem}>
                <input
                  type="checkbox"
                  checked={selectedVerses.some(v => v.id === verse.id)}
                  onChange={() => handleVerseSelect(verse)}
                />
                <span>{verse.id}. {verse.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Third Column - Selected Verses */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Selected Verses</h3>
          <ul className={styles.selectedVersesList}>
            {selectedVerses.map(verse => (
              <li key={verse.id} className={styles.selectedVerseItem}>
                <span>{verse.text}</span>
                <button 
                  className={styles.removeButton}
                  onClick={() => handleVerseSelect(verse)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


