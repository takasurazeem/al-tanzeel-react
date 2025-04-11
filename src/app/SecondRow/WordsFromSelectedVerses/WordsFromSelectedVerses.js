import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const WordsFromSelectedVerses = ({ 
  selectedVerses,
  selectedWords,
  onWordSelect,
  fontSize 
}) => {
  // Extract unique words from all selected verses
  const uniqueWords = [...new Set(
    selectedVerses
      .map(verse => verse.text.split(' '))
      .flat()
      .filter(word => word.trim() !== '')
  )];

  return (
    <div className={styles.column}>
      <h3 className={sharedStyles.columnTitle}>Words From Selected Verses</h3>
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
  );
};