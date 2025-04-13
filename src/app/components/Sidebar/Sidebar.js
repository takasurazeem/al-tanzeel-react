'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './styles.module.css';

export const Sidebar = ({ onPreferencesChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    masjidName: ''
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('quranPreferences');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        // Notify parent component if callback exists
        onPreferencesChange?.(parsed);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };

    try {
      // Update state
      setFormData(updatedData);
      // Save to localStorage
      localStorage.setItem('quranPreferences', JSON.stringify(updatedData));
      // Notify parent component
      onPreferencesChange?.(updatedData);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [formData, onPreferencesChange]);

  return (
    <div className={styles.sidebarContainer}>
      {/* Hamburger Button */}
      <button 
        className={styles.menuButton}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Toggle Settings"
      >
        <span className={`${styles.menuIcon} ${isOpen ? styles.open : ''}`} />
      </button>

      {/* Sidebar Panel */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <h2 className={styles.title}>Settings</h2>
          
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="className">Class Name</label>
              <input
                type="text"
                id="className"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter class name"
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="masjidName">Masjid Name</label>
              <input
                type="text"
                id="masjidName"
                name="masjidName"
                value={formData.masjidName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter masjid name"
                autoComplete="off"
              />
            </div>
          </form>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};