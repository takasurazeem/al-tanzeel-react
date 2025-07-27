'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './styles.module.css';
import { HijriDatePicker } from '../HijriDatePicker/HijriDatePicker';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  gregorianToHijri, 
  hijriToGregorian, 
  formatHijriDate, 
  getCurrentHijriDate,
  isValidHijriDate 
} from '../../utils/hijriCalendar';

export const Sidebar = ({ onPreferencesChange, fontSize, onFontSizeChange, isOpen, onToggle }) => {
  const { t, language, changeLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    className: '',
    masjidName: '',
    pageSize: 'a4'
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarType, setCalendarType] = useState('gregorian');
  const [hijriDate, setHijriDate] = useState(getCurrentHijriDate());

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('quranPreferences');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        
        // Load calendar preferences if they exist
        if (parsed.selectedDate) setSelectedDate(parsed.selectedDate);
        if (parsed.calendarType) setCalendarType(parsed.calendarType);
        if (parsed.hijriDate) {
          setHijriDate(parsed.hijriDate);
        }
        
        // Notify parent component if callback exists
        onPreferencesChange?.(parsed);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onToggle]);

  // Save preferences to localStorage whenever they change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
      selectedDate,
      calendarType,
      hijriDate
    };

    try {
      // Update state
      setFormData(prev => ({ ...prev, [name]: value }));
      // Save to localStorage
      localStorage.setItem('quranPreferences', JSON.stringify(updatedData));
      // Notify parent component
      onPreferencesChange?.(updatedData);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [formData, selectedDate, calendarType, hijriDate, onPreferencesChange]);

  const handleCalendarTypeChange = (type) => {
    setCalendarType(type);
    if (type === 'hijri') {
      // Convert current Gregorian date to Hijri
      try {
        const currentHijri = gregorianToHijri(new Date(selectedDate));
        setHijriDate(currentHijri);
      } catch (error) {
        console.error('Error converting Gregorian to Hijri:', error);
      }
    } else {
      // Convert current Hijri to Gregorian
      if (hijriDate) {
        try {
          const gregorianDate = hijriToGregorian(hijriDate);
          if (gregorianDate && !isNaN(gregorianDate.getTime())) {
            setSelectedDate(gregorianDate.toISOString().split('T')[0]);
          } else {
            console.warn('Invalid Gregorian date conversion, keeping current date');
          }
        } catch (error) {
          console.error('Error converting Hijri to Gregorian:', error);
        }
      }
    }
    
    // Save preferences
    const updatedData = {
      ...formData,
      selectedDate,
      calendarType: type,
      hijriDate
    };
    
    try {
      localStorage.setItem('quranPreferences', JSON.stringify(updatedData));
      onPreferencesChange?.(updatedData);
    } catch (error) {
      console.error('Error saving calendar preferences:', error);
    }
  };

  const handleHijriDateChange = (newHijriDate) => {
    setHijriDate(newHijriDate);
    
    let gregorianDateString = selectedDate; // Default fallback
    
    // Convert to Gregorian for internal use with error handling
    if (newHijriDate) {
      try {
        const gregorianDate = hijriToGregorian(newHijriDate);
        
        // Check if the date is valid
        if (gregorianDate && !isNaN(gregorianDate.getTime())) {
          gregorianDateString = gregorianDate.toISOString().split('T')[0];
          setSelectedDate(gregorianDateString);
        } else {
          console.warn('Invalid Gregorian date conversion from Hijri:', newHijriDate);
          // Keep the current selectedDate as fallback
        }
      } catch (error) {
        console.error('Error converting Hijri to Gregorian:', error, newHijriDate);
        // Keep the current selectedDate as fallback
      }
    }
    
    // Save preferences
    const updatedData = {
      ...formData,
      selectedDate: gregorianDateString,
      calendarType,
      hijriDate: newHijriDate
    };
    
    try {
      localStorage.setItem('quranPreferences', JSON.stringify(updatedData));
      onPreferencesChange?.(updatedData);
    } catch (error) {
      console.error('Error saving hijri date preferences:', error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    
    // If in hijri mode, convert to hijri
    if (calendarType === 'hijri') {
      const newHijri = gregorianToHijri(new Date(e.target.value));
      setHijriDate(newHijri);
    }
    
    // Save preferences
    const updatedData = {
      ...formData,
      selectedDate: e.target.value,
      calendarType,
      hijriDate: calendarType === 'hijri' ? gregorianToHijri(new Date(e.target.value)) : hijriDate
    };
    
    try {
      localStorage.setItem('quranPreferences', JSON.stringify(updatedData));
      onPreferencesChange?.(updatedData);
    } catch (error) {
      console.error('Error saving date preferences:', error);
    }
  };

  const getDisplayDate = () => {
    if (calendarType === 'hijri' && hijriDate) {
      // Format Hijri date for display using localized month names
      const monthNames = t('hijriMonths');
      const monthName = monthNames[hijriDate.month - 1];
      return `${hijriDate.day} ${monthName} ${hijriDate.year} AH`;
    } else {
      return new Date(selectedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <>
      {/* Sidebar Panel */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>{t('settings')}</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onToggle}
              aria-label={t('closeSettings')}
              title={t('closeSettings')}
            >
              ×
            </button>
          </div>
          
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="className">{t('className')}</label>
              <input
                type="text"
                id="className"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                className={styles.input}
                placeholder={t('placeholders.className')}
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="masjidName">{t('masjidName')}</label>
              <input
                type="text"
                id="masjidName"
                name="masjidName"
                value={formData.masjidName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder={t('placeholders.masjidName')}
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('dateSettings')}</label>
              <div className={styles.datePickerContainer}>
                <div className={styles.calendarTypeSelector}>
                  <button 
                    type="button"
                    className={`${styles.calendarButton} ${calendarType === 'gregorian' ? styles.active : ''}`}
                    onClick={() => handleCalendarTypeChange('gregorian')}
                  >
                    {t('gregorian')}
                  </button>
                  <button 
                    type="button"
                    className={`${styles.calendarButton} ${calendarType === 'hijri' ? styles.active : ''}`}
                    onClick={() => handleCalendarTypeChange('hijri')}
                  >
                    {t('hijri')}
                  </button>
                </div>
                
                {calendarType === 'gregorian' ? (
                  <div className={styles.dateInputContainer}>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      onChange={handleDateChange}
                      className={styles.datePicker}
                    />
                  </div>
                ) : (
                  <div className={styles.hijriDateInputContainer}>
                    <div className={styles.hijriDatePickerWrapper}>
                      <HijriDatePicker
                        value={hijriDate}
                        onChange={handleHijriDateChange}
                        placeholder={t('selectHijriDate')}
                      />
                    </div>
                    <div className={styles.dateDisplay}>
                      {getDisplayDate()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="pageSize">{t('pageSize')}</label>
              <select
                id="pageSize"
                name="pageSize"
                value={formData.pageSize}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="a4">{t('pageSizes.a4')}</option>
                <option value="a3">{t('pageSizes.a3')}</option>
                <option value="a5">{t('pageSizes.a5')}</option>
                <option value="letter">{t('pageSizes.letter')}</option>
                <option value="legal">{t('pageSizes.legal')}</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>{t('fontSize')}</label>
              <div className={styles.fontControls}>
                <button 
                  type="button"
                  onClick={() => onFontSizeChange(prev => Math.max(12, prev - 2))}
                  className={styles.fontButton}
                >
                  A-
                </button>
                <span className={styles.fontSizeDisplay}>{fontSize}px</span>
                <button 
                  type="button"
                  onClick={() => onFontSizeChange(prev => Math.min(48, prev + 2))}
                  className={styles.fontButton}
                >
                  A+
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t('language')}</label>
              <div className={styles.languageControls}>
                <button 
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`${styles.languageButton} ${language === 'en' ? styles.active : ''}`}
                >
                  English
                </button>
                <button 
                  type="button"
                  onClick={() => changeLanguage('ur')}
                  className={`${styles.languageButton} ${language === 'ur' ? styles.active : ''}`}
                >
                  اردو
                </button>
              </div>
            </div>
          </form>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={() => onToggle(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};