'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { en, zh, type Lang, type TKey } from './dictionary';

const DICTS: Record<Lang, Record<TKey, string>> = { en, zh };
const STORAGE_KEY = 'dreammy-admin-lang';

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a key for the active language (falls back to English). */
  t: (key: TKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * App-wide language context. Defaults to English and renders English on the
 * first paint, then adopts the per-device choice from localStorage after mount
 * (avoids a hydration mismatch). Available to every role.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode etc.) — the choice still applies for the session.
    }
  }, []);

  const t = useCallback((key: TKey) => DICTS[lang][key] ?? en[key], [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider.');
  return ctx;
}
