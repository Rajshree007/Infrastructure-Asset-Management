// Shared utility functions and helpers

export function formatCurrency(amount: number, decimals = 0): string {
  if (!amount && amount !== 0) return '—';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(decimals === 0 ? 1 : decimals)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(decimals === 0 ? 1 : decimals)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatNumber(n: number): string {
  return n?.toLocaleString('en-IN') ?? '0';
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

export function conditionColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 65) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 35) return 'text-orange-600';
  return 'text-red-600';
}

export function conditionBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 65) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 35) return 'bg-orange-500';
  return 'bg-red-600';
}

export function priorityColor(label: string | undefined): string {
  switch (label) {
    case 'Critical': return 'text-red-700';
    case 'High': return 'text-orange-600';
    case 'Medium': return 'text-yellow-600';
    case 'Low': return 'text-green-600';
    default: return 'text-slate-600';
  }
}

export function priorityBadgeClass(label: string | undefined): string {
  switch (label) {
    case 'Critical': return 'badge badge-critical';
    case 'High': return 'badge badge-high';
    case 'Medium': return 'badge badge-medium';
    case 'Low': return 'badge badge-low';
    default: return 'badge badge-neutral';
  }
}

export function conditionBadgeClass(label: string | undefined): string {
  switch (label) {
    case 'Excellent': return 'badge badge-excellent';
    case 'Good': return 'badge badge-good';
    case 'Fair': return 'badge badge-fair';
    case 'Poor': return 'badge badge-poor';
    case 'Critical': return 'badge badge-critical';
    default: return 'badge badge-neutral';
  }
}

export function statusBadgeClass(status: string | undefined): string {
  const s = status?.toLowerCase().replace(/\s+/g, '') || '';
  if (s === 'completed' || s === 'verified' || s === 'closed' || s === 'operational') return 'badge badge-completed';
  if (s === 'inprogress' || s === 'underconstruction') return 'badge badge-inprogress';
  if (s === 'reported') return 'badge badge-reported';
  if (s === 'assigned') return 'badge badge-info';
  if (s === 'scheduled' || s === 'proposed' || s === 'approved') return 'badge badge-info';
  if (s === 'delayed' || s === 'overdue') return 'badge badge-delayed';
  if (s === 'pending') return 'badge badge-pending';
  if (s === 'maintenance') return 'badge badge-maintenance';
  return 'badge badge-neutral';
}

export function severityBadgeClass(severity: string | undefined): string {
  switch (severity) {
    case 'Critical': return 'badge badge-critical';
    case 'High': return 'badge badge-high';
    case 'Medium': return 'badge badge-medium';
    case 'Low': return 'badge badge-low';
    default: return 'badge badge-neutral';
  }
}

export function priorityScoreColor(score: number): string {
  if (score >= 80) return '#dc2626';
  if (score >= 60) return '#ea580c';
  if (score >= 40) return '#d97706';
  return '#16a34a';
}

export function priorityLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function daysSince(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
