// src/context/TranslationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { translateService } from '../services/translate';

const TranslationContext = createContext(null);

export const TranslationProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        return localStorage.getItem('preferredLanguage') || 'en';
    });

    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('preferredLanguage', currentLanguage);
    }, [currentLanguage]);

    const translate = async (text, targetLang = currentLanguage) => {
        if (!text) return text;
        if (targetLang === 'en') return text;

        const cacheKey = `${text}:${targetLang}`;
        
        // Check cache first
        if (translations[cacheKey]) {
            return translations[cacheKey];
        }

        try {
            setIsLoading(true);
            const translatedText = await translateService.translate(text, targetLang);
            
            // Cache the translation
            setTranslations(prev => ({
                ...prev,
                [cacheKey]: translatedText
            }));

            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original text on error
        } finally {
            setIsLoading(false);
        }
    };

    const changeLanguage = (langCode) => {
        setCurrentLanguage(langCode);
    };

    return (
        <TranslationContext.Provider value={{
            currentLanguage,
            languages: translateService.languages,
            translate,
            changeLanguage,
            isLoading
        }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
};