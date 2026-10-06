'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BrandMark } from '@/components/admin/BrandMark';
import { LanguageSwitcher } from '@/components/admin/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/I18nProvider';

function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    // Full navigation so middleware picks up the new session cookie.
    window.location.assign(next);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={t('lg.email')} htmlFor="email" required>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Field label={t('lg.password')} htmlFor="password" required>
        <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </Field>
      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <Button type="submit" block disabled={busy}>
        {busy ? t('lg.signingIn') : t('lg.signIn')}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-page p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <BrandMark />
          <LanguageSwitcher />
        </div>
        <Card>
          <h1 className="font-display text-xl text-plum">{t('lg.title')}</h1>
          <p className="mb-4 mt-1 text-sm text-ink-soft">{t('lg.subtitle')}</p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}
