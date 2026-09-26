import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconSettings, IconUser, IconGlobe, IconBell } from '@/components/ui/icons';

export const metadata: Metadata = { title: 'Settings' };

const SECTIONS = [
  { icon: IconUser, title: 'Store profile', desc: 'Store name, contact and branding.' },
  { icon: IconGlobe, title: 'Regions & currencies', desc: 'Manage MYR / CNY and server regions.' },
  { icon: IconBell, title: 'Notifications', desc: 'Order and refund alert preferences.' },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your Dreammy admin workspace." demo={false} />

      <Card className="mb-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blush text-primary">
            <IconSettings width={22} height={22} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg text-plum">Settings are coming soon</h2>
              <Badge tone="muted">Not available yet</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              This section isn’t part of the current build. It’s shown as a disabled placeholder so
              navigation stays honest — no settings can be changed here yet. It will be wired up when
              the Laravel backend is connected.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              aria-disabled="true"
              className="admin-card cursor-not-allowed p-5 opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lavender text-plum">
                <Icon width={20} height={20} />
              </span>
              <h3 className="mt-3 font-semibold text-plum">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.desc}</p>
              <Badge tone="muted" className="mt-3">
                Disabled
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
