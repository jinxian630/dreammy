import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { AccessGuard } from '@/components/admin/AccessGuard';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    template: '%s · Dreammy Admin',
    default: 'Dreammy Admin',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-[100dvh] bg-cream-page">
        <AdminSidebar />
        <div className="lg:pl-64">
          <AdminHeader />
          <main className="admin-main mx-auto w-full max-w-shell px-4 py-5 pb-safe sm:px-6 lg:px-8 lg:pb-10">
            <AccessGuard>{children}</AccessGuard>
          </main>
        </div>
        <AdminBottomNav />
      </div>
    </ToastProvider>
  );
}
