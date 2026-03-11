import React, { useState } from 'react';
import { X, Phone, Mail, Clock, MapPin, Award } from 'lucide-react';
import { CrewMember } from '../types';
import {
    statusColor,
    hoursPercent,
    hoursBarColor,
    expiryBadgeClass,
    expiryLabel,
    initials
} from '../utils/formatters';
import { useCrew } from '../hooks/useData';

interface CrewDetailPanelProps {
    crew: CrewMember;
    onClose: () => void;
}

const CrewDetailPanel: React.FC<CrewDetailPanelProps> = ({ crew, onClose }) => (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '450px', background: 'var(--card)', borderLeft: '1px solid var(--border)', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', zIndex: 100, padding: '2rem', overflowY: 'auto' }}>
        <button className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem' }} onClick={onClose}><X size={20} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: '1.25rem', fontWeight: 800 }}>{initials(crew.name)}</div>
            <div>
                <h2 style={{ margin: 0 }}>{crew.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-outline">{crew.role}</span>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(crew.status) }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{crew.status}</span>
                </div>
            </div>
        </div>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <section>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Contact Info</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}><Mail size={14} /> {crew.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}><Phone size={14} /> {crew.phone}</div>
                </div>
            </section>
            <section>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>FAA Flight Hours</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {[
                        { label: 'Total Flight Time', val: crew.totalFlightHours, max: 15000 },
                        { label: 'Last 30 Days', val: crew.last30DayHours, max: 100 },
                        { label: 'Last 90 Days', val: crew.last90DayHours, max: 300 },
                    ].map(h => {
                        const pct = hoursPercent(h.val, h.max);
                        return (
                            <div key={h.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.375rem' }}><span>{h.label}</span><span style={{ fontWeight: 600 }}>{h.val} hr</span></div>
                                <div style={{ height: '6px', background: 'var(--secondary)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: hoursBarColor(pct) }} /></div>
                            </div>
                        );
                    })}
                </div>
            </section>
            <section>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Certificates & Ratings</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {crew.certificates.map(c => (
                        <div key={c.name} style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><Award size={14} style={{ color: '#3b82f6' }} /><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}># {c.number}</span><span className={`badge ${expiryBadgeClass(c.expiry)}`} style={{ fontSize: '0.7rem' }}>{expiryLabel(c.expiry)}</span></div>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Recent Flights</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {crew.recentFlights.map((f, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                            <div><span style={{ fontWeight: 600 }}>{f.trip}</span> <span style={{ color: 'var(--muted-foreground)', margin: '0 0.25rem' }}>·</span> {f.route}</div>
                            <div style={{ color: 'var(--muted-foreground)' }}>{f.date} ({f.hours}h)</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    </div>
);

const CrewManagement: React.FC = () => {
    const { data: crew, isLoading } = useCrew();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (isLoading) {
        return <div style={{ padding: '2rem', color: 'var(--muted-foreground)' }}>Loading crew data...</div>;
    }

    const safeCrew = crew || [];
    const selectedCrew = safeCrew.find((c: CrewMember) => c.id === selectedId);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Crew Management</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input className="search-bar" placeholder="Filter by name, role..." style={{ width: '240px', paddingLeft: '2.25rem', marginBottom: 0 }} />
                    </div>
                    <button className="btn btn-primary">Add Member</button>
                </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table" style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '1.5rem' }}>Crew Member</th><th>Role</th><th>Status</th><th>Total Hours</th><th>Medical Expiry</th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeCrew.map((c: CrewMember) => (
                            <tr key={c.id}>
                                <td style={{ paddingLeft: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 600 }}>{initials(c.name)}</div>
                                        <div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{c.email}</div></div>
                                    </div>
                                </td>
                                <td>{c.role}</td>
                                <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(c.status) }} />{c.status}</div></td>
                                <td style={{ fontWeight: 600 }}>{c.totalFlightHours}</td>
                                <td><span className={`badge ${expiryBadgeClass(c.medicalExpiry)}`}>{c.medicalExpiry}</span></td>
                                <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}><button className="btn btn-ghost" onClick={() => setSelectedId(c.id)}>Details</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedCrew && <CrewDetailPanel crew={selectedCrew} onClose={() => setSelectedId(null)} />}
        </div>
    );
};

export default CrewManagement;
