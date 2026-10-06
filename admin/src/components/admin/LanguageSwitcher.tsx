'use client';

import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n/I18nProvider';

/** Compact EN / 中文 toggle. Visible to every role; persists per device. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center rounded-full border border-blush-deep/40 bg-white p-0.5 text-xs font-semibold',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={cn('rounded-full px-2.5 py-1', lang === 'en' ? 'bg-blush text-primary' : 'text-ink-muted')}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('zh')}
        aria-pressed={lang === 'zh'}
        className={cn('rounded-full px-2.5 py-1', lang === 'zh' ? 'bg-blush text-primary' : 'text-ink-muted')}
      >
        中文
      </button>
    </div>
  );
}
