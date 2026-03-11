import React, { useState } from 'react';
import { Plus, Save, History, Trash2, ArrowRight } from 'lucide-react';
import { SavedQuote } from '../types';
import { useRates, useDistances, useFuelBurn, useCreateFlight } from '../hooks/useData';
import { FMT_USD2 } from '../utils/formatters';
import { AircraftRate } from '../types';

interface QuoteRowProps {
    quote: SavedQuote;
    onDelete: (id: string) => void;
}

const QuoteRow: React.FC<QuoteRowProps> = ({ quote, onDelete }) => (
    <tr>
        <td style={{ fontWeight: 700 }}>{quote.tripNumber}</td>
        <td>{quote.origin} → {quote.destination}</td>
        <td>{quote.aircraft}</td>
        <td style={{ textAlign: 'right' }}>{quote.estimatedHours.toFixed(1)}h</td>
        <td style={{ textAlign: 'right', fontWeight: 700 }}>{FMT_USD2(quote.totalPrice)}</td>
        <td style={{ textAlign: 'right', color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>{new Date(quote.createdAt).toLocaleDateString()}</td>
        <td style={{ textAlign: 'right' }}>
            <button className="btn btn-ghost" style={{ padding: '0.25rem', color: '#ef4444' }} onClick={() => onDelete(quote.id)}><Trash2 size={14} /></button>
        </td>
    </tr>
);

const PricingEngine: React.FC = () => {
    const { data: rates, isLoading: ratesLoading } = useRates();
    const { data: distances, isLoading: distLoading } = useDistances();
    const { data: fuelBurn, isLoading: burnLoading } = useFuelBurn();
    const { mutate: createFlight } = useCreateFlight();

    const [origin, setOrigin] = useState('KCLT');
    const [dest, setDest] = useState('KTEB');
    const [aircraft, setAircraft] = useState('King Air 350');
    const [fuelPrice, setFuelPrice] = useState(6.25);
    const [feeRamp, setFeeRamp] = useState(150);
    const [feeLnd, setFeeLnd] = useState(450);
    const [feeCat, setFeeCat] = useState(250);
    const [quotes, setQuotes] = useState<SavedQuote[]>([
        { id: 'q1', tripNumber: 'Q-9910', origin: 'KCLT', destination: 'KTEB', aircraft: 'King Air 350', estimatedHours: 1.7, jetAPrice: 6.25, totalPrice: 6840, isEmptyLeg: false, createdAt: '2024-03-01' },
    ]);

    if (ratesLoading || distLoading || burnLoading) {
        return <div style={{ padding: '2rem', color: 'var(--muted-foreground)' }}>Calculating yields...</div>;
    }

    const safeRates = rates || [];
    const safeDistances = distances || {};
    const safeFuelBurn = fuelBurn || {};

    const dist = safeDistances[`${origin}-${dest}`] || safeDistances[`${dest}-${origin}`] || 500;
    const ac = safeRates.find((r: AircraftRate) => r.type === aircraft) || safeRates[1] || safeRates[0];
    const estHours = ac ? Number((dist / ac.speedKnots + 0.5).toFixed(1)) : 1;
    const burn = safeFuelBurn[aircraft] || 100;
    const fuelCost = estHours * burn * fuelPrice;
    const baseCost = ac ? estHours * ac.baseHourlyRate : 0;
    const total = baseCost + fuelCost + feeRamp + feeLnd + feeCat;

    const saveQuote = () => {
        const tripNum = `Q-${Math.floor(1000 + Math.random() * 9000)}`;
        const n: SavedQuote = {
            id: Math.random().toString(36).substr(2, 9),
            tripNumber: tripNum,
            origin, destination: dest, aircraft, estimatedHours: estHours,
            jetAPrice: fuelPrice, totalPrice: total, isEmptyLeg: false, createdAt: new Date().toISOString(),
        };

        createFlight({
            origin,
            destination: dest,
            aircraft,
            totalPrice: total,
            tripNumber: tripNum,
            paxCount: 1 // Default
        }, {
            onSuccess: () => {
                setQuotes([n, ...quotes]);
                alert(`Quote ${tripNum} saved to database!`);
            }
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Charter Pricing Engine</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost"><History size={16} style={{ marginRight: '0.5rem' }} /> History</button>
                    <button className="btn btn-primary" onClick={saveQuote}><Save size={16} style={{ marginRight: '0.5rem' }} /> Save Quote</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Route & Aircraft */}
                    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                        <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Origin FBO</label><input type="text" value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())} className="search-bar" style={{ marginBottom: 0, width: '100%' }} /></div>
                        <div style={{ display: 'grid', placeItems: 'center', paddingTop: '1.5rem' }}><ArrowRight size={20} style={{ opacity: 0.3 }} /></div>
                        <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Destination FBO</label><input type="text" value={dest} onChange={e => setDest(e.target.value.toUpperCase())} className="search-bar" style={{ marginBottom: 0, width: '100%' }} /></div>
                        <div style={{ gridColumn: 'span 3' }}><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Aircraft Fleet Type</label><select value={aircraft} onChange={e => setAircraft(e.target.value)} className="search-bar" style={{ marginBottom: 0, width: '100%', appearance: 'none', cursor: 'pointer' }}>{safeRates.map((r: AircraftRate) => <option key={r.type} value={r.type}>{r.type} ({r.capacity} pax)</option>)}</select></div>
                    </div>
                    {/* Cost Components */}
                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1rem' }}>Quote Breakdown</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>FBO Ramp / Handling</label><input type="number" value={feeRamp} onChange={e => setFeeRamp(Number(e.target.value))} className="search-bar" style={{ marginBottom: 0, width: '100%' }} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>Landing Fees</label><input type="number" value={feeLnd} onChange={e => setFeeLnd(Number(e.target.value))} className="search-bar" style={{ marginBottom: 0, width: '100%' }} /></div>
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>Catering Estimate</label><input type="number" value={feeCat} onChange={e => setFeeCat(Number(e.target.value))} className="search-bar" style={{ marginBottom: 0, width: '100%' }} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>Jet-A Price / Gal</label><input type="number" step="0.01" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))} className="search-bar" style={{ marginBottom: 0, width: '100%' }} /></div>
                            </div>
                        </div>
                    </div>
                    {/* Saved Quotes */}
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Active Quotes</div>
                        <table className="table" style={{ margin: 0 }}>
                            <thead><tr><th>ID</th><th>Route</th><th>AC</th><th style={{ textAlign: 'right' }}>Time</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'right' }}>Date</th><th></th></tr></thead>
                            <tbody>{quotes.map(q => <QuoteRow key={q.id} quote={q} onDelete={id => setQuotes(quotes.filter(x => x.id !== id))} />)}</tbody>
                        </table>
                    </div>
                </div>
                {/* Summary Panel */}
                <div className="card" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', position: 'sticky', top: '2rem' }}>
                    <h2 style={{ marginTop: 0, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Estimated Charter Price</h2>
                    <div style={{ display: 'grid', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted-foreground)' }}>Flight Time ({estHours}h)</span><span style={{ fontWeight: 600 }}>{FMT_USD2(baseCost)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted-foreground)' }}>Fuel Surcharge</span><span style={{ fontWeight: 600 }}>{FMT_USD2(fuelCost)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted-foreground)' }}>Fees & Services</span><span style={{ fontWeight: 600 }}>{FMT_USD2(feeRamp + feeLnd + feeCat)}</span></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 600 }}>Total (USD)</span><span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{FMT_USD2(total)}</span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.875rem' }} onClick={saveQuote}><Plus size={18} style={{ marginRight: '0.5rem' }} /> Generate Contract</button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>Price is an estimate based on current fuel rates and average flight times. Final price may vary.</p>
                </div>
            </div>
        </div>
    );
};

export default PricingEngine;
