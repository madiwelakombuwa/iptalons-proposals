CREATE TABLE workspace_members (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  subject TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  tokens_valid_after INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE workspace_records (
  kind TEXT NOT NULL CHECK (kind IN ('proposal','prospect')),
  id TEXT NOT NULL,
  record_json TEXT NOT NULL CHECK (json_valid(record_json)),
  revision INTEGER NOT NULL CHECK (revision > 0),
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (kind,id)
);
CREATE TABLE workspace_record_versions (
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  record_json TEXT NOT NULL CHECK (json_valid(record_json)),
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (kind,id,revision)
);
CREATE TRIGGER workspace_record_insert AFTER INSERT ON workspace_records BEGIN
  INSERT INTO workspace_record_versions VALUES (NEW.kind,NEW.id,NEW.revision,NEW.record_json,NEW.updated_by,NEW.updated_at);
END;
CREATE TRIGGER workspace_record_update AFTER UPDATE ON workspace_records BEGIN
  INSERT INTO workspace_record_versions VALUES (NEW.kind,NEW.id,NEW.revision,NEW.record_json,NEW.updated_by,NEW.updated_at);
END;
