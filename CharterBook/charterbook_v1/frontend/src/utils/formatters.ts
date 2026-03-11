import { CrewMember, TripStatus, CRMClient, ContactNote } from '../types';

export const today = new Date('2024-03-04');
export const today2 = new Date('2024-03-04');

export function daysUntil(dateStr: string): number {
    const d = new Date(dateStr);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntil2(d: string) {
    return Math.ceil((new Date(d).getTime() - today2.getTime()) / 86400000);
}

export function expiryBadgeClass(dateStr: string) {
    const d = daysUntil(dateStr);
    if (d < 0) return 'badge-danger';
    if (d < 60) return 'badge-warning';
    return 'badge-success';
}

export function expiryLabel(dateStr: string) {
    const d = daysUntil(dateStr);
    if (d < 0) return `Expired ${Math.abs(d)}d ago`;
    if (d === 0) return 'Expires today';
    if (d < 60) return `Expires in ${d}d`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function statusColor(status: CrewMember['status']) {
    const map: Record<string, string> = {
        'Available': '#10b981',
        'On Duty': '#3b82f6',
        'Rest Required': '#f59e0b',
        'Inactive': '#6b7280',
    };
    return map[status] ?? '#6b7280';
}

export function hoursPercent(val: number, max: number) {
    return Math.min(100, Math.round((val / max) * 100));
}

export function hoursBarColor(pct: number) {
    if (pct >= 90) return '#ef4444';
    if (pct >= 70) return '#f59e0b';
    return '#10b981';
}

export const FMT_USD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const FMT_USD2 = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export function tripStatusColor(s: TripStatus) {
    return s === 'Completed' ? '#10b981' : s === 'In Progress' ? '#3b82f6'
        : s === 'Confirmed' ? '#8b5cf6' : s === 'Cancelled' ? '#ef4444' : '#f59e0b';
}

export function tierColor(t: CRMClient['tier']) {
    return t === 'VIP' ? '#f59e0b' : t === 'Regular' ? '#3b82f6' : '#6b7280';
}

export function noteIcon(type: ContactNote['type']) {
    return type === 'call' ? '📞' : type === 'email' ? '📧' : type === 'meeting' ? '🤝' : '📝';
}

export function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function hoursRemaining(current: number, due: number) { return due - current; }

export const discountedPrice = (orig: number, pct: number) => Math.round(orig * (1 - pct / 100));

export const urgencyLabel = (hrs: number): { label: string; color: string } => {
    if (hrs <= 12) return { label: 'Departing today!', color: '#ef4444' };
    if (hrs <= 36) return { label: 'Departing tomorrow', color: '#f59e0b' };
    if (hrs <= 72) return { label: 'Departing in 3 days', color: '#3b82f6' };
    return { label: `${Math.round(hrs / 24)}d away`, color: '#6b7280' };
};
