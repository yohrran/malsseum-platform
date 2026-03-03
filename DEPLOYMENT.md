# Deployment Guide

Stack: **MongoDB Atlas** (DB) + **Railway** (backend) + **Vercel** (frontend)

---

## 1. MongoDB Atlas

1. [atlas.mongodb.com](https://atlas.mongodb.com) 접속 → 무료 M0 클러스터 생성
2. **Database Access**: 사용자 생성 (username / password 메모)
3. **Network Access**: `0.0.0.0/0` 추가 (Railway IP 대응)
4. **Connect** → Drivers → Connection string 복사
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/malsseum?retryWrites=true&w=majority
   ```

---

## 2. Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com) → 새 프로젝트 생성
2. **APIs & Services** → **Credentials** → **OAuth 2.0 Client IDs** → Web application
3. Authorized JavaScript origins 추가:
   - `http://localhost:5173` (개발)
   - `https://your-app.vercel.app` (프로덕션)
4. Client ID 복사 (server + client 모두 사용)

---

## 3. Railway (Backend)

### 배포 단계

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. `malsseum-platform` 레포 선택
3. **Settings** → **Root Directory**: `server` 로 설정
4. **Variables** 탭에서 환경변수 설정:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | 랜덤 32자 이상 문자열 |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `BIBLE_API_KEY` | api.bible 키 (선택) |
| `NODE_ENV` | `production` |

5. Deploy → 완료 후 **Domain** 생성 → URL 복사 (예: `https://malsseum-api.up.railway.app`)

### 헬스 체크 확인
```
GET https://malsseum-api.up.railway.app/health
```
응답: `{ "status": "ok" }`

---

## 4. Vercel (Frontend)

### 배포 단계

1. [vercel.com](https://vercel.com) → **New Project** → GitHub 레포 선택
2. **Framework Preset**: Vite
3. **Root Directory**: `client`
4. **Environment Variables** 설정:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Railway URL (예: `https://malsseum-api.up.railway.app`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

5. **Deploy** → 완료 후 URL 복사 (예: `https://malsseum.vercel.app`)

### 배포 후 Google Console 업데이트
- Authorized JavaScript origins에 Vercel URL 추가
- Railway의 `CLIENT_URL` 환경변수를 Vercel URL로 업데이트 → Redeploy

---

## 5. 로컬 개발 환경

### Server
```bash
cd server
cp .env.example .env
# .env 파일에 값 채우기
npm install
npm run dev   # nodemon으로 자동 재시작
```

### Client
```bash
cd client
cp .env.local.example .env.local
# .env.local 파일에 값 채우기
npm install
npm run dev   # http://localhost:5173
```

---

## 6. 환경변수 요약

### server/.env
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
CLIENT_URL=http://localhost:5173
BIBLE_API_KEY=...
PORT=5000
NODE_ENV=development
```

### client/.env.local
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=...
```

---

## 7. 배포 흐름

```
GitHub push (main branch)
  ├── Railway: server/ 디렉토리 자동 감지 → npm install → node src/index.js
  └── Vercel:  client/ 디렉토리 자동 감지 → npm run build → 정적 파일 서빙
```

CI/CD는 별도 설정 없이 GitHub main 브랜치 push 시 자동 배포됩니다.
