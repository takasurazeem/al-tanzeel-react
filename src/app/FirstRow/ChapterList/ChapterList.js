import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const ChapterList = ({ chapters, selectedChapter, onChapterSelect, searchTerm, onSearchChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when a chapter is selected
  useEffect(() => {
    if (selectedChapter) {
      setIsCollapsed(true);
    }
  }, [selectedChapter]);

  const handleChapterSelect = (chapter) => {
    onChapterSelect(chapter);
    // Will auto-collapse due to the useEffect above
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${styles.column} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <h3 className={sharedStyles.columnTitle}>
          Select Surah
          {selectedChapter && (
            <span className={styles.selectedInfo}>
              - {selectedChapter.id}. {selectedChapter.transliteration}
            </span>
          )}
        </h3>
        <button 
          className={styles.toggleButton}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand surah list" : "Collapse surah list"}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>
      
      <div className={`${styles.content} ${isCollapsed ? styles.contentCollapsed : ''}`}>
        <input
          type="text"
          placeholder="Search by ID or name..."
          value={searchTerm}
          onChange={onSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.chapterList}>
          {chapters.map((chapter) => (
            <div 
              key={chapter.id} 
              className={`${styles.chapterItem} ${selectedChapter?.id === chapter.id ? styles.selected : ''}`}
              onClick={() => handleChapterSelect(chapter)}
            >
              {chapter.id}. {chapter.transliteration}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};