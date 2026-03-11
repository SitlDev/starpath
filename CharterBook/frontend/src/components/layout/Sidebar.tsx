import React from 'react';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Plane,
    Users,
    DollarSign,
    ShieldCheck,
    Briefcase,
    Share2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTenant } from '../../context/TenantContext';

const Sidebar: React.FC = () => {
    const { activeTab, setActiveTab, user } = useStore();
    const { branding } = useTenant();

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'scheduling', icon: CalendarIcon, label: 'Scheduling' },
        { id: 'fleet', icon: Plane, label: 'Fleet' },
        { id: 'crew', icon: Users, label: 'Crew Management' },
        { id: 'pricing', icon: DollarSign, label: 'Pricing Engine', roles: ['Dispatcher'] },
        { id: 'compliance', icon: ShieldCheck, label: 'Compliance' },
        { id: 'trips', icon: Briefcase, label: 'Trips & CRM', roles: ['Dispatcher'] },
        { id: 'legs', icon: Share2, label: 'Empty Legs' },
    ];

    const filteredItems = menuItems.filter(item => {
        if (!item.roles) return true;
        return user && item.roles.includes(user.role);
    });

    const initial = branding.companyName.charAt(0).toUpperCase();

    return (
        <div className="sidebar">
            {/* ── Brand logo ── */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {branding.logoUrl ? (
                    <img
                        src={branding.logoUrl}
                        alt={branding.companyName}
                        style={{ height: '2rem', width: 'auto', borderRadius: '4px', objectFit: 'contain' }}
                    />
                ) : (
                    <div style={{
                        background: `var(--brand-primary, ${branding.primaryColor})`,
                        color: 'white',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '6px',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                        boxShadow: `0 2px 8px var(--brand-primary-muted, rgba(124, 58, 237, 0.35))`,
                        transition: 'box-shadow 0.3s ease',
                    }}>
                        {initial}
                    </div>
                )}
                <span style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '160px',
                }}>
                    {branding.companyName}
                </span>
            </div>

            {/* ── Navigation ── */}
            <nav>
                <ul>
                    {filteredItems.map(item => (
                        <li key={item.id}>
                            <a
                                href="#"
                                className={activeTab === item.id ? 'active' : ''}
                                onClick={e => { e.preventDefault(); setActiveTab(item.id); }}
                            >
                                <item.icon size={18} style={{ marginRight: '0.75rem', flexShrink: 0 }} />
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
