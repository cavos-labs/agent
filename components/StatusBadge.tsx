'use client'

interface StatusBadgeProps {
  status: 'active' | 'expired' | 'renewable' | 'not-registered' | 'deployed' | 'not-deployed';
}

const STYLES: Record<string, string> = {
  'active': 'bg-primary/10 text-primary',
  'deployed': 'bg-secondary/5 text-secondary/60',
  'expired': 'bg-black/[0.03] text-secondary/30',
  'renewable': 'bg-primary/5 text-primary/70',
  'not-registered': 'bg-black/[0.03] text-secondary/20',
  'not-deployed': 'bg-black/[0.03] text-secondary/20',
};

const LABELS: Record<string, string> = {
  'active': 'Active',
  'deployed': 'Deployed',
  'expired': 'Expired',
  'renewable': 'Renewable',
  'not-registered': 'Not Registered',
  'not-deployed': 'Not Deployed',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${STYLES[status] || STYLES['not-registered']}`}>
      {LABELS[status] || status}
    </span>
  );
}
