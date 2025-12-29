-- Complete Setup Migration
-- Führe diese Datei aus, wenn die Tabellen noch nicht existieren
-- Oder wenn du alles neu aufsetzen möchtest

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (VORSICHT: Löscht alle Daten!)
-- Entferne die DROP TABLE Zeilen, wenn du Daten behalten möchtest
-- DROP TABLE IF EXISTS post_metrics_daily CASCADE;
-- DROP TABLE IF EXISTS posts CASCADE;
-- DROP TABLE IF EXISTS daily_metrics CASCADE;
-- DROP TABLE IF EXISTS ig_accounts CASCADE;
-- DROP TABLE IF EXISTS pages CASCADE;
-- DROP TABLE IF EXISTS connected_accounts CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected accounts (OAuth tokens)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  page_id TEXT,
  ig_business_id TEXT,
  scopes TEXT[],
  token JSONB NOT NULL,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, page_id)
);

-- Pages (Facebook Pages)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Instagram Business Accounts
CREATE TABLE IF NOT EXISTS ig_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ig_business_id TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ig_business_id)
);

-- Daily metrics (aggregated per account/day)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_ref TEXT NOT NULL, -- page_id or ig_business_id
  platform TEXT NOT NULL, -- 'facebook' or 'instagram'
  date DATE NOT NULL,
  impressions INT DEFAULT 0,
  reach INT DEFAULT 0,
  engagements INT DEFAULT 0,
  profile_views INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  link_clicks INT DEFAULT 0,
  video_views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, account_ref, platform, date)
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  created_time TIMESTAMPTZ,
  caption TEXT,
  media_type TEXT,
  permalink TEXT,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, post_id)
);

-- Post metrics (daily breakdown per post)
CREATE TABLE IF NOT EXISTS post_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  date DATE NOT NULL,
  impressions INT DEFAULT 0,
  reach INT DEFAULT 0,
  engagements INT DEFAULT 0,
  saves INT DEFAULT 0,
  video_views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, post_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_ig_accounts_user_id ON ig_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON daily_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_account_date ON daily_metrics(account_ref, platform, date);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform_created ON posts(platform, created_time);
CREATE INDEX IF NOT EXISTS idx_post_metrics_daily_post_date ON post_metrics_daily(post_id, date);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, für sauberen Neustart)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can insert own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can update own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can delete own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can view own pages" ON pages;
DROP POLICY IF EXISTS "Users can insert own pages" ON pages;
DROP POLICY IF EXISTS "Users can update own pages" ON pages;
DROP POLICY IF EXISTS "Users can delete own pages" ON pages;
DROP POLICY IF EXISTS "Users can view own ig accounts" ON ig_accounts;
DROP POLICY IF EXISTS "Users can insert own ig accounts" ON ig_accounts;
DROP POLICY IF EXISTS "Users can update own ig accounts" ON ig_accounts;
DROP POLICY IF EXISTS "Users can delete own ig accounts" ON ig_accounts;
DROP POLICY IF EXISTS "Users can view own daily metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can insert own daily metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can update own daily metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can delete own daily metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Users can view own post metrics" ON post_metrics_daily;
DROP POLICY IF EXISTS "Users can insert own post metrics" ON post_metrics_daily;
DROP POLICY IF EXISTS "Users can update own post metrics" ON post_metrics_daily;
DROP POLICY IF EXISTS "Users can delete own post metrics" ON post_metrics_daily;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Connected accounts policies
CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected accounts"
  ON connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Pages policies
CREATE POLICY "Users can view own pages"
  ON pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages"
  ON pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages"
  ON pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages"
  ON pages FOR DELETE
  USING (auth.uid() = user_id);

-- IG Accounts policies
CREATE POLICY "Users can view own ig accounts"
  ON ig_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ig accounts"
  ON ig_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ig accounts"
  ON ig_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ig accounts"
  ON ig_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Daily metrics policies
CREATE POLICY "Users can view own daily metrics"
  ON daily_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily metrics"
  ON daily_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily metrics"
  ON daily_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily metrics"
  ON daily_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Post metrics daily policies
CREATE POLICY "Users can view own post metrics"
  ON post_metrics_daily FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own post metrics"
  ON post_metrics_daily FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post metrics"
  ON post_metrics_daily FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own post metrics"
  ON post_metrics_daily FOR DELETE
  USING (auth.uid() = user_id);

