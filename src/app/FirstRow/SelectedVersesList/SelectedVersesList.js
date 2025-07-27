import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

export const SelectedVersesList = ({ verses, fontSize, onRemoveVerse, onLineCountChange, className = '' }) => {
  const { t, isRTL } = useLanguage();
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLineCountDecrease = (verseId, currentLines) => {
    if (currentLines > 1) {
      onLineCountChange(verseId, currentLines - 1);
    }
  };

  const handleLineCountIncrease = (verseId, currentLines) => {
    if (currentLines < 12) { // Maximum reasonable limit
      onLineCountChange(verseId, currentLines + 1);
    }
  };

  const selectedCount = verses.length;

  // Hide component on mobile when no verses are selected
  if (isMobile && selectedCount === 0) {
    return null;
  }

  return (
    <div className={`${styles.column} ${isCollapsed && isMobile ? styles.collapsed : ''} ${className}`.trim()} style={{ fontSize: `${fontSize}px` }}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={sharedStyles.columnTitle}>{t('selectedVerses')}</h3>
          {selectedCount > 0 && (
            <span className={styles.selectedInfo}>
              {selectedCount} {selectedCount === 1 ? t('verseSelected') : t('versesSelected')}
            </span>
          )}
        </div>
        {/* Only show toggle button on mobile */}
        {isMobile && (
          <button 
            className={styles.toggleButton}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? t('expandSelectedVerses') : t('collapseSelectedVerses')}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      
      <div className={`${styles.content} ${isCollapsed && isMobile ? styles.contentCollapsed : ''}`}>
        <ul className={styles.selectedVersesList}>
          {verses.map(verse => (
            <li key={verse.id} className={styles.selectedVerseItem}>
              <div className={styles.verseContent}>
                <span style={{ flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  {verse.text}
                </span>
                <button 
                  className={styles.removeButton}
                  onClick={() => onRemoveVerse(verse)}
                >
                  ×
                </button>
              </div>
              <div className={styles.lineCountControls} dir={isRTL ? 'rtl' : 'ltr'}>
                <span className={styles.lineCountLabel}>{t('translationLines')}:</span>
                <div className={styles.stepper}>
                  <button 
                    className={styles.stepperButton}
                    onClick={() => handleLineCountDecrease(verse.id, verse.translationLines)}
                    disabled={verse.translationLines <= 1}
                    aria-label={t('decreaseLines')}
                  >
                    −
                  </button>
                  <span className={styles.lineCountValue}>{verse.translationLines || 2}</span>
                  <button 
                    className={styles.stepperButton}
                    onClick={() => handleLineCountIncrease(verse.id, verse.translationLines)}
                    disabled={verse.translationLines >= 12}
                    aria-label={t('increaseLines')}
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};