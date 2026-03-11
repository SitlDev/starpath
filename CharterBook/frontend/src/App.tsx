import React, { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Scheduling from './pages/Scheduling';
import CrewManagement from './pages/CrewManagement';
import PricingEngine from './pages/PricingEngine';
import ComplianceDashboard from './pages/ComplianceDashboard';
import TripsCRM from './pages/TripsCRM';
import EmptyLegs from './pages/EmptyLegs';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import SuperAdminPage from './pages/SuperAdminPage';
import { useStore } from './store/useStore';
import { fetchMe } from './api';
import { TenantProvider } from './context/TenantContext';

// ── Super Admin Login Form ─────────────────────────────────────────────────────
import { superAdminLogin } from './api';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

function SuperAdminLoginForm({ onSuccess, onBack }: { onSuccess: (t: string, u: any) => void; onBack: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await superAdminLogin(email, password);
            onSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: 400, padding: '0 1.5rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '12px', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem auto' }}>
                        <ShieldCheck size={24} color="#eab308" />
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, color: '#eab308', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                        PLATFORM ADMIN
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fafafa', margin: 0 }}>Admin Console</h1>
                    <p style={{ color: '#52525b', fontSize: '0.875rem', marginTop: '0.5rem' }}>CharterBook internal access only</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <AlertTriangle size={15} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.4rem' }}>Admin Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                            style={{ width: '100%', padding: '0.875rem 1rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', fontSize: '0.9375rem', boxSizing: 'border-box' }}
                            placeholder="admin@charterbook.io" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.4rem' }}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                            style={{ width: '100%', padding: '0.875rem 1rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', outline: 'none', fontSize: '0.9375rem', boxSizing: 'border-box' }}
                            placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', background: '#eab308', color: '#09090b', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                        {loading ? 'Authenticating…' : 'Access Admin Console'}
                    </button>
                </form>

                <button onClick={onBack} style={{ display: 'block', width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#52525b', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                    ← Back to CharterBook
                </button>
            </div>
        </div>
    );
}

// ── Main App ───────────────────────────────────────────────────────────────────

function AppInner() {
    const { activeTab, alertCount, token, user, setToken, setUser } = useStore();
    const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'super-admin-login'>('landing');

    useEffect(() => {
        if (token && !user) {
            fetchMe().then(data => {
                if (data) setUser(data);
                else setToken(null);
            });
        }
    }, [token, user]);

    const handleLoginSuccess = (newToken: string, newUser: any) => {
        setToken(newToken);
        setUser(newUser);
    };

    // ── Unauthenticated views ──
    if (!token) {
        if (authView === 'super-admin-login') {
            return <SuperAdminLoginForm onSuccess={handleLoginSuccess} onBack={() => setAuthView('landing')} />;
        }
        if (authView === 'landing') {
            return (
                <LandingPage
                    onLoginClick={() => setAuthView('login')}
                    onSignupClick={() => setAuthView('signup')}
                    onSuperAdminClick={() => setAuthView('super-admin-login')}
                />
            );
        }
        if (authView === 'signup') {
            return <SignupPage onSignupSuccess={handleLoginSuccess} onLoginClick={() => setAuthView('login')} />;
        }
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    // ── Super Admin Console ──
    if (user?.superAdmin) {
        return <SuperAdminPage />;
    }

    // ── Normal operator app ──
    const renderContent = () => {
        const isDispatcher = user?.role === 'Dispatcher';

        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'scheduling': return <Scheduling />;
            case 'fleet': return <Dashboard />; // Placeholder
            case 'crew': return <CrewManagement />;
            case 'pricing': return isDispatcher ? <PricingEngine /> : <div style={{ padding: '2rem', color: '#ef4444' }}>Unauthorized Access: Dispatcher only</div>;
            case 'compliance': return <ComplianceDashboard />;
            case 'trips': return isDispatcher ? <TripsCRM /> : <div style={{ padding: '2rem', color: '#ef4444' }}>Unauthorized Access: Dispatcher only</div>;
            case 'legs': return <EmptyLegs />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <Header alertCount={alertCount} />
                <div style={{ padding: '0 2rem 2rem 2rem' }}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

// TenantProvider wraps everything so branding context is available on
// login, landing, and all app pages.
function App() {
    return (
        <TenantProvider>
            <AppInner />
        </TenantProvider>
    );
}

export default App;
