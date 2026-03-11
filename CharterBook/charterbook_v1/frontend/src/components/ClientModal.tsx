import React, { useState } from 'react';
import { X, Save, User, Building, Mail, Phone, CreditCard } from 'lucide-react';
import { useCreateClient } from '../hooks/useData';

interface ClientModalProps {
    onClose: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ onClose }) => {
    const { mutate: createClient, isPending } = useCreateClient();

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        tier: 'Regular'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createClient(formData, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' }} onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: '500px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add New Client</h2>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Create a new CRM record</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Name */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                            <User size={14} /> Full Name *
                        </label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} placeholder="Jane Doe" />
                    </div>

                    {/* Company */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                            <Building size={14} /> Company
                        </label>
                        <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} placeholder="Acme Corp" />
                    </div>

                    {/* Contact Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                <Mail size={14} /> Email *
                            </label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} placeholder="jane@example.com" />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                <Phone size={14} /> Phone
                            </label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }} placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>

                    {/* Tier */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                            <CreditCard size={14} /> Client Tier
                        </label>
                        <select value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--foreground)', outline: 'none' }}>
                            <option value="Regular">Regular</option>
                            <option value="VIP">VIP</option>
                            <option value="One-Time">One-Time</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={isPending} style={{ padding: '0.75rem 1.5rem', background: '#fafafa', border: 'none', color: '#09090b', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isPending ? 0.7 : 1 }}>
                            <Save size={16} /> Save Client
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ClientModal;
