# Malsseum Platform

성경 읽기 및 묵상 플랫폼. 읽기 계획, 북마크, 하이라이트, 저널, 포인트/스트릭 시스템, 오프라인 성경 지원.

## 기술 스택

| 영역      | 스택                                                                |
| --------- | ------------------------------------------------------------------- |
| Client    | React 19 + TypeScript + Vite 6 + Tailwind CSS v4                    |
| 상태관리  | Zustand 5 (전역) + React Query 5 (서버) + useState (로컬)           |
| 라우팅    | React Router v7                                                     |
| Server    | Express 4 + TypeScript + Mongoose 8                                 |
| DB        | MongoDB Atlas                                                       |
| Auth      | Google OAuth 2.0 + JWT                                              |
| 배포      | Vercel (client) + Railway (server)                                  |
| CI/CD     | GitHub Actions (lint, typecheck, test, format-check, auto-deploy)   |
| 테스트    | Vitest (client) + Jest + supertest + mongodb-memory-server (server) |
| 코드 품질 | ESLint 9 + Prettier + Husky + lint-staged                           |

## 빠른 시작

```bash
# Client (port 8000)
cd client && npm install && npm run dev

# Server (port 5000)
cd server && npm install && npm run dev
```

### 환경변수

**Client** (`client/.env.local`):

```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<Google OAuth Client ID>
```

**Server** (`server/.env`):

```
MONGO_URI=<MongoDB Atlas 연결 문자열>
JWT_SECRET=<32자 이상 랜덤 문자열>
GOOGLE_CLIENT_ID=<Google OAuth Client ID>
JWT_EXPIRES_IN=7d          # 선택
BIBLE_API_KEY=<api.bible>  # 선택
PORT=5000                  # 선택
CLIENT_URL=http://localhost:8000  # 선택
NODE_ENV=development       # 선택
```

### 주요 스크립트

```bash
# Client
npm run dev           # Vite 개발 서버
npm run build         # tsc + vite build
npm run lint          # ESLint
npm test              # Vitest 실행
npm run test:coverage # 커버리지 리포트

# Server
npm run dev           # tsx watch 모드
npm run start         # tsx 프로덕션 실행
npm run build         # tsc 컴파일 → dist/
npm test              # Jest 실행
npm run typecheck     # tsc --noEmit
npm run seed:bible    # 성경 데이터 시딩

# Root
npm run format        # Prettier 전체 포맷
npm run format:check  # 포맷 검사
```

## 프로젝트 구조

모노레포 도구 없이 client/server 독립 패키지로 구성.

```
/
├── client/src/
│   ├── pages/          # 14개 페이지 컴포넌트 (라우트별 1:1)
│   ├── features/       # 기능별 훅 + 컴포넌트 (auth, bible, reading, bookmarks, ...)
│   ├── shared/         # 공유 UI (Layout, Navbar, PassageViewer, AuthGuard, ErrorBoundary)
│   ├── store/          # Zustand 스토어 11개 (auth, theme, lang, offline, ...)
│   ├── lib/            # 유틸리티 (api-client, query-client, i18n, offline-bible, types, constants)
│   └── hooks/          # 커스텀 훅 (use-swipe, use-focus-trap)
├── server/src/
│   ├── routes/         # API 라우트 9개 (auth, bible, reading, custom-plan, ...)
│   ├── models/         # Mongoose 모델 8개
│   ├── services/       # 비즈니스 로직 (points-service, reading-plan-calculator)
│   ├── middleware/      # auth(JWT 검증), error-handler
│   └── scripts/        # seed-bible.js
├── docs/               # 배포 가이드, 감사 문서, 리팩토링 계획
└── .github/workflows/  # CI/CD 파이프라인
```

## 아키텍처

### Client 데이터 흐름

```
Page → features/훅 (useQuery/useMutation) → api-client (Axios) → Server API
```

- **auth-store**: sessionStorage 사용 (XSS 방지, 탭 닫으면 세션 종료)
- **기타 store**: localStorage + persist 미들웨어
- **오프라인 성경**: IndexedDB (`idb` 라이브러리)로 성경 전체 캐싱
- **i18n**: 자체 구현 (한국어/영어)
- **PWA**: vite-plugin-pwa로 서비스 워커 + 오프라인 지원
- **다크모드**: `.dark` 클래스 기반, 시스템 설정 감지

### Server 아키텍처

Route-centric 구조 (별도 controller 레이어 없음).

```
Route Handler → Mongoose Model + Service → MongoDB
```

- **미들웨어**: helmet, cors(CLIENT_URL), express.json(1MB), morgan, rate-limit
- **인증**: Bearer JWT → auth 미들웨어 → req.user
- **Rate Limit**: auth 20req/15min, API 300req/15min
- **응답 형식**: `{ success: boolean, data?: T, error?: string }`
- **트랜잭션**: 포인트 적립 시 MongoDB 세션 사용

## API 라우트

| Prefix               | 파일           | 설명                                        |
| -------------------- | -------------- | ------------------------------------------- |
| `/api/auth`          | auth.ts        | Google OAuth 로그인, 토큰 갱신, 프로필 수정 |
| `/api/reading-plans` | reading.ts     | 연간 읽기 계획 CRUD, 일별 완료 체크         |
| `/api/custom-plans`  | custom-plan.ts | 사용자 정의 계획 (시즌 구조)                |
| `/api/bible`         | bible.ts       | 성경 본문 조회, 검색                        |
| `/api/bookmarks`     | bookmarks.ts   | 절 북마크 (태그, 메모)                      |
| `/api/highlights`    | highlights.ts  | 절 하이라이트 (5색)                         |
| `/api/journals`      | journal.ts     | 묵상 일지 (날짜별)                          |
| `/api/daily-verse`   | daily-verse.ts | 오늘의 말씀                                 |
| `/api/points`        | points.ts      | 포인트 잔액, 이력, 리더보드                 |

## 데이터 모델

| 모델         | 주요 필드                                                           | 인덱스                                  |
| ------------ | ------------------------------------------------------------------- | --------------------------------------- |
| User         | googleId, email, displayName, totalPoints, currentStreak, graceDays | totalPoints                             |
| ReadingPlan  | userId, planType, days[{scheduledDate, chapterRefs, isCompleted}]   | (userId, isActive)                      |
| CustomPlan   | userId, title, seasons[{days[], isCompleted}]                       | (userId, createdAt)                     |
| Bookmark     | userId, bookId, chapter, verse, note, tags[]                        | (userId, bookId, chapter, verse) unique |
| Highlight    | userId, bookId, chapter, verse, color                               | (userId, bookId, chapter, verse) unique |
| Journal      | userId, date, content, linkedVerses[]                               | (userId, date) unique                   |
| PointsLedger | userId, eventType, points, referenceId                              | (userId, createdAt)                     |
| BibleBook    | name, abbrKo, bookIndex, chapters[verses[]]                         | -                                       |

## 명명 규칙

| 대상              | 규칙              | 예시                |
| ----------------- | ----------------- | ------------------- |
| 폴더              | kebab-case        | `my-component/`     |
| 컴포넌트          | PascalCase.tsx    | `UserProfile.tsx`   |
| 유틸리티          | kebab-case.ts     | `date-util.ts`      |
| 상수              | UPPER_SNAKE_CASE  | `MAX_COUNT`         |
| 불리언            | is/has/should/can | `isLoading`         |
| 핸들러(함수)      | handle-           | `handleClick`       |
| 핸들러(prop)      | on-               | `onClick`           |
| Route 파일 (서버) | kebab-case.ts     | `custom-plan.ts`    |
| Model (서버)      | PascalCase.ts     | `ReadingPlan.ts`    |
| Service (서버)    | kebab-case.ts     | `points-service.ts` |

## 코드 컨벤션

### 컴포넌트 구조

```tsx
// 1. 타입 정의
type Props = { title: string };

// 2. 메인 컴포넌트 (최상단 export)
export const MyComponent = (props: Props) => {
  return <div>{props.title}</div>;
};

// 3. 로컬 유틸리티 (필요시)
// 4. 로컬 컴포넌트 (필요시)
```

**규칙**: Named export, 화살표 함수, 파일당 1개 export, `type` 사용 (interface X)

### Features 훅 패턴

```tsx
// features/bookmarks/use-bookmarks.ts
export const useBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => apiClient.get('/api/bookmarks').then((res) => res.data),
  });
};

export const useCreateBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateBookmarkParams) => apiClient.post('/api/bookmarks', params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
};
```

### Zustand Store 패턴

```tsx
// store/theme-store.ts
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' },
  ),
);
```

### 서버 라우트 패턴

```typescript
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    // 입력 검증 → DB 조회 → 비즈니스 로직 → 응답
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});
```

### 타입 접미사

- `Params`: API 요청 파라미터 (`CreateBookmarkParams`)
- `Response`: API 응답 (`GetPassageResponse`)
- `Props`: 컴포넌트 props

### 상태 관리 원칙

- 로컬 상태: `useState`
- 서버 상태: React Query (`useQuery`/`useMutation`)
- 전역 상태: Zustand (persist 미들웨어)
- React Query staleTime: 10분, retry: 1회

### 스타일

- Tailwind CSS v4 유틸리티 클래스
- 다크모드: `dark:` variant 사용
- 컬러 팔레트: Stone (primary), Amber/Red/Blue (accent)
- 모바일 퍼스트: `sm:` 브레이크포인트

## 테스트

- **Client**: Vitest + @testing-library/react + jsdom
- **Server**: Jest + supertest + mongodb-memory-server (인메모리 DB)
- **커버리지 목표**: 80%+
- **테스트 위치**: 각 디렉토리의 `__tests__/` 하위

## 배포

- **Client**: Vercel (`/client` 루트, `vercel.json` SPA 리라이트)
- **Server**: Railway (`/server` 루트, `nixpacks.toml` 빌드 설정)
- **DB**: MongoDB Atlas
- **CI**: GitHub Actions → lint, typecheck, test, format-check
- **CD**: `main` 브랜치 push 시 Vercel + Railway 자동 배포

## Prettier 설정

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

<!-- 해당 문구는 절때 삭제하지 마세요 --> ⚠️ 업데이트 필요시: 프로젝트 구조나 디자인 시스템 변경 시 이 문서를 업데이트하세요. <!-- 해당 문구는 절때 삭제하지 마세요 -->
