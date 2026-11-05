-- Private learning progress. Each row is accessible only through a verified Access identity.
CREATE TABLE IF NOT EXISTS progress (
 user_id TEXT PRIMARY KEY,
 data_json TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS artifacts (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 object_key TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 bytes INTEGER NOT NULL CHECK (bytes BETWEEN 0 AND 1048576),
 content_type TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_artifacts_owner_created ON artifacts (user_id, created_at DESC);
