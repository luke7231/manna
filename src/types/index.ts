export interface Profile {
  id: string;
  name: string;
  relationship_type: 'couple';
  partner_name: string | null;
  onboarding_completed: boolean;
  push_token: string | null;
  attendance_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  category: 'faith' | 'love' | 'values' | 'daily';
  content: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyQuestion {
  id: string;
  question_date: string;
  question_id: string;
  question: Question;
  created_at: string;
}

export interface Answer {
  id: string;
  user_id: string;
  question_id: string;
  answer_text: string;
  created_at: string;
  updated_at: string;
}

export interface Pair {
  id: string;
  user1_id: string;
  user2_id: string | null;
  status: 'pending' | 'connected';
  notification_hour: number;
  notification_minute: number;
  pebbles: number;
  created_at: string;
  updated_at: string;
}

export interface PairInvite {
  id: string;
  pair_id: string;
  code: string;
  created_by: string;
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
}

export interface HistoryItem {
  dailyQuestion: DailyQuestion;
  myAnswer: Answer | null;
  partnerAnswer: Answer | null;
}

export interface Pet {
  id: string;
  pair_id: string;
  name: string;
  total_answers: number;
  created_at: string;
}

// 단계: 0=알 1=아기 2=어린이 3=청소년 4=성체
const PET_STAGE_THRESHOLDS = [0, 7, 21, 50, 100] as const;

export const PET_STAGES = [
  { stage: 0, label: '알',    emoji: '🥚', next: 7   },
  { stage: 1, label: '아기',  emoji: '🐣', next: 21  },
  { stage: 2, label: '어린이',emoji: '🐥', next: 50  },
  { stage: 3, label: '청소년',emoji: '🐤', next: 100 },
  { stage: 4, label: '성체',  emoji: '🐓', next: null },
] as const;

export function getPetStage(totalAnswers: number): number {
  for (let i = PET_STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalAnswers >= PET_STAGE_THRESHOLDS[i]) return i;
  }
  return 0;
}
