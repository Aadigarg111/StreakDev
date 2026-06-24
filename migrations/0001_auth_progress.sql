CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE NOT NULL,
  github_username TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  last_active_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  hearts INTEGER NOT NULL DEFAULT 5,
  xp INTEGER NOT NULL DEFAULT 0,
  gems INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_streak_date TEXT,
  daily_goal_xp INTEGER NOT NULL DEFAULT 10,
  league_id TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS completed_lessons (
  user_id TEXT NOT NULL REFERENCES users(id),
  lesson_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  accuracy REAL,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS enrolled_tracks (
  user_id TEXT NOT NULL REFERENCES users(id),
  track_id TEXT NOT NULL,
  current_section_id TEXT,
  current_unit_id TEXT,
  placement_test_completed BOOLEAN DEFAULT FALSE,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, track_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL
);
