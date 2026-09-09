// IPTalons Proposals — Screen Components

// ─── Login Screen ──────────────────────────────────────────────────────────
const LoginScreen = ({ onAuth, onDemo }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const tryLogin = async (e) => {
    e?.preventDefault();
    setErr('');
    setBusy(true);
    const uname = user.trim().toLowerCase();
    try {
      // Server-side session (HMAC cookie) — powers share links, view tracking & email send
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      const serverOk = resp.ok;
      if (serverOk && uname) {
        const name = uname === 'allen' ? 'Allen L. Phelps' : user.trim();
        localStorage.setItem('ip_authed', JSON.stringify({ user: uname, name, loggedAt: new Date().toISOString() }));
        onAuth({ user: uname, name });
        return;
      }
      setErr(resp.status === 503 ? 'Workspace sign-in is not configured. Contact your administrator.' : resp.status === 429 ? 'Too many attempts. Please retry shortly.' : 'Invalid username or password.');
    } catch {
      setErr('Could not reach the sign-in service — check your connection and retry.');
    }
    setBusy(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left brand panel */}
      <div style={{ flex: 1, background: `linear-gradient(155deg, #2D4422 0%, #3D5C2E 50%, #558B2F 100%)`, color: '#fff', padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        {/* Hexagon backdrop */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.08 }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 800">
          <defs>
            <pattern id="hexLogin" x="0" y="0" width="80" height="92" patternUnits="userSpaceOnUse">
              <polygon points="40,4 73,24 73,68 40,88 7,68 7,24" fill="none" stroke="#A4D27A" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="600" height="800" fill="url(#hexLogin)"/>
        </svg>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/logo-white.webp" alt="IPTalons" style={{ height: 42, width: 'auto', display: 'block' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, marginBottom: 16 }}>
            The trusted partner of academic, corporate, and government research organizations worldwide.
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginBottom: 28 }}>
            Build, send, and track research security proposals — calibrated against your portfolio and ready for procurement review.
          </div>
          <div style={{ display: 'flex', gap: 22, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            <div><strong style={{ color: '#A4D27A', fontSize: 22, display: 'block' }}>4,500+</strong>investigations</div>
            <div><strong style={{ color: '#A4D27A', fontSize: 22, display: 'block' }}>$50B+</strong>research portfolio</div>
            <div><strong style={{ color: '#A4D27A', fontSize: 22, display: 'block' }}>2011</strong>since</div>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
          SOC 2 Type II · ISO 27001 · FedRAMP Moderate (in process) · CMMC Level 2
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, background: '#fff', padding: '64px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 560 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.blue, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>Sign in</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: -0.4 }}>Welcome back</h1>
        <div style={{ fontSize: 14, color: COLORS.textSoft, marginTop: 6, marginBottom: 28 }}>Sign in to your IPTalons workspace to continue.</div>

        <form onSubmit={tryLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Username or email" value={user} onChange={setUser} placeholder="allen" required />
          <Input label="Password" type="password" value={pass} onChange={setPass} placeholder="••••••••" required />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: COLORS.textMid, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Remember this device for 30 days
            </label>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: COLORS.blue, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
          </div>

          {err && <div style={{ fontSize: 12, color: COLORS.red, background: COLORS.redBg, padding: '8px 12px', borderRadius: 8 }}>{err}</div>}

          <Btn type="submit" disabled={busy || !user || !pass} className="w-full" onClick={tryLogin}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Btn>
        </form>

        {onDemo && (
          <button type="button" onClick={onDemo}
            style={{ marginTop: 24, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '13px 16px',
              background: 'linear-gradient(135deg, #2D4422 0%, #3D5C2E 100%)', color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 0.2, transition: 'all 0.15s', boxShadow: COLORS.shadowSm }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = COLORS.shadowSm; }}>
            <span style={{ display: 'inline-flex', width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,179,66,0.25)', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>▶</span>
            Watch the live demo — a 60-second tour of the real screens
          </button>
        )}

        <div style={{ marginTop: 16, padding: 14, background: COLORS.blueLight, borderRadius: 10, fontSize: 12, color: COLORS.textMid, lineHeight: 1.6 }}>
          <strong style={{ color: COLORS.text }}>💡 Demo credentials</strong>
          <div style={{ marginTop: 4 }}>Username <code style={{ background: '#fff', padding: '1px 6px', borderRadius: 4, fontFamily: 'ui-monospace, Menlo, monospace' }}>allen</code> · Password <code style={{ background: '#fff', padding: '1px 6px', borderRadius: 4, fontFamily: 'ui-monospace, Menlo, monospace' }}>ipt</code></div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 32, fontSize: 11, color: COLORS.textGhost }}>
          © 2026 IPTalons, Inc. · By signing in you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

// ─── Notification Center (dropdown) ────────────────────────────────────────
const NotificationCenter = ({ proposals, shares, signals, news, prospects, onOpenProposal, onClose }) => {
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ip_notif_read') || '[]')); } catch { return new Set(); }
  });
  const notifications = deriveNotifications(proposals, shares, signals, news, prospects).map(n => ({ ...n, unread: n.unread && !readIds.has(n.id) }));
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    const all = new Set([...readIds, ...notifications.map(n => n.id)]);
    setReadIds(all);
    localStorage.setItem('ip_notif_read', JSON.stringify([...all]));
  };

  const openOne = (n) => {
    const next = new Set([...readIds, n.id]);
    setReadIds(next);
    localStorage.setItem('ip_notif_read', JSON.stringify([...next]));
    if (n.proposalId) {
      const p = proposals.find(x => x.id === n.proposalId);
      if (p) { onOpenProposal(p); onClose(); }
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 800 }} />
      <div style={{ position: 'absolute', top: 48, right: 16, width: 380, maxHeight: 520, background: '#fff', borderRadius: 14, boxShadow: COLORS.shadowLg, border: `1px solid ${COLORS.border}`, zIndex: 801, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>Notifications</div>
            <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2 }}>{unreadCount} unread</div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ fontSize: 11, fontWeight: 600, color: COLORS.blue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Mark all read</button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: COLORS.textSoft }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>You're all caught up.
            </div>
          ) : notifications.map(n => {
            const cfg = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.system;
            return (
              <div key={n.id} onClick={() => openOne(n)}
                style={{ padding: '12px 18px', borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'background 0.12s', background: n.unread ? COLORS.bgAlt : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.blueLight}
                onMouseLeave={e => e.currentTarget.style.background = n.unread ? COLORS.bgAlt : 'transparent'}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{cfg.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                    {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.blue, flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2, lineHeight: 1.5 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: COLORS.textGhost, marginTop: 4 }}>{fmtRelativeDate(n.time)}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '10px 18px', borderTop: `1px solid ${COLORS.border}`, fontSize: 11, textAlign: 'center', background: COLORS.bgAlt }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: COLORS.blue, textDecoration: 'none', fontWeight: 600 }}>View activity log →</a>
        </div>
      </div>
    </>
  );
};

// ─── Send for Signature Modal (DocuSign-style) ────────────────────────────
const SignatureModal = ({ onClose }) => (
  <div role="dialog" aria-modal="true" aria-label="Electronic signing" style={{ position: 'fixed', inset: 0, background: 'rgba(31,42,27,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center' }}>
    <Card style={{ padding: 28, maxWidth: 460 }}>
      <h2>Electronic signing is not connected</h2>
      <p style={{ margin: '16px 0', lineHeight: 1.6 }}>Use Share &amp; Track to publish and email a proposal for review. Arrange signing through your approved signing service.</p>
      <Btn onClick={onClose}>Close</Btn>
    </Card>
  </div>
);

// ─── Trust & Security page ────────────────────────────────────────────────
const TrustSecurity = ({ managed = false }) => (
  <div style={{ padding: 36, maxWidth: 850 }}>
    <h1>Workspace security</h1>
    <p style={{ margin: '16px 0', lineHeight: 1.7 }}>This managed workspace helps the IPTalons team prepare and share proposals. Contact the workspace administrator for approved security documentation and data-handling requirements.</p>
    <Card style={{ padding: 24 }}>
      <h2>Sharing proposals</h2>
      <p style={{ margin: '12px 0', lineHeight: 1.7 }}>Published links contain a snapshot of the proposal’s customer-facing content. {managed ? "Staging links also require an approved team sign-in; external recipient access is not enabled." : "Anyone with a link can read that snapshot."} Internal notes and activity records are excluded.</p>
      <h2>Current limits</h2>
      <p style={{ margin: '12px 0', lineHeight: 1.7 }}>{managed ? "Saved records are shared in the workspace database. Unsaved changes stay in this tab: save or export them before leaving. Administrators can import backups after reviewing them." : "Working drafts currently remain in this browser. Export a backup before clearing browser data or changing computers."} Electronic signing is not connected.</p>
      <p style={{ lineHeight: 1.7 }}>Product certifications and restricted data residency require separately verified documentation. Do not upload regulated research records to this proposal workspace.</p>
    </Card>
  </div>
);

// ─── Dashboard ──────────────────────────────────────────────────────────────
// ─── Share & Track modal (Phase 2: recipient link + view tracking + email) ──
const ShareModal = ({ managed = false, proposal, onClose, onShared, onProposalChange }) => {
  const [share, setShare] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [to, setTo] = useState(proposal.prospect?.email || '');
  const [subject, setSubject] = useState(`Research Security Proposal — ${proposal.prospect?.name || 'your institution'}`);
  const [message, setMessage] = useState(
    `Dear ${proposal.prospect?.contact || 'colleague'},\n\nThank you for your interest in strengthening ${proposal.prospect?.name || 'your institution'}'s research security program. Your proposal is ready for review at the link below.\n\nWe look forward to working together.\n\nAllen L. Phelps\nCEO, IPTalons, Inc.`);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // {tone:'ok'|'err'|'setup', text}

  const [publishing, setPublishing] = useState(false);
  const publish = async () => {
    setPublishing(true); setError('');
    try {
      const resp = await fetch('/api/shares', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposal }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `Publish failed (${resp.status})`);
      setShare(data); onShared?.(data);
    } catch (e) { setError(e.message); }
    finally { setPublishing(false); }
  };

  const copyLink = async () => {
    if (!share) return;
    try { await navigator.clipboard.writeText(share.url); } catch {
      const ta = document.createElement('textarea');
      ta.value = share.url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const sendEmail = async () => {
    if (!share || sending) return;
    setSending(true);
    setSendResult(null);
    try {
      const resp = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: share.token, to, subject, message }),
      });
      const data = await resp.json();
      if (resp.status === 501) { setSendResult({ tone: 'setup', text: data.error }); }
      else if (!resp.ok) throw new Error(data.error || `Send failed (${resp.status})`);
      else {
        setSendResult({ tone: 'ok', text: `Sent to ${data.to}.` });
        if (proposal.status === 'draft' && onProposalChange) {
          onProposalChange({ ...proposal, status: 'sent', sentForSignatureAt: proposal.sentForSignatureAt });
        }
      }
    } catch (e) {
      setSendResult({ tone: 'err', text: e.message });
    }
    setSending(false);
  };

  const mailtoHref = share
    ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + '\n\nView your proposal: ' + share.url)}`
    : '#';

  const views = share?.recentViews || [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,42,27,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: COLORS.shadowLg, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>🔗 Share & Track</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: COLORS.textSoft }}>✕</button>
        </div>
        <div style={{ fontSize: 12.5, color: COLORS.textSoft, marginBottom: 16, lineHeight: 1.6 }}>
          Publish a fixed snapshot for {proposal.prospect?.contact || 'your prospect'}. {managed ? "Staging links require team sign-in and are not ready to send to customers." : "Anyone with the link can read it."} Later draft edits will not change this version. Page requests can include automated scanners.
        </div>

        {error && <div style={{ fontSize: 12.5, color: COLORS.red, background: COLORS.redBg, padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>⚠️ {error}{error.includes('unauthorized') ? ' (sign out and back in to refresh your session)' : ''}</div>}

        {!share && <Btn onClick={publish} disabled={publishing}>{publishing ? 'Publishing…' : 'Publish proposal version'}</Btn>}
        {share && (
          <>
            {/* Link row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input readOnly value={share.url} onFocus={e => e.target.select()}
                style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontFamily: 'ui-monospace, Menlo, monospace', color: COLORS.textMid, background: COLORS.bgAlt }} />
              <Btn size="sm" onClick={copyLink}>{copied ? '✓ Copied' : 'Copy link'}</Btn>
              <Btn size="sm" variant="secondary" onClick={() => window.open(share.url + '?preview=1', '_blank')}>Open ↗</Btn>
            </div>

            {/* View stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: COLORS.bgAlt, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: share.viewCount > 0 ? '#2563EB' : COLORS.textSoft }}>{share.viewCount}</div>
                <div style={{ fontSize: 11, color: COLORS.textSoft }}>recent page request{share.viewCount === 1 ? '' : 's'}</div>
              </div>
              <div style={{ flex: 2.2, background: COLORS.bgAlt, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>
                  {share.lastViewedAt ? `Last viewed ${new Date(share.lastViewedAt).toLocaleString()}` : 'Not viewed yet'}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 3 }}>
                  {views.length > 0
                    ? views.slice(0, 3).map(v => `${new Date(v.at).toLocaleDateString()} ${v.country ? '· ' + v.country : ''}`).join('  ·  ')
                    : 'Recorded requests appear after synchronization; they do not verify reader identity.'}
                </div>
              </div>
            </div>

            {/* Email section */}
            {!emailOpen ? (
              <Btn className="w-full" icon="📨" onClick={() => setEmailOpen(true)}>Email it to {proposal.prospect?.contact || 'the prospect'}</Btn>
            ) : (
              <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Input label="To" type="email" value={to} onChange={setTo} placeholder="prospect@university.edu" required />
                <Input label="Subject" value={subject} onChange={setSubject} required />
                <Textarea label="Message" value={message} onChange={setMessage} rows={7} />
                {sendResult && (
                  <div style={{ fontSize: 12, lineHeight: 1.6, padding: '9px 12px', borderRadius: 8,
                    color: sendResult.tone === 'ok' ? COLORS.green : sendResult.tone === 'setup' ? '#7A5E1F' : COLORS.red,
                    background: sendResult.tone === 'ok' ? COLORS.greenBg : sendResult.tone === 'setup' ? '#FCF6E8' : COLORS.redBg }}>
                    {sendResult.tone === 'ok' ? '✓ ' : sendResult.tone === 'setup' ? '🔧 ' : '⚠️ '}{sendResult.text}
                    {sendResult.tone === 'setup' && (
                      <div style={{ marginTop: 6 }}>
                        Meanwhile: <a href={mailtoHref} style={{ color: COLORS.blue, fontWeight: 600 }}>open a draft in your mail app</a> — the tracked link is already in the body.
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Btn variant="secondary" size="sm" onClick={() => setEmailOpen(false)}>Cancel</Btn>
                  <Btn size="sm" onClick={sendEmail} disabled={sending || !to}>{sending ? 'Sending…' : 'Send email'}</Btn>
                </div>
              </div>
            )}
          </>
        )}
        {publishing && !error && <div style={{ textAlign: 'center', padding: 24, color: COLORS.textSoft, fontSize: 13 }}>Publishing share link…</div>}
      </div>
    </div>
  );
};

// ─── Notes modal — quick CRM annotations on any proposal ────────────────────
// Notes are stored as `activities` entries of type 'note', so they also appear
// in the editor's Activity & Follow-up timeline and in recent-activity notifications.
const NotesModal = ({ proposal, onUpdate, onClose }) => {
  const [text, setText] = useState('');
  const inputRef = useRef();
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const authName = (() => {
    try { return JSON.parse(localStorage.getItem('ip_authed') || '{}').name || 'Team'; } catch { return 'Team'; }
  })();
  const notes = (proposal.activities || []).filter(a => a.type === 'note');

  const addNote = () => {
    const t = text.trim();
    if (!t) return;
    const entry = { id: genId(), type: 'note', date: new Date().toISOString().slice(0, 10), by: authName, content: t };
    onUpdate({ ...proposal, activities: [entry, ...(proposal.activities || [])] });
    setText('');
    inputRef.current && inputRef.current.focus();
  };
  const deleteNote = (id) => {
    onUpdate({ ...proposal, activities: (proposal.activities || []).filter(a => a.id !== id) });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,42,27,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: '100%', maxHeight: '86vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 14, boxShadow: COLORS.shadowLg, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>📝 Notes · {proposal.prospect?.name || proposal.name}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: COLORS.textSoft }}>✕</button>
        </div>
        <div style={{ fontSize: 11.5, color: COLORS.textSoft, marginBottom: 14 }}>{proposal.proposalNumber} · notes also appear on the proposal's activity timeline</div>

        {/* Composer */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
          <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)} rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addNote(); } }}
            placeholder="Add a note… (⌘↩ to save)"
            style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', lineHeight: 1.55, resize: 'vertical', outline: 'none' }} />
          <Btn size="sm" onClick={addNote} disabled={!text.trim()}>Add</Btn>
        </div>

        {/* Notes list */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.length === 0 && (
            <div style={{ padding: '22px 0', textAlign: 'center', fontSize: 12.5, color: COLORS.textSoft }}>
              No notes yet — procurement quirks, budget cycles, who really decides… write it down.
            </div>
          )}
          {notes.map(n => (
            <div key={n.id} style={{ background: '#FDF9E8', border: '1px solid #F0E5B8', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{n.content}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 10.5, color: '#9A8B4F' }}>{n.by} · {fmtDate(n.date)}</span>
                <button onClick={() => deleteNote(n.id)} title="Delete note"
                  style={{ border: 'none', background: 'none', color: '#C4B372', fontSize: 11, cursor: 'pointer', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = COLORS.red}
                  onMouseLeave={e => e.currentTarget.style.color = '#C4B372'}>delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Outreach modal — Claude drafts the touch a news event justifies ────────
const OutreachModal = ({ news, prospect, onClose }) => {
  const [state, setState] = useState('loading'); // loading | done | error
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const isDM = String(prospect.name || '').startsWith('u/');

  const draft = async () => {
    setState('loading'); setError('');
    try {
      const r = prospect.radar;
      const prompt = `You are Allen Phelps, CEO of IPTalons, Inc. — a Dallas-based research security compliance firm (Certified Secure Researcher™, RedBook™, Grant Hopper AI). Draft outreach to a prospect, prompted by a policy event. Return ONLY a JSON object: {"subject": "...", "body": "..."}.

POLICY EVENT (the reason to reach out now):
- ${news.title}
- ${news.summary}
- Source: ${news.source}${news.handle ? ' · ' + news.handle : ''} · ${String(news.at).slice(0, 10)}

PROSPECT:
- ${prospect.name} (${(PROSPECT_TYPE_CONFIG[prospect.type] || {}).label || prospect.type})${prospect.contact && prospect.contact !== prospect.name ? ` — contact: ${prospect.contact}${prospect.title ? ', ' + prospect.title : ''}` : ''}
- Known concern: ${prospect.primaryRisk || 'research security compliance'}
${r ? `- Their own public words (${r.src}): "${r.quote}"
- Working angle: ${r.angle}` : ''}

Rules:
${isDM
  ? '- This is a Reddit/X user. Write a short, casual, value-first DM — max 110 words, subject must be an empty string. r/SBIR is solicitation-averse: lead with genuinely useful insight about what this event changes for them, offer help once, no pitch, no links. NEVER hint that we monitor their posts — paraphrase their concern as something we hear across the sector.'
  : '- Write a brief professional email: subject under 60 characters, body max 170 words.\n- Sign off:\\n\\nAllen L. Phelps\\nCEO, IPTalons, Inc.'}
- Open with what this event means FOR THEM — never "I saw the news" or "I noticed your post"
- One concrete offer: a pre-submission assessment, a mitigation-plan review, or a 20-minute call
- Warm, expert, confident; regulatory urgency without fear-mongering`;

      const text = await window.claude.complete({ messages: [{ role: 'user', content: prompt }], max_tokens: 900 });
      const clean = text.replace(/```json|```/gi, '').trim();
      const start = clean.indexOf('{'), end = clean.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('no JSON in AI response');
      const parsed = JSON.parse(clean.slice(start, end + 1));
      setSubject(parsed.subject || '');
      setBody(parsed.body || '');
      setState('done');
    } catch (e) {
      setError(e.message);
      setState('error');
    }
  };
  useEffect(() => { draft(); }, []);

  const copyAll = async () => {
    const text = (subject ? `Subject: ${subject}\n\n` : '') + body;
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,42,27,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: COLORS.shadowLg, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>✍️ Draft outreach · {prospect.name}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: COLORS.textSoft }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textSoft, margin: '6px 0 14px', lineHeight: 1.55 }}>
          Prompted by: <strong style={{ color: COLORS.textMid }}>{news.title}</strong>
          {prospect.radar && <> · grounded in their own words from {prospect.radar.src}</>}
        </div>

        {state === 'loading' && (
          <div style={{ padding: '36px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>✍️</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>Claude is drafting{isDM ? ' a value-first DM' : ' the email'}…</div>
            <div style={{ fontSize: 12, color: COLORS.textSoft, marginTop: 4 }}>Event + {prospect.radar ? 'radar signal' : 'prospect profile'} → one personalized touch</div>
          </div>
        )}

        {state === 'error' && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 12.5, color: COLORS.red, marginBottom: 12 }}>⚠️ {error}{/key/i.test(error) ? ' — add a Claude API key in Settings.' : ''}</div>
            <Btn size="sm" onClick={draft}>Retry</Btn>
          </div>
        )}

        {state === 'done' && (
          <>
            {!isDM && <Input label="Subject" value={subject} onChange={setSubject} />}
            <div style={{ marginTop: 12 }}>
              <Textarea label={isDM ? 'Direct message (send manually — never auto-post)' : 'Email body'} value={body} onChange={setBody} rows={isDM ? 7 : 11} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Btn variant="secondary" size="sm" onClick={draft}>↻ Re-draft</Btn>
              {prospect.email && (
                <Btn variant="secondary" size="sm" onClick={() => window.open(`mailto:${encodeURIComponent(prospect.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)}>Open in mail app</Btn>
              )}
              <Btn size="sm" onClick={copyAll}>{copied ? '✓ Copied' : 'Copy draft'}</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ proposals, prospects, news, onOpen, onNew, onUpdate, demoExpandIntel }) => {
  const [notesFor, setNotesFor] = useState(null); // proposal id
  const [intelOpen, setIntelOpen] = useState(null); // news item id whose affected-prospects list is expanded
  const [draftFor, setDraftFor] = useState(null); // {news, prospect} → OutreachModal
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'created', dir: 'desc' });

  const sortRows = (rows) => {
    const k = sort.key, dir = sort.dir === 'asc' ? 1 : -1;
    const get = (p) => {
      if (k === 'total')   return calcProposalTotals(p).total || 0;
      if (k === 'name')    return (p.prospect?.name || '').toLowerCase();
      if (k === 'type')    return PROSPECT_TYPE_CONFIG[p.prospect?.type]?.label || '';
      if (k === 'tier')    return PRICING_TIERS[p.tier]?.name || '';
      if (k === 'status')  return p.status || '';
      if (k === 'created') return p.created || '';
      if (k === 'number')  return p.proposalNumber || '';
      return '';
    };
    return [...rows].sort((a, b) => {
      const av = get(a), bv = get(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  };

  const matchesQuery = (p) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return [p.proposalNumber, p.prospect?.name, p.prospect?.contact, p.name]
      .some(v => (v || '').toLowerCase().includes(q));
  };

  const byStatus = filter === 'All' ? proposals : proposals.filter(p => p.status === filter.toLowerCase());
  const filtered = sortRows(byStatus.filter(matchesQuery));

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };
  const SortIcon = ({ k }) => {
    if (sort.key !== k) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
    return <span style={{ marginLeft: 4, color: COLORS.blue }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>;
  };
  const COLS = [
    { key: 'number',  label: 'Proposal #' },
    { key: 'name',    label: 'Prospect' },
    { key: 'type',    label: 'Type' },
    { key: 'tier',    label: 'Tier' },
    { key: 'created', label: 'Created' },
    { key: 'total',   label: 'Total' },
    { key: 'status',  label: 'Status' },
    { key: null,      label: 'Notes' },
    { key: null,      label: '' },
  ];

  const stats = [
    { label: 'Active Proposals',     value: proposals.filter(p => ['draft','sent','review'].includes(p.status)).length, color: COLORS.blue },
    { label: 'Won This Quarter',     value: proposals.filter(p => p.status === 'won').length,                            color: COLORS.green },
    { label: 'Total Pipeline',       value: fmt$(proposals.reduce((s, p) => s + (calcProposalTotals(p).total || 0), 0)), color: COLORS.navy },
  ];

  return (
    <div style={{ padding: '36px 36px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: -0.3 }}>Proposals</h1>
          <p style={{ fontSize: 14, color: COLORS.textSoft, margin: '6px 0 0', lineHeight: 1.5 }}>Manage and track all research security program proposals</p>
        </div>
        <Btn onClick={onNew} icon="+">New Proposal</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 18 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, letterSpacing: -0.5 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: COLORS.textSoft, marginTop: 6 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Policy & Market Intel strip */}
      {(news || []).length > 0 && (() => {
        const sevCfg = {
          high:   { color: '#B8493A', bg: '#F9EAE6', label: 'HIGH' },
          medium: { color: '#B8860B', bg: '#FCF6E8', label: 'MED' },
          info:   { color: COLORS.textSoft, bg: COLORS.bgAlt, label: 'INFO' },
        };
        const sevRank = { high: 0, medium: 1, info: 2 };
        const affectedFor = (n) => (prospects || []).filter(pr => newsMatchesProspect(n, pr));
        const items = [...news]
          .sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) || new Date(b.at) - new Date(a.at))
          .slice(0, 5);
        // During the Live Demo tour, the intel step auto-expands the top item
        const openId = intelOpen !== null ? intelOpen : (demoExpandIntel && items.length ? items[0].id : null);
        return (
          <Card style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px 12px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🛰</span> Policy & Market Intel
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSoft, marginTop: 3 }}>Events that move this pipeline — swept daily from X, qualified by Claude, matched to your prospects</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0E8F80', background: '#E3F4F1', padding: '3px 10px', borderRadius: 999 }}>LIVE</span>
            </div>
            {items.map((n, i) => {
              const sev = sevCfg[n.severity] || sevCfg.info;
              const affected = affectedFor(n);
              return (
                <div key={n.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '13px 24px', borderBottom: i < items.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, color: sev.color, background: sev.bg, padding: '3px 8px', borderRadius: 5, flexShrink: 0, marginTop: 2 }}>{sev.label}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text, lineHeight: 1.45 }}>
                      <a href={n.url} target="_blank" rel="noopener" style={{ color: COLORS.text, textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = COLORS.blue}
                        onMouseLeave={e => e.currentTarget.style.color = COLORS.text}>{n.title} ↗</a>
                      <span style={{ fontSize: 11, fontWeight: 400, color: COLORS.textGhost, marginLeft: 8 }}>{n.source}{n.handle ? ` · ${n.handle}` : ''} · {fmtDate(n.at)}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: COLORS.textMid, lineHeight: 1.55, marginTop: 3 }}>{n.summary}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {(n.tags || []).slice(0, 5).map(t => (
                        <span key={t} style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSoft, background: COLORS.bgAlt, border: `1px solid ${COLORS.border}`, padding: '2px 8px', borderRadius: 999 }}>{t}</span>
                      ))}
                      {affected.length > 0 && (
                        <button onClick={() => setIntelOpen(openId === n.id ? null : n.id)}
                          style={{ fontSize: 10.5, fontWeight: 700, color: '#0E8F80', background: '#E3F4F1', border: `1px solid ${openId === n.id ? '#0E8F80' : 'transparent'}`, padding: '2px 9px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit' }}>
                          affects {affected.length} prospect{affected.length === 1 ? '' : 's'} {openId === n.id ? '▴' : '▾'}
                        </button>
                      )}
                    </div>
                    {openId === n.id && affected.length > 0 && (
                      <div style={{ marginTop: 10, padding: '10px 12px', background: '#F2FAF8', border: '1px solid #CDE8E2', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: '#0E8F80', textTransform: 'uppercase' }}>
                            Affected prospects — {(n.match?.entities || []).length ? 'named directly' : 'by segment match'} · click one to draft outreach
                          </span>
                          <button onClick={() => window._ipNav('prospects')} style={{ border: 'none', background: 'none', fontSize: 11, fontWeight: 600, color: COLORS.blue, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>open Prospects →</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {affected.map(pr => {
                            const pCfg = PROSPECT_TYPE_CONFIG[pr.type] || {};
                            return (
                              <button key={pr.id} onClick={() => setDraftFor({ news: n, prospect: pr })}
                                title={`Draft outreach to ${pr.name} about this event${pr.radar ? ` · radar: ${pr.radar.status}` : ''}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: COLORS.text, background: '#fff', border: `1px solid ${COLORS.border}`, padding: '3px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0E8F80'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(14,143,128,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = 'none'; }}>
                                <span>{pr.radar ? '📡' : pCfg.icon}</span> {pr.name}
                                {pr.radar && <span style={{ width: 6, height: 6, borderRadius: '50%', background: RADAR_STATUS_COLORS[pr.radar.status] || COLORS.textSoft }} />}
                                <span style={{ color: '#0E8F80', fontWeight: 700 }}>✍️</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        );
      })()}

      {/* Follow-ups Due widget */}
      {(() => {
        const withFollowUp = proposals.filter(p => p.nextFollowUp && !['won','lost'].includes(p.status));
        const overdue = withFollowUp.filter(p => daysUntil(p.nextFollowUp) < 0);
        const today   = withFollowUp.filter(p => daysUntil(p.nextFollowUp) === 0);
        const thisWeek = withFollowUp.filter(p => { const d = daysUntil(p.nextFollowUp); return d > 0 && d <= 7; });
        const upcoming = [...overdue, ...today, ...thisWeek]
          .sort((a, b) => daysUntil(a.nextFollowUp) - daysUntil(b.nextFollowUp))
          .slice(0, 6);

        return (
          <Card style={{ marginBottom: 32, padding: 0 }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📅</span> Follow-ups Due
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSoft, marginTop: 3 }}>Sorted by urgency — click any row to jump to that proposal</div>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                {overdue.length > 0 && <span style={{ background: COLORS.redBg, color: COLORS.red, padding: '5px 12px', borderRadius: 999, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.red }}/>{overdue.length} overdue</span>}
                {today.length > 0 && <span style={{ background: COLORS.amberBg, color: COLORS.amber, padding: '5px 12px', borderRadius: 999, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.amber }}/>{today.length} today</span>}
                {thisWeek.length > 0 && <span style={{ background: COLORS.greenBg, color: COLORS.green, padding: '5px 12px', borderRadius: 999, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green }}/>{thisWeek.length} this week</span>}
                {upcoming.length === 0 && <span style={{ color: COLORS.textSoft }}>All caught up ✓</span>}
              </div>
            </div>
            {upcoming.length > 0 ? (
              <div>
                {upcoming.map((p, idx) => {
                  const owner = SAMPLE_TEAM.find(t => t.id === p.ownerId);
                  const tone = followUpTone(p.nextFollowUp);
                  const isLast = idx === upcoming.length - 1;
                  return (
                    <div key={p.id} onClick={() => onOpen(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: isLast ? 'none' : `1px solid ${COLORS.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.bgAlt}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {/* Urgency chip */}
                      <span style={{ fontSize: 11, fontWeight: 600, color: tone.color, background: tone.bg, padding: '5px 12px', borderRadius: 999, whiteSpace: 'nowrap', minWidth: 92, textAlign: 'center' }}>
                        {fmtRelativeDate(p.nextFollowUp)}
                      </span>
                      {/* Prospect + last activity */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.prospect?.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.textSoft, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.activities?.[0] && <span style={{ fontSize: 11 }}>{ACTIVITY_TYPES[p.activities[0].type]?.icon}</span>}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.activities?.[0] ? p.activities[0].content : 'No activity yet'}
                          </span>
                        </div>
                      </div>
                      {/* Owner avatar */}
                      {owner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title={owner.name}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: owner.gradient, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff, 0 1px 3px rgba(0,0,0,0.1)' }}>{owner.initials}</div>
                          <span style={{ fontSize: 12, color: COLORS.textMid, fontWeight: 500 }}>{owner.name.split(' ')[0]}</span>
                        </div>
                      )}
                      <Badge status={p.status} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: COLORS.textSoft }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                No follow-ups due in the next 7 days. You're all caught up.
              </div>
            )}
          </Card>
        );
      })()}

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '14px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
            {filter === 'All' ? 'All Proposals' : `${filter} Proposals`}
            <span style={{ fontSize: 12, color: COLORS.textSoft, fontWeight: 400, marginLeft: 8 }}>({filtered.length})</span>
          </span>

          {/* Search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: COLORS.bgAlt, border: `1px solid ${COLORS.border}`, borderRadius: 8, marginLeft: 8, width: 220, transition: 'all 0.15s' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke={COLORS.textSoft} strokeWidth="1.4"/><path d="M9 9L11.5 11.5" stroke={COLORS.textSoft} strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search proposals…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, fontFamily: 'inherit', color: COLORS.text, minWidth: 0 }} />
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textSoft, fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All','Draft','Sent','Review','Won','Lost'].map(f => {
              const active = filter === f;
              const count = f === 'All' ? proposals.length : proposals.filter(p => p.status === f.toLowerCase()).length;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
                    background: active ? COLORS.blueLight : '#fff',
                    color: active ? COLORS.blue : COLORS.textSoft,
                    fontWeight: active ? 600 : 500, transition: 'all 0.12s', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {f} <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ maxHeight: 'calc(100vh - 420px)', minHeight: 260, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.label || 'act'}
                  onClick={() => c.key && toggleSort(c.key)}
                  style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COLORS.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, background: COLORS.bgAlt, zIndex: 5, cursor: c.key ? 'pointer' : 'default', userSelect: 'none' }}>
                  {c.label}{c.key && <SortIcon k={c.key} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const totals = calcProposalTotals(p);
              const cfg = PROSPECT_TYPE_CONFIG[p.prospect?.type] || {};
              const tier = PRICING_TIERS[p.tier] || {};
              return (
                <tr key={p.id} onClick={() => onOpen(p)} style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: COLORS.blue, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>{p.proposalNumber}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.text, fontWeight: 500, borderBottom: `1px solid ${COLORS.border}`, maxWidth: 240 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.prospect?.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2 }}>{p.prospect?.contact} · {p.prospect?.researcherCount} researchers</div>
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textMid }}>{cfg.icon} {cfg.label}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textMid }}>{tier.name || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: COLORS.textSoft, borderBottom: `1px solid ${COLORS.border}` }}>{fmtDate(p.created)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.text, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>{fmt$(totals.total)}</td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}><Badge status={p.status} /></td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
                    {(() => {
                      const noteCount = (p.activities || []).filter(a => a.type === 'note').length;
                      return (
                        <button title={noteCount ? `${noteCount} note${noteCount === 1 ? '' : 's'} — click to view` : 'Add a note'}
                          onClick={e => { e.stopPropagation(); setNotesFor(p.id); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600, transition: 'all 0.12s',
                            border: `1px solid ${noteCount ? '#F0E5B8' : COLORS.border}`,
                            background: noteCount ? '#FDF9E8' : 'transparent',
                            color: noteCount ? '#9A8B4F' : COLORS.textGhost }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D9C878'; e.currentTarget.style.color = '#7A6C33'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = noteCount ? '#F0E5B8' : COLORS.border; e.currentTarget.style.color = noteCount ? '#9A8B4F' : COLORS.textGhost; }}>
                          📝 {noteCount || '+'}
                        </button>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
                    <Btn variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onOpen(p); }}>Open →</Btn>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '40px 16px', textAlign: 'center', color: COLORS.textSoft, fontSize: 13 }}>
                {query ? (
                  <>No proposals match <strong style={{ color: COLORS.text }}>"{query}"</strong>.{' '}<button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: COLORS.blue, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>Clear search</button></>
                ) : (
                  <>No proposals with status <strong style={{ color: COLORS.text }}>"{filter}"</strong>.{' '}<button onClick={() => setFilter('All')} style={{ background: 'none', border: 'none', color: COLORS.blue, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>Show all</button></>
                )}
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>

      {notesFor && (() => {
        const p = proposals.find(x => x.id === notesFor);
        return p ? <NotesModal proposal={p} onUpdate={onUpdate} onClose={() => setNotesFor(null)} /> : null;
      })()}
      {draftFor && <OutreachModal news={draftFor.news} prospect={draftFor.prospect} onClose={() => setDraftFor(null)} />}
    </div>
  );
};

// ─── Wizard Step Indicator (shared) ─────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
    {['Prospect Info', 'Service Mix & Tier', 'AI Polish & Review'].map((step, i) => {
      const done = i < current, active = i === current;
      const bg = active ? COLORS.blue : done ? COLORS.green : COLORS.border;
      const color = active || done ? '#fff' : COLORS.textSoft;
      return (
        <React.Fragment key={step}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{done ? '✓' : i + 1}</div>
            <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? COLORS.blue : COLORS.textSoft }}>{step}</span>
          </div>
          {i < 2 && <div style={{ flex: 1, height: 1, background: COLORS.border, alignSelf: 'center' }} />}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Wizard Step 1: Prospect Info ───────────────────────────────────────────
const WizardStep1 = ({ data, prospects, onChange, onNext }) => {
  const pickProspect = (pr) => {
    onChange('prospect', pr);
    if (!data.name) onChange('name', `${pr.name} — Research Security Program Support Services`);
  };

  // Radar-sourced prospects first — they carry a live signal worth acting on.
  const pickerList = [...(prospects || SAMPLE_PROSPECTS)].sort((a, b) => (b.radar ? 1 : 0) - (a.radar ? 1 : 0));

  const canContinue = data.prospect?.name && data.prospect?.contact && data.name;
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0 }}>New Proposal — Prospect</h2>
        <p style={{ fontSize: 13, color: COLORS.textSoft, marginTop: 6 }}>Pick an existing prospect or fill in a new one. We'll use this to personalize the intro letter and savings analysis.</p>
      </div>
      <StepIndicator current={0} />

      <div style={{ marginBottom: 24, padding: 14, background: COLORS.blueLight, border: `1px solid ${COLORS.blueMid}`, borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>💡 Existing prospects · click to prefill · 📡 = live radar signal</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxHeight: 264, overflowY: 'auto', paddingRight: 2 }}>
          {pickerList.map(p => (
            <button key={p.id} type="button" onClick={() => pickProspect(p)}
              style={{ background: '#fff', border: `1px solid ${data.prospect?.id === p.id ? COLORS.blue : COLORS.border}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (data.prospect?.id !== p.id) { e.currentTarget.style.borderColor = COLORS.blue; e.currentTarget.style.boxShadow = '0 2px 8px rgba(74,124,46,0.18)'; } }}
              onMouseLeave={e => { if (data.prospect?.id !== p.id) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = 'none'; } }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>{p.radar ? '📡' : (PROSPECT_TYPE_CONFIG[p.type] || {}).icon} {p.name}</div>
              <div style={{ fontSize: 11, color: COLORS.textSoft, lineHeight: 1.5 }}>
                {p.radar
                  ? <span style={{ fontStyle: 'italic' }}>{p.radar.src} · &ldquo;{p.radar.quote.length > 60 ? p.radar.quote.slice(0, 60) + '…' : p.radar.quote}&rdquo;</span>
                  : <>{p.researcherCount} researchers · {fmt$(p.federalFunding)} federal funding</>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Input label="Proposal Name" value={data.name || ''} onChange={v => onChange('name', v)} placeholder="e.g. Baylor University — Research Security Program" required className="col-span-2" />
        <Input label="Institution Name" value={data.prospect?.name || ''} onChange={v => onChange('prospect', { ...data.prospect, name: v })} placeholder="Baylor University" required />
        <Select label="Institution Type" value={data.prospect?.type || 'university'} onChange={v => onChange('prospect', { ...data.prospect, type: v })}
          options={Object.entries(PROSPECT_TYPE_CONFIG).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))} />
        <Input label="Primary Contact" value={data.prospect?.contact || ''} onChange={v => onChange('prospect', { ...data.prospect, contact: v })} placeholder="Dr. Kevin Chambliss" required />
        <Input label="Title" value={data.prospect?.title || ''} onChange={v => onChange('prospect', { ...data.prospect, title: v })} placeholder="Vice Provost for Research" />
        <Input label="Email" type="email" value={data.prospect?.email || ''} onChange={v => onChange('prospect', { ...data.prospect, email: v })} placeholder="kevin@university.edu" />
        <Input label="Phone" type="tel" value={data.prospect?.phone || ''} onChange={v => onChange('prospect', { ...data.prospect, phone: v })} placeholder="000-000-0000" />
        <Input label="# of Federally-Funded Researchers" type="number" value={data.prospect?.researcherCount || ''} onChange={v => onChange('prospect', { ...data.prospect, researcherCount: parseInt(v) || 0 })} placeholder="250" />
        <Input label="Annual Federal Funding ($)" type="number" value={data.prospect?.federalFunding || ''} onChange={v => onChange('prospect', { ...data.prospect, federalFunding: parseInt(v) || 0 })} placeholder="215000000" />
        <Input label="Primary Risk Concern" value={data.prospect?.primaryRisk || ''} onChange={v => onChange('prospect', { ...data.prospect, primaryRisk: v })} placeholder="NSPM-33 + CHIPS Act compliance" className="col-span-2" />
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Btn variant="secondary" onClick={() => window._ipNav('dashboard')}>Cancel</Btn>
        <Btn onClick={onNext} disabled={!canContinue}>Continue to Service Mix →</Btn>
      </div>
    </div>
  );
};

// ─── Wizard Step 2: Service Mix & Tier ──────────────────────────────────────
const WizardStep2 = ({ data, onChange, onBack, onNext }) => {
  const [tier, setTier] = useState(data.tier || 'standard');

  const applyTier = (tierKey) => {
    setTier(tierKey);
    const tierObj = PRICING_TIERS[tierKey];
    // Auto-suggest researcher count from prospect, fall back to tier default
    const csrQty = data.prospect?.researcherCount || tierObj.items.find(i => i.serviceId === 'csr')?.qty || 100;
    const items = tierObj.items.map(it => {
      const svc = SERVICES[it.serviceId];
      const isBundled = (it.serviceId !== 'csr' && tierObj.items.some(i => i.serviceId === 'csr') && svc.bundleDiscount);
      return {
        serviceId: it.serviceId,
        qty: it.serviceId === 'csr' ? csrQty : it.qty,
        unitPrice: svc.pricePerUnit,
        bundleDiscount: isBundled ? svc.bundleDiscount.percent : 0,
      };
    });
    onChange('tier', tierKey);
    onChange('items', items);
  };

  // Initialize tier on first render
  useEffect(() => { if (!data.items || data.items.length === 0) applyTier(tier); }, []);

  const totals = calcProposalTotals(data);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0 }}>Service Mix & Pricing Tier</h2>
        <p style={{ fontSize: 13, color: COLORS.textSoft, marginTop: 6 }}>Pick a starting tier. Adjust quantities below to fit this prospect's size.</p>
      </div>
      <StepIndicator current={1} />

      {/* Tier picker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.values(PRICING_TIERS).map(t => {
          const active = tier === t.id;
          return (
            <button key={t.id} type="button" onClick={() => applyTier(t.id)}
              style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                background: active ? COLORS.blueLight : '#fff',
                border: `2px solid ${active ? COLORS.blue : COLORS.border}`,
                transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{t.name}</div>
                {active && <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.blue, background: '#fff', padding: '2px 6px', borderRadius: 10, letterSpacing: 0.4 }}>SELECTED</span>}
              </div>
              <div style={{ fontSize: 11, color: COLORS.textSoft, marginBottom: 6 }}>{t.targetSize}</div>
              <div style={{ fontSize: 12, color: COLORS.textMid, lineHeight: 1.5 }}>{t.description}</div>
            </button>
          );
        })}
      </div>

      {/* Editable items table */}
      <Card>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>Line Items — adjust quantities to fit this prospect</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.bg }}>
              {['Service', 'Unit Price', 'Qty', 'Bundle Discount', 'Subtotal'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: COLORS.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item, idx) => {
              const svc = SERVICES[item.serviceId];
              if (!svc) return null;
              const setField = (field, value) => {
                const newItems = [...data.items];
                newItems[idx] = { ...item, [field]: parseFloat(value) || 0 };
                onChange('items', newItems);
              };
              return (
                <tr key={item.serviceId} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: COLORS.text }}>
                    <div style={{ fontWeight: 600 }}>{svc.shortName}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2 }}>{svc.unit}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <input type="number" value={item.unitPrice} onChange={e => setField('unitPrice', e.target.value)}
                      style={{ width: 100, padding: '6px 8px', fontSize: 13, border: `1px solid ${COLORS.border}`, borderRadius: 6, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <input type="number" value={item.qty} onChange={e => setField('qty', e.target.value)}
                      style={{ width: 80, padding: '6px 8px', fontSize: 13, border: `1px solid ${COLORS.border}`, borderRadius: 6, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <input type="number" value={item.bundleDiscount} onChange={e => setField('bundleDiscount', e.target.value)}
                      style={{ width: 70, padding: '6px 8px', fontSize: 13, border: `1px solid ${COLORS.border}`, borderRadius: 6, textAlign: 'right' }} />
                    <span style={{ fontSize: 11, color: COLORS.textSoft, marginLeft: 4 }}>%</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: COLORS.text, fontVariantNumeric: 'tabular-nums' }}>{fmt$(calcItemTotal(item))}</td>
                </tr>
              );
            })}
            <tr style={{ background: COLORS.navy }}>
              <td colSpan={4} style={{ padding: '14px 14px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Annual Subscription</td>
              <td style={{ padding: '14px 14px', fontSize: 16, fontWeight: 700, color: '#fff' }}>{fmt$(totals.total)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Btn variant="secondary" onClick={onBack}>← Back</Btn>
        <Btn onClick={onNext} disabled={totals.total <= 0}>Continue to AI Polish →</Btn>
      </div>
    </div>
  );
};

// ─── Wizard Step 3: AI Polish ───────────────────────────────────────────────
const WizardStep3 = ({ data, onChange, onBack, onDone }) => {
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const runPolish = async () => {
    setState('loading');
    setError('');
    try {
      const totals = calcProposalTotals(data);
      const itemsSummary = (data.items || []).map(it => {
        const svc = SERVICES[it.serviceId];
        return `${svc.shortName} (qty ${it.qty}, ${fmt$(calcItemTotal(it))})`;
      }).join('; ');

      const prompt = `You are Allen Phelps, CEO of IPTalons, Inc., a Dallas-based research security compliance firm. Draft two things for a proposal to a research institution. Return a JSON object with exactly these two keys: { "introLetter": "...", "savingsAnalysis": "..." }. No markdown, no preamble.

PROSPECT:
- Institution: ${data.prospect?.name}
- Contact: ${data.prospect?.contact} (${data.prospect?.title || 'Vice President for Research'})
- Type: ${data.prospect?.type || 'university'}
- Federally-funded researchers: ${data.prospect?.researcherCount || 'unknown'}
- Annual federal funding: $${(data.prospect?.federalFunding || 0).toLocaleString()}
- Primary risk concern: ${data.prospect?.primaryRisk || 'NSPM-33 + CHIPS Act compliance'}
${data.prospect?.radar ? `
DEMAND RADAR SIGNAL — this prospect voiced their compliance pain publicly (via ${data.prospect.radar.src}):
- Their concern: ${data.prospect.radar.pain}
- Their own words: "${data.prospect.radar.quote}"
- Suggested opening angle: ${data.prospect.radar.angle}` : ''}

PROPOSED SERVICES (annual subscription): ${itemsSummary} — total $${Math.round(totals.total).toLocaleString()}/year

introLetter rules:
- 3 paragraphs, professional yet warm, in Allen Phelps's voice as IPTalons CEO
- Open by acknowledging the regulatory landscape (NSPM-33, CHIPS Act of 2022)
- Reference the institution by name in the middle paragraph; tie to their primary risk concern
${data.prospect?.radar ? `- A DEMAND RADAR SIGNAL is present: speak directly to that concern early in the letter, paraphrasing it as a pain we hear across the sector — never quote their post verbatim or reveal that we saw it; write as a knowledgeable peer` : ''}
- Close with confidence about partnership and next steps
- Use IPTalons' core positioning: oversight of 4,500+ research security investigations since 2011, $50B+ research portfolio protected, trusted partner of academic/corporate/government research orgs

savingsAnalysis rules:
- A 2-3 paragraph "Estimated Annual Cost Savings" narrative tailored to this institution's size
- Concrete dollar ranges across: database subscriptions saved ($50k-$200k), analyst headcount avoided ($50k-$200k+), training cost reduction ($50k+), compliance verification streamlining
- End with a single bolded sentence stating estimated total annual savings (typically $300k-$1.5M depending on institution size)
- Reference NSPM-33 / CHIPS Act / NDAA compliance where natural`;

      const text = await window.claude.complete({ messages: [{ role: 'user', content: prompt }], max_tokens: 2000 });
      const clean = text.replace(/```json|```/gi, '').trim();
      const start = clean.indexOf('{'), end = clean.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('AI response did not include JSON');
      const parsed = JSON.parse(clean.slice(start, end + 1));
      onChange('introLetter', parsed.introLetter || '');
      onChange('savingsAnalysis', parsed.savingsAnalysis || '');
      setState('done');
    } catch (e) {
      console.error('AI polish error:', e);
      setError(`AI polish failed: ${e.message}. You can write these manually.`);
      setState('error');
    }
  };

  useEffect(() => { runPolish(); }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0 }}>AI Polish — Intro Letter & Savings Analysis</h2>
        <p style={{ fontSize: 13, color: COLORS.textSoft, marginTop: 6 }}>Claude is tailoring the cover letter and savings analysis to this prospect. Edit before saving.</p>
      </div>
      <StepIndicator current={2} />

      {state === 'loading' && (
        <Card style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✍️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Drafting your proposal narrative…</div>
          <div style={{ fontSize: 13, color: COLORS.textSoft, marginTop: 6 }}>Personalizing intro letter + savings analysis from {data.prospect?.name}'s profile</div>
          <div style={{ marginTop: 20, height: 4, background: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: COLORS.blue, borderRadius: 4, animation: 'progress-bar 2s ease-in-out infinite' }} />
          </div>
        </Card>
      )}

      {state === 'error' && (
        <Card style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ color: COLORS.red, marginBottom: 12 }}>⚠️ {error}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Btn variant="secondary" onClick={onBack}>← Back</Btn>
            <Btn onClick={runPolish}>Retry AI polish</Btn>
            <Btn variant="secondary" onClick={onDone}>Skip to editor →</Btn>
          </div>
        </Card>
      )}

      {state === 'done' && (
        <>
          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>📝 Introduction Letter</div>
              <span style={{ fontSize: 10, color: COLORS.green, fontWeight: 700, background: COLORS.greenBg, padding: '2px 7px', borderRadius: 10, letterSpacing: 0.4 }}>AI-DRAFTED</span>
            </div>
            <Textarea value={data.introLetter || ''} onChange={v => onChange('introLetter', v)} rows={12} />
          </Card>

          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>💰 Estimated Annual Cost Savings</div>
              <span style={{ fontSize: 10, color: COLORS.green, fontWeight: 700, background: COLORS.greenBg, padding: '2px 7px', borderRadius: 10, letterSpacing: 0.4 }}>AI-DRAFTED</span>
            </div>
            <Textarea value={data.savingsAnalysis || ''} onChange={v => onChange('savingsAnalysis', v)} rows={8} />
          </Card>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <Btn variant="secondary" onClick={onBack}>← Back</Btn>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" onClick={runPolish}>↻ Re-draft</Btn>
              <Btn onClick={onDone}>Save Proposal →</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Proposal Editor (the open-proposal view) ──────────────────────────────
const ProposalEditor = ({ proposal, onChange, onPreview, onSendForSignature, share, onShare }) => {
  const totals = calcProposalTotals(proposal);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [actType, setActType] = useState('email');
  const [actContent, setActContent] = useState('');
  const [actDate, setActDate] = useState(() => new Date().toISOString().slice(0, 10));

  const updateItem = (idx, field, value) => {
    const items = [...(proposal.items || [])];
    items[idx] = { ...items[idx], [field]: parseFloat(value) || 0 };
    onChange({ ...proposal, items });
  };

  const owner = SAMPLE_TEAM.find(t => t.id === proposal.ownerId) || SAMPLE_TEAM[0];
  const tone  = followUpTone(proposal.nextFollowUp);

  const logActivity = () => {
    if (!actContent.trim()) return;
    const newAct = { id: genId(), type: actType, date: actDate, by: owner.name, content: actContent.trim() };
    onChange({ ...proposal, activities: [newAct, ...(proposal.activities || [])] });
    setShowActivityForm(false);
    setActContent('');
    setActType('email');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>{proposal.name}</h2>
          <div style={{ fontSize: 12, color: COLORS.textSoft, marginTop: 3 }}>
            {proposal.prospect?.name} · {proposal.prospect?.contact} · {proposal.prospect?.researcherCount} researchers
          </div>
        </div>
        {/* Owner picker */}
        <select value={proposal.ownerId || 'u1'} onChange={e => onChange({ ...proposal, ownerId: e.target.value })}
          title="Proposal owner"
          style={{ display: 'flex', alignItems: 'center', padding: '5px 10px 5px 6px', fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 7, background: '#fff', color: COLORS.textMid, fontFamily: 'inherit', cursor: 'pointer' }}>
          {SAMPLE_TEAM.map(t => <option key={t.id} value={t.id}>{t.initials} · {t.name}</option>)}
        </select>
        {/* Next follow-up */}
        <div title={`Next follow-up: ${fmtRelativeDate(proposal.nextFollowUp)}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: tone.color, background: tone.bg, borderRadius: 7 }}>
          📅 {fmtRelativeDate(proposal.nextFollowUp)}
        </div>
        <Badge status={proposal.status} />
        {share && share.viewCount > 0 && (
          <div title={`Prospect opened the shared link ${share.viewCount} time${share.viewCount === 1 ? '' : 's'} · last ${new Date(share.lastViewedAt).toLocaleString()}`}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#2563EB', background: '#E8EEFB', borderRadius: 7 }}>
            👁 {share.viewCount}
          </div>
        )}
        <Btn variant="secondary" size="sm" onClick={onPreview} icon="👁">Preview</Btn>
        <Btn variant="secondary" size="sm" icon="🔗" onClick={onShare}>Share & Track</Btn>
        <Btn variant="success" size="sm" icon="✍️" onClick={onSendForSignature}>Send for Signature</Btn>
        <Btn size="sm" icon="💾" onClick={() => alert('Proposal saved!')}>Save</Btn>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* CRM: Activity & Follow-up */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>📅 Activity & Follow-up</div>
              <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2 }}>Outreach history for this prospect — last {Math.min(proposal.activities?.length || 0, 8)} of {proposal.activities?.length || 0} touchpoints shown</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11, color: COLORS.textSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Next follow-up</label>
              <input type="date" value={proposal.nextFollowUp || ''} onChange={e => onChange({ ...proposal, nextFollowUp: e.target.value })}
                style={{ padding: '5px 8px', fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 6, fontFamily: 'inherit', color: COLORS.text }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: tone.color, background: tone.bg, padding: '4px 9px', borderRadius: 10, whiteSpace: 'nowrap' }}>{fmtRelativeDate(proposal.nextFollowUp)}</span>
            </div>
            <Btn variant="secondary" size="sm" onClick={() => setShowActivityForm(v => !v)} icon={showActivityForm ? '✕' : '+'}>
              {showActivityForm ? 'Cancel' : 'Log activity'}
            </Btn>
          </div>

          {/* Log activity form (inline) */}
          {showActivityForm && (
            <div style={{ padding: '14px 20px', background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, display: 'grid', gridTemplateColumns: '140px 130px 1fr', gap: 10, alignItems: 'flex-end' }}>
              <Select label="Type" value={actType} onChange={setActType}
                options={Object.entries(ACTIVITY_TYPES).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, letterSpacing: 0.3, textTransform: 'uppercase' }}>Date</label>
                <input type="date" value={actDate} onChange={e => setActDate(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: 13, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <Input label="What happened?" value={actContent} onChange={setActContent} placeholder="e.g. Sent revised pricing with multi-year option" className="" />
                <Btn onClick={logActivity} disabled={!actContent.trim()}>Save</Btn>
              </div>
            </div>
          )}

          {/* Activity timeline */}
          {(proposal.activities && proposal.activities.length > 0) ? (
            <div style={{ padding: '4px 20px 14px' }}>
              {proposal.activities.slice(0, 8).map((a, i) => {
                const cfg = ACTIVITY_TYPES[a.type] || ACTIVITY_TYPES.note;
                const isLast = i === Math.min(proposal.activities.length, 8) - 1;
                return (
                  <div key={a.id} style={{ display: 'flex', gap: 12, paddingTop: 14, position: 'relative' }}>
                    {/* Timeline rail */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: cfg.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, border: `1px solid ${cfg.color}33` }}>{cfg.icon}</div>
                      {!isLast && <div style={{ width: 2, flex: 1, background: COLORS.border, marginTop: 4, minHeight: 14 }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 6 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                        <span style={{ fontSize: 11, color: COLORS.textSoft }}>by <strong style={{ color: COLORS.textMid, fontWeight: 600 }}>{a.by}</strong></span>
                        <span style={{ fontSize: 11, color: COLORS.textGhost }}>· {fmtRelativeDate(a.date)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textMid, marginTop: 3, lineHeight: 1.6 }}>{a.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 12, color: COLORS.textSoft }}>
              No activity yet. Click <strong>+ Log activity</strong> to record the first touchpoint.
            </div>
          )}
        </Card>

        {/* Intro letter */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>Introduction Letter</div>
          <div style={{ fontSize: 11, color: COLORS.textSoft, marginBottom: 12 }}>Signed by Allen Phelps, CEO. Appears on the second page of the proposal.</div>
          <Textarea value={proposal.introLetter || ''} onChange={v => onChange({ ...proposal, introLetter: v })} rows={10} />
        </Card>

        {/* Items + pricing */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Your Investment</div>
              <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2 }}>Annual subscription line items</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{fmt$(totals.total)} <span style={{ fontSize: 11, color: COLORS.textSoft, fontWeight: 400 }}>/year</span></div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {['Service', 'Unit', 'Qty', 'Discount', 'Subtotal'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: COLORS.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(proposal.items || []).map((item, idx) => {
                const svc = SERVICES[item.serviceId];
                if (!svc) return null;
                return (
                  <tr key={item.serviceId} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{svc.shortName}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                        style={{ width: 90, padding: '5px 8px', fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 6, textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)}
                        style={{ width: 70, padding: '5px 8px', fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 6, textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <input type="number" value={item.bundleDiscount} onChange={e => updateItem(idx, 'bundleDiscount', e.target.value)}
                        style={{ width: 60, padding: '5px 8px', fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 6, textAlign: 'right' }} />
                      <span style={{ fontSize: 11, color: COLORS.textSoft, marginLeft: 4 }}>%</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: COLORS.text, fontVariantNumeric: 'tabular-nums' }}>{fmt$(calcItemTotal(item))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Savings analysis */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Estimated Annual Cost Savings</div>
            <Input label="" value={proposal.savingsEstimate || ''} onChange={v => onChange({ ...proposal, savingsEstimate: parseFloat(v) || 0 })} placeholder="500000" className="" />
          </div>
          <div style={{ fontSize: 11, color: COLORS.textSoft, marginBottom: 12 }}>Narrative shown in the proposal explaining cost savings vs. internal-only research security programs.</div>
          <Textarea value={proposal.savingsAnalysis || ''} onChange={v => onChange({ ...proposal, savingsAnalysis: v })} rows={7} />
        </Card>

        {/* Payment terms */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>Payment Terms</div>
          <Textarea value={proposal.paymentTerms || ''} onChange={v => onChange({ ...proposal, paymentTerms: v })} rows={3} />
        </Card>
      </div>
    </div>
  );
};

// ─── Proposal Preview (matches the manual Baylor PDF format) ───────────────
const ProposalPreview = ({ proposal, onClose, onSendForSignature, shareMode = false }) => {
  const totals = calcProposalTotals(proposal);
  const today = fmtDateLong(new Date());
  const prospect = proposal.prospect || {};
  const tier = PRICING_TIERS[proposal.tier] || {};

  // Page wrapper: green left rail + footer
  const Page = ({ children, page, total, noFooter }) => (
    <div style={{ position: 'relative', width: 720, minHeight: 932, margin: '0 auto 16px', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', overflow: 'hidden', breakAfter: 'page' }}>
      {/* Green left rail */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, background: 'linear-gradient(180deg, #6B8E3D 0%, #4A7C2E 100%)' }} />
      {/* Page content */}
      <div style={{ padding: '40px 56px 40px 64px', minHeight: 932 }}>
        {children}
      </div>
      {/* Footer */}
      {!noFooter && (
        <div style={{ position: 'absolute', left: 64, right: 56, bottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: COLORS.textSoft }}>
          <IPTalonsLogo size={28} />
          <span style={{ letterSpacing: 1, color: COLORS.textMid }}>CONFIDENTIAL</span>
          <span style={{ color: COLORS.textGhost }}>{page}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={shareMode
      ? { minHeight: '100vh', background: '#EFF2E8', overflowY: 'auto', padding: '24px 0' }
      : { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, overflowY: 'auto', padding: '24px 0' }}>
      {/* Top control bar */}
      <div className="share-topbar" style={{ maxWidth: 720, margin: '0 auto 16px', background: COLORS.navy, padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          {shareMode ? <><IPTalonsLogo size={18} white /> <strong style={{ color: '#fff' }}>IPTalons, Inc.</strong> · Proposal for {prospect.name || 'your institution'}</> : 'Proposal Preview'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" onClick={() => window.print()}>🖨 Print / PDF</Btn>
          {!shareMode && onSendForSignature && <Btn variant="success" size="sm" icon="✍️" onClick={onSendForSignature}>Send for Signature</Btn>}
          {!shareMode && <Btn size="sm" onClick={onClose}>Close ✕</Btn>}
        </div>
      </div>

      {/* ─── PAGE 1: Cover ────────────────────────────────────────── */}
      <Page page="" noFooter>
        <div style={{ marginBottom: 32 }}>
          <img src={shareMode ? "/p/_assets/logo.webp" : "/logo.webp"} alt="IPTalons" style={{ height: 46, width: 'auto', display: 'block' }} />
        </div>

        {/* Hero image placeholder — black/green gradient with hexagon pattern */}
        <div style={{ position: 'relative', width: '100%', height: 380, background: 'linear-gradient(135deg, #2D4422 0%, #1A1F1A 50%, #2D4422 100%)', borderRadius: 4, overflow: 'hidden', marginBottom: 38 }}>
          <svg width="100%" height="100%" viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <pattern id="hex" x="0" y="0" width="60" height="69.3" patternUnits="userSpaceOnUse">
                <polygon points="30,3 55,18 55,52 30,67 5,52 5,18" fill="none" stroke="rgba(124,179,66,0.25)" strokeWidth="1.5"/>
              </pattern>
            </defs>
            <rect width="600" height="380" fill="url(#hex)" opacity="0.8"/>
            <text x="100" y="160" fontSize="38" fontWeight="700" fill="rgba(255,255,255,0.92)">Science</text>
            <text x="300" y="160" fontSize="38" fontWeight="700" fill="rgba(255,255,255,0.6)">RESEARCH</text>
            <text x="180" y="240" fontSize="32" fontWeight="600" fill="rgba(255,255,255,0.85)">Innovation</text>
            <circle cx="430" cy="220" r="36" fill="none" stroke="rgba(124,179,66,0.6)" strokeWidth="2"/>
            <path d="M 420 215 L 440 215 L 440 235" stroke="rgba(124,179,66,0.7)" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        {/* IPTalons contact block — right aligned */}
        <div style={{ textAlign: 'right', fontSize: 11, color: COLORS.green, marginBottom: 44, lineHeight: 1.7 }}>
          <strong style={{ color: COLORS.green, fontSize: 12 }}>IPTalons, Inc.</strong><br />
          6060 N. Central Expressway<br />
          Suite 500<br />
          Dallas, TX 75206<br />
          (972) 422-9169<br />
          www.iptalons.com
        </div>

        {/* Recipient + Date */}
        <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.7 }}>
          <strong>{prospect.contact || '[Contact Name]'}</strong><br />
          {prospect.title || 'Vice President for Research'}<br />
          {prospect.name || '[Institution]'}
        </div>
        <div style={{ marginTop: 24, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: COLORS.textMid, textTransform: 'uppercase' }}>
          {today}
        </div>
      </Page>

      {/* ─── PAGE 2: Introduction Letter ──────────────────────────── */}
      <Page page="1">
        <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.text, marginBottom: 22 }}>Introduction</h1>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.green, letterSpacing: 0.8, marginBottom: 16, textTransform: 'uppercase' }}>
          Here at IPTalons, Inc., our customers are our number one priority.
        </div>
        {(proposal.introLetter || '').split('\n\n').map((para, i) => (
          <p key={i} style={{ fontSize: 11.5, color: COLORS.text, lineHeight: 1.75, marginBottom: 14, textAlign: 'justify' }}>{para}</p>
        ))}
        {/* Signature line */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: 28, color: COLORS.navy, marginBottom: 6 }}>Allen Phelps</div>
          <div style={{ width: 200, height: 1, background: COLORS.textGhost, marginBottom: 8 }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>Allen L. Phelps</div>
          <div style={{ fontSize: 11, color: COLORS.textSoft }}>CEO, IPTalons, Inc.</div>
        </div>
      </Page>

      {/* ─── PAGE 3: Research Security Services ──────────────────── */}
      <Page page="2">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>Research Security Services</h1>
        <p style={{ fontSize: 11.5, color: COLORS.text, lineHeight: 1.75, marginBottom: 16, textAlign: 'justify' }}>
          IPTalons offers services to support your research security program and help you reduce the foreign influence risks affecting your federally funded research grants and contracts. We have curated our services to provide proven solutions that increase the effectiveness and efficiency of research security programs, reducing the need for large database subscriptions, robust internal analytical teams, and the stress of non-compliance with federal research security mandates.
        </p>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginTop: 18, marginBottom: 10 }}>Certified Secure Researcher<sup>™</sup> Program</h3>
        <p style={{ fontSize: 11.5, color: COLORS.text, lineHeight: 1.75, marginBottom: 12, textAlign: 'justify' }}>
          The "easy button" for research security compliance is finally here: Certified Secure Researcher<sup>TM</sup>.
        </p>
        <p style={{ fontSize: 11.5, color: COLORS.text, lineHeight: 1.75, marginBottom: 12, textAlign: 'justify' }}>
          The <strong>Certified Secure Researcher</strong> program (CSR) ensures that each researcher involved in a federally funded research project meets the minimum requirements to comply with the research security rules outlined in NSPM-33, the CHIPS Act, the NDAA, and other funding agency risk management standards. It serves as the foundational building block for your research security program, as you only need to manage the security risks of researchers involved in federally funded and corporate-sponsored research.
        </p>
        <p style={{ fontSize: 11.5, color: COLORS.text, lineHeight: 1.75, marginBottom: 12, textAlign: 'justify' }}>
          The virtual research security records center, operated by IPTalons, maintains each researcher's digital compliance records to enable stakeholders to easily verify via our ORCiD integration that the certified researcher has completed the necessary annual training, has adjudicated their foreign affiliation and association risks, and has attested to and affirmed their compliance with the various reporting requirements. <strong>The goal of every research security program is to have 100% of its funded researchers designated as Certified Secure Researchers</strong>, providing a marketable competitive advantage to attract more research funding opportunities and drive research portfolio growth.
        </p>
        {/* CSR feature panel — green callout block */}
        <div style={{ marginTop: 18, background: 'linear-gradient(135deg, #2D4422 0%, #1A1F1A 100%)', borderRadius: 8, padding: 22, color: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#A4D27A', textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 6 }}>Certified Secure Researcher<sup>™</sup></div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: -0.3 }}>A trusted pathway to research security readiness.</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 14 }}>
            Align your institution and investigators with United States research security requirements. The Certified Secure Researcher<sup>™</sup> designation links directly to each researcher's 16-digit ORCID identifier and proves that they have met the standards funding agencies expect.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { eye: 'LINKED CREDENTIALS', title: 'ORCiD-integrated CSR number', body: 'Attach a verifiable security designation directly to the researcher identifier funding agencies already rely on.' },
              { eye: 'COMPLIANCE READY',   title: 'Foreign affiliation adjudication', body: 'Document attestations, disclosures, and remediation steps once — then share with every sponsor who needs proof.' },
              { eye: 'ACCELERATION',       title: 'Expedited due diligence', body: 'Give reviewers instant visibility into training completion, risk mitigation status, and sponsorship eligibility.' },
            ].map(card => (
              <div key={card.title} style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 6 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#A4D27A', letterSpacing: 1, marginBottom: 4 }}>{card.eye}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{card.body}</div>
              </div>
            ))}
          </div>
        </div>
      </Page>

      {/* ─── PAGE 4: Certification Journey + Inside the Platform ─── */}
      <Page page="3">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>How Researchers Become Certified Secure</h2>
        <p style={{ fontSize: 11, color: COLORS.textMid, lineHeight: 1.65, marginBottom: 16 }}>
          Six steps, one concierge process — no university IT integration required. Each researcher completes the journey once a year; the credential lives on their public ORCID profile.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
          {CSR_JOURNEY_STEPS.map((s, i) => (
            <div key={s.title} style={{ border: `1px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.green}`, borderRadius: 6, padding: '10px 12px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.green, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.text }}>{s.title}</span>
              </div>
              <div style={{ fontSize: 9.5, color: COLORS.textMid, lineHeight: 1.55 }}>{s.body}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Inside the CSR Platform</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {CSR_PLATFORM_FEATURES.map(f => (
            <div key={f.title} style={{ background: '#F5F8EF', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.green, marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 9.5, color: COLORS.textMid, lineHeight: 1.55 }}>{f.body}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', background: COLORS.bg, borderLeft: `3px solid ${COLORS.green}`, borderRadius: '0 6px 6px 0' }}>
          <span style={{ fontSize: 11, color: COLORS.text, lineHeight: 1.6 }}>
            <strong>Included with your subscription:</strong> complimentary platform accounts for up to 500 graduate students and covered individuals, so the entire research team — not just certified PIs — works inside one secure compliance portal.
          </span>
        </div>
      </Page>

      {/* ─── PAGE 5: Benefits + Cost Savings ─────────────────────── */}
      <Page page="4">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.green, marginBottom: 14 }}>Benefits of Deploying the Certified Secure Researcher Strategy</h2>
        <div style={{ background: '#F5F8EF', borderRadius: 8, padding: 22, marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 8, letterSpacing: -0.2 }}>Built for compliance, designed for clarity.</div>
          <div style={{ fontSize: 11.5, color: COLORS.textMid, lineHeight: 1.65, marginBottom: 14 }}>
            CSR gives researchers a modern workflow that satisfies institutional, state, and federal expectations. Everything lives in one secure portal, from initial attestations through continuing education requirements.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { title: 'Continuous monitoring', body: 'Automated check-ins ensure researchers keep certifications, attestations, and training requirements current.' },
              { title: 'Secure document vault', body: 'Upload sensitive disclosures and agreements into a protected portal with audit trails for institutional oversight.' },
              { title: 'Policy alignment',      body: 'CSR templates map to NSPM-33, CHIPS & Science Act, and federated sponsor guidance for confidence during reviews.' },
              { title: 'Collaboration ready',   body: 'Share certification status with partner institutions and primes, reducing duplication across multi-institution proposals.' },
            ].map(c => (
              <div key={c.title} style={{ background: '#fff', padding: 12, borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 10.5, color: COLORS.textMid, lineHeight: 1.55 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginTop: 14, marginBottom: 10 }}>
          Estimated Annual Cost Savings Analysis: {fmt$(proposal.savingsEstimate ?? 0)} or more
        </h3>
        {(proposal.savingsAnalysis || '').split('\n\n').map((para, i) => (
          <p key={i} style={{ fontSize: 11.5, color: COLORS.text, lineHeight: 1.75, marginBottom: 12, textAlign: 'justify' }}>{para}</p>
        ))}
      </Page>

      {/* ─── PAGE 6: Additional Tools Included ────────────────────── */}
      <Page page="5">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>Additional Tools Included with Every CSR Subscription</h2>
        <p style={{ fontSize: 11, color: COLORS.textMid, lineHeight: 1.65, marginBottom: 18 }}>
          The Certified Secure Researcher program is backed by IPTalons' full detection and response stack — included in your annual subscription, not sold separately.
        </p>
        {CSR_INCLUDED_TOOLS.map(tool => (
          <div key={tool.name} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '16px 18px', marginBottom: 14, background: '#fff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>
              {tool.name.split('™')[0]}{tool.name.includes('™') && <sup>TM</sup>}{tool.name.split('™')[1] || ''}
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: COLORS.green, fontStyle: 'italic', marginBottom: 6 }}>{tool.tagline}</div>
            <div style={{ fontSize: 10.5, color: COLORS.textMid, lineHeight: 1.65, textAlign: 'justify' }}>{tool.body}</div>
          </div>
        ))}
        <div style={{ marginTop: 18, padding: '12px 16px', background: 'linear-gradient(135deg, #2D4422 0%, #1A1F1A 100%)', borderRadius: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#A4D27A', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 }}>Trust, verified.</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{CSR_TRUST_POINTS}</div>
        </div>
      </Page>

      {/* ─── PAGE 7: Your Investment (pricing table) ─────────────── */}
      <Page page="6">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, marginBottom: 22 }}>Your Investment</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.borderDark}` }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: COLORS.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', width: '45%' }}>Description</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: COLORS.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', width: '18%' }}>Unit</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: COLORS.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', width: '12%' }}>Qty</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: COLORS.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', width: '25%' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {totals.itemRows.map(row => {
              const svc = SERVICES[row.serviceId];
              if (!svc) return null;
              return (
                <tr key={row.serviceId} style={{ borderBottom: `1px solid ${COLORS.border}`, verticalAlign: 'top' }}>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
                      {svc.name.split('™')[0]}{svc.name.includes('™') && <sup>TM</sup>}{svc.name.split('™')[1]}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.textSoft, lineHeight: 1.55, fontStyle: 'italic' }}>{svc.description}</div>
                  </td>
                  <td style={{ padding: '14px 8px', fontSize: 11, color: COLORS.text }}>${row.unitPrice}{svc.unit}</td>
                  <td style={{ padding: '14px 8px', fontSize: 12, color: COLORS.text, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.qty}</td>
                  <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: COLORS.text, fontVariantNumeric: 'tabular-nums' }}>{fmt$(row.gross)}</div>
                    {row.discountAmount > 0 && (
                      <>
                        <div style={{ fontSize: 11, color: COLORS.green, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>−{fmt$(row.discountAmount)}</div>
                        <div style={{ fontSize: 9.5, color: COLORS.red, marginTop: 2 }}>{(svc.bundleDiscount || {}).label || 'Discount'} −{row.bundleDiscount}%</div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 22, padding: 16, background: COLORS.bg, borderLeft: `3px solid ${COLORS.green}`, borderRadius: '0 6px 6px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Payment Terms</div>
          <p style={{ fontSize: 11, color: COLORS.textMid, lineHeight: 1.65, margin: 0 }}>{proposal.paymentTerms}</p>
        </div>

        <div style={{ marginTop: 18, background: COLORS.green, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Annual Subscription Costs</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{fmt$(totals.total)}</span>
        </div>
      </Page>

      {/* ─── PAGE 8: Let's Work Together (agreement) ──────────────── */}
      <Page page="7">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, marginBottom: 18 }}>Let's Work Together</h1>
        <p style={{ fontSize: 11.5, color: COLORS.text, lineHeight: 1.75, marginBottom: 32, textAlign: 'justify' }}>
          This Agreement, together with the necessary documentation required by the University's procurement process, is the entire Agreement between the parties concerning the subject matter. As of the date both Parties execute this Agreement, it shall supersede any previous agreements or understandings, written or oral, between them. All modifications to the applicable Scope of Work and fees shall be in writing, signed by both Parties, and shall not supersede the terms of this Agreement. The Agreement shall commence on the date the contract is executed.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 14 }}>
          {[
            { printed: 'Allen Phelps', role: 'Chief Executive Officer', org: 'IPTalons, Inc.', sigName: 'Allen Phelps' },
            { printed: prospect.contact || 'Recipient Name', role: prospect.title || 'Vice President for Research', org: prospect.name || 'Institution', sigName: (prospect.contact || '').split(' ').slice(-1)[0] || '________' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M3 18C7 14 11 6 14 4M14 4L18 8M14 4L11 7" stroke={COLORS.green} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.green, letterSpacing: 1, textTransform: 'uppercase' }}>SIGNATURE</div>
                  <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: 18, color: COLORS.navy, lineHeight: 1, marginTop: 4 }}>{s.sigName}</div>
                  <div style={{ height: 1, background: COLORS.borderDark, marginTop: 4 }} />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{s.printed}</div>
                <div style={{ fontSize: 11, color: COLORS.textSoft }}>{s.role}</div>
                <div style={{ fontSize: 11, color: COLORS.textSoft }}>{s.org}</div>
              </div>
            </div>
          ))}
        </div>
      </Page>

    </div>
  );
};

// ─── Lightweight Prospects + Services + Settings screens ──────────────────
const dataTh = (h) => (
  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COLORS.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
);

const RADAR_STATUS_COLORS = { new: '#5F6557', contacted: '#2563EB', replied: '#7C5A8A', call: '#D4A04C', won: '#558B2F', lost: '#B8493A' };
const SIGNAL_STATUS_OPTIONS = [['new', 'New'], ['contacted', 'Contacted'], ['replied', 'Replied'], ['call', 'Call booked'], ['won', 'Won'], ['lost', 'Lost']];
const SIGNAL_TIERS = [
  { key: 'all',  label: 'All' },
  { key: 'hot',  label: '🔥 Hot' },
  { key: 'warm', label: '🌤 Warm' },
  { key: 'acad', label: '🎓 Academic' },
  { key: 'inst', label: '🏛 Institutional' },
];

// ─── Signals (the Demand Radar, inside the app) ─────────────────────────────
// Live radar animation — rings, rotating sweep, pulsing blips (CSS keyframes in index.html)
const RadarBadge = ({ size = 52 }) => {
  const ring = (scale) => ({
    position: 'absolute', left: `${(1 - scale) * 50}%`, top: `${(1 - scale) * 50}%`,
    width: `${scale * 100}%`, height: `${scale * 100}%`,
    borderRadius: '50%', border: '1px solid rgba(85,139,47,0.28)',
  });
  const blip = (x, y, delay, color = '#0E8F80', s = 5) => (
    <span className="radar-anim-blip" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s,
      borderRadius: '50%', background: color, animation: `radar-blip 2.6s ${delay}s ease-in-out infinite` }} />
  );
  return (
    <div aria-hidden="true" style={{ width: size, height: size, position: 'relative', flexShrink: 0, borderRadius: '50%',
      background: 'radial-gradient(circle, #FDFEFB 0%, #F0F5E8 100%)', border: `1px solid ${COLORS.borderDark}`,
      boxShadow: 'inset 0 1px 3px rgba(31,42,27,0.06)' }}>
      <div style={ring(0.66)} />
      <div style={ring(0.33)} />
      {/* crosshair */}
      <div style={{ position: 'absolute', left: '50%', top: '6%', bottom: '6%', width: 1, background: 'rgba(85,139,47,0.18)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '6%', right: '6%', height: 1, background: 'rgba(85,139,47,0.18)' }} />
      {/* rotating sweep */}
      <div className="radar-anim-sweep" style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, rgba(14,143,128,0.45), rgba(14,143,128,0.10) 18%, transparent 26%)',
        animation: 'radar-sweep 4s linear infinite' }} />
      {/* blips */}
      {blip(28, 30, 0)}
      {blip(64, 38, 0.9)}
      {blip(42, 66, 1.7)}
      <span style={{ position: 'absolute', left: '50%', top: '50%', width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5,
        borderRadius: '50%', background: COLORS.green }} />
    </div>
  );
};

const Signals = ({ signals, syncedAt, error, onUpdate, onSync, onDraft }) => {
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);

  const shown = signals.filter(s => filter === 'all' || s.t === filter);
  const countOf = (k) => k === 'all' ? signals.length : signals.filter(s => s.t === k).length;

  const syncNow = async () => {
    setSyncing(true);
    try { await onSync(); } catch {}
    finally { setSyncing(false); }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1080 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <RadarBadge />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Signals</h1>
            <p style={{ fontSize: 13, color: COLORS.textSoft, margin: '4px 0 0' }}>
              Public X posts indicating research-security demand, collected through Apify and reviewed by your team.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {syncedAt && <span style={{ fontSize: 11, color: COLORS.textGhost }}>synced {new Date(syncedAt).toLocaleTimeString()}</span>}
          <Btn variant="secondary" size="sm" onClick={syncNow} disabled={syncing}>{syncing ? 'Syncing…' : '↻ Sync now'}</Btn>
        </div>
      </div>

      {error && <div role="alert" style={{ margin: '12px 0', padding: '10px 12px', borderRadius: 7, background: '#F9EAE6', color: '#8F352B', fontSize: 12.5 }}>{error}</div>}

      {/* Tier filter */}
      <div style={{ display: 'flex', gap: 7, margin: '18px 0 20px', flexWrap: 'wrap' }}>
        {SIGNAL_TIERS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            style={{ fontSize: 12, fontWeight: 600, padding: '5px 13px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              border: `1px solid ${filter === t.key ? COLORS.blue : COLORS.border}`,
              background: filter === t.key ? COLORS.blueLight : '#fff',
              color: filter === t.key ? COLORS.blue : COLORS.textMid }}>
            {t.label} <span style={{ opacity: 0.6 }}>{countOf(t.key)}</span>
          </button>
        ))}
      </div>

      {signals.length === 0 && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📡</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>No signals loaded yet</div>
          <div style={{ fontSize: 12.5, color: COLORS.textSoft, marginTop: 6 }}>
            No qualified signals are stored yet. An administrator can run a bounded Apify scan with <strong>Sync now</strong>.
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {shown.map(sig => {
          const st = sig.state || { status: 'new', owner: '', notes: '' };
          return (
            <Card key={sig.sourceId || sig.handle} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {/* Signal content */}
                <div style={{ flex: 1, padding: '16px 20px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, padding: '2px 8px', borderRadius: 4,
                      color: sig.t === 'hot' ? '#B8493A' : sig.t === 'warm' ? '#B07C1F' : COLORS.green,
                      background: sig.t === 'hot' ? '#F9EAE6' : sig.t === 'warm' ? '#FCF6E8' : '#E8F0DC' }}>{sig.tier}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{sig.handle}</span>
                    <span style={{ fontSize: 11, color: COLORS.textSoft }}>{sig.src}</span>
                    {sig.score > 0 && <span title={(sig.scoreReasons || []).join(' · ')} style={{ fontSize: 10.5, color: COLORS.green, fontWeight: 700 }}>score {sig.score}</span>}
                    {sig.publishedAt && <span style={{ fontSize: 10.5, color: COLORS.textGhost }}>{new Date(sig.publishedAt).toLocaleDateString()}</span>}
                    <a href={sig.url} target="_blank" rel="noopener" style={{ fontSize: 11, color: COLORS.blue, fontWeight: 600, textDecoration: 'none' }}>source ↗</a>
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.text, lineHeight: 1.6, marginBottom: 6 }}>{stripHtml(sig.pain)}</div>
                  {sig.quote && <div style={{ fontSize: 12, color: COLORS.textMid, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 6, borderLeft: `2px solid ${COLORS.border}`, paddingLeft: 10 }}>&ldquo;{stripHtml(sig.quote)}&rdquo;</div>}
                  <div style={{ fontSize: 11.5, color: COLORS.green, lineHeight: 1.55 }}><strong>Angle:</strong> {stripHtml(sig.angle).replace(/^Open:\s*/i, '')}</div>
                </div>

                {/* Workflow rail */}
                <div style={{ width: 210, flexShrink: 0, borderLeft: `1px solid ${COLORS.border}`, background: COLORS.bgAlt, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <select value={st.status} onChange={e => onUpdate(sig.sourceId || sig.handle, { status: e.target.value })}
                    style={{ padding: '6px 8px', fontSize: 12, fontWeight: 600, border: `1px solid ${COLORS.border}`, borderRadius: 7, background: '#fff', fontFamily: 'inherit', color: RADAR_STATUS_COLORS[st.status] || COLORS.text, cursor: 'pointer' }}>
                    {SIGNAL_STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <input defaultValue={st.owner} key={`o-${sig.handle}-${st.owner}`} placeholder="owner"
                    onBlur={e => { if (e.target.value !== st.owner) onUpdate(sig.sourceId || sig.handle, { owner: e.target.value }); }}
                    style={{ padding: '6px 8px', fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 7, fontFamily: 'inherit' }} />
                  <input defaultValue={st.notes} key={`n-${sig.handle}-${st.notes}`} placeholder="notes"
                    onBlur={e => { if (e.target.value !== st.notes) onUpdate(sig.sourceId || sig.handle, { notes: e.target.value }); }}
                    style={{ padding: '6px 8px', fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 7, fontFamily: 'inherit' }} />
                  <Btn size="sm" onClick={() => onDraft(sig)}>Draft proposal →</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: COLORS.textGhost, marginTop: 18, lineHeight: 1.6 }}>
        Status, owner and notes sync live with the radar's team board — one working state across both tools. Outreach stays value-first and human-sent (r/SBIR is solicitation-averse).
      </p>
    </div>
  );
};

const Prospects = ({ prospects, onSync, syncedAt, news }) => {
  const [syncing, setSyncing] = useState(false);
  const radarCount = prospects.filter(p => p.radar).length;

  const syncNow = async () => {
    setSyncing(true);
    await onSync();
    setSyncing(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Prospects</h1>
          <p style={{ fontSize: 13, color: COLORS.textSoft, margin: '4px 0 0' }}>
            {prospects.length} in your pipeline{radarCount > 0 ? ` · ${radarCount} auto-synced from the Demand Radar` : ''}
            {syncedAt ? ` · last sync ${new Date(syncedAt).toLocaleTimeString()}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" onClick={syncNow} disabled={syncing}>{syncing ? 'Syncing…' : '📡 Sync now'}</Btn>
          <Btn icon="+">Add Prospect</Btn>
        </div>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: COLORS.bg }}>{['Institution', 'Type', 'Primary Contact', 'Researchers', 'Federal Funding', 'Primary Risk / Signal', 'Radar'].map(dataTh)}</tr></thead>
          <tbody>
            {prospects.map(p => {
              const cfg = PROSPECT_TYPE_CONFIG[p.type] || {};
              const r = p.radar;
              const intel = (news || []).filter(n => newsMatchesProspect(n, p));
              const intelSev = intel.some(n => n.severity === 'high') ? '#B8493A' : intel.some(n => n.severity === 'medium') ? '#B8860B' : '#0E8F80';
              return (
                <tr key={p.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.text, fontWeight: 500, borderBottom: `1px solid ${COLORS.border}` }}>
                    {r && <span title="Sourced from the Demand Radar" style={{ marginRight: 5 }}>📡</span>}{p.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: COLORS.textMid, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>{cfg.icon} {cfg.label}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: COLORS.textMid, borderBottom: `1px solid ${COLORS.border}` }}>
                    <div>{p.contact || '—'}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSoft }}>{p.email || (r ? r.src : '')}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontVariantNumeric: 'tabular-nums', color: COLORS.text, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>{p.researcherCount || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontVariantNumeric: 'tabular-nums', color: COLORS.text, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>{p.federalFunding ? fmt$(p.federalFunding) : '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 11, color: COLORS.textSoft, borderBottom: `1px solid ${COLORS.border}`, maxWidth: 260, lineHeight: 1.5 }} title={r ? `"${r.quote}" — suggested angle: ${r.angle}` : undefined}>
                    {p.primaryRisk}
                    {r && r.quote && <div style={{ marginTop: 3, color: COLORS.textMid, fontStyle: 'italic' }}>&ldquo;{r.quote.length > 90 ? r.quote.slice(0, 90) + '…' : r.quote}&rdquo;</div>}
                    {intel.length > 0 && (
                      <div style={{ marginTop: 5 }}>
                        <span title={intel.map(n => `${n.severity.toUpperCase()} · ${n.title}`).join('\n')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: intelSev, background: intelSev + '14', border: `1px solid ${intelSev}33`, padding: '2px 8px', borderRadius: 999, cursor: 'default' }}>
                          🛰 {intel.length} policy item{intel.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 11, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>
                    {r ? (
                      <div>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontWeight: 700, fontSize: 10, color: '#fff', background: RADAR_STATUS_COLORS[r.status] || COLORS.textSoft, textTransform: 'capitalize' }}>{r.status}</span>
                        {r.owner && <span style={{ marginLeft: 6, color: COLORS.textMid }}>{r.owner}</span>}
                        <div style={{ marginTop: 3 }}>
                          <a href={r.url} target="_blank" rel="noopener" style={{ color: COLORS.blue, fontSize: 10.5 }} onClick={e => e.stopPropagation()}>source ↗</a>
                        </div>
                      </div>
                    ) : <span style={{ color: COLORS.textGhost }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
};

const ServicesScreen = () => (
  <div style={{ padding: 32 }}>
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Services Catalog</h1>
      <p style={{ fontSize: 13, color: COLORS.textSoft, margin: '4px 0 0' }}>The four products that make up IPTalons' research security suite</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {Object.values(SERVICES).map(s => (
        <Card key={s.id} style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{s.shortName}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.green }}>${s.pricePerUnit.toLocaleString()}<span style={{ fontSize: 11, color: COLORS.textSoft, fontWeight: 400 }}>{s.unit}</span></div>
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMid, lineHeight: 1.65 }}>{s.description}</div>
          {s.bundleDiscount && (
            <div style={{ marginTop: 10, fontSize: 11, color: COLORS.green, fontWeight: 600 }}>
              ✓ {s.bundleDiscount.percent}% bundle discount when paired with {SERVICES[s.bundleDiscount.with].shortName}
            </div>
          )}
        </Card>
      ))}
    </div>
  </div>
);

const Team = ({ proposals }) => {
  const ownership = SAMPLE_TEAM.map(t => {
    const owned = proposals.filter(p => p.ownerId === t.id);
    const activeOwned = owned.filter(p => ['draft','sent','review'].includes(p.status));
    const pipeline = owned.reduce((s, p) => s + (calcProposalTotals(p).total || 0), 0);
    return { ...t, ownedCount: owned.length, activeCount: activeOwned.length, pipeline };
  });

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Team</h1>
          <p style={{ fontSize: 13, color: COLORS.textSoft, margin: '4px 0 0' }}>{SAMPLE_TEAM.length} members · sales, customer success, and research security analysts</p>
        </div>
        <Btn icon="+">Invite Member</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {ownership.map(u => (
          <Card key={u.id} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: u.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{u.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{u.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2 }}>{u.role}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textSoft, lineHeight: 1.7 }}>
              <div>📧 {u.email}</div>
              <div>📞 {u.phone}</div>
            </div>
            <div style={{ marginTop: 12, padding: 10, background: COLORS.bg, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, lineHeight: 1.1 }}>{u.activeCount}</div>
                <div style={{ fontSize: 10, color: COLORS.textSoft, marginTop: 2 }}>active proposals</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.green, lineHeight: 1.1 }}>{fmt$(u.pipeline)}</div>
                <div style={{ fontSize: 10, color: COLORS.textSoft, marginTop: 2 }}>pipeline value</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Templates = () => (
  <div style={{ padding: 32 }}>
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Proposal Templates</h1>
      <p style={{ fontSize: 13, color: COLORS.textSoft, margin: '4px 0 0' }}>Pre-built tier bundles · click "New Proposal" to start from one</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {Object.values(PRICING_TIERS).map(t => (
        <Card key={t.id} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{t.name}</div>
          <div style={{ fontSize: 11, color: COLORS.green, fontWeight: 600 }}>{t.targetSize}</div>
          <div style={{ fontSize: 12, color: COLORS.textMid, lineHeight: 1.6, flex: 1 }}>{t.description}</div>
          <div style={{ marginTop: 10, padding: 10, background: COLORS.bg, borderRadius: 6, fontSize: 11, color: COLORS.textMid }}>
            {t.items.map(it => `${SERVICES[it.serviceId].shortName} × ${it.qty}`).join(' · ')}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const Analytics = ({ proposals }) => {
  const total = proposals.reduce((sum, p) => sum + (calcProposalTotals(p).total || 0), 0);
  return <div style={{ padding: 32 }}>
    <h1>Proposal analytics</h1>
    <p>These figures use drafts saved in this browser. They are not a complete team revenue report.</p>
    <Card style={{ padding: 24 }}>
      <p>{proposals.length} proposals · {fmt$(total)} total proposal value</p>
      {Object.entries(STATUS_CONFIG).map(([status, config]) => <p key={status}>{config.label}: {proposals.filter(p => p.status === status).length}</p>)}
    </Card>
    <Card style={{ padding: 24, marginTop: 20 }}>
      Website, advertising, and historical revenue analytics are not connected. Share tracking records page requests, which can include automated scanners and repeat visits.
    </Card>
  </div>;
};

const MODEL_OPTIONS = [
  { value: 'claude-opus-4-7',   label: 'Claude Opus 4.7 — most capable' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — balanced' },
  { value: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5 — fastest' },
];

const SettingsScreen = ({ managed = false, exportShared }) => {
  const exportBackup = () => {
    const backup = { version: 1, exportedAt: new Date().toISOString(), storage: {} };
    for (const key of ['ip_proposals_v2', 'ip_prospects_v1']) backup.storage[key] = localStorage.getItem(key);
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = `iptalons-backup-${new Date().toISOString().slice(0,10)}.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const [model, setModel]   = useState(() => localStorage.getItem('ip_model')   || 'claude-opus-4-7');
  const [status, setStatus] = useState({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);

  const save = () => {
    localStorage.setItem('ip_model', model);
    setStatus({ kind: 'ok', text: 'Saved' });
    setTimeout(() => setStatus({ kind: '', text: '' }), 2500);
  };

  const test = async () => {
    setBusy(true);
    setStatus({ kind: 'info', text: 'Testing connection…' });
    localStorage.setItem('ip_model', model);
    try {
      const reply = await window.claude.complete({ messages: [{ role: 'user', content: 'Reply with the single word: OK' }], max_tokens: 16 });
      setStatus({ kind: 'ok', text: `Connected — model replied: "${(reply || '').trim().slice(0, 60)}"` });
    } catch (e) {
      setStatus({ kind: 'err', text: e.message || 'Request failed' });
    }
    setBusy(false);
  };

  const statusColor = status.kind === 'ok' ? COLORS.green : status.kind === 'err' ? COLORS.red : COLORS.textSoft;

  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: COLORS.textSoft, margin: '4px 0 0' }}>Configure the Claude API used for proposal drafting.</p>
      </div>
      <Card style={{ padding: 24, marginBottom: 20 }}>
        <h2>{managed ? "Workspace backup" : "Browser data backup"}</h2>
        <p>{managed ? "Export the loaded workspace records, including unsaved edits. Keep the file private. The import review in the toolbar adds new records and skips conflicts; it does not overwrite existing versions." : "Export this browser’s proposal and prospect records before changing browsers or clearing site data. Keep the file private."}</p>
        <Btn onClick={managed ? exportShared : exportBackup}>Export backup</Btn>
      </Card>
      <Card style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>Claude API</div>
        <div style={{ fontSize: 12, color: COLORS.textSoft, marginBottom: 20 }}>
          AI access is managed by the workspace administrator. Requests require a signed-in session and are subject to workspace limits.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Select label="Model" value={model} onChange={setModel} options={MODEL_OPTIONS} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn onClick={save}>Save</Btn>
          <Btn variant="secondary" onClick={test} disabled={busy}>Test connection</Btn>
          {status.text && <span style={{ fontSize: 13, color: statusColor, marginLeft: 'auto' }}>{status.text}</span>}
        </div>
      </Card>
    </div>
  );
};

// Export
Object.assign(window, { Dashboard, WizardStep1, WizardStep2, WizardStep3, ProposalEditor, ProposalPreview, Prospects, Signals, ServicesScreen, Templates, Analytics, SettingsScreen, Team, LoginScreen, NotificationCenter, SignatureModal, ShareModal, TrustSecurity });
