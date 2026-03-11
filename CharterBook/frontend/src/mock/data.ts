import { CrewMember, AircraftRate, CRMClient, CRMTrip, EmptyLeg, ComplianceFlight, AircraftAD, ChecklistItem, CheckStatus } from '../types';

export const MOCK_AIRCRAFT = [
    { id: '1', tailNumber: 'N101CA', type: 'King Air 350', status: 'Airworthy', base: 'KCLT' },
    { id: '2', tailNumber: 'N202CA', type: 'King Air 350', status: 'Airworthy', base: 'KCLT' },
    { id: '3', tailNumber: 'N303CA', type: 'Citation Latitude', status: 'Maintenance', base: 'KCLT' },
    { id: '4', tailNumber: 'N404CA', type: 'Gulfstream G550', status: 'Airworthy', base: 'KCLT' },
    { id: '5', tailNumber: 'N505CA', type: 'Pilatus PC-12', status: 'Airworthy', base: 'KCLT' },
];

export const MOCK_FLIGHTS = [
    { id: 'f1', trip: 'TRP9910', origin: 'KCLT', dest: 'KTEB', dep: '2024-03-04 10:00', arr: '2024-03-04 11:30', status: 'SCHEDULED', tail: 'N101CA', client: 'Apex Capital' },
    { id: 'f2', trip: 'TRP9911', origin: 'KJFK', dest: 'KCLT', dep: '2024-03-04 14:00', arr: '2024-03-04 15:45', status: 'SCHEDULED', tail: 'N101CA', client: 'Blue Ridge' },
    { id: 'f3', trip: 'TRP9912', origin: 'KCLT', dest: 'KMIA', dep: '2024-03-05 09:00', arr: '2024-03-05 11:15', status: 'QUOTED', tail: 'N404CA', client: 'Apex Capital' },
];

export const MOCK_CREW: CrewMember[] = [
    {
        id: 'c1', name: 'Capt. Sarah Jenkins', role: 'PIC',
        email: 's.jenkins@coastalair.com', phone: '704-555-0110',
        certExpiry: '2026-12-31', medicalExpiry: '2026-06-30',
        totalFlightHours: 8500, last30DayHours: 62, last90DayHours: 201, calendarYearHours: 680,
        lastDutyStart: '2024-03-02T06:00:00', lastRestEnd: '2024-03-03T14:00:00',
        status: 'Available',
        recentFlights: [
            { trip: 'TRP9905', date: 'Mar 1', route: 'KCLT → KTEB', hours: 1.8 },
            { trip: 'TRP9900', date: 'Feb 28', route: 'KTEB → KCLT', hours: 1.7 },
            { trip: 'TRP9897', date: 'Feb 26', route: 'KCLT → KMIA', hours: 2.2 },
        ],
        certificates: [
            { name: 'ATP Certificate', number: 'ATP1234567', expiry: '2026-12-31' },
            { name: 'King Air 350 Type Rating', number: 'TR-KA350-004', expiry: '2026-08-15' },
            { name: 'FAA Medical Class I', number: 'MED89012', expiry: '2026-06-30' },
        ],
    },
    {
        id: 'c2', name: 'Capt. David Miller', role: 'PIC',
        email: 'd.miller@coastalair.com', phone: '704-555-0211',
        certExpiry: '2027-03-15', medicalExpiry: '2026-09-20',
        totalFlightHours: 12000, last30DayHours: 88, last90DayHours: 195, calendarYearHours: 890,
        lastDutyStart: '2024-03-04T07:00:00', lastRestEnd: null,
        status: 'On Duty',
        recentFlights: [
            { trip: 'TRP9910', date: 'Mar 4', route: 'KCLT → KTEB', hours: 1.5 },
            { trip: 'TRP9908', date: 'Mar 3', route: 'KFLL → KCLT', hours: 2.0 },
            { trip: 'TRP9902', date: 'Mar 1', route: 'KCLT → KDFW', hours: 2.8 },
        ],
        certificates: [
            { name: 'ATP Certificate', number: 'ATP9988776', expiry: '2027-03-15' },
            { name: 'G550 Type Rating', number: 'TR-G550-021', expiry: '2026-11-10' },
            { name: 'FAA Medical Class I', number: 'MED77123', expiry: '2026-09-20' },
        ],
    },
    {
        id: 'c3', name: 'FO Amanda Ross', role: 'SIC',
        email: 'a.ross@coastalair.com', phone: '704-555-0312',
        certExpiry: '2026-10-10', medicalExpiry: '2026-05-15',
        totalFlightHours: 1800, last30DayHours: 34, last90DayHours: 122, calendarYearHours: 290,
        lastDutyStart: '2024-03-04T07:00:00', lastRestEnd: null,
        status: 'On Duty',
        recentFlights: [
            { trip: 'TRP9910', date: 'Mar 4', route: 'KCLT → KTEB', hours: 1.5 },
            { trip: 'TRP9906', date: 'Mar 2', route: 'KCLT → KBOS', hours: 2.1 },
        ],
        certificates: [
            { name: 'Commercial Pilot Certificate', number: 'COM445566', expiry: '2026-10-10' },
            { name: 'FAA Medical Class II', number: 'MED44521', expiry: '2026-05-15' },
        ],
    },
    {
        id: 'c4', name: 'FO Chris Evans', role: 'SIC',
        email: 'c.evans@coastalair.com', phone: '704-555-0413',
        certExpiry: '2026-11-20', medicalExpiry: '2026-12-05',
        totalFlightHours: 2200, last30DayHours: 18, last90DayHours: 88, calendarYearHours: 210,
        lastDutyStart: null, lastRestEnd: '2024-03-04T01:00:00',
        status: 'Rest Required',
        recentFlights: [
            { trip: 'TRP9901', date: 'Feb 28', route: 'KCLT → KLAS', hours: 4.1 },
            { trip: 'TRP9898', date: 'Feb 27', route: 'KLAS → KCLT', hours: 4.2 },
        ],
        certificates: [
            { name: 'Commercial Pilot Certificate', number: 'COM332211', expiry: '2026-11-20' },
            { name: 'FAA Medical Class II', number: 'MED55678', expiry: '2026-12-05' },
        ],
    },
    {
        id: 'c5', name: 'Capt. Michael Chang', role: 'PIC',
        email: 'm.chang@coastalair.com', phone: '704-555-0514',
        certExpiry: '2027-01-12', medicalExpiry: '2026-07-22',
        totalFlightHours: 9200, last30DayHours: 41, last90DayHours: 178, calendarYearHours: 520,
        lastDutyStart: null, lastRestEnd: '2024-03-03T18:00:00',
        status: 'Available',
        recentFlights: [
            { trip: 'TRP9909', date: 'Mar 3', route: 'KCLT → KAUS', hours: 2.9 },
            { trip: 'TRP9904', date: 'Mar 2', route: 'KAUS → KCLT', hours: 3.0 },
        ],
        certificates: [
            { name: 'ATP Certificate', number: 'ATP6677889', expiry: '2027-01-12' },
            { name: 'King Air 350 Type Rating', number: 'TR-KA350-007', expiry: '2026-10-01' },
            { name: 'FAA Medical Class I', number: 'MED33441', expiry: '2026-07-22' },
        ],
    },
    {
        id: 'c6', name: 'FO Lisa Thorne', role: 'SIC',
        email: 'l.thorne@coastalair.com', phone: '704-555-0615',
        certExpiry: '2026-09-05', medicalExpiry: '2026-08-12',
        totalFlightHours: 1400, last30DayHours: 26, last90DayHours: 95, calendarYearHours: 172,
        lastDutyStart: null, lastRestEnd: '2024-03-02T10:00:00',
        status: 'Available',
        recentFlights: [
            { trip: 'TRP9903', date: 'Mar 1', route: 'KCLT → KATL', hours: 0.8 },
        ],
        certificates: [
            { name: 'Commercial Pilot Certificate', number: 'COM887766', expiry: '2026-09-05' },
            { name: 'FAA Medical Class II', number: 'MED99321', expiry: '2026-08-12' },
        ],
    },
    {
        id: 'c7', name: 'Sarah Wilson', role: 'Flight Attendant',
        email: 's.wilson@coastalair.com', phone: '704-555-0716',
        certExpiry: '2026-12-31', medicalExpiry: '2026-12-31',
        totalFlightHours: 620, last30DayHours: 30, last90DayHours: 92, calendarYearHours: 180,
        lastDutyStart: '2024-03-04T07:00:00', lastRestEnd: null,
        status: 'On Duty',
        recentFlights: [
            { trip: 'TRP9910', date: 'Mar 4', route: 'KCLT → KTEB', hours: 1.5 },
        ],
        certificates: [
            { name: 'Emergency Procedures', number: 'EP-2024-0041', expiry: '2026-12-31' },
            { name: 'CPR / First Aid', number: 'CPR-2024-881', expiry: '2025-03-15' },
        ],
    },
    {
        id: 'c8', name: 'John Doe', role: 'Flight Attendant',
        email: 'j.doe@coastalair.com', phone: '704-555-0817',
        certExpiry: '2026-12-31', medicalExpiry: '2026-12-31',
        totalFlightHours: 380, last30DayHours: 0, last90DayHours: 44, calendarYearHours: 62,
        lastDutyStart: null, lastRestEnd: null,
        status: 'Inactive',
        recentFlights: [],
        certificates: [
            { name: 'Emergency Procedures', number: 'EP-2024-0089', expiry: '2026-12-31' },
        ],
    },
];

export const AIRCRAFT_RATES: AircraftRate[] = [
    { type: 'Pilatus PC-12', tail: 'N505CA', baseHourlyRate: 2100, capacity: 6, speedKnots: 270 },
    { type: 'King Air 350', tail: 'N101CA', baseHourlyRate: 3200, capacity: 8, speedKnots: 310 },
    { type: 'King Air 350', tail: 'N202CA', baseHourlyRate: 3200, capacity: 8, speedKnots: 310 },
    { type: 'Citation Latitude', tail: 'N303CA', baseHourlyRate: 4500, capacity: 9, speedKnots: 446 },
    { type: 'Gulfstream G550', tail: 'N404CA', baseHourlyRate: 8500, capacity: 16, speedKnots: 488 },
];

export const ROUTE_DISTANCES: Record<string, number> = {
    'KCLT-KTEB': 521, 'KTEB-KCLT': 521,
    'KCLT-KMIA': 579, 'KMIA-KCLT': 579,
    'KCLT-KLAS': 1761, 'KLAS-KCLT': 1761,
    'KCLT-KDFW': 941, 'KDFW-KCLT': 941,
    'KCLT-KBOS': 848, 'KBOS-KCLT': 848,
    'KCLT-KJFK': 541, 'KJFK-KCLT': 541,
    'KCLT-KAUS': 1150, 'KAUS-KCLT': 1150,
    'KCLT-KATL': 200, 'KATL-KCLT': 200,
    'KCLT-KFLL': 619, 'KFLL-KCLT': 619,
    'KTEB-KJFK': 14, 'KJFK-KTEB': 14,
};

export const FUEL_BURN: Record<string, number> = {
    'Pilatus PC-12': 60,
    'King Air 350': 102,
    'Citation Latitude': 180,
    'Gulfstream G550': 380,
};

// ── Mock Part 135 Checklist Templates ─────────────────────────────────────────
export function makeChecklist(overrides: Partial<ChecklistItem>[] = []): ChecklistItem[] {
    const base: ChecklistItem[] = [
        // Preflight
        { id: 'pf1', label: 'Aircraft walkaround completed', category: 'preflight', status: 'pending', required: true },
        { id: 'pf2', label: 'Fuel quantity verified', category: 'preflight', status: 'pending', required: true },
        { id: 'pf3', label: 'Oil levels checked', category: 'preflight', status: 'pending', required: true },
        { id: 'pf4', label: 'Control surfaces checked', category: 'preflight', status: 'pending', required: true },
        // Documentation
        { id: 'dc1', label: 'Passenger manifest signed', category: 'document', status: 'pending', required: true },
        { id: 'dc2', label: 'Passenger weights recorded (§135.63)', category: 'document', status: 'pending', required: true },
        { id: 'dc3', label: 'Weight & Balance calculated', category: 'document', status: 'pending', required: true },
        { id: 'dc4', label: 'Airworthiness certificate on board', category: 'document', status: 'pending', required: true },
        { id: 'dc5', label: 'Registration on board', category: 'document', status: 'pending', required: true },
        { id: 'dc6', label: 'Ops specs on board', category: 'document', status: 'pending', required: true },
        // Weather
        { id: 'wx1', label: 'Dispatch weather briefing logged', category: 'weather', status: 'pending', required: true },
        { id: 'wx2', label: 'TAF reviewed for destination', category: 'weather', status: 'pending', required: true },
        { id: 'wx3', label: 'PIREPs checked for route', category: 'weather', status: 'pending', required: false },
        { id: 'wx4', label: 'SIGMET / AIRMET reviewed', category: 'weather', status: 'pending', required: true },
        { id: 'wx5', label: 'NOTAM checked (origin & destination)', category: 'weather', status: 'pending', required: true },
        // Safety
        { id: 'sf1', label: 'Safety briefing completed', category: 'safety', status: 'pending', required: true },
        { id: 'sf2', label: 'Emergency equipment checked', category: 'safety', status: 'pending', required: true },
        { id: 'sf3', label: 'Crew rest requirements met (§135.267)', category: 'safety', status: 'pending', required: true },
        { id: 'sf4', label: 'Drug & Alcohol testing current', category: 'safety', status: 'pending', required: true },
        // Airworthiness
        { id: 'aw1', label: 'MEL reviewed — no deferred items', category: 'airworthiness', status: 'pending', required: true },
        { id: 'aw2', label: 'Next 100hr / Annual inspection OK', category: 'airworthiness', status: 'pending', required: true },
        { id: 'aw3', label: 'No open ADs', category: 'airworthiness', status: 'pending', required: true },
    ];

    overrides.forEach(o => {
        const idx = base.findIndex(b => b.id === o.id);
        if (idx >= 0) base[idx] = { ...base[idx], ...o };
    });
    return base;
}

export const COMP_FLIGHTS: ComplianceFlight[] = [
    {
        id: 'cf1', tripNumber: 'TRP9910', route: 'KCLT → KTEB',
        date: 'Mar 4, 2024', aircraft: 'N101CA (King Air 350)', pic: 'Capt. David Miller',
        status: 'In Progress',
        checklist: makeChecklist([
            { id: 'pf1', status: 'complete', completedBy: 'David Miller', completedAt: '09:42 AM' },
            { id: 'pf2', status: 'complete', completedBy: 'David Miller', completedAt: '09:44 AM' },
            { id: 'pf3', status: 'complete', completedBy: 'David Miller', completedAt: '09:45 AM' },
            { id: 'pf4', status: 'complete', completedBy: 'David Miller', completedAt: '09:46 AM' },
            { id: 'dc1', status: 'complete', completedBy: 'Dispatch', completedAt: '09:30 AM' },
            { id: 'dc2', status: 'complete', completedBy: 'Dispatch', completedAt: '09:31 AM' },
            { id: 'dc3', status: 'complete', completedBy: 'David Miller', completedAt: '09:50 AM' },
            { id: 'dc4', status: 'complete', completedBy: 'David Miller', completedAt: '09:51 AM' },
            { id: 'dc5', status: 'complete', completedBy: 'David Miller', completedAt: '09:51 AM' },
            { id: 'dc6', status: 'complete', completedBy: 'David Miller', completedAt: '09:52 AM' },
            { id: 'wx1', status: 'complete', completedBy: 'Dispatch', completedAt: '09:15 AM' },
            { id: 'wx2', status: 'complete', completedBy: 'Dispatch', completedAt: '09:16 AM' },
            { id: 'wx4', status: 'complete', completedBy: 'Dispatch', completedAt: '09:17 AM' },
            { id: 'wx5', status: 'complete', completedBy: 'Dispatch', completedAt: '09:18 AM' },
            { id: 'sf1', status: 'complete', completedBy: 'David Miller', completedAt: '10:02 AM' },
            { id: 'sf2', status: 'complete', completedBy: 'David Miller', completedAt: '10:03 AM' },
            { id: 'sf3', status: 'complete', completedBy: 'Dispatch', completedAt: '09:00 AM' },
            { id: 'sf4', status: 'complete', completedBy: 'HR', completedAt: 'On file' },
            { id: 'aw1', status: 'complete', completedBy: 'Maint.', completedAt: 'Mar 3' },
            { id: 'aw2', status: 'complete', completedBy: 'Maint.', completedAt: 'Mar 3' },
            { id: 'aw3', status: 'complete', completedBy: 'Maint.', completedAt: 'Mar 3' },
        ]),
    },
    {
        id: 'cf2', tripNumber: 'TRP9912', route: 'KCLT → KMIA',
        date: 'Mar 5, 2024', aircraft: 'N404CA (Gulfstream G550)', pic: 'Capt. Sarah Jenkins',
        status: 'Pre-Flight',
        checklist: makeChecklist([
            { id: 'dc1', status: 'complete', completedBy: 'Dispatch', completedAt: '08:00 AM' },
            { id: 'dc2', status: 'flagged', notes: 'Pax weights not yet received from client' },
            { id: 'wx1', status: 'complete', completedBy: 'Dispatch', completedAt: '07:45 AM' },
            { id: 'sf4', status: 'complete', completedBy: 'HR', completedAt: 'On file' },
        ]),
    },
    {
        id: 'cf3', tripNumber: 'TRP9905', route: 'KCLT → KTEB',
        date: 'Mar 1, 2024', aircraft: 'N101CA (King Air 350)', pic: 'Capt. Sarah Jenkins',
        status: 'Archived',
        checklist: makeChecklist([
            ...['pf1', 'pf2', 'pf3', 'pf4', 'dc1', 'dc2', 'dc3', 'dc4', 'dc5', 'dc6', 'wx1', 'wx2', 'wx4', 'wx5', 'sf1', 'sf2', 'sf3', 'sf4', 'aw1', 'aw2', 'aw3'].map(id => ({
                id, status: 'complete' as CheckStatus, completedBy: 'Crew / Dispatch', completedAt: 'Mar 1',
            })),
        ]),
    },
];

export const AD_ITEMS: AircraftAD[] = [
    { id: 'ad1', tail: 'N101CA', type: 'King Air 350', adNumber: 'AD 2023-12-04', description: 'Elevator Control System Inspection', dueDate: '2024-04-15', dueHours: 2200, currentHours: 2174, status: 'Due Soon' },
    { id: 'ad2', tail: 'N101CA', type: 'King Air 350', adNumber: 'AD 2022-08-09', description: 'Fuel Cap O-Ring Replacement', dueDate: '2024-06-01', dueHours: 2500, currentHours: 2174, status: 'Compliant' },
    { id: 'ad3', tail: 'N202CA', type: 'King Air 350', adNumber: 'AD 2023-12-04', description: 'Elevator Control System Inspection', dueDate: '2024-05-20', dueHours: 1900, currentHours: 1812, status: 'Compliant' },
    { id: 'ad4', tail: 'N303CA', type: 'Citation Latitude', adNumber: 'AD 2024-01-17', description: 'Thrust Reverser Actuator Bracket Inspection', dueDate: '2024-03-10', dueHours: 3100, currentHours: 3108, status: 'Overdue' },
    { id: 'ad5', tail: 'N404CA', type: 'Gulfstream G550', adNumber: 'AD 2023-22-11', description: 'Forward Pressure Bulkhead Inspection', dueDate: '2024-07-01', dueHours: 8200, currentHours: 7900, status: 'Compliant' },
    { id: 'ad6', tail: 'N505CA', type: 'Pilatus PC-12', adNumber: 'AD 2023-15-06', description: 'Main Landing Gear Torque Link Inspection', dueDate: '2024-03-20', dueHours: 4100, currentHours: 4082, status: 'Due Soon' },
];

export const CRM_CLIENTS: CRMClient[] = [
    {
        id: 'cl1', name: 'Marcus Webb', company: 'Webb Capital Group',
        email: 'mwebb@webbcapital.com', phone: '+1 (704) 555-0183',
        tier: 'VIP', totalFlights: 24, totalSpend: 387200, lastFlight: 'Mar 1, 2024',
        avatarColor: '#7c3aed',
        notes: [
            { id: 'n1', date: 'Mar 1, 2024', author: 'Dispatch', text: 'Mr. Webb confirmed return leg for Mar 6. Prefers wifi-equipped aircraft.', type: 'call' },
            { id: 'n2', date: 'Feb 14, 2024', author: 'Sales', text: 'Sent Valentine\'s Day card + $500 FBO waiver voucher.', type: 'note' },
            { id: 'n3', date: 'Jan 28, 2024', author: 'AJ (Ops)', text: 'Called to check in on Q1 travel schedule. Webb planning 6–8 trips this quarter.', type: 'call' },
        ],
    },
    {
        id: 'cl2', name: 'Dr. Priya Patel', company: 'Patel Medical Group',
        email: 'priya@patelmedical.com', phone: '+1 (980) 555-0291',
        tier: 'VIP', totalFlights: 11, totalSpend: 164800, lastFlight: 'Feb 20, 2024',
        avatarColor: '#0891b2',
        notes: [
            { id: 'n4', date: 'Feb 20, 2024', author: 'Dispatch', text: 'Flight completed on time. Dr. Patel requested ground transport coordination next time.', type: 'note' },
            { id: 'n5', date: 'Feb 10, 2024', author: 'Sales', text: 'Sent Q2 pricing sheet and conference schedule.', type: 'email' },
        ],
    },
    {
        id: 'cl3', name: 'Tyler & Kendra Brooks', company: 'Brooks Industries',
        email: 'travel@brooksindustries.com', phone: '+1 (803) 555-0447',
        tier: 'Regular', totalFlights: 6, totalSpend: 48500, lastFlight: 'Jan 15, 2024',
        avatarColor: '#b45309',
        notes: [
            { id: 'n6', date: 'Jan 30, 2024', author: 'AJ (Ops)', text: 'Brooks planning a family ski trip in March. Checking availability on G550.', type: 'call' },
        ],
    },
    {
        id: 'cl4', name: 'LexCorp Events', company: 'LexCorp Events LLC',
        email: 'charter@lexcorp.com', phone: '+1 (212) 555-0055',
        tier: 'Regular', totalFlights: 3, totalSpend: 21000, lastFlight: 'Mar 4, 2024',
        avatarColor: '#065f46',
        notes: [
            { id: 'n7', date: 'Mar 4, 2024', author: 'Dispatch', text: 'Today\'s flight confirmed. Corporate group of 8.', type: 'note' },
        ],
    },
    {
        id: 'cl5', name: 'James Okonkwo', company: '(Individual)',
        email: 'james.ok@gmail.com', phone: '+1 (646) 555-0312',
        tier: 'One-Time', totalFlights: 1, totalSpend: 12400, lastFlight: 'Dec 9, 2023',
        avatarColor: '#9d174d',
        notes: [],
    },
];

export const CRM_TRIPS: CRMTrip[] = [
    {
        id: 'tr1', tripNumber: 'TRP9910', client: 'cl4',
        origin: 'KCLT', destination: 'KTEB', departDate: 'Mar 4, 2024',
        aircraft: 'N101CA — King Air 350', pax: 8, status: 'In Progress',
        totalValue: 11480, paid: true, pic: 'Capt. David Miller',
        notes: 'Corporate group — 8 attendees. FBO at TEB: Meridian.',
        createdAt: 'Feb 28, 2024',
        invoice: [
            { label: 'Charter Rate (1.7 hr × $3,200/hr)', amount: 5440 },
            { label: 'Fuel Surcharge', amount: 630 },
            { label: 'Landing Fee (KTEB)', amount: 550 },
            { label: 'FBO Handling', amount: 200 },
            { label: 'Catering', amount: 960 },
            { label: 'Crew Transport', amount: 300 },
            { label: 'Ramp / Misc', amount: 150 },
            { label: 'Segment Tax (7.5%)', amount: 562 },
            { label: 'Flight Segment Fee', amount: 688 },
        ],
    },
    {
        id: 'tr2', tripNumber: 'TRP9912', client: 'cl1',
        origin: 'KCLT', destination: 'KMIA', departDate: 'Mar 5, 2024',
        aircraft: 'N404CA — Gulfstream G550', pax: 4, status: 'Confirmed',
        totalValue: 23480, paid: false, pic: 'Capt. Sarah Jenkins',
        notes: 'Webb + 3 guests. Catering: steak lunch for 4. FBO: Shelt Air MIA.',
        createdAt: 'Feb 29, 2024',
        invoice: [
            { label: 'Charter Rate (1.9 hr × $8,500/hr)', amount: 16150 },
            { label: 'Fuel Surcharge', amount: 1890 },
            { label: 'Landing Fee (KMIA)', amount: 720 },
            { label: 'FBO Handling', amount: 350 },
            { label: 'Catering (steak lunch × 4)', amount: 1400 },
            { label: 'Segment Tax (7.5%)', amount: 1421 },
            { label: 'Flight Segment Fee', amount: 1549 },
        ],
    },
    {
        id: 'tr3', tripNumber: 'TRP9915', client: 'cl3',
        origin: 'KCLT', destination: 'KLAS', departDate: 'Mar 14, 2024',
        aircraft: 'N404CA — Gulfstream G550', pax: 6, status: 'Quoted',
        totalValue: 39200, paid: false, pic: 'TBD',
        notes: 'Family ski trip with Brooks group. Quote not yet accepted.',
        createdAt: 'Mar 4, 2024',
        invoice: [
            { label: 'Charter Rate (5.7 hr × $8,500/hr)', amount: 34200 },
            { label: 'Fuel Surcharge', amount: 2800 },
            { label: 'Landing Fee (KLAS)', amount: 480 },
            { label: 'FBO Handling', amount: 250 },
            { label: 'Catering', amount: 1200 },
            { label: 'Ramp / Misc', amount: 270 },
        ],
    },
    {
        id: 'tr4', tripNumber: 'TRP9905', client: 'cl1',
        origin: 'KCLT', destination: 'KTEB', departDate: 'Mar 1, 2024',
        aircraft: 'N101CA — King Air 350', pax: 3, status: 'Completed',
        totalValue: 8900, paid: true, pic: 'Capt. Sarah Jenkins',
        notes: 'Routine Webb trip. Return same day.',
        createdAt: 'Feb 25, 2024',
        invoice: [
            { label: 'Charter Rate (1.7 hr × $3,200/hr)', amount: 5440 },
            { label: 'Fuel Surcharge', amount: 540 },
            { label: 'Landing Fee', amount: 450 },
            { label: 'FBO Handling', amount: 200 },
            { label: 'Segment Tax', amount: 448 },
            { label: 'Flight Segment Fee', amount: 1822 },
        ],
    },
    {
        id: 'tr5', tripNumber: 'TRP9908', client: 'cl2',
        origin: 'KCLT', destination: 'KBOS', departDate: 'Feb 20, 2024',
        aircraft: 'N303CA — Citation Latitude', pax: 2, status: 'Completed',
        totalValue: 14200, paid: true, pic: 'Capt. Michael Chang',
        notes: 'Patel medical conference. Return Feb 22.',
        createdAt: 'Feb 12, 2024',
        invoice: [
            { label: 'Charter Rate (2.7 hr × $4,500/hr)', amount: 12150 },
            { label: 'Fuel Surcharge', amount: 970 },
            { label: 'Landing Fee', amount: 380 },
            { label: 'FBO Handling', amount: 200 },
            { label: 'Segment Tax', amount: 500 },
        ],
    },
];

export const EMPTY_LEGS: EmptyLeg[] = [
    {
        id: 'el1', tripNumber: 'TRP9910-R', origin: 'KTEB', originCity: 'Teterboro',
        destination: 'KCLT', destinationCity: 'Charlotte', departDate: 'Mar 4, 2024',
        departTime: '3:30 PM', aircraft: 'King Air 350', aircraftType: 'Turboprop',
        seats: 9, originalPrice: 11480, discountPct: 40, hoursUntilDep: 7,
        status: 'Available', tailNumber: 'N101CA', flightHours: 1.7,
        amenities: ['WiFi', 'Refreshments', 'USB Charging'],
        generated: true,
    },
    {
        id: 'el2', tripNumber: 'TRP9912-R', origin: 'KMIA', originCity: 'Miami',
        destination: 'KCLT', destinationCity: 'Charlotte', departDate: 'Mar 5, 2024',
        departTime: '5:00 PM', aircraft: 'Gulfstream G550', aircraftType: 'Heavy Jet',
        seats: 12, originalPrice: 23480, discountPct: 35, hoursUntilDep: 31,
        status: 'Pending Inquiry', tailNumber: 'N404CA', flightHours: 1.9,
        amenities: ['WiFi', 'Full Galley', 'Satellite Phone', 'Lie-Flat Seats', 'USB Charging'],
        generated: true,
    },
    {
        id: 'el3', tripNumber: 'TRP9908-R', origin: 'KBOS', originCity: 'Boston',
        destination: 'KCLT', destinationCity: 'Charlotte', departDate: 'Mar 6, 2024',
        departTime: '10:00 AM', aircraft: 'Citation Latitude', aircraftType: 'Midsize Jet',
        seats: 9, originalPrice: 14200, discountPct: 30, hoursUntilDep: 52,
        status: 'Available', tailNumber: 'N303CA', flightHours: 2.7,
        amenities: ['WiFi', 'Refreshments', 'USB Charging', 'Lavatory'],
        generated: true,
    },
    {
        id: 'el4', tripNumber: 'TRP9920-R', origin: 'KCLT', originCity: 'Charlotte',
        destination: 'KPBI', destinationCity: 'Palm Beach', departDate: 'Mar 8, 2024',
        departTime: '8:00 AM', aircraft: 'King Air 350', aircraftType: 'Turboprop',
        seats: 9, originalPrice: 8900, discountPct: 45, hoursUntilDep: 96,
        status: 'Available', tailNumber: 'N202CA', flightHours: 1.4,
        amenities: ['Refreshments', 'USB Charging'],
        generated: false,
    },
];
