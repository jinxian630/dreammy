import type { IsoDateTime } from './common';

/** A Guardian is a fulfiller assigned to complete a customer's order. */
export interface Guardian {
  id: string;
  name: string;
  avatarKey: string | null;
  online: boolean;
  /** Number of currently open orders assigned to this Guardian. */
  activeOrders: number;
  joinedAt: IsoDateTime;
}
