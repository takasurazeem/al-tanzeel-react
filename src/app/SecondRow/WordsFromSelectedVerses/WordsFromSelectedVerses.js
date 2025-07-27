import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

export const WordsFromSelectedVerses = ({ 
  selectedVerses,
  selectedWords,
  onWordSelect,
  fontSize 
}) => {
  const { t } = useLanguage();
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

  // Extract unique words from all selected verses
  const uniqueWords = [...new Set(
    selectedVerses
      .map(verse => verse.text.split(' '))
      .flat()
      .filter(word => word.trim() !== '')
  )];

  return (
    <div className={`${styles.column} ${isCollapsed && isMobile ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={sharedStyles.columnTitle}>{t('wordsFromVerses')}</h3>
          {selectedWords.length > 0 && (
            <span className={styles.selectedInfo}>
              {selectedWords.length} {selectedWords.length === 1 ? t('wordSelected') : t('wordsSelected')}
            </span>
          )}
        </div>
        {isMobile && (
          <button 
            className={styles.toggleButton}
            onClick={handleToggle}
            aria-label={isCollapsed ? t('expand') : t('collapse')}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      <div className={`${styles.content} ${isCollapsed && isMobile ? styles.contentCollapsed : ''}`}>
        <div className={styles.wordsContainer}>
          {uniqueWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              className={`${styles.wordChip} ${
                selectedWords.includes(word) ? styles.selected : ''
              }`}
              onClick={() => onWordSelect(word)}
              style={{ fontSize: `${fontSize}px` }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};