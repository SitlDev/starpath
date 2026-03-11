import React, { useState } from 'react';
import { Search, Briefcase, Plus, X, Phone, Mail, Clock, MapPin, Building, CreditCard, ChevronRight, FileText, Send, Zap, Plane, Users } from 'lucide-react';
import { CRMClient, CRMTrip, TripStatus, ContactNote } from '../types';
import {
    FMT_USD2,
    tripStatusColor,
    tierColor,
    noteIcon,
    initials
} from '../utils/formatters';
import { useClients, useTrips, useAddClientNote, useUpdateFlight } from '../hooks/useData';
import ClientModal from '../components/ClientModal';

const STATUS_PIPELINE: TripStatus[] = ['Quoted', 'Confirmed', 'In Progress', 'Completed'];

// ... TripPanel and ClientCard and ClientPanel components stay mostly the same but could be moved if needed ...
// I'll keep them here for now as they are specific to this page

interface TripPanelProps {
    trip: CRMTrip;
    client: CRMClient;
    onClose: () => void;
}

const TripPanel: React.FC<TripPanelProps> = ({ trip, client, onClose }) => {
    const { mutate: updateFlight, isPending } = useUpdateFlight();

    const handleTogglePayment = () => {
        updateFlight({ id: trip.id, data: { paid: !trip.paid } });
    };

    return (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '500px', background: 'var(--card)', borderLeft: '1px solid var(--border)', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trip Detail</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{trip.tripNumber}</div>
                </div>
                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={onClose}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
                    {STATUS_PIPELINE.map(s => {
                        const isDone = STATUS_PIPELINE.indexOf(s) <= STATUS_PIPELINE.indexOf(trip.status);
                        return (
                            <div key={s} style={{ textAlign: 'center' }}>
                                <div style={{ height: '4px', background: isDone ? tripStatusColor(trip.status) : 'var(--secondary)', borderRadius: '2px', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isDone ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{s}</div>
                            </div>
                        );
                    })}
                </div>
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--secondary)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{trip.origin} → {trip.destination}</div><div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{trip.departDate} · {trip.pax} Passengers</div></div>
                            <div style={{ textAlign: 'right' }}><div className="badge" style={{ background: `${tripStatusColor(trip.status)}18`, color: tripStatusColor(trip.status) }}>{trip.status}</div></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plane size={14} style={{ opacity: 0.5 }} /> {trip.aircraft}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14} style={{ opacity: 0.5 }} /> PIC: {trip.pic}</div>
                        </div>
                    </div>
                </section>
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Client</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: client.avatarColor, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800 }}>{initials(client.name)}</div>
                        <div><div style={{ fontWeight: 700 }}>{client.name}</div><div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{client.company}</div></div>
                        <div style={{ flex: 1 }} /><button className="btn btn-ghost" style={{ padding: '0.4rem' }}><ChevronRight size={16} /></button>
                    </div>
                </section>
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Invoice Breakdown</h3>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                        {trip.invoice.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', fontSize: '0.875rem', borderBottom: i === trip.invoice.length - 1 ? 'none' : '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                <span style={{ color: 'var(--muted-foreground)' }}>{item.label}</span><span>{FMT_USD2(item.amount)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary)', fontWeight: 800, fontSize: '1rem' }}>
                            <span>Total</span><span>{FMT_USD2(trip.totalValue)}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button onClick={handleTogglePayment} disabled={isPending} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}><CreditCard size={14} style={{ marginRight: '0.5rem' }} /> {trip.paid ? 'Mark Unpaid' : 'Mark Paid'}</button>
                        <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)', justifyContent: 'center' }}><FileText size={14} style={{ marginRight: '0.5rem' }} /> Invoice PDF</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

const ClientCard: React.FC<{ client: CRMClient; trips: CRMTrip[]; onClick: () => void }> = ({ client, trips, onClick }) => {
    const activeTrips = trips.filter(t => t.client === client.id && (t.status === 'Confirmed' || t.status === 'In Progress'));
    return (
        <div className="card" onClick={onClick} style={{ cursor: 'pointer', transition: 'all 0.15s', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: client.avatarColor, display: 'grid', placeItems: 'center', fontSize: '1.125rem', fontWeight: 800, color: 'white' }}>{initials(client.name)}</div>
                    <div><div style={{ fontWeight: 700, fontSize: '1rem' }}>{client.name}</div><div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{client.company}</div></div>
                </div>
                <span className="badge" style={{ background: `${tierColor(client.tier)}18`, color: tierColor(client.tier), border: `1px solid ${tierColor(client.tier)}40` }}>{client.tier}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
                    <div style={{ fontWeight: 700 }}>{FMT_USD2(client.totalSpend)}</div>
                </div>
                <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flights</div>
                    <div style={{ fontWeight: 700 }}>{client.totalFlights} Total</div>
                </div>
            </div>
            {activeTrips.length > 0 && (
                <div style={{ marginTop: 'auto', padding: '0.75rem', background: '#3b82f615', border: '1px solid #3b82f630', borderRadius: 'var(--radius)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Zap size={10} /> Active Trip</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{activeTrips[0].origin} → {activeTrips[0].destination}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{activeTrips[0].departDate}</div>
                </div>
            )}
        </div>
    );
};

const ClientPanel: React.FC<{ client: CRMClient; trips: CRMTrip[]; onClose: () => void; onTripClick: (t: CRMTrip) => void }> = ({ client, trips, onClose, onTripClick }) => {
    const [note, setNote] = useState('');
    const { mutate: logNote, isPending } = useAddClientNote();
    const clientTrips = trips.filter(t => t.client === client.id);

    const handleAddNote = () => {
        if (!note.trim()) return;
        logNote({
            clientId: client.id,
            note: {
                author: 'Current User', // Mocked user
                text: note,
                type: 'note'
            }
        }, {
            onSuccess: () => setNote('')
        });
    };

    return (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '550px', background: 'var(--card)', borderLeft: '1px solid var(--border)', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '8px', background: client.avatarColor, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem' }}>{initials(client.name)}</div>
                    <div><div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{client.name}</div><div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{client.company}</div></div>
                </div>
                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={onClose}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tier</div><div className="badge" style={{ background: `${tierColor(client.tier)}18`, color: tierColor(client.tier) }}>{client.tier}</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Flights</div><div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{client.totalFlights}</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Revenue</div><div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#10b981' }}>{FMT_USD2(client.totalSpend)}</div></div>
                </div>
                <section style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} /> Contact History</h3>
                    <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.25rem' }}>
                        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note from call, meeting..." style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', resize: 'none', minHeight: '60px', padding: 0, fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}><button className="btn btn-primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.75rem' }} onClick={handleAddNote} disabled={isPending}>{isPending ? 'Saving...' : 'Log Note'}</button></div>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {client.notes.map(n => (
                            <div key={n.id} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ fontSize: '1.25rem', paddingTop: '0.25rem' }}>{noteIcon(n.type)}</div>
                                <div style={{ flex: 1, paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.author}</span><span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{n.date}</span></div>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{n.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={14} /> Trip History</h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {clientTrips.map(t => (
                            <div key={t.id} onClick={() => onTripClick(t)} style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.tripNumber} — {t.origin} → {t.destination}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{t.departDate} · {FMT_USD2(t.totalValue)}</div>
                                </div>
                                <div className="badge" style={{ background: `${tripStatusColor(t.status)}18`, color: tripStatusColor(t.status), fontSize: '0.7rem' }}>{t.status}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const TripsCRM: React.FC = () => {
    const { data: trips, isLoading: tripsLoading } = useTrips();
    const { data: clients, isLoading: clientsLoading } = useClients();
    const [view, setView] = useState<'pipeline' | 'clients'>('pipeline');
    const [search, setSearch] = useState('');
    const [selectedTrip, setSelectedTrip] = useState<CRMTrip | null>(null);
    const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    const safeTrips = trips || [];
    const safeClients = clients || [];

    if (tripsLoading || clientsLoading) {
        return <div style={{ padding: '2rem', color: 'var(--muted-foreground)' }}>Loading CRM data...</div>;
    }

    const clientMap = safeClients.reduce((acc: Record<string, CRMClient>, c: CRMClient) => ({ ...acc, [c.id]: c }), {} as Record<string, CRMClient>);

    const filteredTrips = safeTrips.filter((t: CRMTrip) =>
        t.tripNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.origin.toLowerCase().includes(search.toLowerCase()) ||
        t.destination.toLowerCase().includes(search.toLowerCase()) ||
        clientMap[t.client]?.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredClients = safeClients.filter((c: CRMClient) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Trips & CRM</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        {[
                            { label: 'Pipeline Value', val: FMT_USD2(safeTrips.reduce((s: number, t: CRMTrip) => t.status !== 'Completed' ? s + t.totalValue : s, 0)) },
                            { label: 'Active Trips', val: safeTrips.filter((t: CRMTrip) => t.status === 'In Progress').length },
                            { label: 'Unpaid Invoices', val: safeTrips.filter((t: CRMTrip) => !t.paid && t.status !== 'Cancelled').length }
                        ].map(stat => (
                            <div key={stat.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', minWidth: '140px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{stat.label}</div>
                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {(['pipeline', 'clients'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)}
                            className={`btn ${view === v ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '0.375rem 1rem', fontSize: '0.875rem' }}>
                            {v === 'pipeline' ? '✈ Trip Pipeline' : '👥 Client Directory'}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips, clients..."
                        style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--foreground)', fontSize: '0.875rem', width: '240px', outline: 'none' }} />
                </div>
                {view === 'clients' && (
                    <button onClick={() => setIsClientModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={14} /> New Client
                    </button>
                )}
            </div>

            {view === 'pipeline' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {STATUS_PIPELINE.map(status => {
                            const col = filteredTrips.filter((t: CRMTrip) => t.status === status);
                            const colValue = col.reduce((s: number, t: CRMTrip) => s + t.totalValue, 0);
                            return (
                                <div key={status}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: tripStatusColor(status) }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{status}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '0.1rem 0.4rem', borderRadius: '99px' }}>{col.length}</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{FMT_USD2(colValue)}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', minHeight: '120px' }}>
                                        {col.map((t: CRMTrip) => {
                                            const cl = clientMap[t.client];
                                            return (
                                                <div key={t.id} onClick={() => setSelectedTrip(t)}
                                                    style={{ padding: '0.875rem', border: '1px solid var(--border)', borderLeft: `3px solid ${tripStatusColor(t.status)}`, borderRadius: 'var(--radius)', cursor: 'pointer', background: 'var(--card)', transition: 'all 0.15s' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{t.tripNumber}</span>
                                                        {!t.paid && t.status !== 'Quoted' && <span style={{ fontSize: '0.6rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '0.1rem 0.35rem', borderRadius: '99px', fontWeight: 700 }}>UNPAID</span>}
                                                    </div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{t.origin} → {t.destination}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>{t.departDate} · {t.pax} pax</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        {cl && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: cl.avatarColor, display: 'grid', placeItems: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white' }}>{initials(cl.name)}</div>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{cl.name.split(' ')[0]}</span>
                                                            </div>
                                                        )}
                                                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: tripStatusColor(t.status) }}>{FMT_USD2(t.totalValue)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {col.length === 0 && (
                                            <div style={{ padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>No trips</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {view === 'clients' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {filteredClients.map((c: CRMClient) => (
                        <ClientCard key={c.id} client={c} trips={safeTrips} onClick={() => setSelectedClient(c)} />
                    ))}
                </div>
            )}

            {selectedTrip && (
                <TripPanel trip={selectedTrip} client={clientMap[selectedTrip.client]} onClose={() => setSelectedTrip(null)} />
            )}
            {selectedClient && !selectedTrip && (
                <ClientPanel client={selectedClient} trips={safeTrips} onClose={() => setSelectedClient(null)} onTripClick={t => setSelectedTrip(t)} />
            )}
            {isClientModalOpen && (
                <ClientModal onClose={() => setIsClientModalOpen(false)} />
            )}
        </div>
    );
};

export default TripsCRM;
