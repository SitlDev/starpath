export interface RecentFlight {
    trip: string;
    date: string;
    route: string;
    hours: number;
}

export interface Certificate {
    name: string;
    number: string;
    expiry: string;
}

export interface CrewMember {
    id: string;
    name: string;
    role: 'PIC' | 'SIC' | 'Flight Attendant';
    email: string;
    phone: string;
    certExpiry: string;
    medicalExpiry: string;
    totalFlightHours: number;
    last30DayHours: number;
    last90DayHours: number;
    calendarYearHours: number;
    lastDutyStart: string | null;
    lastRestEnd: string | null;
    recentFlights: RecentFlight[];
    certificates: Certificate[];
    status: 'Available' | 'On Duty' | 'Rest Required' | 'Inactive';
}

export interface AircraftRate {
    type: string;
    tail: string;
    baseHourlyRate: number;
    capacity: number;
    speedKnots: number;
}

export interface SavedQuote {
    id: string;
    tripNumber: string;
    origin: string;
    destination: string;
    aircraft: string;
    estimatedHours: number;
    jetAPrice: number;
    totalPrice: number;
    isEmptyLeg: boolean;
    createdAt: string;
}

export type CheckStatus = 'complete' | 'pending' | 'na' | 'flagged';

export interface ChecklistItem {
    id: string;
    label: string;
    category: 'preflight' | 'document' | 'weather' | 'safety' | 'airworthiness';
    status: CheckStatus;
    completedBy?: string;
    completedAt?: string;
    notes?: string;
    required: boolean;
}

export interface ComplianceFlight {
    id: string;
    tripNumber: string;
    route: string;
    date: string;
    aircraft: string;
    pic: string;
    status: 'Pre-Flight' | 'In Progress' | 'Completed' | 'Archived';
    checklist: ChecklistItem[];
}

export interface AircraftAD {
    id: string;
    tail: string;
    type: string;
    adNumber: string;
    description: string;
    dueDate: string;
    dueHours?: number;
    currentHours?: number;
    status: 'Compliant' | 'Due Soon' | 'Overdue' | 'N/A';
}

export type TripStatus = 'Quoted' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ContactNote {
    id: string;
    date: string;
    author: string;
    text: string;
    type: 'call' | 'email' | 'meeting' | 'note';
}

export interface CRMClient {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    tier: 'VIP' | 'Regular' | 'One-Time';
    totalFlights: number;
    totalSpend: number;
    lastFlight: string;
    notes: ContactNote[];
    avatarColor: string;
}

export interface TripInvoiceLine {
    label: string;
    amount: number;
}

export interface CRMTrip {
    id: string;
    tripNumber: string;
    client: string;
    origin: string;
    destination: string;
    departDate: string;
    aircraft: string;
    pax: number;
    status: TripStatus;
    totalValue: number;
    paid: boolean;
    pic: string;
    notes: string;
    invoice: TripInvoiceLine[];
    createdAt: string;
}

export interface EmptyLeg {
    id: string;
    tripNumber: string;
    origin: string;
    originCity: string;
    destination: string;
    destinationCity: string;
    departDate: string;
    departTime: string;
    aircraft: string;
    aircraftType: string;
    seats: number;
    originalPrice: number;
    discountPct: number;
    hoursUntilDep: number;
    status: 'Available' | 'Pending Inquiry' | 'Booked';
    tailNumber: string;
    amenities: string[];
    flightHours: number;
    generated: boolean;
}

export interface Aircraft {
    id: string;
    tailNumber: string;
    type: string;
    status: 'Airworthy' | 'Maintenance' | 'AOG';
    baseAirport?: string;
    base?: string;
    hours?: number;
    nextInspection?: string;
}

export interface LeadForm {
    name: string;
    email: string;
    phone: string;
    pax: string;
    message: string;
}
