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
import { useStore } from './store/useStore';
import { fetchMe } from './api';

function App() {
    const { activeTab, alertCount, token, user, setToken, setUser } = useStore();
    const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');

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

    if (!token) {
        if (authView === 'landing') {
            return <LandingPage onLoginClick={() => setAuthView('login')} onSignupClick={() => setAuthView('signup')} />;
        }
        if (authView === 'signup') {
            return <SignupPage onSignupSuccess={handleLoginSuccess} onLoginClick={() => setAuthView('login')} />;
        }
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

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

export default App;
