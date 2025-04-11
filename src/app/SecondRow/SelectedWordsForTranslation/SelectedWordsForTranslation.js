import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const SelectedWordsForTranslation = ({ 
  selectedWords,
  onRemoveWord,
  fontSize 
}) => {
  return (
    <div className={styles.column}>
      <h3 className={sharedStyles.columnTitle}>Selected Words</h3>
      <div className={styles.wordsContainer}>
        {selectedWords.map((word, index) => (
          <div key={`${word}-${index}`} className={styles.wordChip}>
            <span style={{ fontSize: `${fontSize}px` }}>{word}</span>
            <button
              className={styles.removeButton}
              onClick={() => onRemoveWord(word)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};