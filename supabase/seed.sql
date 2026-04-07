-- ============================================================
-- Manna App — Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ───────────────────────────────────────────────────────────
-- QUESTIONS (55 questions across 4 categories)
-- ───────────────────────────────────────────────────────────

INSERT INTO questions (id, category, content) VALUES

-- FAITH (신앙) — 15 questions
('00000000-0000-0000-0001-000000000001', 'faith', '오늘 하나님께 감사했던 순간은 언제인가요?'),
('00000000-0000-0000-0001-000000000002', 'faith', '요즘 가장 기도받고 싶은 것은 무엇인가요?'),
('00000000-0000-0000-0001-000000000003', 'faith', '내 신앙 여정에서 가장 중요했던 전환점은 언제였나요?'),
('00000000-0000-0000-0001-000000000004', 'faith', '하나님이 내 삶에 계신다고 느끼는 순간은 언제인가요?'),
('00000000-0000-0000-0001-000000000005', 'faith', '요즘 읽고 있는 말씀 중 가장 마음에 남는 구절은 무엇인가요?'),
('00000000-0000-0000-0001-000000000006', 'faith', '교회 공동체에서 내가 성장했다고 느끼는 부분은 무엇인가요?'),
('00000000-0000-0000-0001-000000000007', 'faith', '기도할 때 어떤 방식으로 하나님과 대화하나요?'),
('00000000-0000-0000-0001-000000000008', 'faith', '신앙이 나의 일상을 어떻게 변화시키고 있나요?'),
('00000000-0000-0000-0001-000000000009', 'faith', '하나님의 사랑을 가장 크게 느꼈던 순간은 언제인가요?'),
('00000000-0000-0000-0001-000000000010', 'faith', '내가 어려울 때 붙잡는 말씀이나 신앙의 기둥은 무엇인가요?'),
('00000000-0000-0000-0001-000000000011', 'faith', '지금 내 삶에서 하나님이 다루고 계신다고 느끼는 부분은 무엇인가요?'),
('00000000-0000-0000-0001-000000000012', 'faith', '예배에서 가장 의미 있게 느껴지는 순간은 언제인가요?'),
('00000000-0000-0000-0001-000000000013', 'faith', '최근에 기도 응답을 경험했다고 느낀 적이 있나요?'),
('00000000-0000-0000-0001-000000000014', 'faith', '믿음의 롤모델로 생각하는 사람이 있나요? 그 이유는 무엇인가요?'),
('00000000-0000-0000-0001-000000000015', 'faith', '하나님께 솔직하게 털어놓고 싶은 마음이 있다면 무엇인가요?'),

-- LOVE (사랑) — 15 questions
('00000000-0000-0000-0002-000000000001', 'love', '내가 생각하는 진정한 사랑은 어떤 모습인가요?'),
('00000000-0000-0000-0002-000000000002', 'love', '상대방에게 사랑받는다고 느끼는 순간은 언제인가요?'),
('00000000-0000-0000-0002-000000000003', 'love', '내가 상대방을 사랑하는 방식을 한마디로 표현한다면?'),
('00000000-0000-0000-0002-000000000004', 'love', '함께하는 시간 중 가장 행복한 순간은 언제인가요?'),
('00000000-0000-0000-0002-000000000005', 'love', '두 사람이 갈등을 겪을 때 가장 중요하게 생각하는 것은 무엇인가요?'),
('00000000-0000-0000-0002-000000000006', 'love', '상대방이 나를 이해해준다고 느끼는 순간은 언제인가요?'),
('00000000-0000-0000-0002-000000000007', 'love', '내가 상대방에게 가장 감사한 것은 무엇인가요?'),
('00000000-0000-0000-0002-000000000008', 'love', '함께 만들어가고 싶은 우리만의 문화나 습관이 있다면 무엇인가요?'),
('00000000-0000-0000-0002-000000000009', 'love', '사랑하는 사람을 위해 기꺼이 포기할 수 있는 것은 무엇인가요?'),
('00000000-0000-0000-0002-000000000010', 'love', '앞으로 10년 후 우리의 모습을 상상한다면 어떤 모습인가요?'),
('00000000-0000-0000-0002-000000000011', 'love', '상대방의 어떤 모습이 나를 안심하게 만드나요?'),
('00000000-0000-0000-0002-000000000012', 'love', '사랑에서 가장 어려운 부분은 무엇이라고 생각하나요?'),
('00000000-0000-0000-0002-000000000013', 'love', '두 사람이 함께 성장한다는 것은 어떤 의미인가요?'),
('00000000-0000-0000-0002-000000000014', 'love', '내가 힘들 때 상대방에게 바라는 것은 무엇인가요?'),
('00000000-0000-0000-0002-000000000015', 'love', '결혼(또는 미래의 관계)에서 가장 중요하게 생각하는 가치는 무엇인가요?'),

-- VALUES (가치관) — 15 questions
('00000000-0000-0000-0003-000000000001', 'values', '내 삶에서 가장 중요한 세 가지 가치는 무엇인가요?'),
('00000000-0000-0000-0003-000000000002', 'values', '돈과 시간 중 더 소중하게 생각하는 것은 무엇인가요? 그 이유는?'),
('00000000-0000-0000-0003-000000000003', 'values', '내가 살면서 꼭 이루고 싶은 것은 무엇인가요?'),
('00000000-0000-0000-0003-000000000004', 'values', '용서에 대해 어떻게 생각하나요?'),
('00000000-0000-0000-0003-000000000005', 'values', '실패를 어떻게 받아들이나요?'),
('00000000-0000-0000-0003-000000000006', 'values', '내 인생에서 가장 중요한 관계는 누구와의 관계인가요?'),
('00000000-0000-0000-0003-000000000007', 'values', '미래를 계획하는 것과 현재를 즐기는 것 중 어디에 무게를 두나요?'),
('00000000-0000-0000-0003-000000000008', 'values', '나에게 \'성공\'이란 어떤 모습인가요?'),
('00000000-0000-0000-0003-000000000009', 'values', '경제적 자유와 의미 있는 일 중 더 중요한 것은 무엇인가요?'),
('00000000-0000-0000-0003-000000000010', 'values', '내가 가장 두려워하는 것은 무엇인가요?'),
('00000000-0000-0000-0003-000000000011', 'values', '지금의 나를 만들어준 가장 큰 경험은 무엇인가요?'),
('00000000-0000-0000-0003-000000000012', 'values', '10년 후 나는 어떤 사람이 되어 있고 싶나요?'),
('00000000-0000-0000-0003-000000000013', 'values', '나에게 쉼이란 어떤 의미인가요?'),
('00000000-0000-0000-0003-000000000014', 'values', '다른 사람에게 어떤 사람으로 기억되고 싶나요?'),
('00000000-0000-0000-0003-000000000015', 'values', '지금 내가 가장 성장하고 싶은 부분은 무엇인가요?'),

-- DAILY (일상) — 10 questions
('00000000-0000-0000-0004-000000000001', 'daily', '요즘 내 마음을 가장 많이 차지하는 생각은 무엇인가요?'),
('00000000-0000-0000-0004-000000000002', 'daily', '오늘 하루 중 가장 기억에 남는 순간은 무엇인가요?'),
('00000000-0000-0000-0004-000000000003', 'daily', '요즘 에너지를 가장 많이 쏟는 것은 무엇인가요?'),
('00000000-0000-0000-0004-000000000004', 'daily', '지금 이 순간 가장 하고 싶은 것은 무엇인가요?'),
('00000000-0000-0000-0004-000000000005', 'daily', '오늘 나를 미소 짓게 한 것은 무엇인가요?'),
('00000000-0000-0000-0004-000000000006', 'daily', '최근에 배운 새로운 것이 있다면 무엇인가요?'),
('00000000-0000-0000-0004-000000000007', 'daily', '요즘 가장 설레는 것은 무엇인가요?'),
('00000000-0000-0000-0004-000000000008', 'daily', '지금 내 삶에서 가장 도전적인 부분은 무엇인가요?'),
('00000000-0000-0000-0004-000000000009', 'daily', '오늘 하루가 끝나고 느끼는 감정은 어떤가요?'),
('00000000-0000-0000-0004-000000000010', 'daily', '요즘 나 자신을 어떻게 돌보고 있나요?');

-- ───────────────────────────────────────────────────────────
-- DAILY_QUESTIONS
-- Assign questions to dates: 2026-02-01 ~ 2026-05-31 (120 days)
-- Cycles through all 55 questions repeatedly
-- ───────────────────────────────────────────────────────────

-- All question IDs in rotation order
-- We'll use a series and modulo to assign questions

DO $$
DECLARE
  question_ids UUID[] := ARRAY[
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0003-000000000001',
    '00000000-0000-0000-0004-000000000001',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0003-000000000002',
    '00000000-0000-0000-0004-000000000002',
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0003-000000000003',
    '00000000-0000-0000-0004-000000000003',
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0003-000000000004',
    '00000000-0000-0000-0004-000000000004',
    '00000000-0000-0000-0001-000000000005',
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0003-000000000005',
    '00000000-0000-0000-0004-000000000005',
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0003-000000000006',
    '00000000-0000-0000-0004-000000000006',
    '00000000-0000-0000-0001-000000000007',
    '00000000-0000-0000-0002-000000000007',
    '00000000-0000-0000-0003-000000000007',
    '00000000-0000-0000-0004-000000000007',
    '00000000-0000-0000-0001-000000000008',
    '00000000-0000-0000-0002-000000000008',
    '00000000-0000-0000-0003-000000000008',
    '00000000-0000-0000-0004-000000000008',
    '00000000-0000-0000-0001-000000000009',
    '00000000-0000-0000-0002-000000000009',
    '00000000-0000-0000-0003-000000000009',
    '00000000-0000-0000-0004-000000000009',
    '00000000-0000-0000-0001-000000000010',
    '00000000-0000-0000-0002-000000000010',
    '00000000-0000-0000-0003-000000000010',
    '00000000-0000-0000-0004-000000000010',
    '00000000-0000-0000-0001-000000000011',
    '00000000-0000-0000-0002-000000000011',
    '00000000-0000-0000-0003-000000000011',
    '00000000-0000-0000-0001-000000000012',
    '00000000-0000-0000-0002-000000000012',
    '00000000-0000-0000-0003-000000000012',
    '00000000-0000-0000-0001-000000000013',
    '00000000-0000-0000-0002-000000000013',
    '00000000-0000-0000-0003-000000000013',
    '00000000-0000-0000-0001-000000000014',
    '00000000-0000-0000-0002-000000000014',
    '00000000-0000-0000-0003-000000000014',
    '00000000-0000-0000-0001-000000000015',
    '00000000-0000-0000-0002-000000000015',
    '00000000-0000-0000-0003-000000000015'
  ];
  total INT := array_length(question_ids, 1);
  current_date DATE := '2026-02-01';
  end_date DATE := '2026-05-31';
  idx INT := 0;
BEGIN
  WHILE current_date <= end_date LOOP
    INSERT INTO daily_questions (question_date, question_id)
    VALUES (current_date, question_ids[(idx % total) + 1])
    ON CONFLICT (question_date) DO NOTHING;

    current_date := current_date + INTERVAL '1 day';
    idx := idx + 1;
  END LOOP;
END $$;

-- ───────────────────────────────────────────────────────────
-- SHOP ITEMS — 방꾸미기 초기 아이템
-- ───────────────────────────────────────────────────────────
INSERT INTO shop_items (id, category, name, description, price, emoji, sort_order) VALUES
-- 테마 (theme)
('00000000-0000-0000-0010-000000000001', 'theme',     '기본 방',      '따뜻하고 아늑한 기본 공간이에요',         0,   '🏠', 0),
('00000000-0000-0000-0010-000000000002', 'theme',     '숲속 오두막',   '초록빛 자연 속 포근한 오두막이에요',       150, '🌲', 1),
('00000000-0000-0000-0010-000000000003', 'theme',     '바다 뷰',       '시원한 바다가 보이는 공간이에요',          200, '🌊', 2),
('00000000-0000-0000-0010-000000000004', 'theme',     '별빛 다락방',   '별이 쏟아지는 낭만적인 다락방이에요',      300, '✨', 3),

-- 가구 (furniture)
('00000000-0000-0000-0011-000000000001', 'furniture', '작은 화분',     '작고 귀여운 초록 화분이에요',              30,  '🌱', 0),
('00000000-0000-0000-0011-000000000002', 'furniture', '별 조명',       '은은하게 빛나는 별 모양 조명이에요',       50,  '⭐', 1),
('00000000-0000-0000-0011-000000000003', 'furniture', '무지개 러그',   '알록달록 예쁜 러그예요',                   60,  '🌈', 2),
('00000000-0000-0000-0011-000000000004', 'furniture', '작은 테이블',   '두 사람이 마주 앉기 좋은 테이블이에요',    40,  '🪑', 3),
('00000000-0000-0000-0011-000000000005', 'furniture', '책장',          '소중한 기억을 담은 책장이에요',            70,  '📚', 4),
('00000000-0000-0000-0011-000000000006', 'furniture', '귀여운 소파',   '함께 앉고 싶은 포근한 소파예요',           80,  '🛋️', 5),
('00000000-0000-0000-0011-000000000007', 'furniture', '꽃 화병',       '예쁜 꽃이 담긴 화병이에요',               35,  '💐', 6),

-- 이름 변경권 (pet_name)
('00000000-0000-0000-0012-000000000001', 'pet_name',  '이름 변경권',   '반려몽의 이름을 바꿀 수 있어요',           100, '✏️', 0)
ON CONFLICT (id) DO NOTHING;

-- 골드 전용 아이템 (is_gold_only = TRUE, 가격 0 = 골드 구독 중이면 무료)
INSERT INTO shop_items (id, category, name, description, price, emoji, is_gold_only, sort_order) VALUES
('00000000-0000-0000-0010-000000000005', 'theme',     '황금빛 방',     '럭셔리한 골드 분위기의 방이에요',     0,  '🌟', TRUE, 10),
('00000000-0000-0000-0010-000000000006', 'theme',     '달빛 정원',     '달빛이 가득한 낭만적인 정원이에요',   0,  '🌙', TRUE, 11),
('00000000-0000-0000-0011-000000000008', 'furniture', '크리스탈 조명', '반짝이는 크리스탈 조명이에요',        0,  '💎', TRUE, 10),
('00000000-0000-0000-0011-000000000009', 'furniture', '하트 쿠션',     '사랑스러운 하트 쿠션이에요',          0,  '🩷', TRUE, 11)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────────────────
-- ENGLISH TRANSLATIONS — en_content for questions
-- ───────────────────────────────────────────────────────────

-- FAITH
UPDATE questions SET en_content = 'When was a moment today you felt grateful to God?' WHERE id = '00000000-0000-0000-0001-000000000001';
UPDATE questions SET en_content = 'What is something you most want to be prayed over lately?' WHERE id = '00000000-0000-0000-0001-000000000002';
UPDATE questions SET en_content = 'What was the most important turning point in your faith journey?' WHERE id = '00000000-0000-0000-0001-000000000003';
UPDATE questions SET en_content = 'When do you feel God''s presence most clearly in your life?' WHERE id = '00000000-0000-0000-0001-000000000004';
UPDATE questions SET en_content = 'Which verse have you been reading lately that has stayed with you most?' WHERE id = '00000000-0000-0000-0001-000000000005';
UPDATE questions SET en_content = 'In what area do you feel you have grown most within your church community?' WHERE id = '00000000-0000-0000-0001-000000000006';
UPDATE questions SET en_content = 'How do you talk to God when you pray?' WHERE id = '00000000-0000-0000-0001-000000000007';
UPDATE questions SET en_content = 'How is your faith changing your everyday life?' WHERE id = '00000000-0000-0000-0001-000000000008';
UPDATE questions SET en_content = 'When have you felt God''s love most deeply?' WHERE id = '00000000-0000-0000-0001-000000000009';
UPDATE questions SET en_content = 'What verse or anchor of faith do you hold onto in difficult times?' WHERE id = '00000000-0000-0000-0001-000000000010';
UPDATE questions SET en_content = 'What area of your life do you feel God is working on right now?' WHERE id = '00000000-0000-0000-0001-000000000011';
UPDATE questions SET en_content = 'When do you feel most moved during worship?' WHERE id = '00000000-0000-0000-0001-000000000012';
UPDATE questions SET en_content = 'Have you experienced what felt like an answered prayer recently?' WHERE id = '00000000-0000-0000-0001-000000000013';
UPDATE questions SET en_content = 'Is there someone you look up to as a role model in faith? Why?' WHERE id = '00000000-0000-0000-0001-000000000014';
UPDATE questions SET en_content = 'Is there something you want to honestly pour out to God right now?' WHERE id = '00000000-0000-0000-0001-000000000015';

-- LOVE
UPDATE questions SET en_content = 'What does true love look like to you?' WHERE id = '00000000-0000-0000-0002-000000000001';
UPDATE questions SET en_content = 'When do you feel most loved by your partner?' WHERE id = '00000000-0000-0000-0002-000000000002';
UPDATE questions SET en_content = 'How would you describe the way you love your partner in one phrase?' WHERE id = '00000000-0000-0000-0002-000000000003';
UPDATE questions SET en_content = 'When are you happiest while spending time together?' WHERE id = '00000000-0000-0000-0002-000000000004';
UPDATE questions SET en_content = 'What do you think matters most when the two of you face conflict?' WHERE id = '00000000-0000-0000-0002-000000000005';
UPDATE questions SET en_content = 'When do you feel your partner truly understands you?' WHERE id = '00000000-0000-0000-0002-000000000006';
UPDATE questions SET en_content = 'What are you most grateful to your partner for?' WHERE id = '00000000-0000-0000-0002-000000000007';
UPDATE questions SET en_content = 'Is there a ritual or tradition unique to the two of you that you want to build together?' WHERE id = '00000000-0000-0000-0002-000000000008';
UPDATE questions SET en_content = 'What is something you would willingly give up for the person you love?' WHERE id = '00000000-0000-0000-0002-000000000009';
UPDATE questions SET en_content = 'If you imagine the two of you 10 years from now, what does that picture look like?' WHERE id = '00000000-0000-0000-0002-000000000010';
UPDATE questions SET en_content = 'What about your partner makes you feel safe and at ease?' WHERE id = '00000000-0000-0000-0002-000000000011';
UPDATE questions SET en_content = 'What do you think is the hardest part of love?' WHERE id = '00000000-0000-0000-0002-000000000012';
UPDATE questions SET en_content = 'What does it mean to you for two people to grow together?' WHERE id = '00000000-0000-0000-0002-000000000013';
UPDATE questions SET en_content = 'What do you need most from your partner when you are struggling?' WHERE id = '00000000-0000-0000-0002-000000000014';
UPDATE questions SET en_content = 'What is the most important value you hold for marriage or your future together?' WHERE id = '00000000-0000-0000-0002-000000000015';

-- VALUES
UPDATE questions SET en_content = 'What are the three most important values in your life?' WHERE id = '00000000-0000-0000-0003-000000000001';
UPDATE questions SET en_content = 'Between money and time, which do you value more? Why?' WHERE id = '00000000-0000-0000-0003-000000000002';
UPDATE questions SET en_content = 'What is something you absolutely want to accomplish in your lifetime?' WHERE id = '00000000-0000-0000-0003-000000000003';
UPDATE questions SET en_content = 'How do you think about forgiveness?' WHERE id = '00000000-0000-0000-0003-000000000004';
UPDATE questions SET en_content = 'How do you tend to process and accept failure?' WHERE id = '00000000-0000-0000-0003-000000000005';
UPDATE questions SET en_content = 'Who is the most important relationship in your life right now?' WHERE id = '00000000-0000-0000-0003-000000000006';
UPDATE questions SET en_content = 'Do you lean more toward planning for the future or savoring the present?' WHERE id = '00000000-0000-0000-0003-000000000007';
UPDATE questions SET en_content = 'What does "success" look like to you?' WHERE id = '00000000-0000-0000-0003-000000000008';
UPDATE questions SET en_content = 'Between financial freedom and meaningful work, which matters more to you?' WHERE id = '00000000-0000-0000-0003-000000000009';
UPDATE questions SET en_content = 'What are you most afraid of?' WHERE id = '00000000-0000-0000-0003-000000000010';
UPDATE questions SET en_content = 'What is the biggest experience that has shaped who you are today?' WHERE id = '00000000-0000-0000-0003-000000000011';
UPDATE questions SET en_content = 'Who do you want to be 10 years from now?' WHERE id = '00000000-0000-0000-0003-000000000012';
UPDATE questions SET en_content = 'What does rest mean to you?' WHERE id = '00000000-0000-0000-0003-000000000013';
UPDATE questions SET en_content = 'How do you want to be remembered by others?' WHERE id = '00000000-0000-0000-0003-000000000014';
UPDATE questions SET en_content = 'What is the area of yourself you most want to grow in right now?' WHERE id = '00000000-0000-0000-0003-000000000015';

-- DAILY
UPDATE questions SET en_content = 'What thought has been taking up the most space in your mind lately?' WHERE id = '00000000-0000-0000-0004-000000000001';
UPDATE questions SET en_content = 'What is the most memorable moment of your day?' WHERE id = '00000000-0000-0000-0004-000000000002';
UPDATE questions SET en_content = 'What are you pouring the most energy into these days?' WHERE id = '00000000-0000-0000-0004-000000000003';
UPDATE questions SET en_content = 'What is the one thing you want to do most right now?' WHERE id = '00000000-0000-0000-0004-000000000004';
UPDATE questions SET en_content = 'What made you smile today?' WHERE id = '00000000-0000-0000-0004-000000000005';
UPDATE questions SET en_content = 'Is there something new you have learned recently?' WHERE id = '00000000-0000-0000-0004-000000000006';
UPDATE questions SET en_content = 'What are you most excited about these days?' WHERE id = '00000000-0000-0000-0004-000000000007';
UPDATE questions SET en_content = 'What is the most challenging part of your life right now?' WHERE id = '00000000-0000-0000-0004-000000000008';
UPDATE questions SET en_content = 'How are you feeling as today comes to an end?' WHERE id = '00000000-0000-0000-0004-000000000009';
UPDATE questions SET en_content = 'How are you taking care of yourself these days?' WHERE id = '00000000-0000-0000-0004-000000000010';

-- ───────────────────────────────────────────────────────────
-- ENGLISH TRANSLATIONS — en_name + en_description for shop_items
-- ───────────────────────────────────────────────────────────

-- Themes
UPDATE shop_items SET en_name = 'Default Room',   en_description = 'A warm and cozy space just for the two of you.'               WHERE id = '00000000-0000-0000-0010-000000000001';
UPDATE shop_items SET en_name = 'Forest Cabin',   en_description = 'A snug cabin nestled in lush green nature.'                   WHERE id = '00000000-0000-0000-0010-000000000002';
UPDATE shop_items SET en_name = 'Ocean View',     en_description = 'A refreshing space with a gorgeous view of the sea.'          WHERE id = '00000000-0000-0000-0010-000000000003';
UPDATE shop_items SET en_name = 'Starlit Attic',  en_description = 'A romantic attic where the stars pour right in.'              WHERE id = '00000000-0000-0000-0010-000000000004';
UPDATE shop_items SET en_name = 'Golden Room',    en_description = 'A luxurious room bathed in warm golden light.'                WHERE id = '00000000-0000-0000-0010-000000000005';
UPDATE shop_items SET en_name = 'Moonlit Garden', en_description = 'A romantic garden filled with soft moonlight.'                WHERE id = '00000000-0000-0000-0010-000000000006';

-- Furniture
UPDATE shop_items SET en_name = 'Tiny Plant',     en_description = 'A cute little green potted plant.'                           WHERE id = '00000000-0000-0000-0011-000000000001';
UPDATE shop_items SET en_name = 'Star Lamp',      en_description = 'A softly glowing star-shaped light.'                         WHERE id = '00000000-0000-0000-0011-000000000002';
UPDATE shop_items SET en_name = 'Rainbow Rug',    en_description = 'A colorful and cheerful rug for your space.'                 WHERE id = '00000000-0000-0000-0011-000000000003';
UPDATE shop_items SET en_name = 'Small Table',    en_description = 'A perfect little table for two to sit across from each other.' WHERE id = '00000000-0000-0000-0011-000000000004';
UPDATE shop_items SET en_name = 'Bookshelf',      en_description = 'A bookshelf filled with your precious memories.'             WHERE id = '00000000-0000-0000-0011-000000000005';
UPDATE shop_items SET en_name = 'Cozy Sofa',      en_description = 'A cozy sofa you will always want to share.'                  WHERE id = '00000000-0000-0000-0011-000000000006';
UPDATE shop_items SET en_name = 'Flower Vase',    en_description = 'A beautiful vase with lovely blooms inside.'                 WHERE id = '00000000-0000-0000-0011-000000000007';
UPDATE shop_items SET en_name = 'Crystal Light',  en_description = 'A sparkling crystal light fixture.'                          WHERE id = '00000000-0000-0000-0011-000000000008';
UPDATE shop_items SET en_name = 'Heart Cushion',  en_description = 'An adorable heart-shaped cushion.'                           WHERE id = '00000000-0000-0000-0011-000000000009';

-- Pet name
UPDATE shop_items SET en_name = 'Rename Ticket',  en_description = 'Change your Spirit''s name to anything you like.'            WHERE id = '00000000-0000-0000-0012-000000000001';

