// Managed mode keeps edits in memory until an explicit revision-checked save.
// Original legacy localStorage keys are never overwritten by shared records.
function useSharedWorkspace({ mode, auth, proposals, prospects, setProposals, setProspects, clearEditor }) {
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''), [review, setReview] = useState(null);
  const [generation, setGeneration] = useState(0);
  const bases = useRef({ proposal: new Map(), prospect: new Map() });
  const saveTimers = useRef(new Map()), saveChains = useRef(new Map()), latestRecords = useRef(new Map());
  const enabled = mode === 'access';
  const entries = { proposal: proposals, prospect: prospects };
  const dirty = enabled && ready && Object.entries(entries).some(([kind, rows]) => {
    const ids = new Set(rows.map(row => row.id));
    return rows.some(row => bases.current[kind].get(row.id)?.json !== JSON.stringify(row)) || [...bases.current[kind].keys()].some(id => !ids.has(id));
  });
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
      for (const [kind, rows] of Object.entries(entries)) {
        const ids = new Set(rows.map(record => record.id));
        for (const [id, before] of [...bases.current[kind].entries()]) if (!ids.has(id)) {
          const response = await fetch(`/api/workspace/records/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedRevision: before.revision }) });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.error || `Delete failed (${response.status})`);
          bases.current[kind].delete(id); saved++;
        }
      }
      setMessage(`Saved ${saved} changed records to the workspace.`);
    } catch (e) { setMessage(`${saved} records saved. ${e.message} Your remaining edits are still in this tab; use Export edits.`); }
    finally { setBusy(false); setGeneration(x => x+1); }
  };
  const upsertRecord = async (kind, record) => {
    if (!enabled) throw new Error('Shared workspace is not enabled.');
    setBusy(true);
    try {
      const before = bases.current[kind].get(record.id);
      const result = await request(`/api/workspace/records/${kind}/${encodeURIComponent(record.id)}`, { record, expectedRevision: before?.revision || 0 });
      bases.current[kind].set(record.id, { revision: result.revision, json: JSON.stringify(record) });
      const setter = kind === 'proposal' ? setProposals : setProspects;
      setter(rows => rows.some(row => row.id === record.id) ? rows.map(row => row.id === record.id ? record : row) : [record, ...rows]);
      setMessage(`${kind === 'prospect' ? 'Prospect' : 'Proposal'} saved to the workspace.`);
      setGeneration(x => x+1);
      return result;
    } catch (error) {
      setMessage(error.message); throw error;
    } finally { setBusy(false); }
  };
  const deleteRecord = async (kind, id) => {
    if (!enabled) throw new Error('Shared workspace is not enabled.');
    const before = bases.current[kind].get(id);
    if (!before) throw new Error('Reload the workspace before deleting this record.');
    setBusy(true);
    try {
      const response = await fetch(`/api/workspace/records/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedRevision: before.revision }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Delete failed (${response.status})`);
      bases.current[kind].delete(id);
      const setter = kind === 'proposal' ? setProposals : setProspects;
      setter(rows => rows.filter(row => row.id !== id));
      setMessage(`${kind === 'prospect' ? 'Prospect' : 'Proposal'} deleted from the workspace.`);
      setGeneration(x => x+1);
      return result;
    } catch (error) {
      setMessage(error.message); throw error;
    } finally { setBusy(false); }
  };
  const scheduleRecord = (kind, record, delay = 700) => {
    if (!enabled || !ready) return;
    const key = `${kind}:${record.id}`;
    latestRecords.current.set(key, record);
    clearTimeout(saveTimers.current.get(key));
    setMessage(`Saving ${kind}…`);
    saveTimers.current.set(key, setTimeout(() => {
      const chain = (saveChains.current.get(key) || Promise.resolve()).catch(() => {}).then(async () => {
        const latest = latestRecords.current.get(key);
        if (latest) await upsertRecord(kind, latest);
      });
      saveChains.current.set(key, chain);
    }, delay));
  };
  useEffect(() => () => { for (const timer of saveTimers.current.values()) clearTimeout(timer); }, []);
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
  return { ready, busy, dirty, controls, exportEdits, upsertRecord, deleteRecord, scheduleRecord };
}

function ManagedTeam({ currentUser }) {
  const [members, setMembers] = useState([]), [error, setError] = useState('');
  useEffect(() => { let active = true; fetch('/api/workspace/members').then(async r => { if (!r.ok) throw new Error('Unable to load team membership'); return r.json(); }).then(d => { if (active) setMembers(d.members); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
  const nameOf = email => email.split('@')[0].split(/[._-]/).map(part => part.charAt(0).toUpperCase()+part.slice(1)).join(' ');
  const initials = email => nameOf(email).split(' ').map(part => part[0]).join('').slice(0,2).toUpperCase();
  const totals = members.reduce((sum, member) => {
    for (const key of ['prospectsCreated','proposalsSent','dealsClosed','estimatedDealValue']) sum[key] += member.metrics?.[key] || 0;
    return sum;
  }, { prospectsCreated: 0, proposalsSent: 0, dealsClosed: 0, estimatedDealValue: 0 });
  const relative = iso => {
    if (!iso) return 'No recorded activity yet';
    const days = Math.floor((Date.now()-new Date(iso).getTime())/86400000);
    return days < 1 ? 'Active today' : days === 1 ? 'Active yesterday' : `Active ${days} days ago`;
  };
  const summary = [
    ['Prospects created', totals.prospectsCreated, '#2F6B4F'],
    ['Proposals sent', totals.proposalsSent, '#3F6FA3'],
    ['Deals closed', totals.dealsClosed, '#7A963F'],
    ['Estimated deal value', money(totals.estimatedDealValue), '#1F3B2C'],
  ];
  return <div style={{ padding: 32, maxWidth: 1180 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>
      <div><h1 style={{ fontSize: 24, margin: 0, color: '#1F2A1B' }}>Workspace team</h1><p style={{ margin: '6px 0 0', color: '#687263', fontSize: 13 }}>Performance from shared workspace records, attributed to the member who created each record.</p></div>
      <div style={{ fontSize: 12, color: '#687263', padding: '7px 11px', border: '1px solid #DDE3D5', borderRadius: 999, background: '#fff' }}>{members.length} active members</div>
    </div>
    {error && <div role="alert" style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#F9EAE6', color: '#8F352B' }}>{error}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 26 }}>
      {summary.map(([label,value,color]) => <div key={label} style={{ background: '#fff', border: '1px solid #E2E7DA', borderRadius: 12, padding: '17px 18px', boxShadow: '0 2px 8px rgba(31,42,27,.04)' }}>
        <div style={{ color, fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>{value}</div><div style={{ color: '#778171', fontSize: 11.5, marginTop: 4 }}>{label}</div>
      </div>)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }}>
      {members.map((member, index) => {
        const metric = member.metrics || {};
        const palette = [['#E4EFDA','#416D2B'],['#E2EEF3','#31647A'],['#F4EAD8','#8B6426'],['#EAE5F3','#655082']][index % 4];
        return <div key={member.email} style={{ background: '#fff', border: '1px solid #DEE4D6', borderRadius: 14, padding: 20, boxShadow: '0 3px 12px rgba(31,42,27,.055)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: palette[0], color: palette[1], fontWeight: 800 }}>{initials(member.email)}</div>
            <div style={{ minWidth: 0, flex: 1 }}><div style={{ fontWeight: 700, color: '#1F2A1B' }}>{nameOf(member.email)} {member.email === currentUser && <span style={{ fontSize: 9, color: '#527A36', background: '#EDF4E8', padding: '2px 6px', borderRadius: 999 }}>YOU</span>}</div><div style={{ fontSize: 11.5, color: '#778171', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</div></div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#527A36', background: '#EDF4E8', padding: '4px 8px', borderRadius: 999 }}>{member.role}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #EDF0E8', borderBottom: '1px solid #EDF0E8', padding: '13px 0', rowGap: 13 }}>
            {[['Prospects',metric.prospectsCreated || 0],['Proposals sent',metric.proposalsSent || 0],['Deals closed',metric.dealsClosed || 0],['Est. value',money(metric.estimatedDealValue)]].map(([label,value]) => <div key={label}><div style={{ fontSize: 17, color: '#263421', fontWeight: 750 }}>{value}</div><div style={{ fontSize: 10.5, color: '#899283', marginTop: 2 }}>{label}</div></div>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 13, fontSize: 11, color: '#7C8577' }}><span>{relative(metric.lastActiveAt)}</span><span>{metric.activityCount || 0} saved changes</span></div>
        </div>;
      })}
    </div>
    <p style={{ marginTop: 18, fontSize: 11, lineHeight: 1.6, color: '#929A8D' }}>Metrics begin when records are saved in the shared workspace. Older imported records without creator history remain unassigned.</p>
  </div>;
}
