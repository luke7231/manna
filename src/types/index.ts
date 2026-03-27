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
