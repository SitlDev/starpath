import React, { useState } from 'react';
import { Filter, ChevronRight, AlertTriangle, CheckCircle2, Search, Clock, Plane } from 'lucide-react';
import { ComplianceFlight, AircraftAD } from '../types';
import {
    COMP_FLIGHTS,
    AD_ITEMS
} from '../mock/data';
import ScoreRing from '../components/common/ScoreRing';
import { hoursRemaining } from '../utils/formatters';
import { useStore } from '../store/useStore';

import { useComplianceFlights, useADItems, useUpdateChecklist } from '../hooks/useData';

const ComplianceDashboard: React.FC = () => {
    const { data: compFlights, isLoading: flightsLoading } = useComplianceFlights();
    const { data: adItems, isLoading: adsLoading } = useADItems();
    const { mutate: updateCheck } = useUpdateChecklist();
    const { user } = useStore();
    const [view, setView] = useState<'flights' | 'ads' | 'maintenance'>('flights');

    if (flightsLoading || adsLoading) {
        return <div style={{ padding: '2rem', color: 'var(--muted-foreground)' }}>Ensuring airworthiness...</div>;
    }

    const safeFlights = compFlights || [];
    const safeAds = adItems || [];

    const toggleCheck = (flightId: string, itemId: string) => {
        if (user?.role !== 'Pilot' && user?.role !== 'Dispatcher') {
            alert('Unauthorized: Missing flight crew credentials');
            return;
        }

        const flight = safeFlights.find(f => f.id === flightId);
        if (!flight) return;

        const item = flight.checklist.find(i => i.id === itemId);
        if (!item) return;

        // Cycle: pending -> complete -> flagged -> pending
        let nextStatus: 'complete' | 'pending' | 'flagged' = 'complete';
        if (item.status === 'complete') nextStatus = 'flagged';
        else if (item.status === 'flagged') nextStatus = 'pending';

        updateCheck({ itemId, status: nextStatus });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Regulatory Compliance</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost"><Filter size={16} style={{ marginRight: '0.5rem' }} /> Filter</button>
                    <button className="btn btn-primary">Compliance Report</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {(['flights', 'ads', 'maintenance'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)}
                        className={`btn ${view === v ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '0.375rem 1rem', fontSize: '0.875rem' }}>
                        {v === 'flights' ? '✈ Flight Checklists' : v === 'ads' ? '🛠 Airworthiness Directives' : '📅 Maintenance Log'}
                    </button>
                ))}
            </div>

            {view === 'flights' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {safeFlights.map((f: ComplianceFlight) => {
                        const total = f.checklist.length;
                        const complete = f.checklist.filter(c => c.status === 'complete').length;
                        const flag = f.checklist.some(c => c.status === 'flagged');
                        const pct = Math.round((complete / total) * 100);

                        return (
                            <div key={f.id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${flag ? '#ef4444' : pct === 100 ? '#10b981' : '#3b82f6'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <ScoreRing pct={pct} />
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{f.tripNumber} — {f.route}</div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                                                <span>{f.date}</span><span>·</span><span>{f.aircraft}</span><span>·</span><span>PIC: {f.pic}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: f.status === 'In Progress' ? '#3b82f6' : 'inherit' }}>{f.status}</div>
                                        </div>
                                        <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} />
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                                    {['preflight', 'document', 'weather', 'safety', 'airworthiness'].map(cat => {
                                        const cItems = f.checklist.filter(i => i.category === cat);
                                        const cComplete = cItems.every(i => i.status === 'complete');
                                        return (
                                            <div key={cat} style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => toggleCheck(f.id, cItems[0]?.id)}>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '0.375rem', display: 'flex', justifyContent: 'space-between' }}>
                                                    {cat} {cComplete && <CheckCircle2 size={10} style={{ color: '#10b981' }} />}
                                                </div>
                                                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{cItems.filter(i => i.status === 'complete').length} / {cItems.length}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {view === 'ads' && (
                <div className="card" style={{ padding: 0 }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>AD Number</th><th>Aircraft</th><th>Description</th><th>Hours / Date Due</th><th>Remaining</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeAds.map((ad: AircraftAD) => {
                                const remHr = ad.dueHours && ad.currentHours ? hoursRemaining(ad.currentHours, ad.dueHours) : null;
                                return (
                                    <tr key={ad.id}>
                                        <td style={{ paddingLeft: '1.5rem', fontWeight: 700 }}>{ad.adNumber}</td>
                                        <td><div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{ad.tail}</div><div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{ad.type}</div></td>
                                        <td style={{ fontSize: '0.875rem', maxWidth: '300px' }}>{ad.description}</td>
                                        <td><div style={{ fontSize: '0.875rem' }}>{ad.dueDate}</div>{ad.dueHours && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{ad.dueHours} Total Airframe hr</div>}</td>
                                        <td>{remHr !== null && <span style={{ fontWeight: 600, color: remHr < 50 ? '#ef4444' : 'inherit' }}>{remHr} hr</span>}</td>
                                        <td><span className={`badge ${ad.status === 'Compliant' ? 'badge-success' : ad.status === 'Due Soon' ? 'badge-warning' : 'badge-danger'}`}>{ad.status}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ComplianceDashboard;
