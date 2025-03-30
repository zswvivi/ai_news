-- Migration number: 0001        2025-01-16T13:42:41.031Z
DROP TABLE IF EXISTS counters;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS ai_news;
DROP TABLE IF EXISTS news_sources;
DROP TABLE IF EXISTS news_tags;
DROP TABLE IF EXISTS news_tag_relations;

-- Basic system tables
CREATE TABLE IF NOT EXISTS counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  path TEXT,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI News tables
CREATE TABLE IF NOT EXISTS news_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'twitter', 'website', etc.
  url TEXT,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  image_url TEXT,
  author TEXT,
  published_at DATETIME,
  external_id TEXT, -- Twitter ID, article ID, etc.
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES news_sources(id)
);

CREATE TABLE IF NOT EXISTS news_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_tag_relations (
  news_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (news_id, tag_id),
  FOREIGN KEY (news_id) REFERENCES ai_news(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES news_tags(id) ON DELETE CASCADE
);

-- Initial data
INSERT INTO counters (name, value) VALUES 
  ('page_views', 0),
  ('api_calls', 0);

-- Initial news tags
INSERT INTO news_tags (name) VALUES
  ('AI Agent'),
  ('LLM'),
  ('Autonomous AI'),
  ('AI Assistant'),
  ('AI Research');

-- Create indexes
CREATE INDEX idx_access_logs_accessed_at ON access_logs(accessed_at);
CREATE INDEX idx_counters_name ON counters(name);
CREATE INDEX idx_ai_news_published_at ON ai_news(published_at);
CREATE INDEX idx_ai_news_source_id ON ai_news(source_id);
CREATE INDEX idx_ai_news_external_id ON ai_news(external_id);
CREATE INDEX idx_news_tags_name ON news_tags(name);
