import React, { useRef, useEffect } from 'react';
import { useFlights, useFleet, useReassignAircraft, useCrew, useAssignCrew } from '../hooks/useData';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Users } from 'lucide-react';
import { tripStatusColor } from '../utils/formatters';
import FlightModal from '../components/FlightModal';

const Scheduling: React.FC = () => {
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [selectedFlightId, setSelectedFlightId] = React.useState<string | null>(null);
    const { data: flights, isLoading: flightsLoading } = useFlights();
    const { data: fleet, isLoading: fleetLoading } = useFleet();
    const { data: crew, isLoading: crewLoading } = useCrew();
    const { mutate: reassign } = useReassignAircraft();
    const { mutate: assignCrew } = useAssignCrew();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Timeline Configuration
    const DAYS_TO_SHOW = 30;
    const DAY_WIDTH = 200; // px per day
    const HOUR_WIDTH = DAY_WIDTH / 24;
    const startDate = new Date(2024, 2, 1); // March 1st, 2024

    useEffect(() => {
        // Scroll to "Today" (March 4th in our demo data)
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 3 * DAY_WIDTH;
        }
    }, [flights]);

    if (flightsLoading || fleetLoading || crewLoading) {
        return <div style={{ padding: '2rem', color: 'var(--muted-foreground)' }}>Syncing fleet schedule...</div>;
    }

    const safeFlights = flights || [];
    const safeFleet = fleet || [];
    const safeCrew = crew || [];

    const getDays = () => {
        const days = [];
        for (let i = 0; i < DAYS_TO_SHOW; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const days = getDays();

    const getFlightPos = (flight: any) => {
        const dep = new Date(flight.departureTime);
        const arr = new Date(flight.arrivalTime);

        // Calculate offset from startDate
        const startDiff = (dep.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        const duration = (arr.getTime() - dep.getTime()) / (1000 * 60 * 60);

        return {
            left: startDiff * HOUR_WIDTH,
            width: Math.max(duration * HOUR_WIDTH, 80) // Min width for visibility
        };
    };

    return (
        <div style={{ height: 'calc(100vh - 12rem)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Error Notification */}
            {errorMsg && (
                <div style={{ position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', boxShadow: '0 10px 25px rgba(220, 38, 38, 0.4)', zIndex: 1000, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideDown 0.3s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem', borderRadius: '50%' }}>!</div>
                    {errorMsg}
                </div>
            )}
            {/* Header / Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Fleet Dispatch</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>March 2024 · 12 Active Missions</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <button className="btn btn-ghost" style={{ borderRadius: 0, padding: '0.5rem' }}><ChevronLeft size={16} /></button>
                        <button className="btn btn-ghost" style={{ borderRadius: 0, padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Today</button>
                        <button className="btn btn-ghost" style={{ borderRadius: 0, padding: '0.5rem' }}><ChevronRight size={16} /></button>
                    </div>
                    <button className="btn btn-primary"><Plus size={16} style={{ marginRight: '0.5rem' }} /> Schedule Leg</button>
                </div>
            </div>

            {/* Timeline View */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--card)' }}>

                {/* Fixed Fleet Sidebar */}
                <div style={{ width: '220px', borderRight: '1px solid var(--border)', zIndex: 10, background: 'var(--card)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '50px', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>
                        Aircraft
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {safeFleet.map((ac: any) => (
                            <div key={ac.id} style={{ height: '90px', borderBottom: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{ac.tailNumber}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{ac.type}</div>
                                <div style={{ marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: ac.status === 'Airworthy' ? '#10b981' : '#f59e0b' }} />
                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: ac.status === 'Airworthy' ? '#10b981' : '#f59e0b' }}>{ac.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scrollable Timeline Grid */}
                <div ref={scrollContainerRef} style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', position: 'relative' }}>
                    {/* Date Header */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                        {days.map((date, i) => (
                            <div key={i} style={{
                                minWidth: `${DAY_WIDTH}px`,
                                height: '50px',
                                borderRight: '1px solid var(--border)',
                                padding: '0.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                background: date.getDate() === 4 ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                            }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                                    {date.toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grid Rows */}
                    <div style={{ position: 'relative', height: 'calc(100% - 50px)', overflowY: 'auto' }}>
                        {/* Vertical Grid Lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', pointerEvents: 'none' }}>
                            {days.map((_, i) => (
                                <div key={i} style={{ minWidth: `${DAY_WIDTH}px`, height: '100%', borderRight: '1px solid var(--border)', opacity: 0.3 }} />
                            ))}
                        </div>

                        {/* Aircraft Schedule Rows */}
                        {safeFleet.map((ac: any) => {
                            const acFlights = safeFlights.filter((f: any) => f.aircraftId === ac.id);

                            const handleDrop = (e: React.DragEvent) => {
                                e.preventDefault();
                                const flightId = e.dataTransfer.getData('flightId');
                                if (flightId) {
                                    reassign({ flightId, aircraftId: ac.id }, {
                                        onError: (err: any) => {
                                            // Handle server-side 400 errors for overlaps
                                            setErrorMsg(err.message.includes('Conflict') ? 'Scheduling Conflict: Aircraft is already booked for these times.' : 'Failed to move trip.');
                                            setTimeout(() => setErrorMsg(null), 4000);
                                        }
                                    });
                                }
                            };

                            return (
                                <div key={ac.id}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    style={{ height: '90px', borderBottom: '1px solid var(--border)', position: 'relative' }}
                                >
                                    {acFlights.map((f: any) => {
                                        const pos = getFlightPos(f);
                                        const handleDragStart = (e: React.DragEvent) => {
                                            e.dataTransfer.setData('flightId', f.id);
                                        };

                                        return (
                                            <div key={f.id}
                                                draggable
                                                onDragStart={handleDragStart}
                                                onClick={() => setSelectedFlightId(f.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    bottom: '12px',
                                                    left: `${pos.left}px`,
                                                    width: `${pos.width}px`,
                                                    background: `linear-gradient(135deg, ${tripStatusColor(f.status)} 0%, ${tripStatusColor(f.status)}dd 100%)`,
                                                    borderRadius: '8px',
                                                    padding: '0.625rem',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                    cursor: 'grab',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    minWidth: '100px',
                                                    zIndex: 5
                                                }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span>{f.tripNumber}</span>
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{f.status}</span>
                                                </div>
                                                <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{f.origin} → {f.destination}</div>

                                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                    <div
                                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const crewId = e.dataTransfer.getData('crewId');
                                                            if (crewId) assignCrew({ flightId: f.id, role: 'pic', crewId });
                                                        }}
                                                        style={{ flex: 1, padding: '0.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px dashed rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>
                                                        <span style={{ opacity: 0.7 }}>PIC:</span> {f.pic}
                                                    </div>
                                                    <div
                                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const crewId = e.dataTransfer.getData('crewId');
                                                            if (crewId) assignCrew({ flightId: f.id, role: 'sic', crewId });
                                                        }}
                                                        style={{ flex: 1, padding: '0.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px dashed rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>
                                                        <span style={{ opacity: 0.7 }}>SIC:</span> {f.sic}
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: '0.6rem', opacity: 0.8, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <Clock size={10} /> {new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Available Crew Sidebar */}
                <div style={{ width: '220px', borderLeft: '1px solid var(--border)', background: 'var(--card)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                    <div style={{ height: '50px', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>
                        Available Crew (<Users size={12} style={{ margin: '0 0.25rem' }} /> Drag)
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        {safeCrew.map((c: any) => (
                            <div
                                key={c.id}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('crewId', c.id)}
                                style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.02)', cursor: 'grab' }}
                            >
                                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{c.role}</div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                                    {c.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend / Status Info */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Fleet Status Legend:</span>
                {[
                    { label: 'Scheduled', color: '#3b82f6' },
                    { label: 'In Progress', color: '#f59e0b' },
                    { label: 'Completed', color: '#10b981' },
                    { label: 'Maintenance', color: '#ef4444' }
                ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '4px', background: l.color }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{l.label}</span>
                    </div>
                ))}
            </div>

            {selectedFlightId && (
                <FlightModal flightId={selectedFlightId} onClose={() => setSelectedFlightId(null)} />
            )}
        </div>
    );
};

export default Scheduling;
