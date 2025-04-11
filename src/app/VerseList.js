import styles from './page.module.css';

export const VerseList = ({ verses, fontSize, onVerseSelect, selectedVerses, searchTerm, onSearchChange }) => (
  <div className={styles.column}>
    <h3 className={styles.columnTitle}>Select Verses</h3>
    <input
      type="text"
      placeholder="Search verse by ID..."
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
          />
          <span>{verse.id}. {verse.text}</span>
        </div>
      ))}
    </div>
  </div>
);