// Hijri Calendar Conversion Utilities
// Based on the Umm al-Qura calendar system used in Saudi Arabia

// Hijri month names in Arabic and English
export const HIJRI_MONTHS = [
  { ar: 'محرم', en: 'Muharram', ur: 'محرم' },
  { ar: 'صفر', en: 'Safar', ur: 'صفر' },
  { ar: 'ربيع الأول', en: "Rabi' al-Awwal", ur: 'ربیع الاول' },
  { ar: 'ربيع الآخر', en: "Rabi' al-Thani", ur: 'ربیع الآخر' },
  { ar: 'جمادى الأولى', en: 'Jumada al-Awwal', ur: 'جمادی الاولیٰ' },
  { ar: 'جمادى الآخرة', en: 'Jumada al-Thani', ur: 'جمادی الآخرہ' },
  { ar: 'رجب', en: 'Rajab', ur: 'رجب' },
  { ar: 'شعبان', en: "Sha'ban", ur: 'شعبان' },
  { ar: 'رمضان', en: 'Ramadan', ur: 'رمضان' },
  { ar: 'شوال', en: 'Shawwal', ur: 'شوال' },
  { ar: 'ذو القعدة', en: "Dhu al-Qi'dah", ur: 'ذوالقعدہ' },
  { ar: 'ذو الحجة', en: 'Dhu al-Hijjah', ur: 'ذوالحجہ' }
];

// Convert Gregorian date to Hijri (approximate calculation)
export function gregorianToHijri(gregorianDate) {
  const date = new Date(gregorianDate);
  
  // Julian day calculation
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  const jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
  
  // Convert Julian day to Hijri
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const m2 = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m2) / 24);
  const y2 = 30 * n + j - 30;

  return {
    year: y2,
    month: m2,
    day: d
  };
}

// Convert Hijri date to Gregorian (approximate calculation)
export function hijriToGregorian(hijriDate) {
  // Handle both object format {year, month, day} and separate parameters
  let hijriYear, hijriMonth, hijriDay;
  
  if (typeof hijriDate === 'object' && hijriDate !== null) {
    hijriYear = hijriDate.year;
    hijriMonth = hijriDate.month;
    hijriDay = hijriDate.day;
  } else {
    // Legacy support for separate parameters
    hijriYear = arguments[0];
    hijriMonth = arguments[1];
    hijriDay = arguments[2];
  }
  
  // Validate input
  if (!hijriYear || !hijriMonth || !hijriDay) {
    console.error('Invalid Hijri date input:', { hijriYear, hijriMonth, hijriDay });
    return new Date(); // Return current date as fallback
  }
  
  try {
    const jd = Math.floor((11 * hijriYear + 3) / 30) + 354 * hijriYear + 30 * hijriMonth - Math.floor((hijriMonth - 1) / 2) + hijriDay + 1948440 - 385;
    
    const a = jd + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    
    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);
    
    const resultDate = new Date(year, month - 1, day);
    
    // Validate the result
    if (isNaN(resultDate.getTime())) {
      throw new Error('Invalid date result');
    }
    
    return resultDate;
  } catch (error) {
    console.error('Error in hijriToGregorian conversion:', error, { hijriYear, hijriMonth, hijriDay });
    return new Date(); // Return current date as fallback
  }
}

// Format Hijri date for display
export function formatHijriDate(hijriDate, includeMonthName = true, language = 'en') {
  if (includeMonthName) {
    const monthData = HIJRI_MONTHS[hijriDate.month - 1];
    if (language === 'ur' || language === 'ar') {
      // For Urdu/Arabic, use RTL format with Urdu month names
      const monthName = language === 'ur' ? monthData?.ur : monthData?.ar;
      return `${hijriDate.day} ${monthName} ${hijriDate.year} ہجری`;
    } else {
      // English format
      const monthName = monthData?.en || '';
      return `${hijriDate.day} ${monthName} ${hijriDate.year} AH`;
    }
  }
  return `${hijriDate.year}-${hijriDate.month.toString().padStart(2, '0')}-${hijriDate.day.toString().padStart(2, '0')} AH`;
}

// Get current Hijri date
export function getCurrentHijriDate() {
  return gregorianToHijri(new Date());
}

// Validate Hijri date
export function isValidHijriDate(year, month, day) {
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }
  
  // Basic validation - Hijri months can have 29 or 30 days
  if (day > 30) {
    return false;
  }
  
  return true;
}
