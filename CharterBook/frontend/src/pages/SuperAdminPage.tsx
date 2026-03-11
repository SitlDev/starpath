import React, { useCallback, useEffect, useState } from 'react';
import {
    Building2, Users, Plane, BarChart3, Edit2, Trash2,
    Search, Check, X, ExternalLink, RefreshCw, LogOut,
    ShieldCheck, ChevronRight, Globe, Palette,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { fetchAllTenants, updateTenantAdmin, deleteTenantAdmin } from '../api';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TenantRow {
    id: string;
    slug: string;
    companyName: string;
    primaryColor: string;
    logoUrl: string | null;
    domain: string | null;
    plan: 'starter' | 'pro' | 'enterprise';
    createdAt: string;
    mrr: number;
    users: number;
    flights: number;
    clients: number;
    aircraft: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
    starter: { label: 'Starter', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    pro: { label: 'Pro', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    enterprise: { label: 'Enterprise', color: '#059669', bg: 'rgba(5,150,105,0.12)' },
};

const BRAND_PRESETS = [
    '#7c3aed', '#2563eb', '#059669', '#e11d48', '#d97706', '#0891b2', '#475569', '#374151',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Edit Panel ────────────────────────────────────────────────────────────────

function EditPanel({ tenant, onClose, onSaved }: { tenant: TenantRow; onClose: () => void; onSaved: (t: TenantRow) => void }) {
    const [form, setForm] = useState({
        companyName: tenant.companyName,
        primaryColor: tenant.primaryColor,
        plan: tenant.plan as string,
        domain: tenant.domain || '',
        logoUrl: tenant.logoUrl || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const updated = await updateTenantAdmin(tenant.id, form);
            onSaved({ ...tenant, ...updated });
        } catch (e: any) {
            setError(e.message);
            setSaving(false);
        }
    };

    const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
        <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#71717a', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
            <input
                type={type}
                value={form[key] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', padding: '0.75rem 0.875rem', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}>
            <div style={{ width: 380, background: '#09090b', borderLeft: '1px solid #27272a', height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Panel header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>Edit Tenant</div>
                        <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.2rem' }}>{tenant.slug}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Fields */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                            {error}
                        </div>
                    )}

                    {field('Company Name', 'companyName', 'text', 'ACME Charter')}

                    {/* Brand color */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#71717a', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {BRAND_PRESETS.map(c => (
                                <button key={c} onClick={() => setForm(f => ({ ...f, primaryColor: c }))}
                                    style={{ width: 28, height: 28, borderRadius: '6px', background: c, border: form.primaryColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: form.primaryColor === c ? `0 0 0 2px ${c}55` : 'none', transition: 'all 0.15s' }}>
                                    {form.primaryColor === c && <Check size={12} color="white" strokeWidth={3} />}
                                </button>
                            ))}
                            <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                                style={{ width: 28, height: 28, border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0, background: 'none' }} />
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#71717a' }}>{form.primaryColor}</span>
                        </div>
                    </div>

                    {/* Plan */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#71717a', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {(['starter', 'pro', 'enterprise'] as const).map(p => {
                                const meta = PLAN_META[p];
                                const active = form.plan === p;
                                return (
                                    <button key={p} onClick={() => setForm(f => ({ ...f, plan: p }))}
                                        style={{ flex: 1, padding: '0.625rem 0.5rem', borderRadius: '8px', border: active ? `1.5px solid ${meta.color}` : '1.5px solid #27272a', background: active ? meta.bg : 'transparent', color: active ? meta.color : '#71717a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {field('Custom Domain', 'domain', 'text', 'ops.yourcompany.com')}
                    {field('Logo URL', 'logoUrl', 'url', 'https://...')}
                </div>

                {/* Actions */}
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #18181b', display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #27272a', background: 'transparent', color: '#fafafa', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#eab308', color: '#09090b', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem', opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteModal({ tenant, onConfirm, onCancel }: { tenant: TenantRow; onConfirm: () => Promise<void>; onCancel: () => void }) {
    const [deleting, setDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const match = tenant.slug;

    const handleDelete = async () => {
        if (confirmText !== match) return;
        setDeleting(true);
        await onConfirm();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#09090b', border: '1px solid #3f3f46', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: 420 }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'grid', placeItems: 'center', marginBottom: '1.25rem' }}>
                    <Trash2 size={22} color="#ef4444" />
                </div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Delete Tenant</h2>
                <p style={{ color: '#71717a', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                    This will permanently delete <strong style={{ color: '#fafafa' }}>{tenant.companyName}</strong> and all its data — flights, crew, clients, and users. This cannot be undone.
                </p>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#71717a', marginBottom: '0.4rem' }}>
                    Type <strong style={{ color: '#fafafa', fontFamily: 'monospace' }}>{match}</strong> to confirm
                </label>
                <input
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: '0.75rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '1.25rem', fontFamily: 'monospace' }}
                    placeholder={match}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #27272a', background: 'transparent', color: '#fafafa', fontWeight: 700, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={confirmText !== match || deleting}
                        style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: 'none', background: confirmText === match ? '#ef4444' : '#27272a', color: '#fafafa', fontWeight: 800, cursor: confirmText === match ? 'pointer' : 'not-allowed', opacity: deleting ? 0.7 : 1, transition: 'background 0.2s' }}>
                        {deleting ? 'Deleting…' : 'Delete Permanently'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Super Admin Page ─────────────────────────────────────────────────────

const SuperAdminPage: React.FC = () => {
    const { user, logout } = useStore();
    const [tenants, setTenants] = useState<TenantRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null);
    const [deletingTenant, setDeletingTenant] = useState<TenantRow | null>(null);
    const [planFilter, setPlanFilter] = useState<string>('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllTenants();
            setTenants(data);
        } catch {
            // could show an error toast
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Derived metrics ──
    const totalMrr = tenants.reduce((s, t) => s + t.mrr, 0);
    const totalFlights = tenants.reduce((s, t) => s + t.flights, 0);
    const totalUsers = tenants.reduce((s, t) => s + t.users, 0);

    const filtered = tenants
        .filter(t => planFilter === 'all' || t.plan === planFilter)
        .filter(t =>
            !search ||
            t.companyName.toLowerCase().includes(search.toLowerCase()) ||
            t.slug.toLowerCase().includes(search.toLowerCase())
        );

    const handleSaved = (updated: TenantRow) => {
        setTenants(ts => ts.map(t => t.id === updated.id ? updated : t));
        setEditingTenant(null);
    };

    const handleDelete = async () => {
        if (!deletingTenant) return;
        await deleteTenantAdmin(deletingTenant.id);
        setTenants(ts => ts.filter(t => t.id !== deletingTenant.id));
        setDeletingTenant(null);
    };

    const KPIS = [
        { label: 'Total Tenants', value: tenants.length, icon: Building2, color: '#7c3aed' },
        { label: 'Monthly ARR', value: `$${totalMrr.toLocaleString()}`, icon: BarChart3, color: '#059669' },
        { label: 'Total Flights', value: totalFlights, icon: Plane, color: '#3b82f6' },
        { label: 'Total Users', value: totalUsers, icon: Users, color: '#f59e0b' },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Header ── */}
            <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #18181b', padding: '0 2rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '6px', background: '#eab308', display: 'grid', placeItems: 'center' }}>
                            <ShieldCheck size={14} color="#09090b" strokeWidth={3} />
                        </div>
                        CharterBook
                    </div>
                    <ChevronRight size={14} color="#3f3f46" />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.625rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, color: '#eab308', letterSpacing: '0.06em' }}>
                        SUPER ADMIN
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#52525b' }}>{user?.name}</span>
                    <button onClick={load} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', display: 'grid', placeItems: 'center' }} title="Refresh">
                        <RefreshCw size={15} />
                    </button>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 2rem' }}>

                {/* ── KPI Row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                    {KPIS.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} style={{ background: '#0c0c0e', border: '1px solid #1c1c1f', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}30`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <Icon size={18} color={color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{value}</div>
                                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.15rem', fontWeight: 500 }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Toolbar ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search tenants…"
                            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', background: '#0c0c0e', border: '1px solid #1c1c1f', borderRadius: '8px', color: '#fafafa', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    {/* Plan filter pills */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {['all', 'starter', 'pro', 'enterprise'].map(p => (
                            <button key={p} onClick={() => setPlanFilter(p)}
                                style={{ padding: '0.375rem 0.75rem', borderRadius: 99, border: planFilter === p ? 'none' : '1px solid #27272a', background: planFilter === p ? (p === 'all' ? '#27272a' : PLAN_META[p]?.bg) : 'transparent', color: planFilter === p ? (p === 'all' ? '#fafafa' : PLAN_META[p]?.color) : '#71717a', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#52525b' }}>
                        {filtered.length} of {tenants.length} tenants
                    </div>
                </div>

                {/* ── Tenant Grid ── */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: '#52525b' }}>Loading tenants…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: '#52525b' }}>No tenants found.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                        {filtered.map(tenant => {
                            const plan = PLAN_META[tenant.plan] || PLAN_META.starter;
                            return (
                                <div key={tenant.id} style={{ background: '#0c0c0e', border: '1px solid #1c1c1f', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2d2d30')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1c1c1f')}>

                                    {/* Card top stripe */}
                                    <div style={{ height: 4, background: tenant.primaryColor }} />

                                    <div style={{ padding: '1.25rem 1.25rem 1rem 1.25rem' }}>
                                        {/* Company header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '8px', background: tenant.primaryColor, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                                                    {tenant.companyName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.9375rem', lineHeight: 1.2 }}>{tenant.companyName}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#52525b', marginTop: '0.1rem', fontFamily: 'monospace' }}>{tenant.slug}</div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '0.2rem 0.6rem', borderRadius: 99, background: plan.bg, color: plan.color, fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>
                                                {plan.label.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Stats row */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                                            {[
                                                { icon: Users, val: tenant.users, label: 'Users' },
                                                { icon: Plane, val: tenant.aircraft, label: 'Fleet' },
                                                { icon: BarChart3, val: tenant.flights, label: 'Flights' },
                                                { icon: Building2, val: tenant.clients, label: 'Clients' },
                                            ].map(({ icon: Icon, val, label }) => (
                                                <div key={label} style={{ background: '#0a0a0c', border: '1px solid #18181b', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                                                    <Icon size={12} color="#52525b" style={{ marginBottom: '0.2rem' }} />
                                                    <div style={{ fontWeight: 800, fontSize: '0.9375rem', lineHeight: 1 }}>{val}</div>
                                                    <div style={{ fontSize: '0.6rem', color: '#52525b', marginTop: '0.15rem' }}>{label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* MRR + date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#10b981' }}>${tenant.mrr.toLocaleString()}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#52525b' }}>/mo</span></div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#52525b' }}>
                                                Since {fmtDate(tenant.createdAt)}
                                            </div>
                                        </div>

                                        {/* Domain badge */}
                                        {tenant.domain && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.6rem', background: '#18181b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.7rem', color: '#71717a' }}>
                                                <Globe size={11} />
                                                <span style={{ fontFamily: 'monospace' }}>{tenant.domain}</span>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setEditingTenant(tenant)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '8px', border: '1px solid #27272a', background: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#18181b'; (e.currentTarget as HTMLButtonElement).style.color = '#fafafa'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'; }}>
                                                <Edit2 size={13} /> Edit
                                            </button>
                                            <button onClick={() => window.open(`/?tenant=${tenant.slug}`, '_blank')} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #27272a', background: 'transparent', color: '#a1a1aa', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
                                                title="Open tenant app"
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#18181b'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                                                <ExternalLink size={13} />
                                            </button>
                                            <button onClick={() => setDeletingTenant(tenant)} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
                                                title="Delete tenant"
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.05)'; }}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Edit Panel ── */}
            {editingTenant && (
                <EditPanel
                    tenant={editingTenant}
                    onClose={() => setEditingTenant(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* ── Delete Confirm ── */}
            {deletingTenant && (
                <DeleteModal
                    tenant={deletingTenant}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingTenant(null)}
                />
            )}
        </div>
    );
};

export default SuperAdminPage;
