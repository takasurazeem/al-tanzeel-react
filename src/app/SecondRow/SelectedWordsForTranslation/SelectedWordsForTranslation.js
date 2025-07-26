import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const SelectedWordsForTranslation = ({ 
  selectedWords,
  onRemoveWord,
  fontSize 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Hide component on mobile when no words are selected
  if (isMobile && selectedWords.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.column} ${isCollapsed && isMobile ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={sharedStyles.columnTitle}>Selected Words</h3>
          {selectedWords.length > 0 && (
            <span className={styles.selectedInfo}>
              {selectedWords.length} word{selectedWords.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        {isMobile && (
          <button 
            className={styles.toggleButton}
            onClick={handleToggle}
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      <div className={`${styles.content} ${isCollapsed && isMobile ? styles.contentCollapsed : ''}`}>
        <div className={styles.wordsContainer}>
          {selectedWords.map((word, index) => (
            <div key={`${word}-${index}`} className={styles.wordChip}>
              <span style={{ fontSize: `${fontSize}px` }}>{word}</span>
              <button
                className={styles.removeButton}
                onClick={() => onRemoveWord(word)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};