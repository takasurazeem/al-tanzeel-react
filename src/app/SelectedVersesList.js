import styles from './page.module.css';

export const SelectedVersesList = ({ verses, fontSize, onRemoveVerse }) => (
  <div className={styles.column} style={{ fontSize: `${fontSize}px` }}>
    <h3 className={styles.columnTitle}>Selected Verses</h3>
    <ul className={styles.selectedVersesList}>
      {verses.map(verse => (
        <li key={verse.id} className={styles.selectedVerseItem}>
          <span>{verse.text}</span>
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
);