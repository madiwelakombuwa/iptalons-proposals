// Managed mode keeps edits in memory until an explicit revision-checked save.
// Original legacy localStorage keys are never overwritten by shared records.
function useSharedWorkspace({ mode, auth, proposals, prospects, setProposals, setProspects, clearEditor }) {
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''), [review, setReview] = useState(null);
  const [generation, setGeneration] = useState(0);
  const bases = useRef({ proposal: new Map(), prospect: new Map() });
  const enabled = mode === 'access';
  const entries = { proposal: proposals, prospect: prospects };
  const dirty = enabled && ready && Object.entries(entries).some(([kind, rows]) => rows.some(row => bases.current[kind].get(row.id)?.json !== JSON.stringify(row)));
  const request = async (path, body) => {
    const response = await fetch(path, body === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let result; try { result = await response.json(); } catch { throw new Error('Sign-in expired or the server is unavailable. Export your edits before reloading.'); }
    if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
    return result;
  };
  const readAll = async kind => {
    let cursor = null, rows = [];
    do {
      const page = await request(`/api/workspace/records/${kind}${cursor ? '?after='+encodeURIComponent(cursor) : ''}`);
      rows.push(...page.records); cursor = page.nextCursor;
    } while (cursor);
    return rows;
  };
  const load = async () => {
    setBusy(true);
    try {
      const [p, c] = await Promise.all([readAll('proposal'), readAll('prospect')]);
      for (const [kind, rows] of [['proposal', p], ['prospect', c]]) bases.current[kind] = new Map(rows.map(row => [row.record.id, { revision: row.revision, json: JSON.stringify(row.record) }]));
      setProposals(p.map(row => row.record)); setProspects(c.map(row => row.record)); clearEditor();
      setReady(true); setMessage('Shared records loaded. Save changes before leaving this page.'); setGeneration(x => x+1);
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  };
  useEffect(() => { if (enabled && auth) load(); else setReady(false); }, [enabled, auth?.user]);
  useEffect(() => {
    const guard = e => { if (dirty || busy) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', guard); return () => window.removeEventListener('beforeunload', guard);
  }, [dirty, busy]);
  const exportEdits = () => {
    const data = { version: 1, exportedAt: new Date().toISOString(), storage: { ip_proposals_v2: JSON.stringify(proposals), ip_prospects_v1: JSON.stringify(prospects) } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `iptalons-shared-edits-${Date.now()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const save = async () => {
    setBusy(true); let saved = 0;
    try {
      for (const [kind, rows] of Object.entries(entries)) for (const record of rows) {
        const before = bases.current[kind].get(record.id);
        if (before?.json === JSON.stringify(record)) continue;
        const result = await request(`/api/workspace/records/${kind}/${encodeURIComponent(record.id)}`, { record, expectedRevision: before?.revision || 0 });
        bases.current[kind].set(record.id, { revision: result.revision, json: JSON.stringify(record) }); saved++;
      }
      setMessage(`Saved ${saved} changed records to the workspace.`);
    } catch (e) { setMessage(`${saved} records saved. ${e.message} Your remaining edits are still in this tab; use Export edits.`); }
    finally { setBusy(false); setGeneration(x => x+1); }
  };
  const prepareImport = backup => {
    try {
      const p = JSON.parse(backup.storage?.ip_proposals_v2 || '[]'), c = JSON.parse(backup.storage?.ip_prospects_v1 || '[]');
      if (!Array.isArray(p) || !Array.isArray(c) || p.length+c.length > 2000 || [...p,...c].some(r => !r || typeof r.id !== 'string' || !r.id || r.id.length > 128)) throw new Error('Backup must contain proposal/prospect arrays with valid IDs, at most 2,000 records.');
      setReview({ proposal: p, prospect: c }); setMessage('Review the record counts, then import. Existing IDs will never be overwritten.');
    } catch (e) { setMessage('Cannot import: '+e.message); }
  };
  const importRecords = async () => {
    setBusy(true); let imported = 0, duplicate = 0; const failures = [];
    for (const [kind, rows] of Object.entries(review)) for (const record of rows) {
      try {
        const result = await request(`/api/workspace/records/${kind}/${encodeURIComponent(record.id)}`, { record, expectedRevision: 0, import: true });
        result.alreadyImported ? duplicate++ : imported++;
      } catch (e) { failures.push(`${kind} ${record.id}: ${e.message}`); }
    }
    await load(); setReview(null); setBusy(false);
    setMessage(`Imported ${imported}; already present ${duplicate}; skipped ${failures.length}. ${failures.join(' | ')}`);
  };
  const controls = enabled && auth && <div style={{ padding: '12px 20px', background: '#edf4e8', borderBottom: '1px solid #c3d1b9', maxHeight: 240, overflow: 'auto' }}>
    <div role="status" style={{ fontSize: 13, marginBottom: 8 }}>{dirty ? 'Unsaved changes. ' : ''}{message || 'Loading shared records…'}</div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button disabled={!ready || busy || !dirty} onClick={save}>Save shared changes</button>
      <button disabled={!ready || busy} onClick={exportEdits}>Export edits</button>
      <button disabled={busy || dirty} onClick={load}>Reload shared records</button>
      {auth.role === 'admin' && <>
        <button disabled={busy || dirty || !ready} onClick={() => prepareImport({ storage: { ip_proposals_v2: localStorage.getItem('ip_proposals_v2'), ip_prospects_v1: localStorage.getItem('ip_prospects_v1') } })}>Review browser import</button>
        <label>Import backup <input type="file" accept="application/json,.json" disabled={busy || dirty || !ready} onChange={async e => {
          const file = e.target.files[0]; if (!file) return;
          try { if (file.size > 10000000) throw new Error('Backup exceeds 10 MB'); prepareImport(JSON.parse(await file.text())); } catch (error) { setMessage(error.message); }
          e.target.value = '';
        }} /></label>
      </>}
    </div>
    {review && <div style={{ marginTop: 10 }}>Import {review.proposal.length} proposals and {review.prospect.length} prospects? Original IDs, dates, and notes are retained. Conflicting records are skipped.
      <button disabled={busy || dirty} onClick={importRecords}>Import reviewed records</button><button disabled={busy} onClick={() => setReview(null)}>Cancel</button>
    </div>}
  </div>;
  return { ready, busy, dirty, controls, exportEdits };
}

function ManagedTeam() {
  const [members, setMembers] = useState([]), [error, setError] = useState('');
  useEffect(() => { let active = true; fetch('/api/workspace/members').then(async r => { if (!r.ok) throw new Error('Unable to load team membership'); return r.json(); }).then(d => { if (active) setMembers(d.members); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  return <div style={{ padding: 32 }}><h1>Workspace team</h1><p>These are approved workspace members. Membership and access policies are managed by the administrator.</p>{error && <p role="alert">{error}</p>}{members.map(m => <p key={m.email}>{m.email} · {m.role}</p>)}</div>;
}
