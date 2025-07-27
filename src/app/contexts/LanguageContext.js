'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from '../locales/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const { t } = useTranslation(language);

  // Load language preference from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('appLanguage');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ur')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  const changeLanguage = (newLanguage) => {
    if (newLanguage === 'en' || newLanguage === 'ur') {
      setLanguage(newLanguage);
      try {
        localStorage.setItem('appLanguage', newLanguage);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
    isRTL: language === 'ur'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
