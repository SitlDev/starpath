import React, { useEffect } from 'react';
import { Shield, Plane, Users, BarChart, Clock, Check, ArrowRight } from 'lucide-react';

interface LandingPageProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
    onSuperAdminClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick, onSuperAdminClick }) => {
    useEffect(() => {
        document.title = "CharterBook | Part 135 Flight Operations Software";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "CharterBook is the premium operational software for Part 135 charter operators. Manage scheduling, CRM, compliance, and quoting in one secure platform.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "CharterBook is the premium operational software for Part 135 charter operators. Manage scheduling, CRM, compliance, and quoting in one secure platform.";
            document.head.appendChild(meta);
        }
    }, []);

    return (
        <div style={{ backgroundColor: '#09090b', color: '#fafafa', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4%', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                    <div style={{ background: '#fafafa', color: '#09090b', width: 28, height: 28, borderRadius: '6px', display: 'grid', placeItems: 'center', fontSize: '0.875rem' }}>C</div>
                    CharterBook
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={onLoginClick} style={{ background: 'transparent', color: '#fafafa', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}>Sign In</button>
                    <button onClick={onSignupClick} style={{ background: '#fafafa', color: '#09090b', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Start Free Trial <ArrowRight size={14} />
                    </button>
                </div>
            </nav>

            <header style={{ padding: '8rem 4%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        Next-Gen Aviation Management
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Run your Part 135 operations flawlessly.
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                        From dynamic quoting to fleet scheduling and compliance, CharterBook is the all-in-one platform built for modern jet operators.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button onClick={onSignupClick} style={{ background: '#fafafa', color: '#09090b', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s', boxShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>
                            Get Started Free
                        </button>
                        <button style={{ background: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                            View Demo
                        </button>
                    </div>
                </div>
            </header>

            <section style={{ padding: '6rem 4%', backgroundColor: '#000000', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Engineered for Dispatchers & Pilots</h2>
                        <p style={{ fontSize: '1.125rem', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>Everything you need to scale your charter business without the administrative bloat.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: <Clock size={24} color="#60a5fa" />, title: 'Real-Time Scheduling', desc: 'Interactive Gantt charts for fleet dispatch. Drag, drop, and resolve conflicts instantly.' },
                            { icon: <BarChart size={24} color="#34d399" />, title: 'Dynamic Quoting', desc: 'Generate accurate pricing based on live fuel rates, hourly minimums, and empty legs.' },
                            { icon: <Users size={24} color="#c084fc" />, title: 'Premium CRM', desc: 'Track client spend, flight history, and preferences. Build relationships that last.' },
                            { icon: <Shield size={24} color="#fbbf24" />, title: 'Role-Based Security', desc: 'Granular permissions. Pilots see flight logs, dispatchers handle financials. Fully secure.' }
                        ].map((feat, idx) => (

                            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s, background 0.2s' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {feat.icon}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>{feat.title}</h3>
                                <p style={{ color: '#a1a1aa', lineHeight: 1.6, fontSize: '0.9375rem' }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '8rem 4%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
                <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Simple, scalable pricing.</h2>
                        <p style={{ fontSize: '1.125rem', color: '#a1a1aa' }}>One price per operator. No per-seat surprises. First 30 days free.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                        {[
                            {
                                label: 'Starter', price: '$299', sub: '1–3 aircraft', color: '#3b82f6',
                                features: ['Dispatch & Scheduling', 'Fleet Management', 'Crew Management', 'Compliance Dashboard', 'White-label branding'],
                            },
                            {
                                label: 'Pro', price: '$599', sub: '4–10 aircraft', color: '#7c3aed', badge: 'Most Popular',
                                features: ['Everything in Starter', 'CRM & Trips Module', 'Dynamic Pricing Engine', 'Empty Legs Marketplace', 'Custom brand colors & logo'],
                            },
                            {
                                label: 'Enterprise', price: '$1,499', sub: '11+ aircraft', color: '#059669',
                                features: ['Everything in Pro', 'Custom domain (ops.yourco.com)', 'API access', 'Dedicated onboarding', '24/7 priority SLA'],
                            },
                        ].map((tier, idx) => (
                            <div key={idx} style={{
                                background: idx === 1
                                    ? 'linear-gradient(145deg, rgba(124,58,237,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                                    : 'rgba(255,255,255,0.02)',
                                border: idx === 1 ? '1.5px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '20px',
                                padding: '2rem',
                                position: 'relative',
                                backdropFilter: 'blur(12px)',
                            }}>
                                {tier.badge && (
                                    <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: tier.color, color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.875rem', borderRadius: 99, whiteSpace: 'nowrap' }}>
                                        {tier.badge}
                                    </div>
                                )}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: tier.color, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tier.label}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{tier.price}</span>
                                        <span style={{ color: '#71717a', fontWeight: 600 }}>/mo</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#71717a', marginTop: '0.25rem' }}>{tier.sub}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                                    {tier.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.875rem', color: '#e4e4e7' }}>
                                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${tier.color}22`, display: 'grid', placeItems: 'center', color: tier.color, flexShrink: 0, marginTop: '0.05rem' }}>
                                                <Check size={11} strokeWidth={3} />
                                            </div>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={onSignupClick} style={{ width: '100%', background: idx === 1 ? tier.color : 'transparent', color: idx === 1 ? 'white' : '#fafafa', border: idx === 1 ? 'none' : `1px solid rgba(255,255,255,0.15)`, padding: '0.875rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    Start Free Trial
                                </button>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#52525b' }}>
                        All plans include a 30-day free trial. No credit card required.
                    </p>
                </div>
            </section>

            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '3rem 4%', textAlign: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#fafafa', marginBottom: '1rem' }}>
                    <Plane size={16} /> CharterBook by KnotStranded LLC
                </div>
                <p>© 2026 KnotStranded LLC. All rights reserved.</p>
                <button
                    onClick={onSuperAdminClick}
                    style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#3f3f46', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                    Admin Access
                </button>
            </footer>
        </div>
    );
};

export default LandingPage;
