// IPTalons Proposals — App Shell + AI Panel

// ─── AI Panel (sidebar assistant) ──────────────────────────────────────────
const AIPanel = ({ proposal }) => {
  const welcomeText = proposal
    ? `Hi! I'm your IPTalons proposal assistant. I can help with this ${proposal.prospect?.name || 'proposal'}:\n\n• Rewrite or polish sections\n• Tighten the intro letter\n• Strengthen the savings analysis\n• Answer NSPM-33 / CHIPS Act questions\n• Suggest objection-handling language\n\nAsk me anything.`
    : "Hi! I'm your IPTalons proposal assistant. Open a proposal and I'll help you tighten the prose, sharpen the savings analysis, or answer NSPM-33 / CHIPS Act compliance questions.";

  const [messages, setMessages] = useState([{ role: 'assistant', text: welcomeText }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: text.trim() }]);
    setLoading(true);

    const totals = proposal ? calcProposalTotals(proposal) : null;
    const proposalSummary = proposal ? `
Current Proposal: ${proposal.name}
Prospect: ${proposal.prospect?.name} (${proposal.prospect?.researcherCount} researchers, ${fmt$(proposal.prospect?.federalFunding || 0)} federal funding)
Tier: ${(PRICING_TIERS[proposal.tier] || {}).name || 'Custom'}
Annual Total: ${fmt$(totals?.total || 0)}
Estimated Savings: ${fmt$(proposal.savingsEstimate || 0)}
Status: ${proposal.status}
${proposal.prospect?.radar ? `Demand Radar signal — the prospect's own public words (via ${proposal.prospect.radar.src}): "${proposal.prospect.radar.quote}" · Their pain: ${proposal.prospect.radar.pain} · Suggested angle: ${proposal.prospect.radar.angle}` : ''}
` : 'No proposal currently open.';

    const systemPrompt = `You are a research security proposal advisor for IPTalons, Inc. — a Dallas-based firm helping universities and research institutions comply with NSPM-33, the CHIPS Act, NDAA, and other federal research security regulations. You know IPTalons' products: Certified Secure Researcher (CSR), RedBook with Grant Hopper AI, and consulting services.

${proposalSummary}

Answer concisely and practically. Match the warm, expert, confident voice of CEO Allen Phelps. When asked to rewrite text, return the polished version cleanly without preamble.`;

    try {
      const response = await window.claude.complete({
        messages: [{ role: 'user', content: systemPrompt + '\n\nUser: ' + text }],
      });
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Sorry, I hit an error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const quickActions = [
    { label: '✍️ Tighten intro letter', prompt: 'Rewrite the introduction letter to be 25% shorter while keeping its warmth and authority. Make sure NSPM-33 and the CHIPS Act are still referenced in the first paragraph.' },
    { label: '💰 Sharpen savings analysis', prompt: 'Rewrite the savings analysis to be more concrete — break out specific dollar ranges per category and tie them to this prospect\'s researcher count.' },
    { label: '🛡 Handle pricing objection', prompt: 'Draft 3 short paragraphs handling the most common objection: "this is more than we budgeted for internal research security tools." Frame it against the cost of a single False Claims Act allegation.' },
    { label: '📋 NSPM-33 compliance summary', prompt: 'In 5 bullet points, summarize what NSPM-33 and the CHIPS Act require of research institutions, and how CSR + RedBook satisfy each requirement.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: COLORS.surface }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, background: COLORS.navy }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Proposal Assistant</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Powered by Claude</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 12px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {quickActions.map(qa => (
          <button key={qa.label} onClick={() => send(qa.prompt)}
            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.textMid, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s' }}
            onMouseEnter={e => { e.target.style.background = COLORS.blueLight; e.target.style.borderColor = COLORS.blue; e.target.style.color = COLORS.blue; }}
            onMouseLeave={e => { e.target.style.background = COLORS.bg; e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textMid; }}>
            {qa.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '88%', padding: '10px 13px', borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              background: msg.role === 'user' ? COLORS.blue : COLORS.bg,
              color: msg.role === 'user' ? '#fff' : COLORS.text,
              fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.blue, animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask the assistant to rewrite, polish, or answer compliance questions…"
            rows={2}
            style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none' }} />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            style={{ padding: '8px 14px', background: input.trim() && !loading ? COLORS.blue : COLORS.border, color: input.trim() && !loading ? '#fff' : COLORS.textSoft, border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'default', fontSize: 16, transition: 'all 0.15s' }}>↑</button>
        </div>
        <div style={{ fontSize: 10, color: COLORS.textGhost, marginTop: 5 }}>Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  );
};

// ─── Sidebar SVG icons (sized for IPTalons sidebar) ────────────────────────
const iconStyle = (active, disabled) => ({ color: disabled ? 'rgba(255,255,255,0.2)' : active ? '#fff' : 'rgba(255,255,255,0.55)', flexShrink: 0 });
const SvgDash    = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity={active?1:0.6}/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity={active?1:0.6}/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity={active?1:0.4}/></svg>;
const SvgDoc     = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><rect x="2" y="1" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5H10M5 7.5H10M5 10H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const SvgList    = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><path d="M2 4H13M2 7.5H13M2 11H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const SvgPeople  = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><circle cx="5.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13C1 10.8 3 9 5.5 9C8 9 10 10.8 10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/><path d="M13 12.5C13 11 12.1 9.8 11 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/></svg>;
const SvgCatalog = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M8.5 11H13.5M11 8.5V13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const SvgTemplate= ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><rect x="1" y="1" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5H14" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5V14" stroke="currentColor" strokeWidth="1.2"/></svg>;
const SvgChart   = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><path d="M1.5 13.5L5 9L8 11L12 5.5L13.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 13.5H13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const SvgGear    = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5V3M7.5 12V13.5M1.5 7.5H3M12 7.5H13.5M3 3L4 4M11 11L12 12M3 12L4 11M11 4L12 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const SvgShield  = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><path d="M7.5 1.5L2 3.5V7.5C2 10.5 4.5 12.7 7.5 13.5C10.5 12.7 13 10.5 13 7.5V3.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 7.5L7 9L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SvgRadar   = ({active,disabled}) => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={iconStyle(active,disabled)}><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2"/><circle cx="7.5" cy="7.5" r="3.2" stroke="currentColor" strokeWidth="1.1" opacity="0.6"/><circle cx="7.5" cy="7.5" r="1" fill="currentColor"/><path d="M7.5 7.5L11.8 3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10.2" cy="9.6" r="1" fill="currentColor" opacity="0.75"/></svg>;

const BreadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginRight: 2 }}>
    <rect x="1" y="1" width="5" height="5" rx="1" fill={COLORS.border}/>
    <rect x="8" y="1" width="5" height="5" rx="1" fill={COLORS.border}/>
    <rect x="1" y="8" width="5" height="5" rx="1" fill={COLORS.border}/>
    <rect x="8" y="8" width="5" height="5" rx="1" fill={COLORS.blue} opacity="0.5"/>
  </svg>
);

const TopBarIcon = ({ children, title }) => (
  <div title={title} style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, cursor: 'pointer', transition: 'background 0.12s' }}
    onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    {children}
  </div>
);
const StatPill = ({ label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
    <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
    <span style={{ fontSize: 11, color: COLORS.textSoft }}>{label}</span>
  </div>
);

// ─── Live Demo tour ─────────────────────────────────────────────────────────
// A self-playing walkthrough of the real screens, started from the login page.
const DEMO_STEPS = [
  { screen: 'dashboard', caption: 'Your pipeline at a glance — every proposal with its owner, next follow-up, live status, and CRM notes.', dur: 7000 },
  { screen: 'dashboard', intel: true, caption: 'Policy & Market Intel: events swept daily from X and the Federal Register, qualified by Claude, matched to your pipeline. This HIGH alert touches nearly every prospect — click any one and Claude drafts the outreach it justifies.', dur: 11000 },
  { screen: 'signals',   caption: 'The Demand Radar, built in: leads scanned daily from r/SBIR, r/NIH and X — each with the prospect’s own words and a ready opening angle.', dur: 9500 },
  { screen: 'prospects', caption: 'Signals sync into your prospect list automatically — and every affected prospect carries a 🛰 chip showing which policy events touch them.', dur: 7500 },
  { screen: 'editor', openProposal: true, caption: 'Claude drafts the intro letter and savings analysis in Allen’s voice, grounded in the prospect’s profile. Pricing computes itself from researcher count.', dur: 9500 },
  { screen: 'editor', preview: true, caption: 'One click renders the print-ready, Baylor-format document — cover to signature page, with the CSR journey, RedBook™ and Grant Hopper AI sections built in.', dur: 9500 },
  { screen: 'editor', caption: 'Share & Track publishes a private recipient link — every prospect view is logged and lands in your Notifications, next to the policy alerts.', dur: 7500 },
  { screen: 'dashboard', notif: true, caption: 'Nothing slips: prospect views, policy alerts, radar signals awaiting first touch, follow-ups due, and team activity — one feed, one glance every morning. The same digest arrives by email at 7:30 AM.', dur: 9500 },
  { screen: 'reports', scrollTo: 'Website & Ads', caption: 'Analytics down to the marketing layer: sessions, campaigns, and the ads ↔ radar ↔ proposals correlation. Sign in to run it for real.', dur: 9000 },
];

const DemoOverlay = ({ step, playing, onPrev, onNext, onPlayPause, onExit }) => {
  const s = DEMO_STEPS[step];
  return (
    <>
      {/* LIVE DEMO chip */}
      <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 2001, pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 7,
        background: '#B8493A', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1, padding: '5px 12px', borderRadius: 999, boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', animation: 'radar-blip 1.6s ease-in-out infinite' }} />
        LIVE DEMO
      </div>

      {/* Caption + controls */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 22, zIndex: 2001, pointerEvents: 'auto', display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ maxWidth: 660, width: '100%', background: 'rgba(26,31,26,0.95)', backdropFilter: 'blur(6px)', borderRadius: 14, padding: '16px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.35)' }}>
          <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.6, marginBottom: 12, textAlign: 'center', fontWeight: 500 }}>{s.caption}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {DEMO_STEPS.map((_, i) => (
                <span key={i} style={{ width: i === step ? 18 : 7, height: 7, borderRadius: 999, transition: 'all 0.25s',
                  background: i === step ? '#7CB342' : i < step ? 'rgba(124,179,66,0.5)' : 'rgba(255,255,255,0.22)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: '‹', title: 'Previous', onClick: onPrev, disabled: step === 0 },
                { label: playing ? '⏸' : '▶', title: playing ? 'Pause' : 'Play', onClick: onPlayPause },
                { label: '›', title: 'Next', onClick: onNext },
              ].map(b => (
                <button key={b.title} title={b.title} onClick={b.onClick} disabled={b.disabled}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
                    color: b.disabled ? 'rgba(255,255,255,0.25)' : '#fff', fontSize: 14, cursor: b.disabled ? 'default' : 'pointer', fontFamily: 'inherit' }}>{b.label}</button>
              ))}
              <button onClick={onExit}
                style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: '#7CB342', color: '#1A1F1A', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Exit demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── App Shell ──────────────────────────────────────────────────────────────
const App = () => {
  // Auth state
  const [auth, setAuth] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    let active = true;
    localStorage.removeItem('ip_api_key');
    fetch('/api/me').then(r => r.json()).then(data => {
      if (!active) return;
      setAuthMode(data.mode || "legacy");
      if (data.authed) {
        let saved; try { saved = JSON.parse(localStorage.getItem('ip_authed') || 'null'); } catch {}
        setAuth(data.user || saved || { user: 'team', name: 'IPTalons Team' });
      } else localStorage.removeItem('ip_authed');
    }).catch(() => {}).finally(() => { if (active) setAuthChecked(true); });
    return () => { active = false; };
  }, []);
  const logout = () => {
    if (authMode === 'access') { window.location.assign('/cdn-cgi/access/logout'); return; }
    localStorage.removeItem('ip_authed');
    fetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
    setAuth(null);
  };

  const [screen, setScreen] = useState('dashboard');
  const storageBlocked = useRef(new Set());
  const [storageError, setStorageError] = useState('');
  const loadRecords = key => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(value) || value.some(v => !v || typeof v !== 'object' || Array.isArray(v))) throw new Error('Invalid saved records');
      return value;
    } catch { storageBlocked.current.add(key); return []; }
  };
  const [proposals, setProposals] = useState(() => loadRecords('ip_proposals_v2'));
  const [prospects, setProspects] = useState(() => loadRecords('ip_prospects_v1'));
  const [currentProp, setCurrentProp] = useState(null);
  const [wizardData, setWizardData] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [aiOpen, setAiOpen] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shares, setShares] = useState({}); // proposalId → share summary (view tracking)
  const [demo, setDemo] = useState(null); // {step, playing} — Live Demo tour

  const persistRecords = (key, records) => {
    if (authMode !== 'legacy') return;
    if (storageBlocked.current.has(key)) {
      setStorageError('Saved records could not be read. Original data has been preserved. Export a backup in Settings before continuing.');
      return;
    }
    try { localStorage.setItem(key, JSON.stringify(records)); }
    catch { setStorageError('Changes could not be saved in this browser. Keep this tab open and resolve browser storage before continuing.'); }
  };
  useEffect(() => { persistRecords('ip_proposals_v2', proposals); }, [proposals, authMode]);
  useEffect(() => { persistRecords('ip_prospects_v1', prospects); }, [prospects, authMode]);

  const shared = useSharedWorkspace({ mode: authMode, auth, proposals, prospects, setProposals, setProspects,
    clearEditor: () => { setCurrentProp(null); setScreen('dashboard'); } });

  // Demand Radar signals — auto-synced server-to-server (no password prompt).
  // Every sync silently merges leads into prospects (idempotent) so the radar
  // and the proposal pipeline are one system.
  const [signals, setSignals] = useState([]);
  const [signalsSyncedAt, setSignalsSyncedAt] = useState(null);
  const [signalsError, setSignalsError] = useState('');
  const loadSignals = useCallback(async (runScan = false) => {
    try {
      setSignalsError('');
      if (runScan) {
        const sync = await fetch('/api/signals/sync', { method: 'POST' });
        const result = await sync.json().catch(() => ({}));
        if (!sync.ok) throw new Error(result.error || `Signal scan failed (${sync.status})`);
      }
      const resp = await fetch('/api/signals');
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || `Signal load failed (${resp.status})`);
      const stMap = (data.state && data.state.leads) || {};
      setSignals((data.leads || []).filter(l => l.t !== 'comp').map(l => ({
        ...l,
        state: stMap[l.sourceId] || stMap[l.handle] || { status: 'new', owner: '', notes: '' },
      })));
      setSignalsSyncedAt(data.meta?.scannedAt || null);
      if (authMode !== 'access') setProspects(prev => mergeRadarExport(prev, data).prospects);
      return data;
    } catch (error) { setSignalsError(error.message || 'Signal sync failed'); throw error; }
  }, [authMode]);
  useEffect(() => {
    if (!auth) return;
    loadSignals();
    const t = setInterval(loadSignals, 300000); // every 5 min
    return () => clearInterval(t);
  }, [auth, loadSignals]);

  const updateSignal = async (sourceId, patch) => {
    setSignals(prev => prev.map(s => (s.sourceId || s.handle) === sourceId ? { ...s, state: { ...s.state, ...patch } } : s));
    try {
      const resp = await fetch('/api/signals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, patch }),
      });
      if (!resp.ok) throw new Error('sync failed');
    } catch { loadSignals(); } // roll back to server truth
  };

  // Policy & market intel — news items ingested by the daily sweep
  const [news, setNews] = useState([]);
  const loadNews = useCallback(async () => {
    try {
      const resp = await fetch('/api/news');
      if (!resp.ok) return;
      const data = await resp.json();
      setNews(data.items || []);
    } catch {}
  }, []);
  useEffect(() => {
    if (!auth) return;
    loadNews();
    const t = setInterval(loadNews, 300000);
    return () => clearInterval(t);
  }, [auth, loadNews]);

  // Poll share view-tracking so "prospect viewed your proposal" lands as a notification
  const loadShares = useCallback(async () => {
    try {
      const resp = await fetch('/api/shares');
      if (!resp.ok) return; // 401 = server session missing (sign out/in re-syncs it)
      const data = await resp.json();
      const map = {};
      (data.shares || []).forEach(s => { if (!map[s.proposalId] || s.createdAt > map[s.proposalId].createdAt) map[s.proposalId] = s; });
      setShares(map);
    } catch {}
  }, []);
  useEffect(() => {
    if (!auth) return;
    loadShares();
    const t = setInterval(loadShares, 60000);
    return () => clearInterval(t);
  }, [auth, loadShares]);

  window._ipNav = (s) => setScreen(s);

  // ── Live Demo tour ──────────────────────────────────────────
  const startDemo = () => {
    // Signed-in users keep their real session (the tour shows their live data);
    // anonymous viewers get an in-memory demo session — refresh exits.
    setAuth(a => a || { user: 'demo', name: 'Live Demo', demo: true });
    setDemo({ step: 0, playing: true });
  };
  const exitDemo = () => {
    setDemo(null);
    setShowPreview(false);
    setCurrentProp(null);
    setScreen('dashboard');
    // Restore the real session if one exists; anonymous viewers go back to login
    try {
      const saved = localStorage.getItem('ip_authed');
      setAuth(saved ? JSON.parse(saved) : null);
    } catch { setAuth(null); }
  };
  const gotoDemoStep = (i) => {
    if (i >= DEMO_STEPS.length) { exitDemo(); return; }
    setDemo(d => d ? { ...d, step: Math.max(0, i) } : d);
  };

  // ?demo=1 auto-starts the tour (used by the pitch deck's embedded iframe) —
  // for signed-in users too, since the deck's iframe shares their session
  useEffect(() => {
    // Public demo disabled until it has an isolated synthetic data store.
  }, []);

  // Apply the current step: navigate, open the sample proposal, toggle preview
  useEffect(() => {
    if (!demo) return;
    const s = DEMO_STEPS[demo.step];
    if (s.openProposal || s.screen === 'editor') setCurrentProp(prev => prev || proposals[0] || null);
    setShowPreview(Boolean(s.preview));
    setShowShare(false); setShowSignature(false); setNotifOpen(Boolean(s.notif)); setUserMenuOpen(false); setSidebarOpen(false);
    setScreen(s.screen);
    if (s.scrollTo) {
      setTimeout(() => {
        const h = [...document.querySelectorAll('h2')].find(el => el.textContent.includes(s.scrollTo));
        if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 700);
    }
  }, [demo && demo.step]);

  // Auto-advance
  useEffect(() => {
    if (!demo || !demo.playing) return;
    const t = setTimeout(() => gotoDemoStep(demo.step + 1), DEMO_STEPS[demo.step].dur);
    return () => clearTimeout(t);
  }, [demo]);

  // Server session is authoritative; the local marker is only a display label.
  if (!authChecked) return <div style={{ padding: 32 }}>Checking workspace session…</div>;
  if (!auth) {
    if (authMode === 'access') return <div style={{ padding: 32 }}><h1>IPTalons team sign-in</h1><p>A verified, approved Cloudflare Access identity is required. Contact your administrator if your email has not been enabled.</p><a href="/cdn-cgi/access/login">Sign in with Cloudflare Access</a></div>;
    return <LoginScreen onAuth={setAuth} />;
  }

  if (authMode === 'access' && !shared.ready) return <div style={{ padding: 32 }}><h1>Loading workspace</h1>{shared.controls}</div>;

  // During the tour (not signed in) the live signal/news feeds 401 — show the demo snapshots
  const displaySignals = demo && signals.length === 0 ? DEMO_SIGNALS : signals;
  const displayNews = demo && news.length === 0 ? DEMO_NEWS : news;

  const openProposal = (p) => { setCurrentProp(p); setScreen('editor'); };
  // Optionally seeded with a prospect (e.g. "Draft proposal" from a radar signal).
  // Guard on .id — sidebar/dashboard call this with a click event as the first arg.
  const startNew = (pre) => {
    const seed = pre && pre.id ? pre : null;
    const year = new Date().getFullYear();
    setWizardData({
      id: crypto.randomUUID(),
      proposalNumber: `PROP-${year}-${String(proposals.length + 1).padStart(3, '0')}`,
      name: seed ? `${seed.name} — Research Security Program Support Services` : '',
      prospect: seed || {}, items: [], tier: 'standard',
      status: 'draft', created: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      introLetter: '', savingsAnalysis: '', savingsEstimate: 500000,
      paymentTerms: 'Subscription costs are payable in advance at the start of the performance period via ACH electronic payment on NET 30 terms. Supplemental support hours invoiced monthly on NET 30 terms.',
    });
    setWizardStep(1);
    setScreen('wizard');
  };

  const saveProposal = (p) => {
    setCurrentProp(p);
    setProposals(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      return idx >= 0 ? prev.map((x, i) => i === idx ? p : x) : [p, ...prev];
    });
  };

  // Update a proposal in place without switching the active editor proposal
  // (used by list-level edits like the Notes modal).
  const updateProposal = (p) => {
    setProposals(prev => prev.map(x => x.id === p.id ? p : x));
    setCurrentProp(c => (c && c.id === p.id ? p : c));
  };

  const draftCount = proposals.filter(p => p.status === 'draft').length;
  const sentCount  = proposals.filter(p => p.status === 'sent').length;
  const reviewCount = proposals.filter(p => p.status === 'review').length;
  const newSignalCount = displaySignals.filter(s => (s.state?.status || 'new') === 'new').length;

  const NAV_SECTIONS = [
    { label: 'WORKSPACE', items: [
      { id: 'dashboard', icon: SvgDash, label: 'Dashboard' },
      { id: 'editor',    icon: SvgDoc,  label: 'Active Proposal', disabled: !currentProp, badge: currentProp ? '●' : null, badgeColor: COLORS.green },
    ]},
    { label: 'PIPELINE', items: [
      { id: 'signals',   icon: SvgRadar,   label: 'Signals', badge: newSignalCount > 0 ? newSignalCount : null, badgeColor: '#37E0C8' },
      { id: 'proposals', icon: SvgList,    label: 'All Proposals', badge: draftCount > 0 ? draftCount : null },
      { id: 'prospects', icon: SvgPeople,  label: 'Prospects' },
      { id: 'services',  icon: SvgCatalog, label: 'Services Catalog' },
      { id: 'templates', icon: SvgTemplate,label: 'Templates' },
    ]},
    { label: 'REPORTS', items: [
      { id: 'reports',   icon: SvgChart, label: 'Analytics' },
    ]},
    { label: 'SYSTEM', items: [
      { id: 'team',      icon: SvgPeople, label: 'Team' },
      { id: 'trust',     icon: SvgShield, label: 'Trust & Security' },
      { id: 'settings',  icon: SvgGear,   label: 'Settings' },
    ]},
  ];

  const handleNav = (id) => {
    setSidebarOpen(false);
    if (id === 'proposals') { setScreen('dashboard'); return; }
    setScreen(id);
  };
  const isActive = (id) => (id === 'proposals' && screen === 'dashboard') || screen === id;

  const SCREEN_LABELS = {
    dashboard: 'All Proposals',
    signals:   'Signals',
    prospects: 'Prospects',
    services:  'Services Catalog',
    templates: 'Templates',
    reports:   'Analytics',
    team:      'Team',
    trust:     'Trust & Security',
    settings:  'Settings',
  };

  const handleSendForSignature = () => { setShowSignature(true); };
  const handleSignatureSent = () => {
    if (currentProp) {
      const updated = { ...currentProp, status: 'sent', sentForSignatureAt: new Date().toISOString() };
      setCurrentProp(updated);
      setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  };

  // Derived unread notification count for the bell badge
  const unreadNotifCount = (() => {
    try {
      const read = new Set(JSON.parse(localStorage.getItem('ip_notif_read') || '[]'));
      return deriveNotifications(proposals, shares, displaySignals, displayNews, prospects).filter(n => n.unread && !read.has(n.id)).length;
    } catch { return 0; }
  })();

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif", background: COLORS.bg, color: COLORS.text, overflow: 'hidden', pointerEvents: demo ? 'none' : 'auto' }}>

      {storageError && <div role="alert" style={{ position: 'fixed', bottom: 12, left: 245, right: 12, zIndex: 2000, padding: 16, background: '#fff0cf', color: '#742900' }}>{storageError}</div>}
      {/* ─── Sidebar ──────────────────────────────────────────── */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(31,42,27,0.45)', zIndex: 90 }} />}
      <div className={'ip-sidebar' + (sidebarOpen ? ' ip-sidebar-open' : '')} style={{ width: 232, background: COLORS.navy, display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid rgba(0,0,0,0.18)' }}>
        {/* Workspace switcher */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.09)' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #558B2F 0%, #2D4422 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IPTalonsLogo size={20} white />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>IPTalons, Inc.</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3 }}>Research Security · Pro</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><path d="M4 5.5L7 8.5L10 5.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 14px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '7px 10px', cursor: 'text' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4"/><path d="M9 9L11.5 11.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Search…</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 5px', letterSpacing: 0.3 }}>⌘K</span>
          </div>
        </div>

        {/* New Proposal CTA */}
        <div style={{ padding: '8px 14px 10px' }}>
          <button onClick={startNew} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '8px 12px', borderRadius: 8, border: 'none', background: COLORS.blue, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 0.2, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#3D6826'}
            onMouseLeave={e => e.currentTarget.style.background=COLORS.blue}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1V12M1 6.5H12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            New Proposal
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: 1.1, padding: '0 8px', marginBottom: 4, textTransform: 'uppercase' }}>{section.label}</div>
              {section.items.map(item => {
                const active = isActive(item.id);
                const disabled = item.disabled;
                return (
                  <button key={item.id}
                    onClick={() => !disabled && handleNav(item.id)}
                    disabled={disabled}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 7, marginBottom: 1, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: active ? 'rgba(255,255,255,0.13)' : 'transparent', color: disabled ? 'rgba(255,255,255,0.2)' : active ? '#fff' : 'rgba(255,255,255,0.58)', fontSize: 13, fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.12s', position: 'relative' }}
                    onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
                    {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: COLORS.green }} />}
                    <item.icon active={active} disabled={disabled} />
                    <span style={{ flex: 1, fontWeight: active ? 600 : 400 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: item.badge === '●' ? '0' : '1px 6px', borderRadius: 10, background: item.badge === '●' ? 'transparent' : 'rgba(255,255,255,0.1)', color: item.badgeColor || 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
          <div onClick={() => setUserMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s', background: userMenuOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onMouseEnter={e => { if (!userMenuOpen) e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.background='transparent'; }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #7CB342, #558B2F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{(auth.name || "IP").slice(0,2).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth?.name || 'Allen L. Phelps'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{auth.role || "Team"} · Signed in</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="1.2" fill="rgba(255,255,255,0.3)"/><circle cx="7" cy="3.5" r="1.2" fill="rgba(255,255,255,0.3)"/><circle cx="7" cy="10.5" r="1.2" fill="rgba(255,255,255,0.3)"/></svg>
          </div>
          {userMenuOpen && (
            <>
              <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
              <div style={{ position: 'absolute', left: 14, right: 14, bottom: 64, background: '#fff', borderRadius: 10, boxShadow: COLORS.shadowLg, padding: 6, zIndex: 91 }}>
                <button onClick={() => { setUserMenuOpen(false); setScreen('settings'); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: COLORS.textMid, background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bgAlt}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  ⚙️ Account settings
                </button>
                <button onClick={() => { setUserMenuOpen(false); setScreen('trust'); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: COLORS.textMid, background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bgAlt}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  🛡 Trust & Security
                </button>
                <div style={{ height: 1, background: COLORS.border, margin: '4px 0' }} />
                <button onClick={() => { setUserMenuOpen(false); logout(); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: COLORS.red, background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.redBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  ↗ Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Main area ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: 54, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14, flexShrink: 0, position: 'relative' }}>
          <button className="ip-hamburger" onClick={() => setSidebarOpen(true)}
            style={{ width: 36, height: 36, border: `1px solid ${COLORS.border}`, background: '#fff', borderRadius: 8, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4H14M2 8H14M2 12H14" stroke={COLORS.textMid} strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
          <div style={{ flex: 1, fontSize: 13, color: COLORS.textSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
            {screen === 'wizard' && <><BreadIcon /><span>New Proposal</span><span style={{ color: COLORS.border, margin: '0 2px' }}>›</span><span style={{ color: COLORS.textMid, fontWeight: 500 }}>Step {wizardStep} of 3</span></>}
            {screen === 'editor' && currentProp && <>
              <BreadIcon />
              <span style={{ color: COLORS.blue, cursor: 'pointer', fontWeight: 500 }} onClick={() => setScreen('dashboard')}>Proposals</span>
              <span style={{ color: COLORS.border, margin: '0 2px' }}>›</span>
              <span style={{ color: COLORS.textMid, fontWeight: 500, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentProp.name}</span>
            </>}
            {SCREEN_LABELS[screen] && <><BreadIcon /><span style={{ color: COLORS.textMid, fontWeight: 500 }}>{SCREEN_LABELS[screen]}</span></>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {screen === 'editor' && (
              <button onClick={() => setAiOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 7, border: `1px solid ${aiOpen ? COLORS.blue : COLORS.border}`, background: aiOpen ? COLORS.blueLight : 'transparent', color: aiOpen ? COLORS.blue : COLORS.textSoft, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.15s' }}>
                AI {aiOpen ? 'On' : 'Off'}
              </button>
            )}
            <div onClick={() => setNotifOpen(o => !o)}>
              <TopBarIcon title="Notifications">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5C5 1.5 3 3.5 3 6V9L1.5 11H13.5L12 9V6C12 3.5 10 1.5 7.5 1.5Z" stroke={COLORS.textSoft} strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 11.5C6 12.3 6.7 13 7.5 13C8.3 13 9 12.3 9 11.5" stroke={COLORS.textSoft} strokeWidth="1.3"/></svg>
                {unreadNotifCount > 0 && (
                  <div style={{ position: 'absolute', top: 3, right: 3, minWidth: 14, height: 14, padding: '0 3px', borderRadius: 999, background: COLORS.red, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', lineHeight: 1 }}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</div>
                )}
              </TopBarIcon>
            </div>
            <TopBarIcon title="Help">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke={COLORS.textSoft} strokeWidth="1.3"/><path d="M5.5 5.5C5.5 4.4 6.4 3.5 7.5 3.5C8.6 3.5 9.5 4.4 9.5 5.5C9.5 6.5 8.8 7.2 7.5 7.5V8.5" stroke={COLORS.textSoft} strokeWidth="1.3" strokeLinecap="round"/><circle cx="7.5" cy="10.5" r="0.8" fill={COLORS.textSoft}/></svg>
            </TopBarIcon>
            <div style={{ width: 1, height: 22, background: COLORS.border, margin: '0 2px' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <StatPill label="Drafts"   value={draftCount}  color={COLORS.textSoft} />
              <StatPill label="Sent"     value={sentCount}   color={COLORS.blue} />
              <StatPill label="In Review" value={reviewCount} color={COLORS.amber} />
            </div>
          </div>
        </div>

        {shared.controls}
        {/* Screen content */}
        <div inert={shared.busy ? '' : undefined} style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {screen === 'dashboard' && <Dashboard proposals={proposals} prospects={prospects} news={displayNews} onOpen={openProposal} onNew={startNew} onUpdate={updateProposal}
              demoExpandIntel={demo ? Boolean(DEMO_STEPS[demo.step] && DEMO_STEPS[demo.step].intel) : false} />}
            {screen === 'wizard' && wizardStep === 1 && (
              <WizardStep1 data={wizardData} prospects={prospects} onChange={(k, v) => setWizardData(d => ({ ...d, [k]: v }))} onNext={() => setWizardStep(2)} />
            )}
            {screen === 'wizard' && wizardStep === 2 && (
              <WizardStep2 data={wizardData} onChange={(k, v) => setWizardData(d => ({ ...d, [k]: v }))} onBack={() => setWizardStep(1)} onNext={() => setWizardStep(3)} />
            )}
            {screen === 'wizard' && wizardStep === 3 && (
              <WizardStep3 data={wizardData} onChange={(k, v) => setWizardData(d => ({ ...d, [k]: v }))} onBack={() => setWizardStep(2)} onDone={() => { saveProposal(wizardData); setCurrentProp(wizardData); setScreen('editor'); }} />
            )}
            {screen === 'editor' && currentProp && (
              <ProposalEditor proposal={currentProp} onChange={saveProposal} onPreview={() => setShowPreview(true)} onSendForSignature={handleSendForSignature}
                share={shares[currentProp.id]} onShare={() => setShowShare(true)} />
            )}
            {screen === 'signals' && (
              <Signals signals={displaySignals} syncedAt={signalsSyncedAt} error={signalsError} onUpdate={updateSignal} onSync={() => loadSignals(true)}
                onDraft={(sig) => {
                  const pid = 'radar-' + String(sig.handle).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const p = prospects.find(x => x.id === pid) || radarLeadToProspect(sig, sig.state);
                  if (!prospects.some(x => x.id === pid)) setProspects(prev => [p, ...prev]);
                  startNew(p);
                }} />
            )}
              {screen === 'prospects' && <Prospects prospects={prospects} onSync={loadSignals} syncedAt={signalsSyncedAt} news={displayNews} onAdd={prospect => setProspects(prev => [prospect, ...prev])} />}
            {screen === 'services'  && <ServicesScreen />}
            {screen === 'templates' && <Templates />}
            {screen === 'reports'   && <Analytics proposals={proposals} />}
            {screen === 'team' && (authMode === 'access' ? <ManagedTeam currentUser={auth.user} /> : <Team proposals={proposals} />)}
            {screen === 'trust'     && <TrustSecurity managed={authMode === 'access'} />}
            {screen === 'settings'  && <SettingsScreen managed={authMode === 'access'} exportShared={shared.exportEdits} />}
          </div>

          {screen === 'editor' && aiOpen && (
            <div style={{ width: 300, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <AIPanel proposal={currentProp} />
            </div>
          )}
        </div>
      </div>

      {showPreview && currentProp && <ProposalPreview proposal={currentProp} onClose={() => setShowPreview(false)} onSendForSignature={() => { setShowPreview(false); setShowSignature(true); }} />}
      {showSignature && currentProp && <SignatureModal proposal={currentProp} onClose={() => setShowSignature(false)} onSend={handleSignatureSent} />}
      {showShare && currentProp && (
        <ShareModal managed={authMode === 'access'} proposal={currentProp} onClose={() => { setShowShare(false); loadShares(); }}
          onShared={(s) => setShares(prev => ({ ...prev, [s.proposalId]: s }))}
          onProposalChange={saveProposal} />
      )}
      {notifOpen && <NotificationCenter proposals={proposals} shares={shares} signals={displaySignals} news={displayNews} prospects={prospects} onOpenProposal={openProposal} onClose={() => setNotifOpen(false)} />}
      {demo && (
        <DemoOverlay step={demo.step} playing={demo.playing}
          onPrev={() => gotoDemoStep(demo.step - 1)}
          onNext={() => gotoDemoStep(demo.step + 1)}
          onPlayPause={() => setDemo(d => ({ ...d, playing: !d.playing }))}
          onExit={exitDemo} />
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
