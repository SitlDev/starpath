// Content script for Gmail integration

(function() {
  'use strict';
  
  console.log('FollowUp Operator: Monitoring Gmail...');
  
  // Track sent emails
  let lastEmailCount = 0;
  
  function extractEmailData() {
    // Look for sent confirmation banner
    const sentBanner = document.querySelector('[role="alert"]');
    if (!sentBanner) return null;
    
    const text = sentBanner.textContent;
    if (!text.includes('sent') && !text.includes('Sent')) return null;
    
    // Try to extract recipient from the last composed email
    const composeWindows = document.querySelectorAll('[role="dialog"]');
    let emailData = null;
    
    composeWindows.forEach(window => {
      const toField = window.querySelector('[aria-label*="To"]');
      const subjectField = window.querySelector('[name="subjectbox"]');
      
      if (toField && toField.textContent) {
        const emails = extractEmails(toField.textContent);
        if (emails.length > 0) {
          emailData = {
            email: emails[0],
            subject: subjectField?.value || 'No subject',
            timestamp: new Date().toISOString()
          };
        }
      }
    });
    
    return emailData;
  }
  
  function extractEmails(text) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    return text.match(emailRegex) || [];
  }
  
  // Monitor for sent emails
  const observer = new MutationObserver(() => {
    const emailData = extractEmailData();
    if (emailData) {
      chrome.runtime.sendMessage({
        type: 'EMAIL_SENT',
        data: emailData
      }, (response) => {
        if (response?.success) {
          console.log('FollowUp Operator: Tracked lead', emailData.email);
          showNotification(emailData);
        }
      });
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Show in-Gmail notification
  function showNotification(emailData) {
    const notification = document.createElement('div');
    notification.className = 'followup-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0a0a0a;
        border: 1px solid #00ff41;
        color: #00ff41;
        padding: 16px 20px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 255, 65, 0.2);
        animation: slideIn 0.3s ease-out;
      ">
        <div style="font-weight: bold; margin-bottom: 4px;">✓ Lead Tracked</div>
        <div style="color: #888;">${emailData.email}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();
