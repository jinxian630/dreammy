import { Badge, type BadgeTone } from '@/components/ui/Badge';
import {
  FULFILLMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  VOUCHER_STATUS_LABELS,
  type FulfillmentStatus,
  type PaymentStatus,
  type ServiceStatus,
  type VoucherStatus,
} from '@/types';

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
  active: 'success',
  scheduled: 'warn',
  disabled: 'muted',
  expired: 'muted',
};

const SERVICE_TONES: Record<ServiceStatus, BadgeTone> = {
  active: 'success',
  draft: 'warn',
  archived: 'muted',
};

const SERVICE_LABELS: Record<ServiceStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge tone={PAYMENT_TONES[status]} dot>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  return (
    <Badge tone={FULFILLMENT_TONES[status]} dot>
      {FULFILLMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function VoucherBadge({ status }: { status: VoucherStatus }) {
  return <Badge tone={VOUCHER_TONES[status]}>{VOUCHER_STATUS_LABELS[status]}</Badge>;
}

export function ServiceBadge({ status }: { status: ServiceStatus }) {
  return <Badge tone={SERVICE_TONES[status]}>{SERVICE_LABELS[status]}</Badge>;
}
