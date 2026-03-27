-- ============================================================
-- Manna App — Database Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- ───────────────────────────────────────────────────────────
-- 1. PROFILES
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name                  TEXT NOT NULL DEFAULT '',
  relationship_type     TEXT NOT NULL DEFAULT 'couple'
                          CHECK (relationship_type IN ('couple')),
  partner_name          TEXT,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  push_token            TEXT,
  attendance_date       DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- 2. PAIRS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pairs (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'connected')),
  notification_hour   INT NOT NULL DEFAULT 9,
  notification_minute INT NOT NULL DEFAULT 0,
  pebbles             INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- 3. PAIR_INVITES
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pair_invites (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id     UUID REFERENCES pairs(id) ON DELETE CASCADE NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  created_by  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expires_at  TIMESTAMPTZ,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- 4. QUESTIONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category    TEXT NOT NULL
                CHECK (category IN ('faith', 'love', 'values', 'daily')),
  content     TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- 5. DAILY_QUESTIONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_questions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_date  DATE UNIQUE NOT NULL,
  question_id    UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- 6. ANSWERS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id  UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  answer_text  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, question_id)
);

-- ───────────────────────────────────────────────────────────
-- 7. PEBBLES RPC — 원자적 만나돌 증감 (race condition 방지)
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_pebbles(p_pair_id UUID, p_amount INT)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new INT;
BEGIN
  UPDATE pairs SET pebbles = pebbles + p_amount WHERE id = p_pair_id
  RETURNING pebbles INTO v_new;
  RETURN v_new;
END; $$;

-- ───────────────────────────────────────────────────────────
-- 8. PETS — 커플 공동 반려몽
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pets (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id        UUID REFERENCES pairs(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name           TEXT NOT NULL DEFAULT '반려몽',
  total_answers  INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 답변 저장 시 total_answers 원자적 증가 + 없으면 생성
CREATE OR REPLACE FUNCTION increment_pet_answers(p_pair_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_total INT;
BEGIN
  INSERT INTO pets (pair_id, total_answers)
    VALUES (p_pair_id, 1)
  ON CONFLICT (pair_id) DO UPDATE
    SET total_answers = pets.total_answers + 1
  RETURNING total_answers INTO v_total;
  RETURN v_total;
END; $$;

-- ───────────────────────────────────────────────────────────
-- 8. updated_at AUTO-TRIGGER
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pairs_updated_at
  BEFORE UPDATE ON pairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ───────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pair_invites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets            ENABLE ROW LEVEL SECURITY;

-- PETS: pair members read/write
CREATE POLICY "pets_member_all"
  ON pets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pairs
      WHERE pairs.id = pets.pair_id
        AND (pairs.user1_id = auth.uid() OR pairs.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pairs
      WHERE pairs.id = pets.pair_id
        AND (pairs.user1_id = auth.uid() OR pairs.user2_id = auth.uid())
    )
  );

-- PROFILES: own row only; connected partner can read (for push_token)
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM pairs
      WHERE status = 'connected'
        AND (
          (user1_id = auth.uid() AND user2_id = profiles.id)
          OR (user2_id = auth.uid() AND user1_id = profiles.id)
        )
    )
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- QUESTIONS: any authenticated user can read active questions
CREATE POLICY "questions_select_authenticated"
  ON questions FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- DAILY_QUESTIONS: any authenticated user can read
CREATE POLICY "daily_questions_select_authenticated"
  ON daily_questions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ANSWERS: own write; read own + connected partner
CREATE POLICY "answers_insert_own"
  ON answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "answers_update_own"
  ON answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "answers_select"
  ON answers FOR SELECT
  USING (
    -- own answer
    auth.uid() = user_id
    OR
    -- partner's answer (only if connected pair exists)
    EXISTS (
      SELECT 1 FROM pairs
      WHERE status = 'connected'
        AND (
          (user1_id = auth.uid() AND user2_id = answers.user_id)
          OR
          (user2_id = auth.uid() AND user1_id = answers.user_id)
        )
    )
  );

-- PAIRS: members can read their own pair
CREATE POLICY "pairs_select_member"
  ON pairs FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- user1 creates the pair
CREATE POLICY "pairs_insert_user1"
  ON pairs FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

-- both members can update (for connecting)
CREATE POLICY "pairs_update_member"
  ON pairs FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- PAIR_INVITES: creator can manage; any authenticated user can read (to enter code)
CREATE POLICY "pair_invites_select_authenticated"
  ON pair_invites FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "pair_invites_insert_creator"
  ON pair_invites FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "pair_invites_update_creator"
  ON pair_invites FOR UPDATE
  USING (auth.uid() = created_by OR auth.role() = 'authenticated');

CREATE POLICY "pair_invites_delete_creator"
  ON pair_invites FOR DELETE
  USING (auth.uid() = created_by);

-- ───────────────────────────────────────────────────────────
-- 9. INDEXES for common queries
-- ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_questions_date ON daily_questions (question_date DESC);
CREATE INDEX IF NOT EXISTS idx_answers_user_question ON answers (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_pairs_user1 ON pairs (user1_id);
CREATE INDEX IF NOT EXISTS idx_pairs_user2 ON pairs (user2_id);
CREATE INDEX IF NOT EXISTS idx_pair_invites_code ON pair_invites (code);
