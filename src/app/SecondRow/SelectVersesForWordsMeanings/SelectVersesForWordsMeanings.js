import { useState, useEffect } from 'react';
import styles from '../../shared/styles/verseList.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

export const SelectVersesForWordsMeanings = ({ 
  verses, 
  fontSize, 
  onVerseSelect, 
  selectedVerses 
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

  return (
    <div 
      className={`${styles.column} ${isCollapsed && isMobile ? styles.collapsed : ''}`} 
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={sharedStyles.columnTitle}>{t('versesForWordsMeanings')}</h3>
          {selectedVerses.length > 0 && (
            <span className={styles.selectedInfo}>
              {selectedVerses.length} {selectedVerses.length === 1 ? t('verseSelected') : t('versesSelected')}
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
        <div className={styles.verseList}>
          {verses?.map((verse) => (
            <div 
              key={verse.id} 
              className={styles.verseItem}
              onClick={() => onVerseSelect(verse)}
            >
              <input
                type="checkbox"
                checked={selectedVerses.some(v => v.id === verse.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  onVerseSelect(verse);
                }}
                style={{ flexShrink: 0, marginTop: '4px' }}
              />
              <span style={{ flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {verse.id}. {verse.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};