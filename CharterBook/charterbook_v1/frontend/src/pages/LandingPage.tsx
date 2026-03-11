import React, { useEffect } from 'react';
import { Shield, Plane, Users, BarChart, Clock, Check, ArrowRight } from 'lucide-react';

interface LandingPageProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
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
                <div style={{ position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
                <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Simple, scalable pricing.</h2>
                        <p style={{ fontSize: '1.125rem', color: '#a1a1aa' }}>Transparent costs for growing flight departments.</p>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 800, marginBottom: '2rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                            First 30 Days Free
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>$99</span>
                            <span style={{ fontSize: '1.25rem', color: '#a1a1aa', fontWeight: 600 }}>/ month</span>
                        </div>

                        <div style={{ fontSize: '1.125rem', color: '#60a5fa', fontWeight: 700, marginBottom: '3rem' }}>
                            + $10 per additional user
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '600px', marginBottom: '3rem' }}>
                            {[
                                'Full Fleet Scheduling', 'Dynamic Quoting Engine', 'Premium CRM System', 'Compliance Dashboard',
                                'Role-Based Access', 'Unlimited Clients', 'API Access', '24/7 Priority Support'
                            ].map(feature => (
                                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e4e4e7', fontSize: '0.9375rem', fontWeight: 500 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', display: 'grid', placeItems: 'center', color: '#34d399' }}>
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <button onClick={onSignupClick} style={{ width: '100%', maxWidth: '400px', background: '#fafafa', color: '#09090b', border: 'none', padding: '1.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.125rem', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s', boxShadow: '0 4px 14px 0 rgba(255,255,255,0.1)' }}>
                            Start Your 30-Day Free Trial
                        </button>
                        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#a1a1aa' }}>No credit card required. Cancel anytime.</p>
                    </div>
                </div>
            </section>

            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '3rem 4%', textAlign: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#fafafa', marginBottom: '1rem' }}>
                    <Plane size={16} /> CharterBook by KnotStranded LLC
                </div>
                <p>© 2026 KnotStranded LLC. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
