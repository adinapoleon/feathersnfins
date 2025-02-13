// src/services/translate.jsx

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBGTACraTafguZnzJoYXdky8yNCIyVQwEo';

export const translateService = {
    // Supported languages
    languages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'vi', name: 'Vietnamese' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ar', name: 'Arabic' },
        { code: 'tr', name: 'Turkish' }, // Added Turkish
        { code: 'sr', name: 'Serbian' }  // Added Serbian
    ],

    // Translate text using Google Translate API
    translate: async (text, targetLang, sourceLang = 'en') => {
        try {
            const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLang,
                    source: sourceLang
                })
            });

            if (!response.ok) {
                throw new Error('Translation failed');
            }

            const data = await response.json();
            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    },

    // Detect language of text
    detectLanguage: async (text) => {
        try {
            const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text
                })
            });

            if (!response.ok) {
                throw new Error('Language detection failed');
            }

            const data = await response.json();
            return data.data.detections[0][0].language;
        } catch (error) {
            console.error('Language detection error:', error);
            throw error;
        }
    },

    // Get supported languages
    getSupportedLanguages: async () => {
        try {
            const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${GOOGLE_TRANSLATE_API_KEY}&target=en`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch supported languages');
            }

            const data = await response.json();
            return data.data.languages;
        } catch (error) {
            console.error('Error fetching supported languages:', error);
            return translateService.languages; // Fallback to default languages
        }
    }
};