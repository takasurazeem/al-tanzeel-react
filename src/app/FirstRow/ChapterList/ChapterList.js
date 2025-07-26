import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const ChapterList = ({ chapters, selectedChapter, onChapterSelect, searchTerm, onSearchChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse when a chapter is selected (only on mobile)
  useEffect(() => {
    if (selectedChapter && isMobile) {
      setIsCollapsed(true);
    }
  }, [selectedChapter, isMobile]);

  const handleChapterSelect = (chapter) => {
    onChapterSelect(chapter);
    // Will auto-collapse due to the useEffect above (only on mobile)
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${styles.chapterColumn} ${isCollapsed && isMobile ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={sharedStyles.columnTitle}>Select Surah</h3>
          {selectedChapter && (
            <span className={styles.selectedInfo}>
              {selectedChapter.id}. {selectedChapter.name} ({selectedChapter.transliteration})
            </span>
          )}
        </div>
        {/* Only show toggle button on mobile */}
        {isMobile && (
          <button 
            className={styles.toggleButton}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand surah list" : "Collapse surah list"}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      
      <div className={`${styles.content} ${isCollapsed && isMobile ? styles.contentCollapsed : ''}`}>
        <input
          type="text"
          placeholder="Search by Surah number or name"
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
              <div className={styles.chapterInfo}>
                <div className={styles.chapterNumber}>{chapter.id}.</div>
                <div className={styles.chapterNames}>
                  <div className={styles.arabicName}>{chapter.name}</div>
                  <div className={styles.transliterationName}>{chapter.transliteration}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};