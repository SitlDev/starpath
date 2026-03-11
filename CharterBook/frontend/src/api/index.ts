import { MOCK_AIRCRAFT, MOCK_FLIGHTS, MOCK_CREW, CRM_CLIENTS, CRM_TRIPS, COMP_FLIGHTS, AD_ITEMS, EMPTY_LEGS, AIRCRAFT_RATES, ROUTE_DISTANCES, FUEL_BURN } from '../mock/data';
import { CrewMember, CRMClient, CRMTrip, Aircraft, ComplianceFlight, AircraftAD, EmptyLeg, AircraftRate } from '../types';

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const login = async (credentials: any) => {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
};

export const signup = async (userData: any) => {
    const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Signup failed');
    }
    return res.json();
};

export const fetchMe = async () => {
    const res = await fetch('/api/me', {
        headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return res.json();
};

export const fetchBranding = async () => {
    try {
        const res = await fetch('/api/tenant/branding');
        if (!res.ok) throw new Error('Failed to fetch branding');
        return res.json();
    } catch {
        return null;
    }
};

export const fetchFleet = async (): Promise<Aircraft[]> => {
    try {
        const res = await fetch('/api/fleet', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return MOCK_AIRCRAFT as Aircraft[];
    }
};

export const fetchCrew = async (): Promise<CrewMember[]> => {
    try {
        const res = await fetch('/api/crew', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return MOCK_CREW;
    }
};

export const fetchFlights = async (): Promise<any[]> => {
    try {
        const res = await fetch('/api/schedule', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return MOCK_FLIGHTS;
    }
};

export const fetchClients = async (): Promise<CRMClient[]> => {
    try {
        const res = await fetch('/api/clients', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return CRM_CLIENTS;
    }
};

export const createClient = async (clientData: any) => {
    const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
    });
    if (!res.ok) throw new Error('Failed to create client');
    return res.json();
};

export const fetchTrips = async (): Promise<CRMTrip[]> => {
    try {
        const res = await fetch('/api/trips', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return CRM_TRIPS;
    }
};

export const fetchComplianceFlights = async (): Promise<ComplianceFlight[]> => {
    try {
        const res = await fetch('/api/compliance', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return COMP_FLIGHTS;
    }
};

export const fetchADItems = async (): Promise<AircraftAD[]> => {
    try {
        const res = await fetch('/api/ads', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return AD_ITEMS;
    }
};

export const fetchEmptyLegs = async (): Promise<EmptyLeg[]> => {
    try {
        const res = await fetch('/api/legs', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return EMPTY_LEGS;
    }
};

export const fetchRates = async (): Promise<AircraftRate[]> => {
    try {
        const res = await fetch('/api/rates', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return AIRCRAFT_RATES;
    }
};

export const fetchDistances = async (): Promise<Record<string, number>> => {
    try {
        const res = await fetch('/api/distances', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return ROUTE_DISTANCES;
    }
};

export const fetchFuelBurn = async (): Promise<Record<string, number>> => {
    try {
        const res = await fetch('/api/fuel-burn', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch {
        return FUEL_BURN;
    }
};

export const updateChecklistItem = async (itemId: string, status: string, remarks?: string) => {
    const res = await fetch(`/api/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
    });
    if (!res.ok) throw new Error('Failed to update checklist');
    return res.json();
};

export const addClientNote = async (clientId: string, note: any) => {
    const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
};

export const updateFlightStatus = async (flightId: string, status: string) => {
    const res = await fetch(`/api/flights/${flightId}/status`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update flight status');
    return res.json();
};

export const assignCrew = async (flightId: string, role: string, crewId: string) => {
    const res = await fetch(`/api/flights/${flightId}/crew`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, crewId })
    });
    if (!res.ok) throw new Error('Failed to assign crew');
    return res.json();
};

export const reassignAircraft = async (flightId: string, aircraftId: string) => {
    const res = await fetch(`/api/flights/${flightId}/aircraft`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ aircraftId })
    });
    if (!res.ok) throw new Error('Failed to reassign aircraft');
    return res.json();
};

export const fetchFlight = async (flightId: string) => {
    const res = await fetch(`/api/flights/${flightId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch flight');
    return res.json();
};

export const updateFlight = async (flightId: string, flightData: any) => {
    const res = await fetch(`/api/flights/${flightId}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData)
    });
    if (!res.ok) throw new Error('Failed to update flight');
    return res.json();
};

export const createFlight = async (flightData: any) => {
    const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData)
    });
    if (!res.ok) throw new Error('Failed to create flight');
    return res.json();
};

// ─── Super Admin API ───────────────────────────────────────────────────────────

const getSuperAdminHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    // Note: no x-tenant-id — the backend skips tenant resolution for /api/super-admin/*
    return token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
};

export const superAdminLogin = async (email: string, password: string) => {
    const res = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid super admin credentials');
    }
    return res.json();
};

export const fetchAllTenants = async () => {
    const res = await fetch('/api/super-admin/tenants', { headers: getSuperAdminHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tenants');
    return res.json();
};

export const updateTenantAdmin = async (tenantId: string, data: any) => {
    const res = await fetch(`/api/super-admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: getSuperAdminHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update tenant');
    return res.json();
};

export const deleteTenantAdmin = async (tenantId: string) => {
    const res = await fetch(`/api/super-admin/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: getSuperAdminHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete tenant');
    return res.json();
};
