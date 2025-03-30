-- Add update_logs table to the migration file
ALTER TABLE ai_news ADD COLUMN last_updated DATETIME;

CREATE TABLE IF NOT EXISTS update_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'twitter_search', 'twitter_accounts', etc.
  params TEXT, -- search query, account names, etc.
  status TEXT NOT NULL, -- 'in_progress', 'success', 'failed'
  message TEXT,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Create index for update_logs
CREATE INDEX idx_update_logs_started_at ON update_logs(started_at);
CREATE INDEX idx_update_logs_type ON update_logs(type);
