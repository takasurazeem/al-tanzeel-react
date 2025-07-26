import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const SelectedVersesList = ({ verses, fontSize, onRemoveVerse, className = '' }) => {
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

  const selectedCount = verses.length;

  // Hide component on mobile when no verses are selected
  if (isMobile && selectedCount === 0) {
    return null;
  }

  return (
    <div className={`${styles.column} ${isCollapsed && isMobile ? styles.collapsed : ''} ${className}`.trim()} style={{ fontSize: `${fontSize}px` }}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={sharedStyles.columnTitle}>Selected Verses</h3>
          {selectedCount > 0 && (
            <span className={styles.selectedInfo}>
              {selectedCount} verse{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        {/* Only show toggle button on mobile */}
        {isMobile && (
          <button 
            className={styles.toggleButton}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand selected verses" : "Collapse selected verses"}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>
      
      <div className={`${styles.content} ${isCollapsed && isMobile ? styles.contentCollapsed : ''}`}>
        <ul className={styles.selectedVersesList}>
          {verses.map(verse => (
            <li key={verse.id} className={styles.selectedVerseItem}>
              <span style={{ flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {verse.text}
              </span>
              <button 
                className={styles.removeButton}
                onClick={() => onRemoveVerse(verse)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};