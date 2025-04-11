import styles from '../../shared/styles/verseList.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const SelectVersesForWordsMeanings = ({ 
  verses, 
  fontSize, 
  onVerseSelect, 
  selectedVerses 
}) => (
  <div className={styles.column} style={{ fontSize: `${fontSize}px` }}>
    <h3 className={sharedStyles.columnTitle}>Verses for Words Meaning</h3>
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
          />
          <span>{verse.id}. {verse.text}</span>
        </div>
      ))}
    </div>
  </div>
);