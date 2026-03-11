const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── TENANT RESOLUTION MIDDLEWARE ─────────────────────────────────────────────
// Determines which tenant (operator) owns this request.
//
// Resolution order:
//   1. x-tenant-id header (dev/API/mobile clients)
//   2. Subdomain: acme-air.charterbook.app  →  slug "acme-air"
//   3. Custom domain: ops.acmeair.com  →  Tenant.domain lookup
//   4. Dev fallback: if localhost, use first tenant in DB (convenience)
//
// Skipped for: POST /api/signup (tenant doesn't exist yet)

const SKIP_TENANT_PATHS = ['/api/signup', '/api/health', '/', '/api/super-admin'];

const resolveTenant = async (req, res, next) => {
  // Skip tenant resolution for public / cross-tenant routes
  if (SKIP_TENANT_PATHS.some(p => req.path === p || req.path.startsWith(p + '/'))) {
    return next();
  }

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    const tenantHeader = req.headers['x-tenant-id'];
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    let tenant = null;

    if (tenantHeader) {
      // Explicit header wins — great for dev, API clients, mobile apps
      tenant = await prisma.tenant.findUnique({ where: { slug: tenantHeader } });
    } else if (!isLocalhost) {
      // Production: resolve by subdomain or custom domain
      const subdomain = host.split('.')[0];
      tenant = await prisma.tenant.findFirst({
        where: { OR: [{ slug: subdomain }, { domain: host }] },
      });
    } else {
      // Dev fallback: just use the first tenant in the database
      tenant = await prisma.tenant.findFirst();
    }

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        hint: 'Check the x-tenant-id header or your organization URL.',
      });
    }

    req.tenant = tenant;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Tenant resolution failed', detail: err.message });
  }
};

app.use(resolveTenant);

// ─── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = authHeader.split(' ')[1];
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'Invalid Token' });
    // Verify user belongs to the resolved tenant
    if (user.tenantId && req.tenant && user.tenantId !== req.tenant.id) {
      return res.status(403).json({ error: 'Access Denied: User does not belong to this tenant' });
    }
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

// ─── AUTH ENDPOINTS ────────────────────────────────────────────────────────────

// POST /api/login — tenant-scoped user lookup
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email within this specific tenant
    const user = await prisma.user.findFirst({
      where: { email, tenantId: req.tenant.id },
    });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({
      token: user.id,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/me
app.get('/api/me', authenticate, (req, res) => {
  res.json(req.user);
});

// POST /api/signup — creates a new Tenant + root Admin user in one step
// Note: resolveTenant is skipped for this route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, company, companySlug, primaryColor } = req.body;

    if (!name || !email || !password || !company) {
      return res.status(400).json({ error: 'Name, email, password, and company are required' });
    }

    // Auto-generate a slug from company name if not provided
    const slug = (companySlug || company)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      return res.status(400).json({ error: `The company URL "${slug}" is already taken. Try a different company name.` });
    }

    // Check email uniqueness (within the about-to-be-created tenant scope is impossible
    // before the tenant exists, so just check globally for now)
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please log in.' });
    }

    // 1. Create the tenant
    const tenant = await prisma.tenant.create({
      data: {
        slug,
        companyName: company,
        primaryColor: primaryColor || '#7c3aed',
        plan: 'starter',
      },
    });

    // 2. Create the root admin user scoped to this tenant
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // ⚠️ Hash with bcrypt in production
        role: 'Dispatcher',
        tenantId: tenant.id,
      },
    });

    res.json({
      token: user.id,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
      tenant: { slug: tenant.slug, companyName: tenant.companyName, primaryColor: tenant.primaryColor },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tenant/branding — public endpoint, returns branding for the resolved tenant
app.get('/api/tenant/branding', (req, res) => {
  res.json({
    slug: req.tenant.slug,
    companyName: req.tenant.companyName,
    logoUrl: req.tenant.logoUrl || null,
    primaryColor: req.tenant.primaryColor,
    plan: req.tenant.plan,
  });
});

// Helper
const formatDate = (date) => date ? date.toISOString().split('T')[0] : null;

// ─── FLEET API ─────────────────────────────────────────────────────────────────
app.get('/api/fleet', async (req, res) => {
  try {
    const fleet = await prisma.aircraft.findMany({
      where: { tenantId: req.tenant.id },
    });
    const transformed = fleet.map(a => ({
      id: a.id,
      tailNumber: a.tailNumber,
      type: a.type,
      status: a.status,
      base: a.baseAirport,
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SCHEDULE API ──────────────────────────────────────────────────────────────
app.get('/api/schedule', async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      where: { tenantId: req.tenant.id },
      include: { aircraft: true, client: true, pic: true, sic: true },
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
      client: f.client?.name || 'Unknown',
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CREW API ──────────────────────────────────────────────────────────────────
app.get('/api/crew', async (req, res) => {
  try {
    const crew = await prisma.crewMember.findMany({
      where: { tenantId: req.tenant.id },
      include: {
        certificates: true,
        flightsPic: { take: 3, orderBy: { departureTime: 'desc' } },
        flightsSic: { take: 3, orderBy: { departureTime: 'desc' } },
      },
    });

    const transformed = crew.map(c => {
      const flights = [...c.flightsPic, ...c.flightsSic]
        .sort((a, b) => b.departureTime - a.departureTime)
        .slice(0, 3)
        .map(f => ({
          trip: f.tripNumber,
          date: f.departureTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          route: `${f.origin} → ${f.destination}`,
          hours: 2.0,
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
          expiry: formatDate(cert.expiry),
        })),
        recentFlights: flights,
      };
    });

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CLIENTS API ───────────────────────────────────────────────────────────────
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { tenantId: req.tenant.id },
      include: { notes: true },
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
      lastFlight: c.lastFlightDate
        ? c.lastFlightDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'None',
      avatarColor: c.avatarColor,
      notes: c.notes.map(n => ({
        id: n.id,
        date: n.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: n.author,
        text: n.text,
        type: n.type,
      })),
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
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const client = await prisma.client.create({
      data: { name, company, email, phone, tier: tier || 'Regular', avatarColor, tenantId: req.tenant.id },
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── TRIPS (CRM) API ───────────────────────────────────────────────────────────
app.get('/api/trips', async (req, res) => {
  try {
    const trips = await prisma.flight.findMany({
      where: { tenantId: req.tenant.id },
      include: { aircraft: true, pic: true },
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
      status: t.status === 'IN_PROGRESS' ? 'In Progress'
        : t.status === 'QUOTED' ? 'Quoted'
          : t.status === 'SCHEDULED' ? 'Confirmed'
            : 'Completed',
      totalValue: t.totalPrice || 0,
      paid: t.paid,
      pic: t.pic?.name || 'TBD',
      notes: t.cateringNotes || '',
      invoice: t.invoice ? JSON.parse(t.invoice) : [],
      createdAt: formatDate(t.createdAt),
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── COMPLIANCE API ────────────────────────────────────────────────────────────
app.get('/api/compliance', async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      where: { tenantId: req.tenant.id },
      include: { aircraft: true, pic: true, checklist: true },
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
        notes: i.notes,
      })),
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── AD ITEMS API ──────────────────────────────────────────────────────────────
// ADItems belong to Aircraft which belong to a tenant — filter via relation
app.get('/api/ads', async (req, res) => {
  try {
    const ads = await prisma.aDItem.findMany({
      where: { aircraft: { tenantId: req.tenant.id } },
      include: { aircraft: true },
    });
    const transformed = ads.map(ad => ({
      id: ad.id,
      tail: ad.aircraft.tailNumber,
      type: ad.aircraft.type,
      adNumber: ad.adNumber,
      description: ad.description,
      dueDate: formatDate(ad.dueDate),
      dueHours: ad.dueHours,
      currentHours: 2174,
      status: ad.status,
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── EMPTY LEGS API ────────────────────────────────────────────────────────────
app.get('/api/legs', async (req, res) => {
  try {
    const legs = await prisma.emptyLeg.findMany({
      where: { tenantId: req.tenant.id },
    });
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
      hoursUntilDep: 12,
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── PRICING RATES API ─────────────────────────────────────────────────────────
app.get('/api/rates', async (req, res) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      where: { tenantId: req.tenant.id },
    });
    const transformed = rules.map(r => ({
      type: r.aircraftType,
      baseHourlyRate: r.baseHourlyRate,
      capacity: r.aircraftType.includes('G550') ? 16 : r.aircraftType.includes('King') ? 8 : 6,
      speedKnots: r.aircraftType.includes('G550') ? 488 : r.aircraftType.includes('King') ? 310 : 270,
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── ROUTE DISTANCES API ───────────────────────────────────────────────────────
// Global shared data — not tenant-specific
app.get('/api/distances', async (req, res) => {
  try {
    const distances = await prisma.routeDistance.findMany();
    const dict = {};
    distances.forEach(d => { dict[d.route] = d.distance; });
    res.json(dict);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── FUEL BURN API ─────────────────────────────────────────────────────────────
app.get('/api/fuel-burn', async (req, res) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      where: { tenantId: req.tenant.id },
    });
    const dict = {};
    rules.forEach(r => { dict[r.aircraftType] = r.fuelBurnEntry; });
    res.json(dict);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── MUTATIONS ─────────────────────────────────────────────────────────────────

// Update Checklist Item Status
app.patch('/api/checklist/:itemId', authenticate, requireRole(['Pilot', 'Dispatcher']), async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status, remarks } = req.body;
    // Verify item belongs to a flight owned by this tenant
    const item = await prisma.checklistItem.findFirst({
      where: { id: itemId, flight: { tenantId: req.tenant.id } },
    });
    if (!item) return res.status(404).json({ error: 'Checklist item not found' });

    const updated = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        status,
        notes: remarks,
        completedAt: status === 'complete' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        completedBy: status === 'complete' ? req.user.name : null,
      },
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
    // Verify client belongs to this tenant
    const client = await prisma.client.findFirst({
      where: { id: clientId, tenantId: req.tenant.id },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const note = await prisma.cRMNote.create({
      data: { author: req.user.name, text, type, clientId },
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
      where: { id, tenantId: req.tenant.id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Flight Details
app.get('/api/flights/:id', authenticate, async (req, res) => {
  try {
    const flight = await prisma.flight.findFirst({
      where: { id: req.params.id, tenantId: req.tenant.id },
      include: { aircraft: true, client: true, pic: true, sic: true },
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
      where: { id, tenantId: req.tenant.id },
      data: updateData,
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
    const { role, crewId } = req.body;

    // Verify both flight and crew belong to this tenant
    const [flight, crew] = await Promise.all([
      prisma.flight.findFirst({ where: { id, tenantId: req.tenant.id } }),
      prisma.crewMember.findFirst({ where: { id: crewId, tenantId: req.tenant.id } }),
    ]);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    if (!crew) return res.status(404).json({ error: 'Crew member not found' });

    const updateData = {};
    if (role.toLowerCase() === 'pic') updateData.picId = crewId;
    if (role.toLowerCase() === 'sic') updateData.sicId = crewId;

    const updated = await prisma.flight.update({ where: { id }, data: updateData });
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

    // 1. Verify flight and aircraft both belong to this tenant
    const [targetFlight, aircraft] = await Promise.all([
      prisma.flight.findFirst({ where: { id, tenantId: req.tenant.id } }),
      prisma.aircraft.findFirst({ where: { id: aircraftId, tenantId: req.tenant.id } }),
    ]);
    if (!targetFlight) return res.status(404).json({ error: 'Flight not found' });
    if (!aircraft) return res.status(404).json({ error: 'Aircraft not found' });

    // 2. Check for overlaps within same tenant
    const overlaps = await prisma.flight.findMany({
      where: {
        tenantId: req.tenant.id,
        aircraftId,
        id: { not: id },
        AND: [
          { departureTime: { lt: targetFlight.arrivalTime } },
          { arrivalTime: { gt: targetFlight.departureTime } },
        ],
      },
    });

    if (overlaps.length > 0) {
      return res.status(400).json({
        error: 'Scheduling Conflict',
        details: `Aircraft is already booked for Trip ${overlaps[0].tripNumber} during this time.`,
      });
    }

    // 3. Assign aircraft
    const updated = await prisma.flight.update({ where: { id }, data: { aircraftId } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Flight (Save Quote)
app.post('/api/flights', authenticate, requireRole(['Dispatcher']), async (req, res) => {
  try {
    const { origin, destination, aircraft, paxCount, totalPrice, tripNumber } = req.body;

    // Find aircraft by type within this tenant
    const ac = await prisma.aircraft.findFirst({
      where: { type: aircraft, tenantId: req.tenant.id },
    });

    const flight = await prisma.flight.create({
      data: {
        tripNumber: tripNumber || `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        origin,
        destination,
        departureTime: new Date(Date.now() + 86400000),
        arrivalTime: new Date(Date.now() + 86400000 + 7200000),
        paxCount: parseInt(paxCount) || 1,
        status: 'QUOTED',
        totalPrice,
        aircraftId: ac?.id,
        tenantId: req.tenant.id,
      },
    });
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CharterBook API', version: '2.0.0-whitelabel' });
});

app.get('/', (req, res) => {
  res.send('CharterBook API v2.0 — White-Label Multi-Tenant');
});

// ─── SUPER ADMIN MIDDLEWARE ────────────────────────────────────────────────────
// requireSuperAdmin must come AFTER authenticate.
// Super admin routes intentionally skip resolveTenant (no tenant context needed).

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.superAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// ─── SUPER ADMIN: LOGIN ────────────────────────────────────────────────────────
// Cross-tenant login — finds the super admin user globally by email.
app.post('/api/super-admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email, superAdmin: true } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({
      token: user.id,
      user: { id: user.id, name: user.name, role: user.role, email: user.email, superAdmin: true },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SUPER ADMIN: LIST ALL TENANTS ────────────────────────────────────────────
app.get('/api/super-admin/tenants', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: { select: { users: true, flights: true, clients: true, aircraft: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const planMrr = { starter: 299, pro: 599, enterprise: 1499 };

    res.json(tenants.map(t => ({
      id: t.id,
      slug: t.slug,
      companyName: t.companyName,
      primaryColor: t.primaryColor,
      logoUrl: t.logoUrl,
      domain: t.domain,
      plan: t.plan,
      createdAt: t.createdAt,
      mrr: planMrr[t.plan] || 299,
      users: t._count.users,
      flights: t._count.flights,
      clients: t._count.clients,
      aircraft: t._count.aircraft,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SUPER ADMIN: UPDATE TENANT ───────────────────────────────────────────────
app.patch('/api/super-admin/tenants/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, primaryColor, logoUrl, domain, plan, slug } = req.body;
    const updateData = {};
    if (companyName) updateData.companyName = companyName;
    if (primaryColor) updateData.primaryColor = primaryColor;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;
    if (domain !== undefined) updateData.domain = domain || null;
    if (plan) updateData.plan = plan;
    if (slug) updateData.slug = slug;
    const updated = await prisma.tenant.update({ where: { id }, data: updateData });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SUPER ADMIN: DELETE TENANT ───────────────────────────────────────────────
// Cascades deletion in FK-safe order.
app.delete('/api/super-admin/tenants/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.checklistItem.deleteMany({ where: { flight: { tenantId: id } } });
    await prisma.cRMNote.deleteMany({ where: { client: { tenantId: id } } });
    await prisma.flight.deleteMany({ where: { tenantId: id } });
    await prisma.client.deleteMany({ where: { tenantId: id } });
    await prisma.certificate.deleteMany({ where: { crewMember: { tenantId: id } } });
    await prisma.crewMember.deleteMany({ where: { tenantId: id } });
    await prisma.aDItem.deleteMany({ where: { aircraft: { tenantId: id } } });
    await prisma.aircraft.deleteMany({ where: { tenantId: id } });
    await prisma.emptyLeg.deleteMany({ where: { tenantId: id } });
    await prisma.pricingRule.deleteMany({ where: { tenantId: id } });
    await prisma.user.deleteMany({ where: { tenantId: id } });
    await prisma.tenant.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`\n🚀 CharterBook API running on port ${port}`);
  console.log(`   White-label multi-tenancy: ENABLED`);
  console.log(`   Tenant resolution: subdomain | x-tenant-id header | dev fallback\n`);
});
