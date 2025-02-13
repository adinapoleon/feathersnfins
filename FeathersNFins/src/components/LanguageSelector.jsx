// src/components/LanguageSelector.jsx
import React from 'react';
import { useTranslation } from '../context/TranslationContext';

const LanguageSelector = () => {
    const { currentLanguage, languages, changeLanguage } = useTranslation();
  
    return (
      <div className="language-selector">
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="px-2 py-1 border rounded-md bg-white text-gray-700 text-sm"
          aria-label="Select Language" // Accessible name for the select element
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    );
  };
  

export default LanguageSelector;