// Background service worker for FollowUp Operator

// Storage utilities
const storage = {
  async get(key) {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  },
  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },
  async getAll(prefix) {
    const all = await chrome.storage.local.get(null);
    return Object.entries(all)
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, value]) => value);
  }
};

// Lead tracking
async function trackLead(emailData) {
  const leadId = `lead:${emailData.email}`;
  const existing = await storage.get(leadId);
  
  const lead = {
    id: emailData.email,
    name: emailData.name || emailData.email,
    email: emailData.email,
    company: emailData.company || extractCompany(emailData.email),
    lastContact: new Date().toISOString(),
    followUpDays: 3,
    priority: 5,
    followUpCount: (existing?.followUpCount || 0) + 1,
    status: 'active',
    createdAt: existing?.createdAt || new Date().toISOString(),
    subject: emailData.subject,
    threadId: emailData.threadId
  };
  
  await storage.set(leadId, lead);
  updateBadge();
  return lead;
}

// Extract company from email domain
function extractCompany(email) {
  const domain = email.split('@')[1];
  if (!domain) return null;
  return domain.split('.')[0];
}

// Check for leads needing follow-up
async function checkFollowUps() {
  const leads = await storage.getAll('lead:');
  const now = new Date();
  let needsFollowUp = 0;
  
  for (const lead of leads) {
    if (lead.status !== 'active') continue;
    
    const daysSince = Math.floor(
      (now - new Date(lead.lastContact)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSince >= lead.followUpDays) {
      needsFollowUp++;
      
      // Send notification for high-priority overdue leads
      if (daysSince >= lead.followUpDays * 2) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'FollowUp Operator Alert',
          message: `${lead.name} needs follow-up (${daysSince} days ago)`,
          priority: 2
        });
      }
    }
  }
  
  return needsFollowUp;
}

// Update extension badge
async function updateBadge() {
  const count = await checkFollowUps();
  
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#00ff41' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Set up periodic checks
chrome.alarms.create('checkFollowUps', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkFollowUps') {
    updateBadge();
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EMAIL_SENT') {
    trackLead(message.data).then(lead => {
      sendResponse({ success: true, lead });
    });
    return true; // Required for async response
  }
  
  if (message.type === 'GET_LEADS') {
    storage.getAll('lead:').then(leads => {
      sendResponse({ leads });
    });
    return true;
  }
  
  if (message.type === 'UPDATE_LEAD') {
    storage.set(`lead:${message.data.id}`, message.data).then(() => {
      updateBadge();
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.type === 'DELETE_LEAD') {
    chrome.storage.local.remove(`lead:${message.leadId}`).then(() => {
      updateBadge();
      sendResponse({ success: true });
    });
    return true;
  }
});

// Initial badge update on install
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});

// Update badge when popup opens
chrome.action.onClicked.addListener(() => {
  updateBadge();
});
