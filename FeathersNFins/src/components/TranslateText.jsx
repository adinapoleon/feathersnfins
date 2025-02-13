// src/components/TranslateText.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';

const TranslateText = ({ children }) => {
    const { translate, currentLanguage } = useTranslation();
    const [translatedText, setTranslatedText] = useState(children);

    useEffect(() => {
        const translateText = async () => {
            if (typeof children === 'string') {
                const translated = await translate(children);
                setTranslatedText(translated);
            }
        };

        translateText();
    }, [children, currentLanguage, translate]);

    if (typeof children !== 'string') {
        return children;
    }

    return <>{translatedText}</>;
};

export default TranslateText;