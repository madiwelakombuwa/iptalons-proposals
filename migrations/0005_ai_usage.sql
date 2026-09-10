CREATE TABLE ai_usage_events (
  id TEXT PRIMARY KEY,
  actor_email TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL CHECK (output_tokens >= 0),
  created_at TEXT NOT NULL
);

CREATE INDEX ai_usage_events_created_at ON ai_usage_events(created_at);
