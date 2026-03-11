import React, { useState } from 'react';
import { Plane, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { signup } from '../api';

interface SignupPageProps {
    onSignupSuccess: (token: string, user: any) => void;
    onLoginClick: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onLoginClick }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (step === 1) {
            if (!name || !email) { setError('Name and email are required'); return; }
            setStep(2);
        } else if (step === 2) {
            if (!company) { setError('Company name is required'); return; }
            setStep(3);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!password) { setError('Password is required'); return; }
        setIsLoading(true);
        try {
            const data = await signup({ name, email, password, company });
            onSignupSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#09090b', color: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', cursor: 'pointer' }} onClick={onLoginClick}>
                <div style={{ background: '#fafafa', color: '#09090b', width: 28, height: 28, borderRadius: '6px', display: 'grid', placeItems: 'center', fontSize: '0.875rem' }}>C</div>
                CharterBook
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(24, 24, 27, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(20px)' }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                            30-Day Free Trial
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Get Started</h1>
                        <p style={{ color: '#a1a1aa' }}>Step {step} of 3</p>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: 4, width: 32, borderRadius: 2, background: i <= step ? '#fafafa' : 'rgba(255,255,255,0.1)' }} />
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={step === 3 ? handleSignup : handleNext}>
                        {step === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#e4e4e7' }}>Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                        style={{ width: '100%', padding: '0.875rem 1rem', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', transition: 'border 0.2s', fontSize: '0.9375rem' }}
                                        placeholder="John Carter" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#e4e4e7' }}>Work Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        style={{ width: '100%', padding: '0.875rem 1rem', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', transition: 'border 0.2s', fontSize: '0.9375rem' }}
                                        placeholder="john@charter.com" />
                                </div>
                                <button type="submit" style={{ width: '100%', background: '#fafafa', color: '#09090b', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    Continue <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#e4e4e7' }}>Company Name</label>
                                    <input type="text" value={company} onChange={e => setCompany(e.target.value)} required autoFocus
                                        style={{ width: '100%', padding: '0.875rem 1rem', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', transition: 'border 0.2s', fontSize: '0.9375rem' }}
                                        placeholder="Aviation Charter Inc." />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: '#09090b', color: '#fafafa', border: '1px solid #27272a', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                                        Back
                                    </button>
                                    <button type="submit" style={{ flex: 2, background: '#fafafa', color: '#09090b', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                        Continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#e4e4e7' }}>Create Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus autoComplete="new-password"
                                        style={{ width: '100%', padding: '0.875rem 1rem', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', transition: 'border 0.2s', fontSize: '0.9375rem' }}
                                        placeholder="••••••••" />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setStep(2)} disabled={isLoading} style={{ flex: 1, background: '#09090b', color: '#fafafa', border: '1px solid #27272a', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                                        Back
                                    </button>
                                    <button type="submit" disabled={isLoading} style={{ flex: 2, background: '#fafafa', color: '#09090b', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1, fontSize: '1rem' }}>
                                        {isLoading ? 'Creating...' : 'Launch App'} <Check size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#a1a1aa' }}>
                        Already have an account?{' '}
                        <button onClick={onLoginClick} type="button" style={{ background: 'none', border: 'none', color: '#fafafa', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Log in</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SignupPage;
