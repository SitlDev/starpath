// Combined bootstrap - loads all modules sequentially and initializes app
(async () => {
  try {
    // Load seed data first
    const seedModule = await import('./src/data/seed.js');
    window.LISTINGS = seedModule.LISTINGS;
    window.COUNTIES = seedModule.COUNTIES;
    window.SCRAPE_JOBS = seedModule.SCRAPE_JOBS;
    window.REDEMPTION_PERIODS = seedModule.REDEMPTION_PERIODS;
    window.STATE_DATA = seedModule.STATE_DATA;
    
    // Load utils
    const utilsModule = await import('./src/lib/utils.js');
    window.utils = utilsModule;
    
    // Now load and run app
    await import('./src/app.js');
    
  } catch (e) {
    console.error('Bootstrap failed:', e);
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = `<div style="padding:40px;color:#ff6b6b;font-family:monospace;font-size:11px">
        <strong>INITIALIZATION ERROR</strong><br><br>
        ${e.message}<br><br>
        <small>${e.stack?.split('\n')[1] || ''}</small>
      </div>`;
    }
  }
})();
