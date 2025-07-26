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
            style={{ flexShrink: 0, marginTop: '4px' }}
          />
          <span style={{ flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {verse.id}. {verse.text}
          </span>
        </div>
      ))}
    </div>
  </div>
);