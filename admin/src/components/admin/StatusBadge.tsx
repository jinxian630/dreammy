'use client';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type {
  FulfillmentStatus,
  PaymentStatus,
  ServiceStatus,
  VoucherStatus,
} from '@/types';
import { useI18n } from '@/lib/i18n/I18nProvider';

const PAYMENT_TONES: Record<PaymentStatus, BadgeTone> = {
  paid: 'success',
  pending: 'warn',
  refunded: 'danger',
};

const FULFILLMENT_TONES: Record<FulfillmentStatus, BadgeTone> = {
  pending: 'lavender',
  awaiting_guardian: 'warn',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'muted',
};

const VOUCHER_TONES: Record<VoucherStatus, BadgeTone> = {
  available: 'success',
  unavailable: 'muted',
};

const SERVICE_TONES: Record<ServiceStatus, BadgeTone> = {
  active: 'success',
  draft: 'warn',
  archived: 'muted',
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const { t } = useI18n();
  return (
    <Badge tone={PAYMENT_TONES[status]} dot>
      {t(`payment.${status}`)}
    </Badge>
  );
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const { t } = useI18n();
  return (
    <Badge tone={FULFILLMENT_TONES[status]} dot>
      {t(`fulfillment.${status}`)}
    </Badge>
  );
}

export function VoucherBadge({ status }: { status: VoucherStatus }) {
  const { t } = useI18n();
  return <Badge tone={VOUCHER_TONES[status]}>{t(`voucherStatus.${status}`)}</Badge>;
}

export function ServiceBadge({ status }: { status: ServiceStatus }) {
  const { t } = useI18n();
  return <Badge tone={SERVICE_TONES[status]}>{t(`serviceStatus.${status}`)}</Badge>;
}
