import React, { useState, useEffect } from 'react';
import { X, Save, Clock, MapPin, Users, Coffee } from 'lucide-react';
import { useFlight, useUpdateFlight } from '../hooks/useData';

interface FlightModalProps {
    flightId: string;
    onClose: () => void;
}

const FlightModal: React.FC<FlightModalProps> = ({ flightId, onClose }) => {
    const { data, isLoading } = useFlight(flightId, { enabled: !!flightId });
    const flight = data as any;
    const { mutate: updateFlight, isPending } = useUpdateFlight();

    const [formData, setFormData] = useState({
        departureTime: '',
        arrivalTime: '',
        origin: '',
        destination: '',
        paxCount: 0,
        status: '',
        cateringNotes: ''
    });

    useEffect(() => {
        if (flight) {
            setFormData({
                departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
                arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
                origin: flight.origin || '',
                destination: flight.destination || '',
                paxCount: flight.paxCount || 0,
                status: flight.status || 'QUOTED',
                cateringNotes: flight.cateringNotes || ''
            });
        }
    }, [flight]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFlight({ id: flightId, data: formData }, {
            onSuccess: () => onClose()
        });
    };

    if (isLoading) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'grid', placeItems: 'center' }}>
                <div style={{ color: 'var(--muted-foreground)' }}>Loading flight details...</div>
            </div>
        );
    }

    if (!flight) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }} onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: '600px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Flight {flight.tripNumber}</h2>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>ID: {flight.id}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Routing */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                <MapPin size={14} /> Origin ICAO
                            </label>
                            <input type="text" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                <MapPin size={14} /> Destination ICAO
                            </label>
                            <input type="text" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} />
                        </div>
                    </div>

                    {/* Times */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                <Clock size={14} /> Departure (Local)
                            </label>
                            <input type="datetime-local" value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                <Clock size={14} /> Arrival (Local)
                            </label>
                            <input type="datetime-local" value={formData.arrivalTime} onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} />
                        </div>
                    </div>

                    {/* Pax & Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                <Users size={14} /> Passengers
                            </label>
                            <input type="number" min="0" value={formData.paxCount} onChange={e => setFormData({ ...formData, paxCount: parseInt(e.target.value) || 0 })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                Status
                            </label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }}>
                                <option value="QUOTED">QUOTED</option>
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>
                    </div>

                    {/* Catering Notes */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                            <Coffee size={14} /> Catering & Special Requests
                        </label>
                        <textarea rows={3} value={formData.cateringNotes} onChange={e => setFormData({ ...formData, cateringNotes: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none', resize: 'vertical' }}
                            placeholder="e.g. 2x sparkling water, no peanuts..." />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={isPending} style={{ padding: '0.75rem 1.5rem', background: '#fafafa', border: 'none', color: '#09090b', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isPending ? 0.7 : 1 }}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default FlightModal;
