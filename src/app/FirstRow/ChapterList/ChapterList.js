import styles from './styles.module.css';
import sharedStyles from '../../shared/styles/shared.module.css';

export const ChapterList = ({ chapters, selectedChapter, onChapterSelect, searchTerm, onSearchChange }) => (
  <div className={styles.column}>
    <h3 className={sharedStyles.columnTitle}>Select Surah</h3>
    <input
      type="text"
      placeholder="Search by ID or name..."
      value={searchTerm}
      onChange={onSearchChange}
      className={styles.searchInput}
    />
    <div className={styles.chapterList}>
      {chapters.map((chapter) => (
        <div 
          key={chapter.id} 
          className={`${styles.chapterItem} ${selectedChapter?.id === chapter.id ? styles.selected : ''}`}
          onClick={() => onChapterSelect(chapter)}
        >
          {chapter.id}. {chapter.transliteration}
        </div>
      ))}
    </div>
  </div>
);