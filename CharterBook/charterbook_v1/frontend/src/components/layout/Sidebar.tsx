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

const Sidebar: React.FC = () => {
    const { activeTab, setActiveTab, user } = useStore();

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

    return (
        <div className="sidebar">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'white', color: 'black', width: '2rem', height: '2rem', borderRadius: '4px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>T</div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>TailwindOS</span>
            </div>
            <nav>
                <ul>
                    {filteredItems.map(item => (
                        <li key={item.id}>
                            <a href="#" className={activeTab === item.id ? 'active' : ''}
                                onClick={e => { e.preventDefault(); setActiveTab(item.id); }}>
                                <item.icon size={18} style={{ marginRight: '0.75rem' }} />
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
