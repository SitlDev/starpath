import React, { useEffect, useState } from 'react';
import { Plane, AlertTriangle, ArrowRight, Check, Palette, Globe, Building2 } from 'lucide-react';
import { signup } from '../api';

interface SignupPageProps {
    onSignupSuccess: (token: string, user: any) => void;
    onLoginClick: () => void;
}

// ── Preset brand palettes ─────────────────────────────────────────────────────
const BRAND_PRESETS = [
    { label: 'Violet', color: '#7c3aed' },
    { label: 'Cobalt', color: '#2563eb' },
    { label: 'Emerald', color: '#059669' },
    { label: 'Rose', color: '#e11d48' },
    { label: 'Amber', color: '#d97706' },
    { label: 'Cyan', color: '#0891b2' },
    { label: 'Slate', color: '#475569' },
    { label: 'Graphite', color: '#374151' },
];

// ── Slug generator ────────────────────────────────────────────────────────────
const toSlug = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);

// ── Input style helper ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.875rem 1rem',
    background: '#09090b', border: '1px solid #3f3f46',
    borderRadius: '8px', color: '#fafafa', outline: 'none',
    fontSize: '0.9375rem', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.5rem',
    fontSize: '0.875rem', fontWeight: 600, color: '#e4e4e7',
};

// ─────────────────────────────────────────────────────────────────────────────

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onLoginClick }) => {
    const TOTAL_STEPS = 4;
    const [step, setStep] = useState(1);

    // Step 1 — personal info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Step 2 — company branding
    const [company, setCompany] = useState('');
    const [companySlug, setCompanySlug] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('#7c3aed');

    // Step 3 — plan selection
    const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

    // Step 4 — password
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Auto-generate slug from company name unless user has edited it manually
    useEffect(() => {
        if (!slugEdited && company) {
            setCompanySlug(toSlug(company));
        }
    }, [company, slugEdited]);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (step === 1) {
            if (!name || !email) { setError('Name and email are required'); return; }
            setStep(2);
        } else if (step === 2) {
            if (!company) { setError('Company name is required'); return; }
            if (!companySlug) { setError('Company URL slug is required'); return; }
            if (!/^[a-z0-9-]+$/.test(companySlug)) { setError('URL slug may only contain lowercase letters, numbers, and hyphens'); return; }
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setIsLoading(true);
        try {
            const data = await signup({ name, email, password, company, companySlug, primaryColor, plan });
            onSignupSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const PLANS = [
        {
            id: 'starter', label: 'Starter', price: '$299',
            sub: '1–3 aircraft',
            features: ['Dispatch & Scheduling', 'Fleet Management', 'Crew & Compliance'],
            color: '#3b82f6',
        },
        {
            id: 'pro', label: 'Pro', price: '$599',
            sub: '4–10 aircraft',
            features: ['Everything in Starter', 'CRM & Trips Module', 'Pricing Engine', 'Empty Legs Marketplace', 'Custom Branding'],
            color: '#7c3aed',
            badge: 'Most Popular',
        },
        {
            id: 'enterprise', label: 'Enterprise', price: '$1,499',
            sub: '11+ aircraft',
            features: ['Everything in Pro', 'Custom Domain', 'API Access', 'Dedicated Support', 'White-glove Onboarding'],
            color: '#059669',
        },
    ];

    const stepTitles = ['Your Account', 'Your Brand', 'Choose Plan', 'Set Password'];
    const stepIcons = [Building2, Palette, Check, Globe];

    return (
        <div style={{ backgroundColor: '#09090b', color: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Top Nav ── */}
            <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', cursor: 'pointer' }} onClick={onLoginClick}>
                    <div style={{ background: primaryColor, color: 'white', width: 28, height: 28, borderRadius: '6px', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 900, transition: 'background 0.3s' }}>C</div>
                    CharterBook
                </div>
                <span style={{ fontSize: '0.875rem', color: '#71717a' }}>
                    Already have an account?{' '}
                    <button onClick={onLoginClick} style={{ background: 'none', border: 'none', color: '#fafafa', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Sign in</button>
                </span>
            </div>

            {/* ── Main ── */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', gap: '3rem' }}>

                {/* ── Left: Form card ── */}
                <div style={{ width: '100%', maxWidth: '480px' }}>

                    {/* Step progress */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                                <div key={i} style={{
                                    flex: 1, height: 3, borderRadius: 2,
                                    background: i < step ? primaryColor : 'rgba(255,255,255,0.1)',
                                    transition: 'background 0.4s ease',
                                }} />
                            ))}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, color: '#71717a', marginBottom: '0.75rem' }}>
                            Step {step} of {TOTAL_STEPS}
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
                            {stepTitles[step - 1]}
                        </h1>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            <AlertTriangle size={15} /> {error}
                        </div>
                    )}

                    <form onSubmit={step === TOTAL_STEPS ? handleSignup : handleNext}>

                        {/* ── Step 1: Personal info ── */}
                        {step === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                                        required autoFocus style={inputStyle} placeholder="John Carter" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Work Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        required style={inputStyle} placeholder="john@youropcert.com" />
                                </div>
                                <button type="submit" style={{ width: '100%', background: primaryColor, color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'opacity 0.2s', boxShadow: `0 4px 16px rgba(${primaryColor},0.3)` }}>
                                    Continue <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* ── Step 2: Company branding ── */}
                        {step === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Company name */}
                                <div>
                                    <label style={labelStyle}>Company Name</label>
                                    <input type="text" value={company}
                                        onChange={e => setCompany(e.target.value)}
                                        required autoFocus style={inputStyle}
                                        placeholder="Coastal Air Charter" />
                                </div>

                                {/* URL slug */}
                                <div>
                                    <label style={labelStyle}>Your App URL</label>
                                    <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid #3f3f46', borderRadius: '8px', overflow: 'hidden', background: '#09090b' }}>
                                        <span style={{ padding: '0.875rem 0.875rem', background: '#18181b', color: '#71717a', fontSize: '0.875rem', fontWeight: 500, borderRight: '1px solid #3f3f46', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                            app.charterbook.com/
                                        </span>
                                        <input type="text" value={companySlug}
                                            onChange={e => { setCompanySlug(toSlug(e.target.value)); setSlugEdited(true); }}
                                            required style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1, paddingLeft: '0.75rem' }}
                                            placeholder="coastal-air" />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.4rem', marginBottom: 0 }}>
                                        Auto-generated from your company name. You can customise it.
                                    </p>
                                </div>

                                {/* Brand color picker */}
                                <div>
                                    <label style={labelStyle}>Brand Color</label>
                                    <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                                        {BRAND_PRESETS.map(preset => (
                                            <button
                                                key={preset.color}
                                                type="button"
                                                title={preset.label}
                                                onClick={() => setPrimaryColor(preset.color)}
                                                style={{
                                                    width: 36, height: 36,
                                                    borderRadius: '8px',
                                                    background: preset.color,
                                                    border: primaryColor === preset.color
                                                        ? '2px solid white'
                                                        : '2px solid transparent',
                                                    cursor: 'pointer',
                                                    display: 'grid', placeItems: 'center',
                                                    boxShadow: primaryColor === preset.color
                                                        ? `0 0 0 3px ${preset.color}55`
                                                        : 'none',
                                                    transition: 'all 0.2s',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {primaryColor === preset.color && (
                                                    <Check size={14} color="white" strokeWidth={3} />
                                                )}
                                            </button>
                                        ))}
                                        {/* Custom hex input */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 120 }}>
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={e => setPrimaryColor(e.target.value)}
                                                style={{ width: 36, height: 36, border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, background: 'none' }}
                                                title="Custom color"
                                            />
                                            <span style={{ fontSize: '0.8rem', color: '#71717a', fontFamily: 'monospace' }}>{primaryColor}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', color: '#fafafa', border: '1px solid #3f3f46', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                                        Back
                                    </button>
                                    <button type="submit" style={{ flex: 2, background: primaryColor, color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', transition: 'opacity 0.2s' }}>
                                        Continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Plan picker ── */}
                        {step === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {PLANS.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setPlan(p.id as any)}
                                        style={{
                                            background: plan === p.id ? `rgba(${hexToRgb(p.color)}, 0.08)` : 'rgba(255,255,255,0.02)',
                                            border: plan === p.id ? `1.5px solid ${p.color}` : '1.5px solid rgba(255,255,255,0.07)',
                                            borderRadius: '12px', padding: '1.25rem 1.5rem',
                                            display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                            color: '#fafafa',
                                        }}
                                    >
                                        {/* Selection indicator */}
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${plan === p.id ? p.color : '#3f3f46'}`, background: plan === p.id ? p.color : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '0.15rem', transition: 'all 0.2s' }}>
                                            {plan === p.id && <Check size={11} color="white" strokeWidth={3} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{p.label}</span>
                                                        {p.badge && (
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 99, background: `${p.color}22`, color: p.color }}>{p.badge}</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.1rem' }}>{p.sub}</div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{p.price}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#71717a' }}>/mo</span>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                                {p.features.map(f => (
                                                    <span key={f} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: '#a1a1aa' }}>{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                ))}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setStep(2)} style={{ flex: 1, background: 'transparent', color: '#fafafa', border: '1px solid #3f3f46', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                                        Back
                                    </button>
                                    <button type="submit" style={{ flex: 2, background: primaryColor, color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                        Continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Password ── */}
                        {step === 4 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={labelStyle}>Create a Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                        required autoFocus autoComplete="new-password"
                                        style={inputStyle} placeholder="At least 6 characters" />
                                </div>

                                {/* Summary before submit */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem 1.25rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {[
                                        ['Account', name || '—'],
                                        ['Company', company || '—'],
                                        ['App URL', companySlug ? `app.charterbook.com/${companySlug}` : '—'],
                                        ['Plan', PLANS.find(p => p.id === plan)?.label || plan],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                            <span style={{ color: '#71717a' }}>{k}</span>
                                            <span style={{ fontWeight: 600, maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                        <span style={{ color: '#71717a' }}>Brand</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: 4, background: primaryColor }} />
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{primaryColor}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setStep(3)} disabled={isLoading}
                                        style={{ flex: 1, background: 'transparent', color: '#fafafa', border: '1px solid #3f3f46', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                                        Back
                                    </button>
                                    <button type="submit" disabled={isLoading}
                                        style={{ flex: 2, background: primaryColor, color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1, fontSize: '1rem', transition: 'opacity 0.2s' }}>
                                        {isLoading ? 'Launching…' : 'Launch My Ops'} <Check size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#52525b' }}>
                        No credit card required · 30-day free trial · Cancel anytime
                    </p>
                </div>

                {/* ── Right: Live brand preview ── */}
                <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: '6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#52525b', margin: 0 }}>
                        Live Preview
                    </p>
                    {/* Mini app preview */}
                    <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                        {/* Mock sidebar */}
                        <div style={{ display: 'flex', height: 280 }}>
                            <div style={{ width: 72, background: '#09090b', borderRight: '1px solid #18181b', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {/* Logo */}
                                <div style={{ width: 28, height: 28, borderRadius: '6px', background: primaryColor, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, fontSize: '0.75rem', marginBottom: '0.75rem', transition: 'background 0.3s' }}>
                                    {(company || 'C').charAt(0).toUpperCase()}
                                </div>
                                {/* Nav items */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ height: 6, borderRadius: 3, background: i === 0 ? primaryColor : '#27272a', opacity: i === 0 ? 1 : 0.6, transition: 'background 0.3s' }} />
                                ))}
                            </div>
                            {/* Mock content */}
                            <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#09090b' }}>
                                <div style={{ height: 8, borderRadius: 4, background: '#27272a', width: '60%' }} />
                                <div style={{ height: 6, borderRadius: 3, background: '#18181b', width: '80%' }} />
                                <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} style={{ height: 48, borderRadius: '8px', background: i === 0 ? `${primaryColor}18` : '#18181b', border: i === 0 ? `1px solid ${primaryColor}33` : '1px solid #27272a', transition: 'all 0.3s' }} />
                                    ))}
                                </div>
                                <div style={{ marginTop: '0.25rem', height: 36, borderRadius: '6px', background: '#18181b', border: '1px solid #27272a' }} />
                                <div style={{ height: 24, borderRadius: '6px', background: primaryColor, opacity: 0.9, transition: 'background 0.3s' }} />
                            </div>
                        </div>
                        {/* Preview footer */}
                        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #18181b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '4px', background: primaryColor, display: 'grid', placeItems: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 900, transition: 'background 0.3s' }}>
                                {(company || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fafafa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {company || 'Your Company'} Ops
                            </span>
                        </div>
                    </div>

                    {/* Color chip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '6px', background: primaryColor, flexShrink: 0, transition: 'background 0.3s', boxShadow: `0 2px 8px ${primaryColor}55` }} />
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fafafa' }}>Brand Color</div>
                            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#71717a' }}>{primaryColor}</div>
                        </div>
                    </div>
                    {companySlug && (
                        <div style={{ padding: '0.75rem 1rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '0.7rem' }}>
                            <div style={{ color: '#52525b', marginBottom: '0.2rem' }}>Your URL</div>
                            <div style={{ color: '#a1a1aa', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                app.charterbook.com/<strong style={{ color: '#fafafa' }}>{companySlug}</strong>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple helper used in JSX above (doesn't need to be exported)
function hexToRgb(hex: string): string {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

export default SignupPage;
