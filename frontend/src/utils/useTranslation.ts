import { useCallback, useEffect, useState } from 'react';
import { Language, TranslationData } from '../types';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<TranslationData | null>(null);

  const loadTranslations = useCallback(async (lang: Language) => {
    try {
      const response = await import(`../translation/${lang}.json`);
      setTranslations(response.default);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  return {
    language,
    setLanguage,
    translations,
    t: (key: string) => {
      if (!translations) return '';
      const keys = key.split('.');
      let value: any = translations;
      for (const k of keys) {
        value = value[k];
        if (!value) return key;
      }
      return value;
    }
  };
};