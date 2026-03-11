import { useStore } from '../../store/useStore';
import { useTenant } from '../../context/TenantContext';
import { initials } from '../../utils/formatters';
import { Search, Bell, LogOut } from 'lucide-react';

interface HeaderProps {
    alertCount: number;
}

const Header: React.FC<HeaderProps> = ({ alertCount }) => {
    const { user, logout } = useStore();
    const { branding } = useTenant();

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            padding: '1.5rem 2rem 0 2rem',
        }}>
            {/* ── Search ── */}
            <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{
                    position: 'absolute', left: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--muted-foreground)',
                }} />
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search trips, tails, crew..."
                    style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
                />
            </div>

            {/* ── Right side ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Bell */}
                <button className="btn btn-ghost" style={{ padding: '0.5rem', position: 'relative' }}>
                    <Bell size={20} />
                    {alertCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '4px', right: '4px',
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: 'var(--brand-primary)',
                            fontSize: '0.6rem', fontWeight: 700,
                            color: 'white', display: 'grid', placeItems: 'center',
                        }}>
                            {alertCount}
                        </span>
                    )}
                </button>

                {/* User info + avatar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    paddingLeft: '0.75rem', borderLeft: '1px solid var(--border)',
                }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                            {user?.name || 'Coastal Operative'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                            {user?.role || 'Dispatch'}
                        </div>
                    </div>

                    {/* Avatar uses brand primary color */}
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `var(--brand-primary, ${branding.primaryColor})`,
                        boxShadow: `0 2px 8px var(--brand-primary-muted, rgba(124,58,237,0.35))`,
                        color: 'white',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        transition: 'box-shadow 0.3s ease',
                    }}>
                        {user ? initials(user.name) : 'CB'}
                    </div>

                    <button
                        onClick={logout}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem', color: 'var(--muted-foreground)' }}
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
