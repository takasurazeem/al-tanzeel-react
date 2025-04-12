'use client';
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    className: '',
    masjidName: ''
  });

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('quranAppPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Save preferences when they change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newPreferences = { ...preferences, [name]: value };
    setPreferences(newPreferences);
    localStorage.setItem('quranAppPreferences', JSON.stringify(newPreferences));
    onPreferencesChange(newPreferences); // Pass preferences up to parent
  };

  return (
    <>
      <button 
        className={styles.burger}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`${styles.burgerLine} ${isOpen ? styles.open : ''}`}></div>
        <div className={`${styles.burgerLine} ${isOpen ? styles.open : ''}`}></div>
        <div className={`${styles.burgerLine} ${isOpen ? styles.open : ''}`}></div>
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.content}>
          <h2>Settings</h2>
          <form className={styles.preferencesForm}>
            <div className={styles.formGroup}>
              <label htmlFor="className">Class Name</label>
              <input
                type="text"
                id="className"
                name="className"
                value={preferences.className}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter class name"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="masjidName">Masjid Name</label>
              <input
                type="text"
                id="masjidName"
                name="masjidName"
                value={preferences.masjidName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter masjid name"
              />
            </div>
          </form>
        </div>
      </div>

      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};