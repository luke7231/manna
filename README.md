# ✦ Manna

> 크리스천 썸/커플이 매일 하나의 질문을 통해 더 깊은 대화와 관계를 만들어가는 앱

---

## 소개

Manna는 신앙 안에서 건강한 관계와 대화를 돕는 앱입니다.
- 매일 1개의 질문을 제공합니다
- 사용자는 질문에 답변을 작성합니다
- 커플/썸 상대와 연결되면 서로의 답변을 볼 수 있습니다
- 질문은 **신앙 · 사랑 · 가치관 · 일상** 4가지 카테고리로 구성됩니다

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 모바일 | Expo (SDK 52) + React Native + TypeScript |
| 백엔드 | Supabase (Auth + Postgres + RLS) |
| 보안 저장소 | Expo SecureStore (세션 저장) |
| 라우팅 | Expo Router v4 (파일 기반) |
| 상태 관리 | Zustand |
| 날짜 처리 | date-fns |

---

## 시작하기

### 1. 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- Expo Go 앱 (iOS/Android) 또는 시뮬레이터
- Supabase 계정

### 2. 클론 및 패키지 설치

```bash
git clone <repo-url>
cd manna
npm install
```

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 실제 Supabase 프로젝트 값으로 교체:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> Supabase 대시보드 → Project Settings → API 에서 확인

### 4. Supabase 데이터베이스 설정

Supabase 대시보드의 **SQL Editor**에서 순서대로 실행:

```
1. supabase/schema.sql  — 테이블, RLS 정책, 인덱스 생성
2. supabase/seed.sql    — 질문 데이터 및 daily_questions 삽입
```

### 5. Supabase Auth 설정

Supabase 대시보드 → Authentication → Settings:

- **Email provider** 활성화
- **OTP (One-Time Password)** 방식 활성화
- **Confirm email**: 필요에 따라 설정
- Site URL / Redirect URLs에 딥링크 추가: `manna://`

### 6. 앱 실행

```bash
npm start
# 또는
npx expo start
```

터미널에 QR 코드가 뜨면 Expo Go 앱으로 스캔합니다.

---

## 프로젝트 구조

```
manna/
├── app/                        # Expo Router 화면
│   ├── _layout.tsx             # Root layout (Auth Guard)
│   ├── onboarding.tsx          # 온보딩 화면
│   ├── answer.tsx              # 답변 작성/수정 화면 (modal)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx           # 이메일 입력
│   │   └── verify.tsx          # OTP 인증
│   └── (app)/
│       ├── _layout.tsx         # 탭 네비게이터
│       ├── index.tsx           # 홈 (오늘의 질문)
│       ├── history.tsx         # 히스토리
│       ├── pairing.tsx         # 커플 연결
│       └── settings.tsx        # 설정
│
├── src/
│   ├── components/             # 공통 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingView.tsx
│   │   └── EmptyState.tsx
│   ├── features/               # 기능별 컴포넌트
│   │   ├── home/
│   │   ├── history/
│   │   └── pairing/
│   ├── lib/
│   │   ├── supabase/           # Supabase 클라이언트 + 쿼리 함수
│   │   ├── constants/          # 색상 등 디자인 토큰
│   │   └── utils/              # 날짜 유틸
│   ├── stores/                 # Zustand 상태 관리
│   │   ├── authStore.ts
│   │   └── profileStore.ts
│   └── types/
│       └── index.ts            # 공통 타입 정의
│
├── supabase/
│   ├── schema.sql              # DB 스키마 + RLS 정책
│   └── seed.sql                # 샘플 질문 데이터 (55개)
│
├── app.json                    # Expo 설정 (scheme: "manna")
├── .env.example                # 환경변수 예시
└── README.md
```

---

## 주요 기능

### 인증 (Auth)
- 이메일 기반 OTP 인증 (Supabase Auth)
- 세션 자동 복구 (Expo SecureStore에 안전하게 저장)
- 앱 딥링크 scheme: `manna://`

### 온보딩
- 이름 입력 → 관계 유형 선택 (썸/연인/혼자) → 상대방 이름 (선택)
- 완료 전까지 홈 진입 차단

### 홈 (오늘의 질문)
- 날짜 기준 오늘의 질문 1개 표시
- 내 답변 작성/수정 바로가기
- 연결된 상대방의 답변 미리보기

### 히스토리
- 과거 질문 목록 (최근 30일)
- 탭하면 내 답변 + 상대방 답변 확인

### 커플 연결
- 초대 코드 생성 (6자리, 7일 유효)
- 초대 코드 공유 → 상대방 입력 → 자동 연결
- 연결 후 서로의 답변 조회 가능

---

## DB 스키마 요약

```
profiles         — 사용자 프로필, 온보딩 상태
pairs            — 커플 연결 (pending / connected)
pair_invites     — 초대 코드 (6자리, 만료일 있음)
questions        — 질문 목록 (category: faith/love/values/daily)
daily_questions  — 날짜별 질문 매핑
answers          — 사용자 답변 (user_id + question_id 유니크)
```

---

## RLS 보안 정책

| 테이블 | 정책 |
|--------|------|
| `profiles` | 본인 행만 읽기/쓰기 가능 |
| `questions` | 인증된 모든 사용자 읽기 |
| `daily_questions` | 인증된 모든 사용자 읽기 |
| `answers` | 본인 답변 작성/수정; 연결된 파트너 답변 읽기 |
| `pairs` | 구성원만 읽기/수정 |
| `pair_invites` | 인증된 사용자 코드 조회; 생성자만 관리 |

---

## 개발 시 주의사항

1. **assets 폴더**: `icon.png`, `splash.png`, `adaptive-icon.png` 파일을 직접 추가해야 합니다 (1024×1024 PNG 권장)
2. **Supabase SQL 순서**: `schema.sql` → `seed.sql` 순으로 실행하세요
3. **OTP 이메일 발송**: Supabase 무료 플랜은 시간당 이메일 발송 제한이 있습니다
4. **daily_questions**: seed.sql은 2026-02-01 ~ 2026-05-31 기간을 커버합니다. 그 이후 날짜는 Supabase에서 추가 삽입이 필요합니다

---

## 라이선스

MIT
