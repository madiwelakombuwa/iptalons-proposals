ALTER TABLE proposal_events ADD COLUMN operation_id TEXT;
CREATE UNIQUE INDEX proposal_events_operation_id ON proposal_events(operation_id) WHERE operation_id IS NOT NULL;

CREATE TABLE email_deliveries (
  operation_id TEXT PRIMARY KEY,
  token TEXT NOT NULL REFERENCES published_proposals(token),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_hash TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','accepted','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  error TEXT
);

CREATE INDEX email_deliveries_token_created ON email_deliveries(token, created_at DESC);
CREATE INDEX email_deliveries_status_updated ON email_deliveries(status, updated_at);
