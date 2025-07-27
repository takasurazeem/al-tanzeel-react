import { useState, useEffect } from 'react';
import styles from '../../shared/styles/verseList.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

export const VerseList = ({ verses, fontSize, onVerseSelect, selectedVerses, searchTerm, onSearchChange, className = '' }) => {
  const { t } = useLanguage();
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

  const selectedCount = selectedVerses.length;

  return (
    <div className={`${styles.column} ${isCollapsed && isMobile ? styles.collapsed : ''} ${className}`.trim()}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={sharedStyles.columnTitle}>{t('verseList')}</h3>
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
            aria-label={isCollapsed ? t('expandVerseList') : t('collapseVerseList')}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      
      <div className={`${styles.content} ${isCollapsed && isMobile ? styles.contentCollapsed : ''}`}>
        <input
          type="text"
          placeholder={t('searchVersePlaceholder')}
          value={searchTerm}
          onChange={onSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.verseList}>
          {verses?.map((verse) => (
            <div 
              key={verse.id} 
              className={styles.verseItem} 
              style={{ fontSize: `${fontSize}px` }}
              onClick={() => onVerseSelect(verse)}
            >
              <input
                type="checkbox"
                checked={selectedVerses.some(v => v.id === verse.id)}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent double triggering
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