import type { Guardian } from '@/types';

export const mockGuardians: Guardian[] = [
  { id: 'grd-luna', name: 'Luna', avatarKey: 'avatar.guardian-luna', online: true, activeOrders: 3, joinedAt: '2026-01-10T10:00:00+08:00' },
  { id: 'grd-nova', name: 'Nova', avatarKey: 'avatar.guardian-nova', online: true, activeOrders: 2, joinedAt: '2026-02-14T10:00:00+08:00' },
  { id: 'grd-aurora', name: 'Aurora', avatarKey: 'avatar.guardian-aurora', online: false, activeOrders: 1, joinedAt: '2026-03-02T10:00:00+08:00' },
  { id: 'grd-lumi', name: 'Lumi', avatarKey: 'avatar.guardian-lumi', online: false, activeOrders: 0, joinedAt: '2026-04-21T10:00:00+08:00' },
];
