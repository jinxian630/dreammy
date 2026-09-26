'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Service } from '@/types';
import { ServiceForm } from '../../ServiceForm';
import { LoadingRows, EmptyState } from '@/components/admin/States';
import { Button } from '@/components/ui/Button';
import { IconBag } from '@/components/ui/icons';

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getService(id).then((s) => {
      if (active) {
        setService(s);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="admin-card p-6">
        <LoadingRows rows={6} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="admin-card p-6">
        <EmptyState
          icon={IconBag}
          title="Service not found"
          description="This service may have been archived or the link is incorrect."
          action={
            <Link href="/admin/services">
              <Button size="sm">Back to services</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return <ServiceForm service={service} />;
}
