const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing old data...');
    await prisma.user.deleteMany();
    await prisma.checklistItem.deleteMany();
    await prisma.cRMNote.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.client.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.crewMember.deleteMany();
    await prisma.aDItem.deleteMany();
    await prisma.aircraft.deleteMany();
    await prisma.emptyLeg.deleteMany();
    await prisma.routeDistance.deleteMany();
    await prisma.pricingRule.deleteMany();

    // 0. Create Users
    await prisma.user.create({
        data: {
            email: 'admin@charterbook.com',
            password: 'password123',
            name: 'Coastal Dispatch',
            role: 'Dispatcher'
        }
    });
    await prisma.user.create({
        data: {
            email: 'pilot@charterbook.com',
            password: 'password123',
            name: 'Capt. David Miller',
            role: 'Pilot'
        }
    });

    // 1. Create Aircraft
    const aircraftData = [
        { tailNumber: 'N101CA', type: 'King Air 350', capacity: 8, baseAirport: 'KCLT', hourlyRate: 3200, status: 'Airworthy' },
        { tailNumber: 'N202CA', type: 'King Air 350', capacity: 8, baseAirport: 'KCLT', hourlyRate: 3200, status: 'Airworthy' },
        { tailNumber: 'N303CA', type: 'Citation Latitude', capacity: 9, baseAirport: 'KCLT', hourlyRate: 4500, status: 'Maintenance' },
        { tailNumber: 'N404CA', type: 'Gulfstream G550', capacity: 16, baseAirport: 'KCLT', hourlyRate: 8500, status: 'Airworthy' },
        { tailNumber: 'N505CA', type: 'Pilatus PC-12', capacity: 6, baseAirport: 'KCLT', hourlyRate: 2100, status: 'Airworthy' },
    ];

    const dbAircraft = [];
    for (const data of aircraftData) {
        const a = await prisma.aircraft.create({ data });
        dbAircraft.push(a);
    }

    // 2. Create Crew
    const crewData = [
        {
            name: 'Capt. Sarah Jenkins', role: 'PIC', email: 's.jenkins@coastalair.com', phone: '704-555-0110',
            certExpiry: new Date('2026-12-31'), medicalExpiry: new Date('2026-06-30'),
            totalFlightHours: 8500, last30DayHours: 62, last90DayHours: 201, calendarYearHours: 680,
            status: 'Available',
            certificates: {
                create: [
                    { name: 'ATP Certificate', number: 'ATP1234567', expiry: new Date('2026-12-31') },
                    { name: 'King Air 350 Type Rating', number: 'TR-KA350-004', expiry: new Date('2026-08-15') }
                ]
            }
        },
        {
            name: 'Capt. David Miller', role: 'PIC', email: 'd.miller@coastalair.com', phone: '704-555-0211',
            certExpiry: new Date('2027-03-15'), medicalExpiry: new Date('2026-09-20'),
            totalFlightHours: 12000, last30DayHours: 88, last90DayHours: 195, calendarYearHours: 890,
            status: 'On Duty'
        },
        {
            name: 'FO Amanda Ross', role: 'SIC', email: 'a.ross@coastalair.com', phone: '704-555-0312',
            certExpiry: new Date('2026-10-10'), medicalExpiry: new Date('2026-05-15'),
            totalFlightHours: 1800, last30DayHours: 34, last90DayHours: 122, calendarYearHours: 290,
            status: 'On Duty'
        }
    ];

    const dbCrew = [];
    for (const data of crewData) {
        const c = await prisma.crewMember.create({ data });
        dbCrew.push(c);
    }

    // 3. Create Clients & Notes
    const clientsData = [
        {
            name: 'Marcus Webb', company: 'Webb Capital Group', email: 'mwebb@webbcapital.com',
            phone: '+1 (704) 555-0183', tier: 'VIP', totalFlights: 24, totalSpend: 387200,
            avatarColor: '#7c3aed', lastFlightDate: new Date('2024-03-01'),
            notes: {
                create: [
                    { author: 'Dispatch', type: 'call', text: 'Mr. Webb confirmed return leg for Mar 6. Prefers wifi-equipped aircraft.' },
                    { author: 'Sales', type: 'note', text: 'Sent Valentine\'s Day card + $500 FBO waiver voucher.' },
                ]
            }
        },
        {
            name: 'Dr. Priya Patel', company: 'Patel Medical Group', email: 'priya@patelmedical.com',
            phone: '+1 (980) 555-0291', tier: 'VIP', totalFlights: 11, totalSpend: 164800,
            avatarColor: '#0891b2', lastFlightDate: new Date('2024-02-20'),
            notes: {
                create: [
                    { author: 'Dispatch', type: 'note', text: 'Flight completed on time. Dr. Patel requested ground transport coordination next time.' }
                ]
            }
        },
        {
            name: 'LexCorp Events', company: 'LexCorp Events LLC', email: 'charter@lexcorp.com',
            phone: '+1 (212) 555-0055', tier: 'Regular', totalFlights: 3, totalSpend: 21000,
            avatarColor: '#065f46', lastFlightDate: new Date('2024-03-04')
        }
    ];

    const dbClients = [];
    for (const data of clientsData) {
        const c = await prisma.client.create({ data });
        dbClients.push(c);
    }

    // 4. Create Flights & Checklists
    const flightsData = [
        {
            tripNumber: 'TRP9910', origin: 'KCLT', destination: 'KTEB',
            departureTime: new Date('2024-03-04T10:00:00Z'), arrivalTime: new Date('2024-03-04T11:30:00Z'),
            paxCount: 8, status: 'IN_PROGRESS', paid: true, totalPrice: 11480,
            aircraftId: dbAircraft.find(a => a.tailNumber === 'N101CA').id,
            clientId: dbClients.find(c => c.name === 'LexCorp Events').id,
            picId: dbCrew.find(c => c.name === 'Capt. David Miller').id,
            sicId: dbCrew.find(c => c.name === 'FO Amanda Ross').id,
            invoice: JSON.stringify([
                { label: 'Charter Rate (1.7 hr × $3,200/hr)', amount: 5440 },
                { label: 'Fuel Surcharge', amount: 630 },
                { label: 'Landing Fee (KTEB)', amount: 550 }
            ]),
            checklist: {
                create: [
                    { label: 'Aircraft walkaround completed', category: 'preflight', status: 'complete', completedBy: 'David Miller', completedAt: '09:42 AM' },
                    { label: 'Fuel quantity verified', category: 'preflight', status: 'complete', completedBy: 'David Miller', completedAt: '09:44 AM' },
                    { label: 'Weight & Balance calculated', category: 'document', status: 'complete', completedBy: 'David Miller', completedAt: '09:50 AM' },
                    { label: 'Passenger manifest signed', category: 'document', status: 'complete', completedBy: 'Dispatch', completedAt: '09:30 AM' },
                ]
            }
        },
        {
            tripNumber: 'TRP9912', origin: 'KCLT', destination: 'KMIA',
            departureTime: new Date('2024-03-05T09:00:00Z'), arrivalTime: new Date('2024-03-05T11:15:00Z'),
            paxCount: 4, status: 'SCHEDULED', paid: false, totalPrice: 23480,
            aircraftId: dbAircraft.find(a => a.tailNumber === 'N404CA').id,
            clientId: dbClients.find(c => c.name === 'Marcus Webb').id,
            picId: dbCrew.find(c => c.name === 'Capt. Sarah Jenkins').id,
            checklist: {
                create: [
                    { label: 'Weight & Balance calculated', category: 'document', status: 'flagged', notes: 'Pax weights not yet received from client' },
                    { label: 'Dispatch weather briefing logged', category: 'weather', status: 'complete', completedBy: 'Dispatch', completedAt: '07:45 AM' },
                ]
            }
        }
    ];

    for (const data of flightsData) {
        await prisma.flight.create({ data });
    }

    // 5. Create ADItems
    const adData = [
        { adNumber: 'AD 2023-12-04', description: 'Elevator Control System Inspection', dueDate: new Date('2024-04-15'), dueHours: 2200, status: 'Due Soon', aircraftId: dbAircraft.find(a => a.tailNumber === 'N101CA').id },
        { adNumber: 'AD 2024-01-17', description: 'Thrust Reverser Actuator Bracket Inspection', dueDate: new Date('2024-03-10'), dueHours: 3100, status: 'Overdue', aircraftId: dbAircraft.find(a => a.tailNumber === 'N303CA').id },
    ];

    for (const data of adData) {
        await prisma.aDItem.create({ data });
    }

    // 6. Empty Legs
    const emptyLegsData = [
        {
            tripNumber: 'TRP9910-R', origin: 'KTEB', originCity: 'Teterboro',
            destination: 'KCLT', destinationCity: 'Charlotte',
            departDate: new Date('2024-03-04'), departTime: '3:30 PM',
            seats: 9, originalPrice: 11480, discountPct: 40,
            status: 'Available', tailNumber: 'N101CA', flightHours: 1.7,
            amenities: 'WiFi, Refreshments, USB Charging'
        }
    ];

    for (const data of emptyLegsData) {
        await prisma.emptyLeg.create({ data });
    }

    // 7. Route Distances
    const distances = [
        { route: 'KCLT-KTEB', distance: 521 },
        { route: 'KCLT-KMIA', distance: 579 },
        { route: 'KCLT-KLAS', distance: 1761 },
    ];

    for (const data of distances) {
        await prisma.routeDistance.create({ data });
    }

    // 8. Pricing Rules
    const pricingRules = [
        { aircraftType: 'King Air 350', baseHourlyRate: 3200, fuelBurnEntry: 102 },
        { aircraftType: 'Citation Latitude', baseHourlyRate: 4500, fuelBurnEntry: 180 },
        { aircraftType: 'Gulfstream G550', baseHourlyRate: 8500, fuelBurnEntry: 380 },
        { aircraftType: 'Pilatus PC-12', baseHourlyRate: 2100, fuelBurnEntry: 60 },
    ];

    for (const data of pricingRules) {
        await prisma.pricingRule.create({ data });
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
