import React, { useState } from 'react';
import { Plane, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { login } from '../api';

interface LoginPageProps {
    onLoginSuccess: (token: string, user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('admin@charterbook.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await login({ email, password });
            onLoginSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--background)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 48, height: 48, background: 'var(--primary)', borderRadius: '12px', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem', color: 'white' }}>
                        <Plane size={24} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Coastal Air Charter Operations</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.875rem', borderRadius: 'var(--radius)', fontSize: '0.8125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius)', color: 'var(--foreground)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius)', color: 'var(--foreground)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '1rem' }} disabled={loading}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                    </button>

                    <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        Forgot password? Contact IT Dispatch.
                    </div>
                </form>
            </div>

            <div style={{ position: 'absolute', bottom: '2rem', fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Secure Part 135 Operations Portal v2.4
            </div>
        </div>
    );
};

export default LoginPage;
