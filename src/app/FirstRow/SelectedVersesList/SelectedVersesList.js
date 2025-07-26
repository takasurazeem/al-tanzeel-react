import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const SelectedVersesList = ({ verses, fontSize, onRemoveVerse }) => (
  <div className={styles.column} style={{ fontSize: `${fontSize}px` }}>
    <h3 className={sharedStyles.columnTitle}>Selected Verses</h3>
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
);