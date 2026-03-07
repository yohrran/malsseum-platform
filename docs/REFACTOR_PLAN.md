# 말씀 앱 리팩토링 계획

> PM 관점에서 작성된 전면 개선 계획서
> 목표: "성경통독을 잘 할 수 있도록 돕는 앱"

---

## 현재 상태 분석 (AS-IS)

### 핵심 문제들

| 문제 | 위치 | 심각도 |
|------|------|--------|
| 성경 본문을 읽을 수 없음 | ReadingPage | 치명적 |
| Dashboard가 너무 빈약함 | DashboardPage | 높음 |
| 통독 플랜과 커스텀 플랜이 별도 페이지로 분리 | 네비게이션 | 높음 |
| PassageViewer가 작은 모달로만 존재 | PassageViewer | 높음 |
| 연속 읽기(스트릭) 표시 없음 | 전체 | 중간 |
| 온보딩 없음 (플랜 없으면 폼만 보임) | ReadingPage | 중간 |
| 진행률 시각화가 너무 단조로움 | ReadingPage | 중간 |
| 모바일 UX 미흡 | 전체 | 중간 |

### 현재 기술 스택

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **상태관리**: Zustand (auth, lang) + React Query
- **라우팅**: React Router v6
- **Backend**: Express.js + MongoDB (Mongoose)
- **인증**: Google OAuth
- **성경 DB**: 자체 MongoDB (한국어 성경)

### 현재 페이지 구조

```
/            → DashboardPage   (홈 - 빈약)
/reading     → ReadingPage     (통독 - 본문 못 읽음)
/custom-plan → CustomPlanPage  (커스텀 플랜 목록)
/custom-plan/:id → CustomPlanDetailPage (유일하게 본문 읽기 가능)
/leaderboard → LeaderboardPage
/profile     → ProfilePage
```

---

## 목표 (TO-BE)

### 핵심 가치

1. **성경을 앱 안에서 직접 읽을 수 있어야 한다**
2. **매일 읽기를 도와주는 명확한 플로우**
3. **통독 진행 상황을 한눈에 파악**
4. **읽고 싶은 동기부여 (스트릭, 시각화)**

### 북극성 지표

- DAU 중 실제 성경 본문을 읽은 비율 > 70%
- 7일 연속 읽기 완료율 > 50%
- 통독 플랜 완료율 > 30%

---

## 리팩토링 계획

### Phase 1: 핵심 경험 개선 (가장 먼저)

#### 1-1. ReadingPage 전면 개편 - "오늘 읽기" 중심

**현재**: 플랜 정보 + 체크박스 목록
**목표**: 오늘 읽을 말씀을 앱에서 직접 읽고 완료 체크

```
[오늘 읽기 화면 구조]

┌─────────────────────────────────┐
│  Day 45 · 창세기 1-3장           │
│  2026.03.07 (목)                 │
├─────────────────────────────────┤
│  [창 1장] [창 2장] [창 3장]      │  ← 탭 형태
├─────────────────────────────────┤
│                                  │
│  1 태초에 하나님이 천지를...      │
│  2 땅이 혼돈하고 공허하며...     │
│  ...                             │
│                                  │
│  (인라인 스크롤 방식으로 읽기)    │
│                                  │
├─────────────────────────────────┤
│  [이전 장]          [다음 장]    │
│                                  │
│  [오늘 읽기 완료 ✓]              │
└─────────────────────────────────┘
```

**구현 항목**:
- ReadingPage에 PassageViewer를 인라인으로 통합 (모달 제거)
- 장(Chapter) 탭 네비게이션
- 폰트 크기 조절 버튼
- 읽기 완료 버튼 (플로팅 or 하단 고정)
- 완료 시 애니메이션 피드백

#### 1-2. DashboardPage 개편 - "오늘의 현황"

**현재**: 카드 3개 (오늘 읽을 말씀, 포인트, 커스텀플랜 링크)
**목표**: 한눈에 현황 파악 + 즉시 행동 가능

```
[대시보드 구조]

┌─────────────────────────────────┐
│  안녕하세요, 요한님!            │
│  오늘도 말씀을 읽으세요         │
├─────────────────────────────────┤
│  🔥 연속 읽기 12일              │  ← 스트릭 배너
├─────────────────────────────────┤
│  오늘 읽을 말씀                  │
│  창세기 1-3장                    │
│  [지금 읽기 →]                  │  ← 클릭하면 ReadingPage로
├─────────────────────────────────┤
│  통독 진행률                     │
│  ████████░░░░░ 45/365일 (12%)   │
├─────────────────────────────────┤
│  이번 주 읽기 현황               │
│  월 화 수 목 금 토 일            │
│  ✓  ✓  ✓  ●  ○  ○  ○          │  ← 주간 캘린더
├─────────────────────────────────┤
│  내 포인트: 1,250 pts  [순위 #3]│
└─────────────────────────────────┘
```

**구현 항목**:
- 스트릭 표시 컴포넌트 (backend에 streak 계산 추가)
- 주간 읽기 현황 미니 캘린더
- 진행률 바 개선 (숫자 + 색상)
- "지금 읽기" CTA 버튼

#### 1-3. PassageViewer 개선

**현재**: 작은 바텀시트 모달
**목표**: 풀스크린 읽기 경험

- 모달 → 전체화면 슬라이드 패널로 변경
- 폰트 크기 유지 (로컬 저장)
- 절 번호 강조 스타일링
- 스크롤 진행 표시

---

### Phase 2: 통독 플랜 UX 개선

#### 2-1. 플랜 구조 통합

**현재**: 통독(ReadingPage) / 커스텀플랜(CustomPlanPage) 이원화
**목표**: "내 플랜" 하나로 통합

네비게이션 변경:
```
기존: 홈 | 통독 | 말씀읽기 | 순위표
신규: 홈 | 읽기 | 플랜 | 순위표
```

- `/reading` → 오늘 읽기 (인라인 본문)
- `/plans` → 내 플랜 목록 (통독 + 커스텀 통합)

#### 2-2. 플랜 생성 UX 개선

**현재**: startDate + endDate 입력 폼만 존재
**목표**: 가이드된 플랜 선택

```
[플랜 선택 화면]

인기 플랜
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 1년 통독  │ │ 90일 통독 │ │ 직접 설정 │
│ 3장/일   │ │ 10장/일  │ │ 커스텀   │
└──────────┘ └──────────┘ └──────────┘

시작일: [2026.03.07]
```

- 프리셋 플랜 선택 (1년/6개월/90일)
- 커스텀 날짜 입력은 "직접 설정" 선택 시

#### 2-3. 플랜 진행 화면 개선

**현재**: 30개만 보이는 리스트
**목표**: 월별 캘린더 뷰

```
[3월]
월  화  수  목  금  토  일
               1   2   3
 4   5   6   7✓  8   9  10
11  12  13  14  15  16  17
...
```

- 캘린더 뷰 / 리스트 뷰 토글
- 완료된 날 초록색 표시
- 오늘 날짜 강조

---

### Phase 3: 동기부여 및 소셜 기능

#### 3-1. 스트릭 시스템

**Backend 변경**:
- User 모델에 `currentStreak`, `longestStreak`, `lastReadDate` 필드 추가
- 읽기 완료 시 streak 자동 계산

**Frontend**:
- 대시보드 스트릭 배너
- 7일, 30일, 100일 달성 뱃지
- 스트릭 끊길 것 같을 때 리마인더 UX

#### 3-2. 리더보드 개선

**현재**: 단순 포인트 순위
**목표**: 의미있는 비교

- 이번 주 읽기 장 수 기준 순위
- 전체 / 이번 달 / 이번 주 탭
- 내 순위 항상 하단에 표시

#### 3-3. 완료 피드백

- 오늘 읽기 완료 시 축하 애니메이션
- 시즌 완료 시 공유 카드 생성
- "X일 연속 달성!" 팝업

---

### Phase 4: 성경 탐색 기능

#### 4-1. 성경 검색/탐색 페이지

현재는 플랜에서만 본문 접근 가능. 자유롭게 성경 탐색 필요.

```
/bible  → 성경 탐색 페이지

[구약] [신약] 탭
창세기 1 2 3 ... 50
출애굽기 1 2 ... 40
...
```

- 책 목록 → 장 선택 → 본문 읽기
- 최근 읽은 곳 기억 (로컬스토리지)

#### 4-2. 하이라이트 & 메모 (선택적)

- 구절 롱프레스 → 하이라이트 색상 선택
- 간단한 메모 추가
- 내 하이라이트 모음 페이지

---

## 컴포넌트 리팩토링 목록

### 신규 생성 필요

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `BibleReader` | `shared/BibleReader.tsx` | 인라인 성경 읽기 (풀스크린) |
| `StreakBadge` | `shared/StreakBadge.tsx` | 연속 읽기 배지 |
| `WeeklyCalendar` | `shared/WeeklyCalendar.tsx` | 주간 읽기 현황 |
| `ProgressRing` | `shared/ProgressRing.tsx` | 원형 진행률 |
| `PlanPresetCard` | `features/reading/PlanPresetCard.tsx` | 플랜 프리셋 선택 카드 |
| `MonthlyCalendar` | `features/reading/MonthlyCalendar.tsx` | 월별 통독 캘린더 |
| `ChapterTabs` | `features/bible/ChapterTabs.tsx` | 장 탭 네비게이션 |

### 개선 필요

| 컴포넌트 | 개선 내용 |
|---------|---------|
| `PassageViewer` | 모달 → 풀스크린 패널, 폰트 크기 조절 |
| `DashboardPage` | 스트릭 + 주간캘린더 + CTA 추가 |
| `ReadingPage` | 인라인 본문 읽기 통합 |
| `Navbar` | 아이콘 추가, 탭 구조 개선 |
| `LoadingSpinner` | 스켈레톤 로딩으로 교체 |

---

## Backend 변경 사항

### User 모델 추가 필드

```javascript
currentStreak: { type: Number, default: 0 },
longestStreak: { type: Number, default: 0 },
lastReadDate: { type: Date },
```

### 새 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/user/streak` | 현재 스트릭 조회 |
| GET | `/api/bible/books` | 성경 책 목록 (이미 있음) |
| GET | `/api/bible/passage/:bookAbbr/:chapters` | 본문 조회 (이미 있음) |
| GET | `/api/reading/weekly` | 이번 주 읽기 현황 |
| GET | `/api/leaderboard?period=week` | 기간별 리더보드 |

### 포인트 서비스 개선

- 스트릭 보너스: 7일 +50pts, 30일 +200pts, 100일 +500pts
- 읽기 완료: 현재 유지

---

## 디자인 시스템 방향

### 현재 색상 (유지)
- Primary: `blue-700` (#1d4ed8)
- Success: `green-500/600`
- Warning: `amber-500`

### 추가 정의 필요
- 완료 상태 배경: `green-50`
- 스트릭 강조: `orange-500` (불꽃 느낌)
- 읽기 텍스트: `slate-800`, line-height 넉넉하게 (1.8)

### 폰트 크기 (읽기 모드)
- 소: 14px
- 중: 16px (기본)
- 대: 18px
- 특대: 20px

---

## 구현 우선순위

### 즉시 (이번 세션)
- [x] ReadingPage에 성경 본문 인라인 읽기 추가 (groupChapterRefs로 GEN.1 → 창 변환)
- [x] DashboardPage 개편 (주간캘린더 + 진행률 + CTA, 스트릭은 backend 준비 후 활성화)
- [x] PassageViewer 풀스크린 개선 (92vh 패널, 장탭, 폰트크기 조절)
- [x] bible-abbr-map.ts에 BOOK_ID_TO_ABBR_KO 매핑 및 groupChapterRefs 추가

### 다음 단계 (Phase 2)
- [x] 플랜 생성 UI 개선 (1년/6개월/90일 프리셋 카드)
- [x] CustomPlanPage 한국어화 + indigo 테마 적용
- [x] CustomPlanDetailPage 개선 (진행률 바, 커스텀 체크박스, indigo 테마)
- [x] LeaderboardPage indigo 테마 적용
- [x] ProfilePage indigo 테마 + 로그아웃 버튼 명시화
- [x] Navbar 개선 (아이콘 추가, 모바일 하단 탭바로 변경, indigo 테마)
- [ ] 월별 캘린더 뷰 (ReadingPage)
- [ ] Backend streak 시스템 (User 모델 currentStreak/longestStreak)

### 이후 (Phase 3+)
- [ ] 성경 탐색 페이지 (/bible)
- [ ] 완료 축하 애니메이션
- [ ] 하이라이트/메모

---

## 컨텍스트 유실 대비 체크리스트

이 문서를 기반으로 다음 작업 시작 가능:

1. **현재 브랜치**: `main`
2. **서버 실행**: `cd server && npm run dev` (포트 5000)
3. **클라이언트 실행**: `cd client && npm run dev` (포트 5173)
4. **배포**: Vercel (클라이언트) + Railway (서버)
5. **성경 DB**: MongoDB에 한국어 성경 데이터 저장됨 (`BibleBook` 컬렉션)
6. **인증**: Google OAuth (JWT 방식)

### 파일 위치 요약

```
client/src/
  pages/
    DashboardPage.tsx   - 홈 (개선 대상 #1)
    ReadingPage.tsx     - 통독 (개선 대상 #2, 본문 읽기 없음!)
    CustomPlanDetailPage.tsx - 유일하게 PassageViewer 사용
  shared/
    PassageViewer.tsx   - 성경 본문 모달 (개선 대상 #3)
  features/
    bible/usePassage.ts - 성경 본문 API 훅
    reading/            - 통독 관련 훅들

server/src/
  routes/
    bible.js   - GET /api/bible/books, GET /api/bible/passage/:abbr/:chapters
    reading.js - 통독 플랜 CRUD
  models/
    BibleBook.js - 성경 DB 스키마
    ReadingPlan.js - 통독 플랜
    CustomPlan.js - 커스텀 플랜 (seasons > days 구조)
```
