'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import { gregorianToHijri, hijriToGregorian } from '../../utils/hijriCalendar';
import { useLanguage } from '../../contexts/LanguageContext';

const HIJRI_MONTHS = [
  { ar: 'محرم', en: 'Muharram', ur: 'محرم' },
  { ar: 'صفر', en: 'Safar', ur: 'صفر' },
  { ar: 'ربیع الأول', en: "Rabi' I", ur: 'ربیع الاول' },
  { ar: 'ربیع الآخر', en: "Rabi' II", ur: 'ربیع الآخر' },
  { ar: 'جمادى الأولى', en: 'Jumada I', ur: 'جمادی الاولیٰ' },
  { ar: 'جمادى الآخرة', en: 'Jumada II', ur: 'جمادی الآخرہ' },
  { ar: 'رجب', en: 'Rajab', ur: 'رجب' },
  { ar: 'شعبان', en: "Sha'ban", ur: 'شعبان' },
  { ar: 'رمضان', en: 'Ramadan', ur: 'رمضان' },
  { ar: 'شوال', en: 'Shawwal', ur: 'شوال' },
  { ar: 'ذو القعدة', en: "Dhu al-Qi'dah", ur: 'ذوالقعدہ' },
  { ar: 'ذو الحجة', en: 'Dhu al-Hijjah', ur: 'ذوالحجہ' }
];

export function HijriDatePicker({ value, onChange, placeholder = "Select Hijri Date" }) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(value?.day || '');
  const [selectedMonth, setSelectedMonth] = useState(value?.month || '');
  const [isMobile, setIsMobile] = useState(false);
  
  // Get current Hijri year more accurately
  const getCurrentHijriYear = () => {
    const today = new Date();
    const hijriToday = gregorianToHijri(today);
    return hijriToday.year;
  };
  
  const [selectedYear] = useState(getCurrentHijriYear()); // Use accurate current Hijri year
  
  const dropdownRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key to close modal on mobile
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen && isMobile) {
        setIsOpen(false);
      }
    };

    if (isOpen && isMobile) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  // Calculate minimum date (2 days in the past)
  const getMinDate = () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return gregorianToHijri(twoDaysAgo);
  };

  const minDate = getMinDate();

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !isMobile) {
        setIsOpen(false);
      }
    }

    if (!isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  // Generate calendar grid for the current month
  const generateCalendarDays = () => {
    if (!selectedMonth) return [];
    
    const daysInMonth = getDaysInHijriMonth(selectedMonth, selectedYear);
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Temporarily disable the minimum date check to allow all dates
      const isDisabled = false; // Remove date restriction for now
      
      days.push({ day, disabled: isDisabled });
    }
    
    return days;
  };

  // Check if a date is before the minimum date
  const isDateBeforeMin = (date, minDate) => {
    // For debugging, let's be more lenient with the minimum date check
    // Only disable dates that are significantly in the past (more than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const minDateThirtyDays = gregorianToHijri(thirtyDaysAgo);
    
    if (date.year < minDateThirtyDays.year) return true;
    if (date.year > minDateThirtyDays.year) return false;
    if (date.month < minDateThirtyDays.month) return true;
    if (date.month > minDateThirtyDays.month) return false;
    return date.day < minDateThirtyDays.day;
  };

  // Approximate days in Hijri month (354-day year)
  const getDaysInHijriMonth = (month, year) => {
    // Hijri months alternate between 29 and 30 days
    // This is a simplified calculation
    const monthNumber = parseInt(month);
    if ([1, 3, 5, 7, 9, 11].includes(monthNumber)) {
      return 30;
    } else if ([2, 4, 6, 8, 10].includes(monthNumber)) {
      return 29;
    } else { // Month 12
      // Last month has 29 days in normal year, 30 in leap year
      const isLeapYear = ((year * 11) + 14) % 30 < 11;
      return isLeapYear ? 30 : 29;
    }
  };

  const handleDayClick = (day, disabled) => {
    // Remove the disabled check for now to allow all dates
    // if (disabled) return; 
    
    setSelectedDay(day);
    if (selectedMonth) {
      const hijriDate = {
        day: day,
        month: parseInt(selectedMonth),
        year: selectedYear
      };
      onChange(hijriDate);
      setIsOpen(false);
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setSelectedDay(''); // Reset day when month changes
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (selectedDay && selectedMonth) {
      const hijriMonths = t('hijriMonths');
      const monthName = hijriMonths[selectedMonth - 1] || '';
      return `${selectedDay} ${monthName} ${selectedYear} AH`;
    }
    return placeholder;
  };

  return (
    <div className={styles.hijriDatePicker} ref={dropdownRef}>
      <button
        type="button"
        className={styles.pickerButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {formatDisplayValue()}
        <span className={styles.arrow}>▼</span>
      </button>

      {isOpen && (
        <>
          {isMobile && <div className={styles.modalOverlay} onClick={handleClose} />}
          <div className={`${styles.dropdown} ${isMobile ? styles.mobileModal : ''}`}>
            {/* Mobile Close Button */}
            {isMobile && (
              <div className={styles.mobileHeader}>
                <h3 className={styles.modalTitle}>{t('selectHijriDate') || 'Select Hijri Date'}</h3>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={handleClose}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            )}

            {/* Year Display */}
            <div className={styles.yearDisplay}>
              {selectedYear} AH
            </div>

            {/* Month Selection */}
            <div className={styles.monthSelector}>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className={styles.monthSelect}
              >
                <option value="">{t('selectMonth')}</option>
                {HIJRI_MONTHS.map((month, index) => {
                  const hijriMonths = t('hijriMonths');
                  const monthName = hijriMonths[index] || month.en;
                  return (
                    <option key={index + 1} value={index + 1}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Calendar Grid */}
            {selectedMonth && (
              <div className={styles.calendar}>
                <div className={styles.calendarHeader}>
                  {t('hijriMonths')[selectedMonth - 1]} {selectedYear} AH
                </div>
                <div className={styles.daysGrid}>
                  {generateCalendarDays().map(({ day, disabled }) => (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.dayButton} ${selectedDay === day ? styles.selectedDay : ''} ${disabled ? styles.disabledDay : ''}`}
                      onClick={() => handleDayClick(day, disabled)}
                      disabled={disabled}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.todayButton}
                onClick={() => {
                  const today = gregorianToHijri(new Date());
                  // Remove the minimum date check for Today button
                  setSelectedDay(today.day);
                  setSelectedMonth(today.month);
                  onChange(today);
                  setIsOpen(false);
                }}
              >
                {t('today')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
