/* Four deliberate portfolio events. The page remains usable when analytics is blocked. */
(() => {
  const query = new URLSearchParams(location.search);
  const optOutKey = 'ghazi-portfolio-analytics-off';
  try {
    if (query.get('analytics') === 'off') localStorage.setItem(optOutKey, '1');
    if (query.get('analytics') === 'on') localStorage.removeItem(optOutKey);
    if (localStorage.getItem(optOutKey) === '1') return;
  } catch { /* The current URL still opts out when storage is unavailable. */ }
  if (query.get('analytics') === 'off' || query.has('review') || query.has('noanalytics')) return;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  const canonical = document.querySelector('meta[property="og:url"]')?.content;
  if (!canonical) return;
  const production = new URL(canonical);
  if (location.protocol !== 'https:' || location.hostname !== production.hostname || !location.pathname.startsWith(production.pathname)) return;

  const names = new Set(['portfolio_visited', 'portfolio_case_opened', 'portfolio_contact_clicked', 'portfolio_link_clicked']);
  const cases = { 'ai-risk-case':'AI risk assistant', 'advocate-case':'Advocate', 'work-case':'The Surge', 'platform-case':'PLA & LAUNCH' };
  const destinations = { 'linkedin.com':'LinkedIn', 'github.com':'GitHub', 'x.com':'X', 'apps.apple.com':'Advocate App Store' };
  let tracker;
  const pending = [];
  function capture(name, properties = {}) {
    if (!names.has(name)) return;
    if (!tracker) { if (pending.length < 20) pending.push([name, properties]); return; }
    try { tracker.capture(name, { site:'portfolio', ...properties }, { transport:'sendBeacon', send_instantly:true }); }
    catch { /* Analytics never interrupts navigation, readers or contact. */ }
  }
  document.querySelectorAll('.project-case').forEach(details => {
    details.addEventListener('portfolio:caseopen', () => capture('portfolio_case_opened', { case_study:cases[details.id] }));
  });
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('.contact-reveal, .hero-contact')) capture('portfolio_contact_clicked');
    const link = target?.closest('a[href]');
    if (!link) return;
    try {
      const url = new URL(link.href);
      const destination = destinations[url.hostname.replace(/^www\./, '')];
      if (destination) capture('portfolio_link_clicked', { destination });
    } catch { /* Internal anchors and malformed links are not outbound events. */ }
  });
  function source() {
    const campaign = query.get('utm_source')?.toLowerCase();
    if (campaign && /^[a-z0-9_-]{1,40}$/.test(campaign)) return campaign;
    try { return document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : 'Direct'; }
    catch { return 'Direct'; }
  }
  function clean(event) {
    if (!event || !names.has(event.event)) return null;
    const properties = event.properties || {};
    delete properties.$set; delete properties.$set_once;
    // Do not send query strings, hashes, note text, clipboard text or arbitrary custom properties.
    const custom = new Set(['site', 'traffic_source', 'case_study', 'destination']);
    for (const key of Object.keys(properties)) {
      if (!key.startsWith('$') && !custom.has(key) && key !== 'distinct_id' && key !== 'token') delete properties[key];
      if (/url|referrer/i.test(key) && typeof properties[key] === 'string') {
        try { const url = new URL(properties[key]); properties[key] = /referrer/i.test(key) ? url.origin : url.origin + url.pathname; }
        catch { properties[key] = ''; }
      }
    }
    properties.site = 'portfolio';
    return event;
  }
  fetch(new URL('assets/analytics-config.json', document.baseURI), { credentials:'omit' })
    .then(response => response.ok ? response.json() : null)
    .then(config => {
      if (!config?.project_token?.startsWith('phc_') || !config.api_host) return;
      const host = new URL(config.api_host);
      if (host.protocol !== 'https:' || !['us.i.posthog.com','eu.i.posthog.com'].includes(host.hostname)) return;
      const script = document.createElement('script');
      script.async = true; script.crossOrigin = 'anonymous';
      host.hostname = host.hostname.replace('.i.posthog.com', '-assets.i.posthog.com');
      script.src = host.origin + '/static/array.js';
      script.onload = () => {
        try {
          window.posthog.init(config.project_token, {
            api_host:config.api_host,
            autocapture:false, capture_pageview:false, capture_pageleave:false,
            disable_session_recording:true, disable_surveys:true, advanced_disable_flags:true,
            capture_performance:false, capture_exceptions:false, capture_heatmaps:false, capture_dead_clicks:false,
            enable_recording_console_log:false, person_profiles:'never', respect_dnt:true, ip:false,
            persistence:'localStorage', persistence_name:'ghazi_portfolio', cross_subdomain_cookie:false,
            before_send:clean,
            loaded(instance) {
              tracker = instance;
              // One visit per document load. Hash navigation and readers are not extra pageviews.
              capture('portfolio_visited', { traffic_source:source() });
              pending.splice(0).forEach(([name, properties]) => capture(name, properties));
            }
          });
        } catch { /* A blocked or unavailable SDK leaves the portfolio unchanged. */ }
      };
      document.head.append(script);
    }).catch(() => { /* Missing/offline config is a silent no-op. */ });
})();
