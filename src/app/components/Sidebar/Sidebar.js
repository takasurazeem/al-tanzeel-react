'use client';
import { useState } from 'react';
import styles from './styles.module.css';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          {/* Settings will go here */}
        </div>
      </div>

      {/* Overlay to close sidebar when clicking outside */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};