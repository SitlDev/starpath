import React, { useState } from 'react';
import { Plane, Zap, X, Copy, Share2 } from 'lucide-react';
import { EmptyLeg, LeadForm } from '../types';
import { useEmptyLegs } from '../hooks/useData';
import { FMT_USD2, discountedPrice, urgencyLabel } from '../utils/formatters';

function ShareModal({ leg, onClose }: { leg: EmptyLeg; onClose: () => void }) {
    const url = `https://fly.tailwindos.com/empty-legs/${leg.id}`;
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const discPrice = discountedPrice(leg.originalPrice, leg.discountPct);
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div style={{ width: '440px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>Share Empty Leg</div>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={onClose}><X size={18} /></button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f2035)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{leg.origin}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{leg.originCity}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <Plane size={20} style={{ color: '#3b82f6' }} />
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{leg.flightHours}h</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{leg.destination}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{leg.destinationCity}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empty Leg Price</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{FMT_USD2(discPrice)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>{FMT_USD2(leg.originalPrice)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{leg.departDate}</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{leg.departTime}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{leg.aircraft} · {leg.seats} seats</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shareable Link</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1, padding: '0.625rem 0.75rem', background: 'var(--secondary)', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
                            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }} onClick={copy}>
                                {copied ? <>✓ Copied!</> : <><Copy size={13} /> Copy</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InquiryModal({ leg, onClose }: { leg: EmptyLeg; onClose: () => void }) {
    const [form, setForm] = useState<LeadForm>({ name: '', email: '', phone: '', pax: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const discPrice = discountedPrice(leg.originalPrice, leg.discountPct);
    if (submitted) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
                <div style={{ width: '400px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '3rem', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Inquiry Received!</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>We'll contact {form.email} within 15 minutes to confirm availability.</div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Done</button>
                </div>
            </div>
        );
    }
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div style={{ width: '480px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>Book Empty Leg — {leg.origin} → {leg.destination}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>{FMT_USD2(discPrice)} <span style={{ color: 'var(--muted-foreground)', fontWeight: 400, textDecoration: 'line-through' }}>{FMT_USD2(leg.originalPrice)}</span> · {leg.discountPct}% off</div>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={onClose}><X size={18} /></button>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {([
                        { key: 'name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
                        { key: 'email', label: 'Email Address', placeholder: 'you@company.com', type: 'email' },
                        { key: 'phone', label: 'Phone Number', placeholder: '+1 (000) 000-0000', type: 'tel' },
                        { key: 'pax', label: 'Passengers', placeholder: '1', type: 'number' },
                    ] as const).map(({ key, label, placeholder, type }) => (
                        <div key={key}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>{label}</label>
                            <input type={type} placeholder={placeholder} value={form[key]}
                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    ))}
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>Message (Optional)</label>
                        <textarea placeholder="Any special requests..." value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            style={{ width: '100%', minHeight: '72px', padding: '0.625rem 0.875rem', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '1rem', padding: '0.75rem' }}
                        onClick={() => { if (form.name && form.email) setSubmitted(true); }}>
                        <Zap size={16} /> Submit Inquiry — {FMT_USD2(discPrice)}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EmptyLegCard({ leg, onShare, onInquire }: { leg: EmptyLeg; onShare: () => void; onInquire: () => void }) {
    const discPrice = discountedPrice(leg.originalPrice, leg.discountPct);
    const urgency = urgencyLabel(leg.hoursUntilDep);
    const pending = leg.status === 'Pending Inquiry';
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '1.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{leg.origin}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{leg.originCity}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Plane size={16} style={{ color: '#3b82f6', marginBottom: '0.25rem' }} />
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{leg.flightHours}h</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{leg.destination}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{leg.destinationCity}</div>
                    </div>
                </div>
            </div>
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>{leg.departDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{leg.aircraft} · {leg.seats} seats</div>
                    </div>
                    <span className="badge" style={{ background: `${urgency.color}18`, color: urgency.color }}>{urgency.label}</span>
                </div>
                <div style={{ background: 'var(--secondary)', padding: '0.875rem', borderRadius: 'var(--radius)', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Price</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{FMT_USD2(discPrice)}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onInquire}>Book Now</button>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem', border: '1px solid var(--border)' }} onClick={onShare}><Share2 size={16} /></button>
                </div>
            </div>
        </div>
    );
}

const EmptyLegs: React.FC = () => {
    const { data: legs, isLoading } = useEmptyLegs();
    const [shareLeg, setShareLeg] = useState<EmptyLeg | null>(null);
    const [inquiryLeg, setInquiryLeg] = useState<EmptyLeg | null>(null);

    if (isLoading) {
        return <div style={{ padding: '2rem', color: 'var(--muted-foreground)' }}>Searching for return flights...</div>;
    }

    const safeLegs = legs || [];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Empty Leg Marketplace</h1>
                <button className="btn btn-primary">Create Empty Leg</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {safeLegs.map((leg: EmptyLeg) => (
                    <EmptyLegCard key={leg.id} leg={leg} onShare={() => setShareLeg(leg)} onInquire={() => setInquiryLeg(leg)} />
                ))}
            </div>
            {shareLeg && <ShareModal leg={shareLeg} onClose={() => setShareLeg(null)} />}
            {inquiryLeg && <InquiryModal leg={inquiryLeg} onClose={() => setInquiryLeg(null)} />}
        </div>
    );
};

export default EmptyLegs;
