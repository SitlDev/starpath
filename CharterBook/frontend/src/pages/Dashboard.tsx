import React from 'react';
import { Plus } from 'lucide-react';
import { useFleet, useFlights } from '../hooks/useData';
import { Aircraft } from '../types';

const Dashboard: React.FC = () => {
    const { data: fleet, isLoading: fleetLoading } = useFleet();
    const { data: flights, isLoading: flightsLoading } = useFlights();

    if (fleetLoading || flightsLoading) {
        return <div style={{ padding: '2rem', color: 'var(--muted-foreground)' }}>Syncing fleet data...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Fleet Overview</h1>
                <button className="btn btn-primary"><Plus size={16} style={{ marginRight: '0.5rem' }} /> New Trip</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {(fleet || []).map((jet: Aircraft) => (
                    <div key={jet.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{jet.tailNumber}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{jet.type}</div>
                            </div>
                            <span className={`badge ${jet.status === 'Airworthy' ? 'badge-success' : 'badge-warning'}`}>{jet.status}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Base: {jet.baseAirport || jet.base}</span><span>Next Inspection: 14d</span>
                        </div>
                        <div style={{ marginTop: '1rem', height: '4px', background: 'var(--secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: jet.status === 'Airworthy' ? '100%' : '30%', height: '100%', background: jet.status === 'Airworthy' ? '#10b981' : '#f59e0b' }} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="card">
                <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Active & Upcoming Trips</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Trip #</th><th>Origin</th><th>Destination</th><th>Departure</th><th>Aircraft</th><th>Status</th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(flights || []).map((f: any) => (
                            <tr key={f.id}>
                                <td style={{ fontWeight: 600 }}>{f.tripNumber || f.trip}</td>
                                <td>{f.origin}</td><td>{f.destination || f.dest}</td><td>{f.departureTime ? new Date(f.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : f.dep}</td>
                                <td><span className="badge badge-outline">{f.aircraft?.tailNumber || f.tail}</span></td>
                                <td><span className={`badge ${f.status === 'SCHEDULED' ? 'badge-success' : 'badge-warning'}`}>{f.status}</span></td>
                                <td><button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Manage</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
