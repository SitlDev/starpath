const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth Middleware (Simplistic for Prototype)
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = authHeader.split(' ')[1];
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'Invalid Token' });
    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: 'Auth Error' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access Denied: Insufficient Permissions' });
    }
    next();
  };
};

// --- Auth Endpoints ---

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // In a real app, generate a JWT. Here we return the ID as the "token".
    res.json({ token: user.id, user: { name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/me', authenticate, (req, res) => {
  res.json(req.user);
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    // Basic validation
    if (!name || !email || !password || !company) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists. Please log in.' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In a production app, hash this using bcrypt
        role: 'Dispatcher', // Default admin role for new founders
      }
    });

    res.json({ token: user.id, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to format dates for frontend
const formatDate = (date) => date ? date.toISOString().split('T')[0] : null;

// Fleet API
app.get('/api/fleet', async (req, res) => {
  try {
    const fleet = await prisma.aircraft.findMany();
    const transformed = fleet.map(a => ({
      id: a.id,
      tailNumber: a.tailNumber,
      type: a.type,
      status: a.status,
      base: a.baseAirport
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule API
app.get('/api/schedule', async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: { aircraft: true, client: true, pic: true, sic: true }
    });
    const transformed = flights.map(f => ({
      id: f.id,
      trip: f.tripNumber,
      origin: f.origin,
      dest: f.destination,
      dep: f.departureTime.toISOString().replace('T', ' ').substring(0, 16),
      arr: f.arrivalTime.toISOString().replace('T', ' ').substring(0, 16),
      status: f.status,
      tail: f.aircraft?.tailNumber || 'TBD',
      aircraftId: f.aircraftId,
      pic: f.pic?.name || 'Unassigned',
      picId: f.picId,
      sic: f.sic?.name || 'Unassigned',
      sicId: f.sicId,
      client: f.client?.name || 'Unknown'
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crew API
app.get('/api/crew', async (req, res) => {
  try {
    const crew = await prisma.crewMember.findMany({
      include: {
        certificates: true,
        flightsPic: { take: 3, orderBy: { departureTime: 'desc' } },
        flightsSic: { take: 3, orderBy: { departureTime: 'desc' } }
      }
    });

    const transformed = crew.map(c => {
      const flights = [...c.flightsPic, ...c.flightsSic]
        .sort((a, b) => b.departureTime - a.departureTime)
        .slice(0, 3)
        .map(f => ({
          trip: f.tripNumber,
          date: f.departureTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          route: `${f.origin} → ${f.destination}`,
          hours: 2.0 // Mock hours
        }));

      return {
        id: c.id,
        name: c.name,
        role: c.role,
        email: c.email,
        phone: c.phone || 'N/A',
        certExpiry: formatDate(c.certExpiry),
        medicalExpiry: formatDate(c.medicalExpiry),
        totalFlightHours: c.totalFlightHours,
        last30DayHours: c.last30DayHours,
        last90DayHours: c.last90DayHours,
        calendarYearHours: c.calendarYearHours,
        lastDutyStart: c.lastDutyStart,
        lastRestEnd: c.lastRestEnd,
        status: c.status,
        certificates: c.certificates.map(cert => ({
          name: cert.name,
          number: cert.number,
          expiry: formatDate(cert.expiry)
        })),
        recentFlights: flights
      };
    });

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clients API
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: { notes: true }
    });
    const transformed = clients.map(c => ({
      id: c.id,
      name: c.name,
      company: c.company || '',
      email: c.email,
      phone: c.phone || '',
      tier: c.tier,
      totalFlights: c.totalFlights,
      totalSpend: c.totalSpend,
      lastFlight: c.lastFlightDate ? c.lastFlightDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None',
      avatarColor: c.avatarColor,
      notes: c.notes.map(n => ({
        id: n.id,
        date: n.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: n.author,
        text: n.text,
        type: n.type
      }))
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { name, company, email, phone, tier } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Avatar color generation logic
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const client = await prisma.client.create({
      data: {
        name,
        company,
        email,
        phone,
        tier: tier || 'Regular',
        avatarColor
      }
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trips (CRM) API
app.get('/api/trips', async (req, res) => {
  try {
    const trips = await prisma.flight.findMany({
      include: { aircraft: true, pic: true }
    });
    const transformed = trips.map(t => ({
      id: t.id,
      tripNumber: t.tripNumber,
      client: t.clientId,
      origin: t.origin,
      destination: t.destination,
      departDate: t.departureTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      aircraft: t.aircraft ? `${t.aircraft.tailNumber} — ${t.aircraft.type}` : 'TBD',
      pax: t.paxCount,
      status: t.status === 'IN_PROGRESS' ? 'In Progress' :
        t.status === 'QUOTED' ? 'Quoted' :
          t.status === 'SCHEDULED' ? 'Confirmed' : 'Completed',
      totalValue: t.totalPrice || 0,
      paid: t.paid,
      pic: t.pic?.name || 'TBD',
      notes: t.cateringNotes || '',
      invoice: t.invoice ? JSON.parse(t.invoice) : [],
      createdAt: formatDate(t.createdAt)
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compliance API
app.get('/api/compliance', async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: { aircraft: true, pic: true, checklist: true }
    });
    const transformed = flights.map(f => ({
      id: f.id,
      tripNumber: f.tripNumber,
      route: `${f.origin} → ${f.destination}`,
      date: f.departureTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      aircraft: f.aircraft ? `${f.aircraft.tailNumber} (${f.aircraft.type})` : 'TBD',
      pic: f.pic?.name || 'TBD',
      status: f.status === 'IN_PROGRESS' ? 'In Progress' : 'Pre-Flight',
      checklist: f.checklist.map(i => ({
        id: i.id,
        label: i.label,
        category: i.category,
        status: i.status,
        required: i.required,
        completedBy: i.completedBy,
        completedAt: i.completedAt,
        notes: i.notes
      }))
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AD Items API
app.get('/api/ads', async (req, res) => {
  try {
    const ads = await prisma.aDItem.findMany({
      include: { aircraft: true }
    });
    const transformed = ads.map(ad => ({
      id: ad.id,
      tail: ad.aircraft.tailNumber,
      type: ad.aircraft.type,
      adNumber: ad.adNumber,
      description: ad.description,
      dueDate: formatDate(ad.dueDate),
      dueHours: ad.dueHours,
      currentHours: 2174, // Mock current hours
      status: ad.status
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Empty Legs API
app.get('/api/legs', async (req, res) => {
  try {
    const legs = await prisma.emptyLeg.findMany();
    const transformed = legs.map(l => ({
      id: l.id,
      tripNumber: l.tripNumber,
      origin: l.origin,
      originCity: l.originCity,
      destination: l.destination,
      destinationCity: l.destinationCity,
      departDate: l.departDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      departTime: l.departTime,
      seats: l.seats,
      originalPrice: l.originalPrice,
      discountPct: l.discountPct,
      status: l.status,
      tailNumber: l.tailNumber,
      flightHours: l.flightHours,
      amenities: l.amenities ? l.amenities.split(', ') : [],
      generated: l.generated,
      hoursUntilDep: 12 // Mock
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pricing Rates API
app.get('/api/rates', async (req, res) => {
  try {
    const rules = await prisma.pricingRule.findMany();
    const transformed = rules.map(r => ({
      type: r.aircraftType,
      baseHourlyRate: r.baseHourlyRate,
      capacity: r.aircraftType.includes('G550') ? 16 : r.aircraftType.includes('King') ? 8 : 6,
      speedKnots: r.aircraftType.includes('G550') ? 488 : r.aircraftType.includes('King') ? 310 : 270
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route Distances API
app.get('/api/distances', async (req, res) => {
  try {
    const distances = await prisma.routeDistance.findMany();
    const dict = {};
    distances.forEach(d => {
      dict[d.route] = d.distance;
    });
    res.json(dict);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fuel Burn API
app.get('/api/fuel-burn', async (req, res) => {
  try {
    const rules = await prisma.pricingRule.findMany();
    const dict = {};
    rules.forEach(r => {
      dict[r.aircraftType] = r.fuelBurnEntry;
    });
    res.json(dict);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Mutations ---

// Update Checklist Item Status
app.patch('/api/checklist/:itemId', authenticate, requireRole(['Pilot', 'Dispatcher']), async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status, remarks } = req.body;
    const updated = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        status: status,
        notes: remarks,
        completedAt: status === 'complete' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        completedBy: status === 'complete' ? req.user.name : null
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add CRM Note
app.post('/api/clients/:clientId/notes', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { clientId } = req.params;
    const { text, type } = req.body;
    const note = await prisma.cRMNote.create({
      data: {
        author: req.user.name,
        text,
        type,
        clientId
      }
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Flight Status
app.patch('/api/flights/:id/status', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.flight.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Flight Details
app.get('/api/flights/:id', authenticate, async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
      include: { aircraft: true, client: true, pic: true, sic: true }
    });
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Flight Details
app.patch('/api/flights/:id', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { departureTime, arrivalTime, origin, destination, paxCount, cateringNotes, status, paid } = req.body;

    const updateData = {};
    if (departureTime) updateData.departureTime = new Date(departureTime);
    if (arrivalTime) updateData.arrivalTime = new Date(arrivalTime);
    if (origin) updateData.origin = origin;
    if (destination) updateData.destination = destination;
    if (paxCount !== undefined) updateData.paxCount = paxCount;
    if (cateringNotes !== undefined) updateData.cateringNotes = cateringNotes;
    if (status) updateData.status = status;
    if (paid !== undefined) updateData.paid = paid;

    const updated = await prisma.flight.update({
      where: { id },
      data: updateData
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign Crew to Flight
app.patch('/api/flights/:id/crew', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, crewId } = req.body; // role should be 'pic' or 'sic'

    // In a full system we would check duty limits and certifications here.

    const updateData = {};
    if (role.toLowerCase() === 'pic') updateData.picId = crewId;
    if (role.toLowerCase() === 'sic') updateData.sicId = crewId;

    const updated = await prisma.flight.update({
      where: { id },
      data: updateData
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reassign Aircraft to Flight with Overlap Protection
app.patch('/api/flights/:id/aircraft', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { aircraftId } = req.body;

    // 1. Fetch current flight details
    const targetFlight = await prisma.flight.findUnique({ where: { id } });
    if (!targetFlight) return res.status(404).json({ error: 'Flight not found' });

    // 2. Check for overlaps on the new aircraft
    const overlaps = await prisma.flight.findMany({
      where: {
        aircraftId: aircraftId,
        id: { not: id },
        AND: [
          { departureTime: { lt: targetFlight.arrivalTime } },
          { arrivalTime: { gt: targetFlight.departureTime } }
        ]
      }
    });

    if (overlaps.length > 0) {
      return res.status(400).json({
        error: 'Scheduling Conflict',
        details: `Aircraft is already booked for Trip ${overlaps[0].tripNumber} during this time.`
      });
    }

    // 3. Update the aircraft assignment
    const updated = await prisma.flight.update({
      where: { id },
      data: { aircraftId }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Flight (Save Quote)
app.post('/api/flights', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { origin, destination, aircraft, paxCount, totalPrice, tripNumber } = req.body;

    // Find aircraft by name/type or just use a default for mock saving
    const ac = await prisma.aircraft.findFirst({ where: { type: aircraft } });

    const flight = await prisma.flight.create({
      data: {
        tripNumber: tripNumber || `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        origin,
        destination,
        departureTime: new Date(Date.now() + 86400000), // Tomorrow
        arrivalTime: new Date(Date.now() + 86400000 + 7200000), // +2 hrs
        paxCount: parseInt(paxCount) || 1,
        status: 'QUOTED',
        totalPrice,
        aircraftId: ac?.id
      }
    });
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('CharterBook API is running with full persistence and mutations');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
