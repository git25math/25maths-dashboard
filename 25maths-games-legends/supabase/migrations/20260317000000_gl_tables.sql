-- Games Legends tables for Supabase (shared ExamHub instance)

-- 1. Mission data (optional, for future server-side management)
CREATE TABLE IF NOT EXISTS gl_missions (
  id INT PRIMARY KEY,
  grade INT NOT NULL,
  unit_id INT NOT NULL,
  unit_order INT NOT NULL,
  unit_title JSONB NOT NULL,
  title JSONB NOT NULL,
  story JSONB NOT NULL,
  description JSONB NOT NULL,
  topic TEXT NOT NULL,
  question_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  reward INT NOT NULL DEFAULT 100,
  data JSONB NOT NULL,
  secret JSONB NOT NULL,
  tutorial_steps JSONB,
  kp_id TEXT,
  section_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User progress
CREATE TABLE IF NOT EXISTS gl_user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  total_score INT DEFAULT 0,
  grade INT,
  selected_char_id TEXT DEFAULT '',
  completed_missions JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{"Algebra":0,"Geometry":0,"Functions":0,"Calculus":0,"Statistics":0}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Battle results
CREATE TABLE IF NOT EXISTS gl_battle_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  mission_id INT,
  kp_id TEXT,
  difficulty_mode TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  score INT DEFAULT 0,
  duration_secs INT,
  hp_remaining INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Multiplayer rooms
CREATE TABLE IF NOT EXISTS gl_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('team', 'pk')),
  mission_id INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  players JSONB DEFAULT '{}',
  host_id UUID REFERENCES auth.users ON DELETE SET NULL,
  winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gl_battle_user ON gl_battle_results(user_id);
CREATE INDEX IF NOT EXISTS idx_gl_battle_kp ON gl_battle_results(kp_id);
CREATE INDEX IF NOT EXISTS idx_gl_battle_mission ON gl_battle_results(mission_id);
CREATE INDEX IF NOT EXISTS idx_gl_rooms_status ON gl_rooms(status);

-- RLS policies
ALTER TABLE gl_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_missions ENABLE ROW LEVEL SECURITY;

-- gl_user_progress: users can read/write own data
CREATE POLICY gl_user_progress_select ON gl_user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY gl_user_progress_insert ON gl_user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY gl_user_progress_update ON gl_user_progress FOR UPDATE USING (auth.uid() = user_id);

-- gl_battle_results: users can insert own, read own
CREATE POLICY gl_battle_results_select ON gl_battle_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY gl_battle_results_insert ON gl_battle_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- gl_rooms: authenticated users can read all, create, update
CREATE POLICY gl_rooms_select ON gl_rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY gl_rooms_insert ON gl_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY gl_rooms_update ON gl_rooms FOR UPDATE USING (auth.role() = 'authenticated');

-- gl_missions: public read
CREATE POLICY gl_missions_select ON gl_missions FOR SELECT USING (true);

-- Enable realtime for rooms
ALTER PUBLICATION supabase_realtime ADD TABLE gl_rooms;
