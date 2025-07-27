'use client';

import { useEffect } from 'react';

export const FontLoader = () => {
  useEffect(() => {
    // Check if we're on GitHub Pages by looking at the hostname
    const isGitHubPages = typeof window !== 'undefined' && 
                         window.location.hostname === 'takasurazeem.github.io';
    
    // Determine the base path for assets
    const basePath = isGitHubPages ? '/al-tanzeel-react' : '';

    // Create and inject font face styles dynamically
    const fontStyles = `
      @font-face {
        font-family: 'QuranFont';
        src: url('${basePath}/fonts/pdms-saleem-quranfont.ttf') format('truetype');
        font-display: swap;
      }

      @font-face {
        font-family: 'NotoNastaliqUrdu';
        src: url('${basePath}/fonts/NotoNastaliqUrdu-VariableFont_wght.ttf') format('truetype');
        font-weight: 100 900;
        font-display: swap;
      }
    `;

    // Check if styles are already injected
    const existingStyle = document.getElementById('dynamic-fonts');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = 'dynamic-fonts';
      styleElement.textContent = fontStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  return null; // This component doesn't render anything
};
