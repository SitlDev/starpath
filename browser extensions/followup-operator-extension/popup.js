// Popup UI logic

let currentTab = 'urgent';
let allLeads = [];

// Load leads on popup open
document.addEventListener('DOMContentLoaded', () => {
  loadLeads();
  setupEventListeners();
});

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      renderLeads();
    });
  });

  // Open full dashboard
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'dashboard.html' });
  });
}

function loadLeads() {
  chrome.runtime.sendMessage({ type: 'GET_LEADS' }, (response) => {
    if (response?.leads) {
      allLeads = response.leads.sort((a, b) => b.priority - a.priority);
      updateStats();
      renderLeads();
    }
  });
}

function updateStats() {
  const active = allLeads.filter(l => l.status === 'active').length;
  const urgent = getUrgentLeads().length;
  const total = allLeads.length;

  document.getElementById('activeCount').textContent = active;
  document.getElementById('urgentCount').textContent = urgent;
  document.getElementById('totalCount').textContent = total;
}

function getUrgentLeads() {
  const now = new Date();
  return allLeads.filter(lead => {
    if (lead.status !== 'active') return false;
    const daysSince = Math.floor(
      (now - new Date(lead.lastContact)) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= lead.followUpDays;
  });
}

function filterLeads() {
  switch(currentTab) {
    case 'urgent':
      return getUrgentLeads();
    case 'active':
      return allLeads.filter(l => l.status === 'active');
    case 'all':
      return allLeads;
    default:
      return allLeads;
  }
}

function getUrgency(lead) {
  const daysSince = Math.floor(
    (new Date() - new Date(lead.lastContact)) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSince >= lead.followUpDays * 2) return 'high';
  if (daysSince >= lead.followUpDays) return 'medium';
  return 'low';
}

function renderLeads() {
  const container = document.getElementById('leads');
  const leads = filterLeads();

  if (leads.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">✓</div>
        <div class="empty-text">
          ${currentTab === 'urgent' 
            ? "All caught up! No urgent follow-ups." 
            : "No leads in this view."}
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = leads.map(lead => {
    const urgency = getUrgency(lead);
    const daysSince = Math.floor(
      (new Date() - new Date(lead.lastContact)) / (1000 * 60 * 60 * 24)
    );

    return `
      <div class="lead" data-id="${lead.id}">
        <div class="lead-header">
          <div>
            <div class="lead-name">${lead.name}</div>
            <div class="lead-email">${lead.email}</div>
          </div>
          <div class="urgency urgency-${urgency}">
            ${urgency}
          </div>
        </div>
        <div class="lead-meta">
          <span>📧 ${daysSince}d ago</span>
          <span>🔄 ${lead.followUpCount} sent</span>
          ${lead.company ? `<span>🏢 ${lead.company}</span>` : ''}
        </div>
        <div class="lead-actions">
          <button class="btn btn-primary" onclick="followUp('${lead.id}')">
            Follow Up
          </button>
          <button class="btn" onclick="markResponded('${lead.id}')">
            Responded
          </button>
          <button class="btn btn-danger" onclick="markDead('${lead.id}')">
            Dead
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function followUp(leadId) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;

  // Open Gmail compose with pre-filled recipient
  const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}&su=Following up on ${lead.subject || 'our conversation'}`;
  chrome.tabs.create({ url: composeUrl });

  // Update lead
  lead.lastContact = new Date().toISOString();
  lead.followUpCount++;
  updateLead(lead);
}

function markResponded(leadId) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;

  lead.status = 'responded';
  updateLead(lead);
}

function markDead(leadId) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;

  if (confirm(`Mark ${lead.name} as dead? This will remove them from active tracking.`)) {
    lead.status = 'dead';
    updateLead(lead);
  }
}

function updateLead(lead) {
  chrome.runtime.sendMessage({
    type: 'UPDATE_LEAD',
    data: lead
  }, () => {
    loadLeads(); // Refresh the view
  });
}

// Make functions globally available
window.followUp = followUp;
window.markResponded = markResponded;
window.markDead = markDead;
