import type { Business, Connections, ConnectionStatus } from '@/api/types';

export type Relation = { status: ConnectionStatus; direction: 'sent' | 'received'; contactUserId: number | null } | null;

const RANK: Record<ConnectionStatus, number> = { approved: 3, pending_admin: 2, rejected: 1 };

export function relationTo(business: Business, connections: Connections): Relation {
  const candidates: NonNullable<Relation>[] = [
    ...connections.sent
      .filter((s) => s.business_id === business.id)
      .map((s) => ({ status: s.status, direction: 'sent' as const, contactUserId: s.business_owner_id })),
    ...connections.received
      .filter((r) => r.requester_business_id === business.id)
      .map((r) => ({ status: r.status, direction: 'received' as const, contactUserId: r.requester_id })),
  ];
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => RANK[b.status] - RANK[a.status])[0];
}

export const STATUS_LABEL: Record<ConnectionStatus, string> = {
  pending_admin: 'Pending',
  approved: 'Connected',
  rejected: 'Declined',
};
