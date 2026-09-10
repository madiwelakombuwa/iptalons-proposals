CREATE TABLE proposal_templates (
  id TEXT PRIMARY KEY,
  record_json TEXT NOT NULL CHECK (json_valid(record_json)),
  revision INTEGER NOT NULL CHECK (revision > 0),
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO proposal_templates VALUES
('starter','{"description":"CSR only — for institutions piloting research security compliance","id":"starter","items":[{"qty":100,"serviceId":"csr"},{"qty":40,"serviceId":"consulting"}],"name":"Starter","targetSize":"Under 150 researchers"}',1,'system',strftime('%Y-%m-%dT%H:%M:%fZ','now')),
('standard','{"description":"CSR + RedBook + Grant Hopper AI + 60 hrs consulting — most common bundle","id":"standard","items":[{"qty":250,"serviceId":"csr"},{"qty":1,"serviceId":"redbook"},{"qty":60,"serviceId":"consulting"}],"name":"Standard","targetSize":"150–500 researchers"}',1,'system',strftime('%Y-%m-%dT%H:%M:%fZ','now')),
('full','{"description":"Standard + supplemental hours for larger R1 universities and labs","id":"full","items":[{"qty":500,"serviceId":"csr"},{"qty":1,"serviceId":"redbook"},{"qty":60,"serviceId":"consulting"},{"qty":120,"serviceId":"supplemental"}],"name":"Full Suite","targetSize":"500+ researchers"}',1,'system',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
