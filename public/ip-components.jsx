// IPTalons Proposals — Shared Components, Data, and Primitives

// ─── Brand palette (cozy HubSpot-inspired: soft sage on cool off-white) ────
const COLORS = {
  navy: '#2D4422',       // deep forest — sidebar (kept rich for contrast)
  navyMid: '#3D5C2E',
  navyLight: '#558B2F',
  blue: '#4A7C2E',       // primary green accent
  blueLight: '#EEF6E5',  // pale sage tint (a hair lighter for cozy feel)
  blueMid: '#D5E8C5',
  surface: '#FFFFFF',
  bg: '#F4F7EE',         // softer cool off-white (cozier than warm cream)
  bgAlt: '#FAFCF6',      // even lighter, for nested sections
  border: '#E8ECE0',     // softer borders
  borderDark: '#C9D0BD',
  text: '#1F2A1B',       // slightly deeper for warmth
  textMid: '#3D4A35',
  textSoft: '#6B7766',
  textGhost: '#A8B0A0',
  green: '#558B2F',
  greenBg: '#E8F2DA',
  amber: '#D4A04C',
  amberBg: '#FCF6E8',
  red: '#B8493A',
  redBg: '#F9EAE6',
  purple: '#7C5A8A',
  purpleBg: '#F1ECF4',

  // ── Soft shadows ────────────────────────────────────────────────────────
  shadowSm: '0 1px 2px rgba(31,42,27,0.04), 0 2px 6px rgba(31,42,27,0.03)',
  shadowMd: '0 2px 6px rgba(31,42,27,0.06), 0 6px 18px rgba(31,42,27,0.05)',
  shadowLg: '0 8px 24px rgba(31,42,27,0.10), 0 4px 10px rgba(31,42,27,0.06)',
};

const STATUS_CONFIG = {
  draft:    { label: 'Draft',     color: COLORS.textSoft, bg: '#EFF2E8' },
  sent:     { label: 'Sent',      color: COLORS.blue,     bg: COLORS.blueLight },
  review:   { label: 'In Review', color: COLORS.amber,    bg: COLORS.amberBg },
  won:      { label: 'Won',       color: COLORS.green,    bg: COLORS.greenBg },
  lost:     { label: 'Lost',      color: COLORS.red,      bg: COLORS.redBg },
};

const PROSPECT_TYPE_CONFIG = {
  university:  { label: 'University',          icon: '🎓' },
  healthcare:  { label: 'Healthcare / Med',    icon: '🏥' },
  govlab:      { label: 'Government Lab',      icon: '🏛️' },
  corporate:   { label: 'Corporate R&D',       icon: '🔬' },
  sbir:        { label: 'SBIR / Small Biz',    icon: '🚀' },
};

// ─── CSR product content (sourced from the CSR platform / Baylor proposal) ──
// Fixed proposal copy: the researcher certification journey, what's inside the
// platform, and the tools bundled with every CSR subscription.
const CSR_JOURNEY_STEPS = [
  { title: 'ORCID iD',              body: 'Register for — or confirm — your ORCID iD, the global researcher identifier sponsors already rely on.' },
  { title: 'CSR application',       body: 'Complete the CSR online application. Your ORCID credentials create the account.' },
  { title: 'Payment',               body: 'Submit payment for the annual certification.' },
  { title: 'Schedule',              body: 'Schedule your adjudication interview at a time that works for you.' },
  { title: 'Virtual adjudication',  body: 'Share collaboration histories, upload documents, complete training, and sign the mitigation agreement.' },
  { title: 'CSR number',            body: 'Receive your CSR number — the designation appears on your public ORCID profile for all sponsors to view.' },
];

const CSR_PLATFORM_FEATURES = [
  { title: 'Digital File Cabinet',        body: 'Versioned uploads of every required document — CV, current & pending support, MFTRP participation form, international travel reporting, pre-publication agreement, suspicious interaction reporting.' },
  { title: 'CSR Risk Interview',          body: 'An adjudication engine with a versioned, risk-scored question set. Foreign collaborators identified through open-source publication analysis are attached to the session for review.' },
  { title: 'Training that fits research', body: 'Innovation Defense Academy microcourses (2–5 minutes each) with a master test-out option — or upload certifications from your existing LMS.' },
  { title: 'Verifiable certification',    body: 'A downloadable certificate, ORCID write-back, and a public verification page any funding agency or sponsor can check in seconds.' },
  { title: 'Ongoing obligations, organized', body: 'Post-travel security questionnaires, annual MFTRP attestation, and self-reporting of new collaborations and suspicious contacts — all in one portal.' },
  { title: 'Continuous monitoring',       body: 'CSR risk profiles integrate with RedBook. If a certified researcher publishes with a new high-risk collaborator, your RSO and IPTalons are alerted for re-adjudication — the certification stays current, not point-in-time.' },
];

const CSR_INCLUDED_TOOLS = [
  {
    name: 'RedBook™ — Foreign Influence Detection & Response',
    tagline: 'An early-warning system — so your university can take corrective actions before you get a letter of concern.',
    body: 'AI-assisted analysis of over 300 million research publications and 120 million patent documents. RedBook matches your researchers’ co-authorship networks against roughly 16,200 flagged foreign entities and the government watch lists that matter (updated regularly), and delivers a per-university foreign-risk dashboard: flagged researchers, risky collaborations by year, risk scores, and drill-downs. Updates monthly and pushes alerts when a researcher’s risk profile changes.',
  },
  {
    name: 'Grant Hopper AI — External Screening',
    tagline: 'Screen people before they arrive.',
    body: 'Publication- and patent-network screening for people outside your institution: visiting scholar applications, faculty hires, graduate admissions, joint ventures, and supply-chain partners — including detection of publications a candidate left off their CV.',
  },
  {
    name: 'Subject-Matter-Expert Consulting',
    tagline: '60 hours per year, included.',
    body: 'Every CSR subscription includes 60 hours per year of subject-matter-expert and analytical support. Supplemental Research Security Program Support Hours are available at $275/hr via written task order, invoiced monthly.',
  },
];

const CSR_TRUST_POINTS = 'Contact IPTalons for the current service scope, security documentation, and contractual terms.';

// ─── Live Demo tour data ─────────────────────────────────────────────────────
// Shown on the Signals screen during the guided demo when the visitor isn't
// signed in (the real feed needs a server session). Snapshot of real radar leads.
const DEMO_SIGNALS = [
  { t: 'hot', tier: 'HOT', handle: 'u/gigemdh', src: 'r/SBIR', url: 'https://old.reddit.com/r/SBIR/comments/1u3fw9z/foreign_risk/',
    pain: 'NIGMS CRP proposal (through Phase I/II/IIb, product ready) rejected on foreign-risk assessment.',
    quote: 'Highly scored proposal rejected for failing foreign risk assessment. No appeal. No explanation.',
    angle: 'CSR surfaces the flag & builds the mitigation plan before resubmission. Offer a free team/vendor risk scan.',
    state: { status: 'contacted', owner: 'AP', notes: '' } },
  { t: 'hot', tier: 'HOT', handle: 'u/Responsible_Call5640', src: 'r/SBIR', url: 'https://old.reddit.com/r/SBIR/comments/1u3fw9z/foreign_risk/',
    pain: 'Medtech with 49% Indian ownership, no gov ties — anxious NSF/NIH will reject on it.',
    quote: 'Community’s answer: “Disclose it and pray.”',
    angle: 'Replace “pray” with a pre-submission assessment + clean disclosure package.',
    state: { status: 'new', owner: '', notes: '' } },
  { t: 'warm', tier: 'WARM', handle: 'u/650By-The-Hour', src: 'r/SBIR · r/NIH', url: 'https://old.reddit.com/r/SBIR/comments/1ujesel/po_just_requested_budget_clarification/',
    pain: 'NIH STTR founder sweating the JIT foreign-involvement stage; funding is make-or-break.',
    quote: 'Already sent in most JIT documents especially foreign involvement. Tell me this is a good sign?',
    angle: 'CSR turns the foreign-involvement JIT from a coin-flip into a documented, defensible package.',
    state: { status: 'new', owner: '', notes: '' } },
  { t: 'inst', tier: 'INSTITUTIONAL', handle: 'James Madison University', src: 'X', url: 'https://x.com/JMUresearch/status/2056742003619115298',
    pain: 'Hiring an Assoc. Director of Research Security & International Compliance — building a program org-up.',
    quote: 'We’re hiring… to provide strategic leadership for JMU’s research security program.',
    angle: 'An org hiring an RSO needs a platform. Reach the VP-Research level with CSR as the turnkey layer.',
    state: { status: 'new', owner: '', notes: '' } },
];

// ─── Demo marketing data (mirrors the daily digest's generator) ─────────────
// Illustrative GA4/Ads figures, varied deterministically by day-of-year so the
// dashboard looks alive. Swap for the real GA4 Data API + Google Ads later.
function demoMarketing() {
  const now = new Date();
  const doy = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000);
  const vary = (base, pct, salt) => Math.round(base * (1 + ((((doy * 7 + salt * 13) % (2 * pct + 1)) - pct) / 100)));
  const sessions7 = [318, 356, 289, 402, 371, 348, 412].map((v, i) => vary(v, 9, i));
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
  const sessionsYesterday = sessions7[6];
  const avg7 = Math.round(sessions7.slice(0, 6).reduce((a, b) => a + b, 0) / 6);
  const sessionsDelta = Math.round(((sessionsYesterday - avg7) / avg7) * 100);
  const campaigns = [
    { name: 'Google · "NSPM-33 / research security"', spend: vary(84, 10, 3), clicks: vary(92, 12, 4), ctr: 4.8, conv: 6, convLabel: 'demo requests' },
    { name: 'Google · "SBIR foreign risk"',           spend: vary(32, 10, 5), clicks: vary(41, 12, 6), ctr: 6.2, conv: 3, convLabel: 'radar-matched visits' },
    { name: 'LinkedIn · RSO retargeting',             spend: vary(46, 10, 7), clicks: vary(38, 12, 8), ctr: 1.9, conv: 2, convLabel: 'pricing views' },
  ];
  // 7-day series for the ads ↔ radar ↔ proposals correlation chart
  const adClicks7 = [22, 26, 19, 31, 27, 29, 34].map((v, i) => vary(v, 12, i + 20));
  const signals7  = [1, 2, 0, 3, 2, 2, 4].map((v, i) => Math.max(0, vary(v + 1, 30, i + 30) - 1));
  const views7    = [0, 1, 0, 2, 1, 1, 2].map((v, i) => Math.max(0, vary(v + 1, 35, i + 40) - 1));
  return {
    sessions7, dayLabels, sessionsYesterday, avg7, sessionsDelta,
    channels: [
      { name: 'Organic search', pct: 38 },
      { name: 'Paid search',    pct: 31 },
      { name: 'Direct',         pct: 19 },
      { name: 'LinkedIn',       pct: 12 },
    ],
    campaigns,
    adSpend: campaigns.reduce((n, c) => n + c.spend, 0),
    adClicks: campaigns.reduce((n, c) => n + c.clicks, 0),
    demoRequests: 6,
    adClicks7, signals7, views7,
  };
}

// A news item affects a prospect on an entity match (institution named in the
// item) or a category match (item tagged for the prospect's type).
function newsMatchesProspect(n, pr) {
  if (!n || !pr) return false;
  const entities = (n.match && n.match.entities) || [];
  const types = (n.match && n.match.types) || [];
  return entities.some(e => pr.name && pr.name.toLowerCase().includes(String(e).toLowerCase()))
    || types.includes(pr.type);
}

// Frozen intel snapshot for the Live Demo tour (anonymous visitors can't read
// /api/news). Real items from the 2026-08-13 sweep.
const DEMO_NEWS = [
  // evergreen date (2h ago): keeps the HIGH policy alert fresh and near the top of the notification feed for demo viewers
  { id: 'demo-omb', at: new Date(Date.now() - 2 * 3600000).toISOString(), source: 'X', handle: '@Michael7ucci', url: 'https://x.com/Michael7ucci/status/2087731970566414392',
    title: 'Select Committee pushing research-security rules toward ALL federal grants',
    summary: 'House Select Committee pressure is driving research-security changes at the Pentagon, DoE and NSF — with OMB now weighing government-wide requirements covering every federal grant.',
    tags: ['congress', 'omb', 'research-security', 'federal-grants'], severity: 'high',
    match: { types: ['university', 'sbir', 'govlab', 'healthcare'], entities: [] } },
  { id: 'demo-doe', at: '2026-07-16T00:00:00Z', source: 'Federal Register', handle: 'DOE · Final Rule', url: 'https://www.federalregister.gov/documents/2026/07/16/2026-14333/financial-assistance-regulations-conflict-of-interest-and-conflict-of-commitment-policy-requirements',
    title: 'DOE finalizes conflict-of-interest and conflict-of-commitment rules for all financial assistance',
    summary: 'Disclosure programs are now a condition of DOE funding for every non-federal recipient — not a best practice.',
    tags: ['doe', 'disclosure', 'coi'], severity: 'high',
    match: { types: ['university', 'govlab', 'sbir'], entities: [] } },
  { id: 'demo-dhs', at: '2026-07-17T00:00:00Z', source: 'Federal Register', handle: 'DHS · Final Rule', url: 'https://www.federalregister.gov/documents/2026/07/17/2026-14439/establishing-a-fixed-time-period-of-admission-and-an-extension-of-stay-procedure-for-nonimmigrant',
    title: 'DHS ends duration-of-status for F and J visas',
    summary: 'International researchers and visiting scholars now face fixed admission periods and recurring vetting checkpoints — screening workload universities will have to absorb.',
    tags: ['dhs', 'visas', 'international-scholars'], severity: 'medium',
    match: { types: ['university', 'healthcare'], entities: [] } },
];

// ─── Demand Radar integration ───────────────────────────────────────────────
// The CSR Demand Radar (sister worker) surfaces qualified leads from public
// posts. /api/export returns { leads:[...], state:{leads:{[handle]:{status,notes,owner}}} }.
const RADAR_URL = 'https://iptalons-csr-radar.harsha-4cf.workers.dev';

const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const RADAR_TIER_TYPE = { hot: 'sbir', warm: 'sbir', acad: 'university', inst: 'university' };

const radarLeadToProspect = (lead, leadState) => ({
  id: 'radar-' + String(lead.handle).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: lead.handle,
  type: RADAR_TIER_TYPE[lead.t] || 'university',
  contact: lead.handle,
  title: '',
  email: '',
  phone: '',
  researcherCount: 0,
  federalFunding: 0,
  primaryRisk: stripHtml(lead.pain),
  radar: {
    tier: lead.tier,
    src: lead.src,
    url: lead.url,
    pain: stripHtml(lead.pain),
    quote: stripHtml(lead.quote),
    angle: stripHtml(lead.angle),
    status: leadState?.status || 'new',
    owner: leadState?.owner || '',
    notes: leadState?.notes || '',
    importedAt: new Date().toISOString(),
  },
});

// Merge a radar export into the prospect list. Radar-sourced prospects are
// updated in place (fresh signal + outreach state, user-entered fields kept);
// competitor-intel entries are skipped; everything else is untouched.
function mergeRadarExport(prospects, exportData) {
  const byId = new Map(prospects.map(p => [p.id, p]));
  let added = 0, updated = 0;
  for (const lead of exportData.leads || []) {
    if (!lead.handle || lead.t === 'comp') continue;
    const incoming = radarLeadToProspect(lead, exportData.state?.leads?.[lead.handle]);
    const existing = byId.get(incoming.id);
    if (existing) {
      byId.set(incoming.id, { ...existing, primaryRisk: existing.primaryRisk || incoming.primaryRisk, radar: incoming.radar });
      updated++;
    } else {
      byId.set(incoming.id, incoming);
      added++;
    }
  }
  return { prospects: [...byId.values()], added, updated };
}

// ─── Service catalog (IPTalons' product lineup) ────────────────────────────
const SERVICES = {
  csr: {
    id: 'csr',
    name: 'Certified Secure Researcher™ Program',
    shortName: 'CSR Program',
    unit: '/researcher/year',
    pricePerUnit: 249,
    description: 'An annual subscription provides access to the CSR platform to complete and verify required yearly training courses, adjudicate foreign research collaboration risks, and submit researcher attestations to comply with risk mitigation plan requirements. Subscription pricing is based on the actual number of primary investigators (PIs) named on federal grants and contracts associated with and identified by the University at the time of contract or contract annual renewal.',
  },
  redbook: {
    id: 'redbook',
    name: 'RedBook with Grant Hopper AI Annual Subscription',
    shortName: 'RedBook + Grant Hopper AI',
    unit: '/year platform fee',
    pricePerUnit: 26500,
    description: 'RedBook is an online dashboard providing research security risk insights into your research portfolio. The dashboard supports internal workflow analysis and foreign influence risk management practices to comply with NSPM-33 and CHIPS Act requirements, and integrates into the Certified Secure Researcher program. Grant Hopper AI is an online tool embedded within the RedBook platform that searches for foreign influence risks in external applications, including visiting scholars, graduate students, and other external candidates.',
    bundleDiscount: { with: 'csr', percent: 100, label: 'CSR Bundle Discount' },
  },
  consulting: {
    id: 'consulting',
    name: 'Consulting Services',
    shortName: 'Consulting (60 hrs included)',
    unit: '/hour',
    pricePerUnit: 275,
    defaultQty: 60,
    description: 'Up to 60 hours per year of complimentary subject matter expertise and analytical support are included to assist with internal research security workflows, process integration, and related research security program requirements that might arise during the subscription performance period. Unused hours do not roll over at renewal.',
    bundleDiscount: { with: 'csr', percent: 100, label: 'CSR Bundle Discount' },
  },
  supplemental: {
    id: 'supplemental',
    name: 'Supplemental Research Security Program Support Hours',
    shortName: 'Supplemental Hours',
    unit: '/hour',
    pricePerUnit: 275,
    description: 'Optional: Subject Matter Expert + Analyst hours used to assist the University in implementing internal research security workflows, processes, and controls. Invoiced monthly via written task order at the published labor rates.',
  },
};

// ─── Pricing tiers (pre-bundled common offerings) ──────────────────────────
const PRICING_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    targetSize: 'Under 150 researchers',
    description: 'CSR only — for institutions piloting research security compliance',
    items: [{ serviceId: 'csr', qty: 100 }, { serviceId: 'consulting', qty: 40 }],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    targetSize: '150–500 researchers',
    description: 'CSR + RedBook + Grant Hopper AI + 60 hrs consulting — most common bundle',
    items: [{ serviceId: 'csr', qty: 250 }, { serviceId: 'redbook', qty: 1 }, { serviceId: 'consulting', qty: 60 }],
  },
  full: {
    id: 'full',
    name: 'Full Suite',
    targetSize: '500+ researchers',
    description: 'Standard + supplemental hours for larger R1 universities and labs',
    items: [{ serviceId: 'csr', qty: 500 }, { serviceId: 'redbook', qty: 1 }, { serviceId: 'consulting', qty: 60 }, { serviceId: 'supplemental', qty: 120 }],
  },
};

// ─── Team (IPTalons staff) ─────────────────────────────────────────────────
const SAMPLE_TEAM = [
  { id: 'u1', name: 'Allen L. Phelps',     role: 'Chief Executive Officer',                initials: 'AP', email: 'allen@iptalons.com',    phone: '972-422-9169', gradient: 'linear-gradient(135deg,#7CB342,#558B2F)' },
  { id: 'u2', name: 'Sarah Mitchell',      role: 'VP Sales & Business Development',        initials: 'SM', email: 'sarah@iptalons.com',    phone: '972-422-9170', gradient: 'linear-gradient(135deg,#4A7C2E,#2D4422)' },
  { id: 'u3', name: 'Marcus Chen',         role: 'Customer Success Manager',               initials: 'MC', email: 'marcus@iptalons.com',   phone: '972-422-9171', gradient: 'linear-gradient(135deg,#558B2F,#7CB342)' },
  { id: 'u4', name: 'Dr. Patricia Reyes',  role: 'Senior Research Security Analyst',       initials: 'PR', email: 'patricia@iptalons.com', phone: '972-422-9172', gradient: 'linear-gradient(135deg,#7C5A8A,#4A7C2E)' },
  { id: 'u5', name: "James O'Brien",       role: 'Compliance Engineer & Federal Liaison',  initials: 'JO', email: 'james@iptalons.com',    phone: '972-422-9173', gradient: 'linear-gradient(135deg,#D4A04C,#A36336)' },
  { id: 'u6', name: 'Lin Wang',            role: 'Research Security Analyst',              initials: 'LW', email: 'lin@iptalons.com',      phone: '972-422-9174', gradient: 'linear-gradient(135deg,#2D5234,#558B2F)' },
  { id: 'u7', name: 'Devon Ash',           role: 'Customer Onboarding Specialist',         initials: 'DA', email: 'devon@iptalons.com',    phone: '972-422-9175', gradient: 'linear-gradient(135deg,#A4D27A,#558B2F)' },
];

const ACTIVITY_TYPES = {
  email:    { label: 'Email sent',         icon: '📧', color: '#2563EB' },
  call:     { label: 'Call logged',        icon: '📞', color: '#558B2F' },
  meeting:  { label: 'Meeting held',       icon: '🤝', color: '#7C5A8A' },
  document: { label: 'Document sent',      icon: '📋', color: '#D4A04C' },
  note:     { label: 'Internal note',      icon: '📝', color: '#5F6557' },
  status:   { label: 'Status change',      icon: '⚡', color: '#2D4422' },
};

// Date helpers for follow-ups
const daysUntil = (iso) => {
  if (!iso) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(iso); target.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
};

const fmtRelativeDate = (iso) => {
  const d = daysUntil(iso);
  if (d === null) return '—';
  if (d < -7) return `${Math.abs(d)} days ago`;
  if (d < 0)  return `${Math.abs(d)} day${d === -1 ? '' : 's'} ago`;
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d < 7)  return `in ${d} days`;
  if (d < 30) return `in ${d} days`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const followUpTone = (iso) => {
  const d = daysUntil(iso);
  if (d === null) return { color: '#9A9D90', bg: '#EFF2E8', label: 'No follow-up set' };
  if (d < 0)      return { color: '#B8493A', bg: '#F9EAE6', label: 'Overdue' };
  if (d === 0)    return { color: '#D4A04C', bg: '#FCF6E8', label: 'Today' };
  if (d <= 7)     return { color: '#558B2F', bg: '#E8F0DC', label: 'This week' };
  return                 { color: '#5F6557', bg: '#EFF2E8', label: 'Later' };
};

// Helper to date strings N days from today
const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// Demo data ages: follow-up dates persisted to localStorage months ago drift
// absurdly overdue ("88 days ago"). Anything more than 30 days past is pulled
// back to a realistic 7-10 days ago; recent and future dates are untouched.
function freshenFollowUps(proposals) {
  return proposals.map((p, i) => {
    const d = daysUntil(p.nextFollowUp);
    if (d !== null && d < -30) {
      return { ...p, nextFollowUp: dateOffset(-(7 + (i % 4))) };
    }
    return p;
  });
}

// ─── Sample prospects ──────────────────────────────────────────────────────
const SAMPLE_PROSPECTS = [
  { id: 'pr1', name: 'Baylor University',                   type: 'university', contact: 'Dr. Kevin Chambliss',      title: 'Vice Provost for Research',           email: 'kevin_chambliss@baylor.edu',        phone: '254-710-3763', researcherCount: 250, federalFunding: 215000000, primaryRisk: 'NSPM-33 + CHIPS Act compliance' },
  { id: 'pr2', name: 'University of Texas at Austin',       type: 'university', contact: 'Dr. Alison Preston',        title: 'Vice President for Research',         email: 'apreston@utexas.edu',                phone: '512-471-2877', researcherCount: 850, federalFunding: 780000000, primaryRisk: 'Foreign influence on advanced materials research' },
  { id: 'pr3', name: 'Texas A&M University',                 type: 'university', contact: 'Dr. Jack G. Baldauf',       title: 'Vice President for Research',         email: 'jbaldauf@tamu.edu',                  phone: '979-845-8585', researcherCount: 620, federalFunding: 590000000, primaryRisk: 'Defense-funded research vetting' },
  { id: 'pr4', name: 'Rice University',                      type: 'university', contact: 'Dr. Ramamoorthy Ramesh',    title: 'Vice President for Research',         email: 'rramesh@rice.edu',                   phone: '713-348-6055', researcherCount: 320, federalFunding: 195000000, primaryRisk: 'CHIPS Act compliance for nanotech research' },
  { id: 'pr5', name: 'UT Southwestern Medical Center',       type: 'healthcare', contact: 'Dr. Mark Skinner',          title: 'Vice President for Research',         email: 'mark.skinner@utsouthwestern.edu',    phone: '214-648-3404', researcherCount: 540, federalFunding: 480000000, primaryRisk: 'NIH grant compliance + biomedical IP' },
  { id: 'pr6', name: 'Southern Methodist University',        type: 'university', contact: 'Dr. Suku Nair',             title: 'Vice President for Research',         email: 'snair@smu.edu',                       phone: '214-768-2000', researcherCount: 140, federalFunding: 62000000,  primaryRisk: 'DoD research security baseline' },
  { id: 'pr7', name: 'Massachusetts Institute of Technology', type: 'university', contact: 'Dr. Maria Zuber',           title: 'Vice President for Research',         email: 'mzuber@mit.edu',                      phone: '617-253-1000', researcherCount: 1100, federalFunding: 890000000, primaryRisk: 'CHIPS Act compliance for semiconductor + quantum research' },
  { id: 'pr8', name: 'Stanford University',                   type: 'university', contact: 'Dr. Kathryn Moler',         title: 'Vice Provost & Dean of Research',     email: 'kmoler@stanford.edu',                 phone: '650-723-2300', researcherCount: 950,  federalFunding: 1200000000, primaryRisk: 'Foreign influence on AI + biotech research' },
  { id: 'pr9', name: 'Pennsylvania State University',         type: 'university', contact: 'Dr. Andrew Read',           title: 'Senior Vice President for Research',  email: 'aread@psu.edu',                       phone: '814-865-6332', researcherCount: 870,  federalFunding: 785000000, primaryRisk: 'Defense + agricultural research compliance' },
  { id: 'pr10', name: 'Carnegie Mellon University',           type: 'university', contact: 'Dr. Theresa Mayer',         title: 'Vice President for Research',         email: 'tmayer@cmu.edu',                      phone: '412-268-2000', researcherCount: 380,  federalFunding: 310000000, primaryRisk: 'AI/ML export controls + NDAA Section 889' },
  { id: 'pr11', name: 'Georgia Institute of Technology',      type: 'university', contact: 'Dr. Tim Lieuwen',           title: 'Executive Vice President for Research', email: 'tim.lieuwen@research.gatech.edu',  phone: '404-894-2000', researcherCount: 540,  federalFunding: 475000000, primaryRisk: 'CHIPS Act + DoD basic research portfolio' },
  { id: 'pr12', name: 'Cornell University',                   type: 'university', contact: 'Dr. Krystyn Van Vliet',     title: 'Vice President for Research',         email: 'krystyn.vanvliet@cornell.edu',        phone: '607-255-4422', researcherCount: 720,  federalFunding: 640000000, primaryRisk: 'NSPM-33 + agricultural research foreign collaboration' },
  { id: 'pr13', name: 'Johns Hopkins Applied Physics Lab',    type: 'govlab',     contact: 'Dr. Ralph Semmel',          title: 'Director',                            email: 'rsemmel@jhuapl.edu',                  phone: '443-778-5000', researcherCount: 2100, federalFunding: 1850000000,primaryRisk: 'DoD classified + ITAR controls' },
  { id: 'pr14', name: 'University of Michigan',               type: 'university', contact: 'Dr. Arthur Lupia',          title: 'Vice President for Research',         email: 'lupia@umich.edu',                     phone: '734-764-1817', researcherCount: 1250, federalFunding: 1100000000,primaryRisk: 'Foreign student researcher screening at scale' },
  { id: 'pr15', name: 'Lawrence Berkeley National Lab',       type: 'govlab',     contact: 'Dr. Michael Witherell',     title: 'Director',                            email: 'mswitherell@lbl.gov',                 phone: '510-486-4000', researcherCount: 1800, federalFunding: 1050000000,primaryRisk: 'DOE security order DOE O 142.3B compliance' },
];

// ─── Sample proposals ──────────────────────────────────────────────────────
// The Baylor proposal mirrors the manual PDF the team has been sending
const SAMPLE_PROPOSALS = [
  {
    id: 'PROP-2026-001',
    proposalNumber: 'PROP-2026-001',
    name: 'Baylor University — Research Security Program Support Services',
    prospect: SAMPLE_PROSPECTS[0],
    status: 'sent',
    tier: 'standard',
    items: [
      { serviceId: 'csr',        qty: 250, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',    qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting', qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
      { serviceId: 'supplemental', qty: 0, unitPrice: 275,   bundleDiscount: 0   },
    ],
    created: '2025-11-10',
    validUntil: '2026-06-10',
    ownerId: 'u2', // Sarah Mitchell
    nextFollowUp: dateOffset(5),
    activities: [
      { id: 'a1', type: 'email',    date: dateOffset(-1),  by: 'Sarah Mitchell',   content: 'Sent revised pricing with the supplemental hours option pulled out.' },
      { id: 'a2', type: 'note',     date: dateOffset(-3),  by: 'Sarah Mitchell',   content: 'Dean wants to bundle CSR with the summer cohort — pricing team is checking phased start-date.' },
      { id: 'a3', type: 'meeting',  date: dateOffset(-7),  by: 'Sarah Mitchell',   content: 'Discovery call with Dr. Chambliss and the AVP for Research Administration. NSPM-33 deadline is the main driver.' },
      { id: 'a4', type: 'document', date: dateOffset(-10), by: 'Sarah Mitchell',   content: 'Sent initial overview deck + CSR program one-pager.' },
      { id: 'a5', type: 'note',     date: dateOffset(-14), by: 'Lin Wang',         content: 'Open-source publication scan complete — flagged 8 researchers with foreign collaborator activity.' },
    ],
    introLetter: `As research security compliance professionals, we understand your objectives and challenges in delivering research security, compliance, and regulatory services to your academic, research, and healthcare institutions. You work hard every day to meet both your internal and external stakeholder needs and try to anticipate what they will require in the future. The recent U.S. Congressional passage of the "Creating Helpful Incentives to Produce Semiconductors (CHIPS) Act of 2022", which codifies research security and compliance requirements published in the National Security Presidential Memorandum 33 (NSPM-33) Strategy for United States Government Supported Research and Development, has changed how research organizations must manage their regulatory and compliance risks now and into the future.

We understand the challenges of balancing the requirements of a shifting security and regulatory risk landscape, as well as a growing insider risk fueled by malicious foreign influence threats, with the demands and sensitivities of internal stakeholders. We founded IPTalons to meet the research security, compliance, and regulatory requirements worldwide. We understand what it takes to create an effective, professional-grade research security and compliance program, and we bring unmatched compliance and insider threat management experience and know-how to support your team and programs.

We want you to know that our objective is to build on your strengths, ensuring that Baylor University remains a leading research institution that attracts high-caliber researchers, innovation-driving research partners, and committed government and corporate research investments. I look forward to discussing the next steps for supporting Baylor University's research security and compliance program efforts.`,
    savingsEstimate: 500000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms. Supplemental support hours invoiced monthly on NET 30 terms.',
  },
  {
    id: 'PROP-2026-002',
    proposalNumber: 'PROP-2026-002',
    name: 'UT Austin — Full Suite Research Security Engagement',
    prospect: SAMPLE_PROSPECTS[1],
    status: 'review',
    tier: 'full',
    items: [
      { serviceId: 'csr',          qty: 850, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',      qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting',   qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
      { serviceId: 'supplemental', qty: 200, unitPrice: 275,   bundleDiscount: 0   },
    ],
    created: '2026-04-22',
    validUntil: '2026-07-22',
    ownerId: 'u2',
    nextFollowUp: dateOffset(1),
    activities: [
      { id: 'b1', type: 'meeting',  date: dateOffset(-2),  by: 'Sarah Mitchell',   content: 'Procurement review — they want a 3-year term option. Drafting alternative pricing.' },
      { id: 'b2', type: 'email',    date: dateOffset(-5),  by: 'Allen L. Phelps',  content: 'Replied to Dr. Preston RE: NDAA Section 1286 questions on visiting scholar adjudication.' },
      { id: 'b3', type: 'call',     date: dateOffset(-9),  by: 'Sarah Mitchell',   content: 'VP of Research called — they want a custom rollout plan for the McKetta school first.' },
      { id: 'b4', type: 'document', date: dateOffset(-12), by: 'Sarah Mitchell',   content: 'Sent Full Suite proposal v1.' },
    ],
    introLetter: '',
    savingsEstimate: 1200000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2026-003',
    proposalNumber: 'PROP-2026-003',
    name: 'Rice University — CSR + RedBook Pilot',
    prospect: SAMPLE_PROSPECTS[3],
    status: 'draft',
    tier: 'standard',
    items: [
      { serviceId: 'csr',        qty: 320, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',    qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting', qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
    ],
    created: '2026-05-02',
    validUntil: '2026-08-02',
    ownerId: 'u2',
    nextFollowUp: dateOffset(-2), // overdue
    activities: [
      { id: 'c1', type: 'note', date: dateOffset(-2), by: 'Sarah Mitchell', content: 'Need to follow up — Dr. Ramesh asked for a budget brief he can take to the Provost.' },
      { id: 'c2', type: 'call', date: dateOffset(-4), by: 'Sarah Mitchell', content: 'Intake call. Rice is starting from scratch on research security; very interested in CSR.' },
    ],
    introLetter: '',
    savingsEstimate: 650000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2025-014',
    proposalNumber: 'PROP-2025-014',
    name: 'UT Southwestern — Research Security & Compliance',
    prospect: SAMPLE_PROSPECTS[4],
    status: 'won',
    tier: 'standard',
    items: [
      { serviceId: 'csr',        qty: 540, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',    qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting', qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
    ],
    created: '2025-09-18',
    validUntil: '2025-12-18',
    ownerId: 'u3', // Marcus Chen — handed off to Customer Success after close
    nextFollowUp: dateOffset(10), // 90-day check-in
    activities: [
      { id: 'd1', type: 'note',     date: dateOffset(-15), by: 'Marcus Chen',       content: 'Onboarding complete. 487 of 540 PIs designated CSR. RedBook is producing weekly risk reports.' },
      { id: 'd2', type: 'meeting',  date: dateOffset(-45), by: 'Marcus Chen',       content: 'Kickoff meeting with Dr. Skinner and the research compliance team.' },
      { id: 'd3', type: 'status',   date: dateOffset(-60), by: 'Allen L. Phelps',   content: 'Contract executed. Handed off to Customer Success (Marcus).' },
      { id: 'd4', type: 'document', date: dateOffset(-75), by: 'Sarah Mitchell',    content: 'Sent final agreement with revised payment terms.' },
    ],
    introLetter: '',
    savingsEstimate: 850000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },

  // ─── Pipeline proposals (drive Follow-ups widget) ───────────────────────
  {
    id: 'PROP-2026-004', proposalNumber: 'PROP-2026-004',
    name: 'MIT — Full Suite Research Security Engagement',
    prospect: SAMPLE_PROSPECTS[6], // MIT
    status: 'sent', tier: 'full',
    items: [
      { serviceId: 'csr',          qty: 1100, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',      qty: 1,    unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting',   qty: 60,   unitPrice: 275,   bundleDiscount: 100 },
      { serviceId: 'supplemental', qty: 200,  unitPrice: 275,   bundleDiscount: 0   },
    ],
    created: '2026-03-12', validUntil: '2026-06-12',
    ownerId: 'u2', nextFollowUp: dateOffset(-5),
    activities: [
      { id: 'm1', type: 'note',     date: dateOffset(-5),  by: 'Sarah Mitchell',  content: 'Need to follow up — procurement asked for a 5-year option before EOQ. Holding up signing.' },
      { id: 'm2', type: 'email',    date: dateOffset(-8),  by: 'Sarah Mitchell',  content: 'Sent revised quote with multi-year discount table.' },
      { id: 'm3', type: 'meeting',  date: dateOffset(-12), by: 'Allen L. Phelps', content: 'Demo with MIT research compliance team. Strong interest in Grant Hopper AI for visiting scholar screening.' },
      { id: 'm4', type: 'email',    date: dateOffset(-20), by: 'Allen L. Phelps', content: 'Initial intro email — Allen leveraged NSF research security network connection.' },
    ],
    introLetter: '', savingsEstimate: 1400000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2026-005', proposalNumber: 'PROP-2026-005',
    name: 'Stanford — Pilot CSR Engagement',
    prospect: SAMPLE_PROSPECTS[7], // Stanford
    status: 'review', tier: 'standard',
    items: [
      { serviceId: 'csr',        qty: 950, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',    qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting', qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
    ],
    created: '2026-04-01', validUntil: '2026-07-01',
    ownerId: 'u2', nextFollowUp: dateOffset(-3),
    activities: [
      { id: 's1', type: 'note',     date: dateOffset(-3),  by: 'Sarah Mitchell',  content: 'Their security team flagged a clause in section 12.4 (data residency). Need to send redline.' },
      { id: 's2', type: 'document', date: dateOffset(-7),  by: 'Sarah Mitchell',  content: 'Sent redline of MSA with proposed edits to data residency + indemnification.' },
      { id: 's3', type: 'meeting',  date: dateOffset(-11), by: 'Sarah Mitchell',  content: 'VP Research review meeting — Dr. Moler signaled strong interest, deferred to legal for final.' },
    ],
    introLetter: '', savingsEstimate: 1100000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2026-006', proposalNumber: 'PROP-2026-006',
    name: 'Penn State — Renewal + 200 PI Expansion',
    prospect: SAMPLE_PROSPECTS[8], // Penn State
    status: 'review', tier: 'standard',
    items: [
      { serviceId: 'csr',        qty: 870, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',    qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting', qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
    ],
    created: '2026-04-15', validUntil: '2026-07-15',
    ownerId: 'u3', nextFollowUp: dateOffset(-1),
    activities: [
      { id: 'p1', type: 'email',    date: dateOffset(-1),  by: 'Marcus Chen',     content: 'Renewal email sent — they want to add 200 more PIs for FY27. Awaiting countersignature.' },
      { id: 'p2', type: 'meeting',  date: dateOffset(-6),  by: 'Marcus Chen',     content: 'Quarterly business review. Andrew Read happy with adoption; 92% of in-scope PIs designated.' },
      { id: 'p3', type: 'note',     date: dateOffset(-14), by: 'Lin Wang',        content: 'YoY risk report delivered — flagged 6 new high-risk collaborations vs. last year.' },
    ],
    introLetter: '', savingsEstimate: 980000,
    paymentTerms: 'Renewal subscription costs are payable in advance at the start of the FY27 performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2026-007', proposalNumber: 'PROP-2026-007',
    name: 'Carnegie Mellon — Standard Tier',
    prospect: SAMPLE_PROSPECTS[9], // CMU
    status: 'sent', tier: 'standard',
    items: [
      { serviceId: 'csr',        qty: 380, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',    qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting', qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
    ],
    created: '2026-04-25', validUntil: '2026-07-25',
    ownerId: 'u2', nextFollowUp: dateOffset(0),
    activities: [
      { id: 'cm1', type: 'meeting',  date: dateOffset(0),   by: 'Sarah Mitchell',  content: 'Demo today at 2pm CST. Dr. Mayer + AI/ML lab director attending. Allen joining for closing block.' },
      { id: 'cm2', type: 'document', date: dateOffset(-3),  by: 'Sarah Mitchell',  content: 'Sent agenda + sample risk report ahead of today\'s demo.' },
      { id: 'cm3', type: 'email',    date: dateOffset(-9),  by: 'Sarah Mitchell',  content: 'Initial intro via NSF research security working group. Mayer responded same day.' },
    ],
    introLetter: '', savingsEstimate: 520000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2026-008', proposalNumber: 'PROP-2026-008',
    name: 'Georgia Tech — Standard + Supplemental Hours',
    prospect: SAMPLE_PROSPECTS[10], // Georgia Tech
    status: 'draft', tier: 'full',
    items: [
      { serviceId: 'csr',          qty: 540, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',      qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting',   qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
      { serviceId: 'supplemental', qty: 80,  unitPrice: 275,   bundleDiscount: 0   },
    ],
    created: '2026-05-02', validUntil: '2026-08-02',
    ownerId: 'u2', nextFollowUp: dateOffset(1),
    activities: [
      { id: 'g1', type: 'note',     date: dateOffset(-1),  by: 'Sarah Mitchell',  content: 'Drafting proposal — they want supplemental hours specifically for the GTRI semiconductor research portfolio.' },
      { id: 'g2', type: 'call',     date: dateOffset(-4),  by: 'Sarah Mitchell',  content: 'Discovery call with EVP Research. CHIPS Act + DoD basic research are top concerns.' },
    ],
    introLetter: '', savingsEstimate: 720000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms. Supplemental support hours invoiced monthly on NET 30 terms.',
  },
  {
    id: 'PROP-2026-009', proposalNumber: 'PROP-2026-009',
    name: 'Cornell University — Full Suite',
    prospect: SAMPLE_PROSPECTS[11], // Cornell
    status: 'sent', tier: 'standard',
    items: [
      { serviceId: 'csr',        qty: 720, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',    qty: 1,   unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting', qty: 60,  unitPrice: 275,   bundleDiscount: 100 },
    ],
    created: '2026-04-18', validUntil: '2026-07-18',
    ownerId: 'u2', nextFollowUp: dateOffset(2),
    activities: [
      { id: 'co1', type: 'document', date: dateOffset(-2),  by: 'Sarah Mitchell',  content: 'Sent W-9 + certificate of insurance to procurement.' },
      { id: 'co2', type: 'meeting',  date: dateOffset(-6),  by: 'Sarah Mitchell',  content: 'Compliance review by their general counsel. Two minor edits requested on cyber-incident reporting.' },
      { id: 'co3', type: 'document', date: dateOffset(-11), by: 'Sarah Mitchell',  content: 'Proposal sent (Standard tier, 720 CSR subscriptions).' },
    ],
    introLetter: '', savingsEstimate: 820000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2026-010', proposalNumber: 'PROP-2026-010',
    name: 'Johns Hopkins APL — Custom DoD Engagement',
    prospect: SAMPLE_PROSPECTS[12], // JHU APL
    status: 'review', tier: 'full',
    items: [
      { serviceId: 'csr',          qty: 2100, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',      qty: 1,    unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting',   qty: 60,   unitPrice: 275,   bundleDiscount: 100 },
      { serviceId: 'supplemental', qty: 400,  unitPrice: 275,   bundleDiscount: 0   },
    ],
    created: '2026-03-28', validUntil: '2026-06-28',
    ownerId: 'u1', nextFollowUp: dateOffset(4),
    activities: [
      { id: 'j1', type: 'meeting',  date: dateOffset(4),   by: 'Allen L. Phelps', content: 'Allen meeting with Dr. Semmel next Tuesday — DoD funding considerations + classified portfolio segmentation.' },
      { id: 'j2', type: 'email',    date: dateOffset(-8),  by: 'Allen L. Phelps', content: 'Replied with detail on how CSR adjudication maps to ITAR + DoD basic research disclosure requirements.' },
      { id: 'j3', type: 'note',     date: dateOffset(-15), by: 'James O\'Brien',  content: 'Reviewed APL\'s current security baseline. CSR fits — but they\'ll need a custom data-handling addendum for ITAR-controlled portfolios.' },
    ],
    introLetter: '', savingsEstimate: 2400000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms. Supplemental support hours invoiced monthly on NET 30 terms.',
  },
  {
    id: 'PROP-2026-011', proposalNumber: 'PROP-2026-011',
    name: 'University of Michigan — Standard Tier',
    prospect: SAMPLE_PROSPECTS[13], // Michigan
    status: 'draft', tier: 'full',
    items: [
      { serviceId: 'csr',          qty: 1250, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',      qty: 1,    unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting',   qty: 60,   unitPrice: 275,   bundleDiscount: 100 },
      { serviceId: 'supplemental', qty: 120,  unitPrice: 275,   bundleDiscount: 0   },
    ],
    created: '2026-04-30', validUntil: '2026-07-30',
    ownerId: 'u6', nextFollowUp: dateOffset(6),
    activities: [
      { id: 'um1', type: 'note',     date: dateOffset(-2),  by: 'Lin Wang',         content: 'Drafting CSR coverage estimate. Foreign-student researcher count is non-trivial — proposing tiered onboarding.' },
      { id: 'um2', type: 'document', date: dateOffset(-5),  by: 'Sarah Mitchell',   content: 'Received PI list (1,250 federally-funded researchers across 19 colleges).' },
      { id: 'um3', type: 'call',     date: dateOffset(-10), by: 'Sarah Mitchell',   content: 'Intake call with the research compliance director. Lupia is supportive but wants a phased Year-1 rollout plan.' },
    ],
    introLetter: '', savingsEstimate: 1850000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms.',
  },
  {
    id: 'PROP-2026-012', proposalNumber: 'PROP-2026-012',
    name: 'Lawrence Berkeley National Lab — DOE Pilot',
    prospect: SAMPLE_PROSPECTS[14], // LBNL
    status: 'draft', tier: 'full',
    items: [
      { serviceId: 'csr',          qty: 1800, unitPrice: 249,   bundleDiscount: 0   },
      { serviceId: 'redbook',      qty: 1,    unitPrice: 26500, bundleDiscount: 100 },
      { serviceId: 'consulting',   qty: 60,   unitPrice: 275,   bundleDiscount: 100 },
      { serviceId: 'supplemental', qty: 200,  unitPrice: 275,   bundleDiscount: 0   },
    ],
    created: '2026-05-04', validUntil: '2026-08-04',
    ownerId: 'u4', nextFollowUp: dateOffset(14),
    activities: [
      { id: 'l1', type: 'note', date: dateOffset(-2), by: 'Dr. Patricia Reyes', content: 'DOE national labs require a different procurement track — leading the engagement to map DOE O 142.3B to CSR controls.' },
      { id: 'l2', type: 'call', date: dateOffset(-6), by: 'Sarah Mitchell',     content: 'First call with Witherell\'s chief of staff. Long sales cycle expected (DOE procurement). Patricia taking over as primary.' },
    ],
    introLetter: '', savingsEstimate: 2200000,
    paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms. DOE procurement may require alternative payment terms.',
  },
];

// ─── Utilities ─────────────────────────────────────────────────────────────
const fmt$  = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const fmt$d = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtDateLong = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const genId = () => crypto.randomUUID();

const calcItemTotal = (item) => {
  const gross = (item.qty || 0) * (item.unitPrice || 0);
  const discount = gross * (item.bundleDiscount || 0) / 100;
  return gross - discount;
};

const calcProposalTotals = (proposal) => {
  const items = proposal.items || [];
  const itemRows = items.map(item => {
    const gross = (item.qty || 0) * (item.unitPrice || 0);
    const discountAmount = gross * (item.bundleDiscount || 0) / 100;
    const net = gross - discountAmount;
    return { ...item, gross, discountAmount, net };
  });
  const subtotal = itemRows.reduce((s, r) => s + r.net, 0);
  return { itemRows, subtotal, total: subtotal };
};

// ─── UI primitives ─────────────────────────────────────────────────────────
const { useState, useEffect, useRef, useCallback, useMemo } = React;

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', icon, type = 'button' }) => {
  const [hover, setHover] = useState(false);
  const sizes = {
    sm: { padding: '7px 14px', fontSize: 12 },
    md: { padding: '10px 18px', fontSize: 13 },
    lg: { padding: '12px 22px', fontSize: 14 },
  };
  const palettes = {
    primary:   { bg: COLORS.blue,   hoverBg: '#3D6826', color: '#fff',           border: 'transparent', shadow: hover ? COLORS.shadowMd : COLORS.shadowSm },
    secondary: { bg: COLORS.surface, hoverBg: COLORS.bgAlt, color: COLORS.textMid, border: COLORS.border, shadow: hover ? COLORS.shadowMd : COLORS.shadowSm },
    ghost:     { bg: 'transparent', hoverBg: COLORS.bgAlt, color: COLORS.textSoft, border: 'transparent', shadow: 'none' },
    danger:    { bg: COLORS.red,    hoverBg: '#963A2D',  color: '#fff',           border: 'transparent', shadow: hover ? COLORS.shadowMd : COLORS.shadowSm },
    success:   { bg: COLORS.green,  hoverBg: '#426F23',  color: '#fff',           border: 'transparent', shadow: hover ? COLORS.shadowMd : COLORS.shadowSm },
  };
  const p = palettes[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'inherit', fontWeight: 600,
        background: hover && !disabled ? p.hoverBg : p.bg,
        color: p.color,
        border: `1px solid ${p.border}`,
        borderRadius: 10,
        boxShadow: p.shadow,
        transform: hover && !disabled ? 'translateY(-1px)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        transition: 'all 0.16s ease',
        ...sizes[size],
      }}>
      {icon && <span style={{ fontSize: sizes[size].fontSize + 1 }}>{icon}</span>}
      {children}
    </button>
  );
};

const Badge = ({ label, status }) => {
  const cfg = STATUS_CONFIG[status] || { label, color: COLORS.textSoft, bg: '#EEF2E5' };
  return (
    <span style={{
      color: cfg.color, background: cfg.bg,
      fontSize: 11, fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 999,
      whiteSpace: 'nowrap',
      letterSpacing: 0.1,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label || label}
    </span>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text', required, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMid, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>{label}{required && <span style={{ color: COLORS.red }}> *</span>}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 14, color: COLORS.text, outline: 'none', background: COLORS.surface, transition: 'all 0.15s ease', boxShadow: 'inset 0 1px 0 rgba(31,42,27,0.02)' }}
      onFocus={e => { e.target.style.borderColor = COLORS.blue; e.target.style.boxShadow = `inset 0 1px 0 rgba(31,42,27,0.02), 0 0 0 3px ${COLORS.blueLight}`; }}
      onBlur={e => { e.target.style.borderColor = COLORS.border; e.target.style.boxShadow = 'inset 0 1px 0 rgba(31,42,27,0.02)'; }}
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMid, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 14, color: COLORS.text, outline: 'none', background: COLORS.surface, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit', boxShadow: 'inset 0 1px 0 rgba(31,42,27,0.02)' }}>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 4, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMid, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>{label}</label>}
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, color: COLORS.text, outline: 'none', background: COLORS.surface, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, transition: 'all 0.15s ease', boxShadow: 'inset 0 1px 0 rgba(31,42,27,0.02)' }}
      onFocus={e => { e.target.style.borderColor = COLORS.blue; e.target.style.boxShadow = `inset 0 1px 0 rgba(31,42,27,0.02), 0 0 0 3px ${COLORS.blueLight}`; }}
      onBlur={e => { e.target.style.borderColor = COLORS.border; e.target.style.boxShadow = 'inset 0 1px 0 rgba(31,42,27,0.02)'; }}
    />
  </div>
);

const Card = ({ children, className = '', style = {}, hover = false }) => {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        boxShadow: isHovering ? COLORS.shadowMd : COLORS.shadowSm,
        transform: hover && isHovering ? 'translateY(-1px)' : 'none',
        transition: 'all 0.18s ease',
        cursor: hover ? 'pointer' : 'default',
        ...style,
      }}
      className={className}
      onMouseEnter={() => hover && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>
      {children}
    </div>
  );
};

const Divider = () => <div style={{ height: 1, background: COLORS.border, margin: '16px 0' }} />;

// ─── Chart.js wrapper + style defaults ────────────────────────────────────
const ChartJS = ({ type, data, options, height = 240 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const dataKey = JSON.stringify(data);
  const optionsKey = JSON.stringify(options);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, { type, data, options });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [type, dataKey, optionsKey]);
  return <div style={{ height, position: 'relative' }}><canvas ref={canvasRef} /></div>;
};

const CHART_FONT = { family: "'DM Sans', sans-serif", size: 11 };
const baseScales = (yFormatter) => ({
  y: { beginAtZero: true, grid: { color: COLORS.border, drawBorder: false }, ticks: { color: COLORS.textSoft, font: CHART_FONT, callback: yFormatter || ((v) => v) } },
  x: { grid: { display: false }, ticks: { color: COLORS.textSoft, font: CHART_FONT } },
});
const baseTooltip = {
  backgroundColor: COLORS.navy,
  titleFont: { family: "'DM Sans', sans-serif", size: 12, weight: '600' },
  bodyFont: CHART_FONT,
  padding: 10, cornerRadius: 8, displayColors: false,
};

// ─── Notifications (derived from proposals state) ─────────────────────────
const NOTIFICATION_TYPES = {
  overdue:   { icon: '⚠', color: '#B8493A', bg: '#F9EAE6' },
  today:     { icon: '📅', color: '#D4A04C', bg: '#FCF6E8' },
  signed:    { icon: '✓', color: '#558B2F', bg: '#E8F2DA' },
  activity:  { icon: '👤', color: '#4A7C2E', bg: '#EEF6E5' },
  viewed:    { icon: '👁', color: '#2563EB', bg: '#E8EEFB' },
  emailed:   { icon: '📨', color: '#7C5A8A', bg: '#F1EAF6' },
  signal:    { icon: '📡', color: '#0E8F80', bg: '#E3F4F1' },
  intel:     { icon: '🛰', color: '#B8493A', bg: '#F9EAE6' },
  system:    { icon: '⚡', color: '#5F6557', bg: '#EFF2E8' },
};

// shares: map of proposalId → share summary from GET /api/shares (view tracking)
// signals: radar leads with outreach state, from GET /api/signals
// news + prospects: policy intel items → high-severity ones raise alerts
// (newsMatchesProspect is defined with the radar helpers above)
function deriveNotifications(proposals, shares = {}, signals = [], news = [], prospects = []) {
  const out = [];
  const weekAgo = Date.now() - 7 * 86400000;
  news.filter(n => n.severity === 'high' && new Date(n.at).getTime() >= weekAgo).forEach(n => {
    const affected = prospects.filter(pr => newsMatchesProspect(n, pr)).length;
    out.push({
      id: `n-intel-${n.id}`, type: 'intel',
      title: `Policy alert · ${n.title.length > 70 ? n.title.slice(0, 70) + '…' : n.title}`,
      body: `${affected > 0 ? `Affects ${affected} prospect${affected === 1 ? '' : 's'} · ` : ''}${n.source}${n.handle ? ' · ' + n.handle : ''}`,
      time: n.at, unread: true,
    });
  });
  const fresh = signals.filter(s => (s.state?.status || 'new') === 'new');
  if (fresh.length > 0) {
    // id includes the count so the entry re-surfaces unread when new signals land
    out.push({
      id: `n-signals-${fresh.length}`, type: 'signal',
      title: `${fresh.length} radar signal${fresh.length === 1 ? '' : 's'} awaiting first touch`,
      body: fresh.slice(0, 3).map(s => s.handle).join(' · ') + (fresh.length > 3 ? ` · +${fresh.length - 3} more` : ''),
      time: new Date().toISOString().slice(0, 10), unread: true,
    });
  }
  Object.values(shares).forEach(s => {
    if (s.viewCount > 0) {
      // id includes the count so each new view re-surfaces as an unread notification
      out.push({
        id: `n-view-${s.token}-${s.viewCount}`, type: 'viewed', proposalId: s.proposalId,
        title: `Proposal viewed · ${s.prospectName || s.name}`,
        body: `${s.viewCount} view${s.viewCount === 1 ? '' : 's'} on the shared link${s.recentViews?.[0]?.country ? ` · latest from ${s.recentViews[0].country}` : ''}`,
        time: s.lastViewedAt, unread: true,
      });
    }
    if (s.emails && s.emails.length > 0) {
      out.push({
        id: `n-sent-${s.token}-${s.emails.length}`, type: 'emailed', proposalId: s.proposalId,
        title: `Proposal emailed · ${s.prospectName || s.name}`,
        body: `Sent to ${s.emails[0].to}`,
        time: s.emails[0].at, unread: false,
      });
    }
  });
  proposals.forEach(p => {
    const d = daysUntil(p.nextFollowUp);
    const owner = SAMPLE_TEAM.find(t => t.id === p.ownerId);
    if (d !== null && d < 0 && !['won','lost'].includes(p.status)) {
      out.push({ id: `n-${p.id}-overdue`, type: 'overdue', proposalId: p.id, title: `Follow-up overdue · ${p.prospect?.name}`, body: `${Math.abs(d)} day${d === -1 ? '' : 's'} past due${owner ? ` · owned by ${owner.name.split(' ')[0]}` : ''}`, time: p.nextFollowUp, unread: true });
    } else if (d === 0) {
      out.push({ id: `n-${p.id}-today`, type: 'today', proposalId: p.id, title: `Follow-up today · ${p.prospect?.name}`, body: `${owner ? `${owner.name.split(' ')[0]} is on point` : 'Owner unassigned'}`, time: p.nextFollowUp, unread: true });
    }
    if (p.status === 'won') {
      out.push({ id: `n-${p.id}-won`, type: 'signed', proposalId: p.id, title: `Proposal signed · ${p.prospect?.name}`, body: `Welcome to the customer success queue.`, time: p.created, unread: false });
    }
    // Latest activity from a teammate
    if (p.activities && p.activities[0] && !['won','lost'].includes(p.status)) {
      const act = p.activities[0];
      const actCfg = ACTIVITY_TYPES[act.type] || {};
      const dAgo = daysUntil(act.date);
      if (dAgo !== null && dAgo > -3) {
        out.push({ id: `n-${p.id}-act-${act.id}`, type: 'activity', proposalId: p.id, title: `${act.by} · ${actCfg.label || 'note'}`, body: `${p.prospect?.name} — ${act.content.slice(0, 80)}${act.content.length > 80 ? '…' : ''}`, time: act.date, unread: true });
      }
    }
  });
  // System notifications (always present)
  out.push({ id: 'n-sys-1', type: 'system', title: 'Quarterly business review export ready', body: 'Q1 2026 customer summary available in the Trust & Security center.', time: dateOffset(-1), unread: false });
  return out.sort((a, b) => new Date(b.time) - new Date(a.time));
}

// IPTalons leaf logo as inline SVG — three leaves stacked, sage green
// The real IPTalons talon mark (from iptalons.com). `white` renders the
// all-white variant for dark surfaces. Full lockups: /logo.webp, /logo-white.webp.
const IPTalonsLogo = ({ size = 28, white = false }) => (
  <img src={white ? '/logo-mark-white.webp' : '/logo-mark.webp'} alt="IPTalons"
    style={{ height: size * 0.86, width: 'auto', display: 'block', flexShrink: 0 }} />
);

// Export everything to window
Object.assign(window, {
  COLORS, STATUS_CONFIG, PROSPECT_TYPE_CONFIG, SERVICES, PRICING_TIERS, SAMPLE_PROSPECTS, SAMPLE_PROPOSALS,
  SAMPLE_TEAM, ACTIVITY_TYPES, NOTIFICATION_TYPES,
  RADAR_URL, stripHtml, mergeRadarExport, DEMO_SIGNALS, DEMO_NEWS, demoMarketing, freshenFollowUps, newsMatchesProspect,
  CSR_JOURNEY_STEPS, CSR_PLATFORM_FEATURES, CSR_INCLUDED_TOOLS, CSR_TRUST_POINTS,
  fmt$, fmt$d, fmtDate, fmtDateLong, genId, calcItemTotal, calcProposalTotals,
  daysUntil, fmtRelativeDate, followUpTone, dateOffset, freshenFollowUps, deriveNotifications,
  Btn, Badge, Input, Select, Textarea, Card, Divider, IPTalonsLogo,
  ChartJS, CHART_FONT, baseScales, baseTooltip,
  useState, useEffect, useRef, useCallback, useMemo,
});
