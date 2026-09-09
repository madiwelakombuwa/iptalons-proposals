CREATE TABLE published_proposals (
  token TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  prospect_name TEXT NOT NULL,
  proposal_json TEXT NOT NULL CHECK (json_valid(proposal_json)),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT,
  expires_at TEXT
);

CREATE INDEX published_proposals_created_at ON published_proposals(created_at DESC);
CREATE INDEX published_proposals_proposal_id ON published_proposals(proposal_id);

CREATE TABLE proposal_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL REFERENCES published_proposals(token) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view','email_accepted')),
  at TEXT NOT NULL,
  country TEXT,
  user_agent TEXT,
  recipient TEXT,
  subject TEXT
);

CREATE INDEX proposal_events_token_at ON proposal_events(token, at DESC);
CREATE INDEX proposal_events_type_at ON proposal_events(event_type, at DESC);
