# Git Workflow Guide

> 매일 말씀 프로젝트의 브랜치 전략 및 배포 가이드

---

## 브랜치 전략

### 원칙

- **main 브랜치에 직접 push 금지**
- 모든 작업은 feature 브랜치에서 진행
- main 병합은 **사용자 요청 시** 또는 **주 1회** PR merge로만 수행
- 불필요한 배포를 방지하여 Vercel/Railway 리소스 절약

### 브랜치 네이밍

```
feat/<기능명>       # 새 기능 (feat/offline-bible)
fix/<버그명>        # 버그 수정 (fix/dark-mode-ring)
refactor/<대상>     # 리팩토링 (refactor/extract-stat-card)
chore/<작업명>      # 설정/인프라 (chore/update-deps)
```

---

## 작업 흐름

### 1. 브랜치 생성

```bash
git checkout main
git pull platform-origin main
git checkout -b feat/my-feature
```

### 2. 작업 및 커밋

feature 브랜치에서 자유롭게 커밋. 커밋 메시지는 컨벤셔널 커밋 형식:

```
feat: 새 기능 설명
fix: 버그 수정 설명
refactor: 리팩토링 설명
chore: 설정 변경 설명
```

```bash
git add <files>
git commit -m "feat: 구절 검색 API 추가"
```

### 3. 리모트에 push

```bash
git push -u platform-origin feat/my-feature
```

### 4. main 병합 (PR)

**사용자가 명시적으로 요청할 때만** 또는 **주 1회 정기 병합** 시:

```bash
# PR 생성
gh pr create --base main --title "feat: 기능명" --body "변경 내용 요약"

# PR merge (사용자 확인 후)
gh pr merge --squash
```

---

## 병합 정책

| 상황                                       | 병합 방식                  |
| ------------------------------------------ | -------------------------- |
| 사용자가 "머지해줘" / "main에 합쳐줘" 요청 | PR 생성 후 merge           |
| 주 1회 정기 병합 (사용자 동의 시)          | 누적된 변경사항 PR로 merge |
| 긴급 핫픽스 (프로덕션 장애)                | main 직접 push 허용        |

### 주의사항

- PR merge 시 **squash merge** 권장 (커밋 히스토리 깔끔하게)
- merge 전 반드시 TypeScript 검사 + 빌드 확인
- merge 후 feature 브랜치 삭제

---

## 배포 구조

| 서비스 | 플랫폼  | 트리거                 |
| ------ | ------- | ---------------------- |
| Client | Vercel  | main push 시 자동 배포 |
| Server | Railway | main push 시 자동 배포 |

feature 브랜치 push는 배포를 트리거하지 않음 → 불필요한 배포 방지

---

## Claude Code 작업 시 체크리스트

Claude Code가 이 프로젝트에서 작업할 때 따라야 할 순서:

1. **현재 브랜치 확인** - main이면 feature 브랜치 생성
2. **feature 브랜치에서 작업** - 커밋은 자유롭게
3. **feature 브랜치에 push** - `git push -u platform-origin <branch>`
4. **main merge는 사용자 요청 시에만** - 절대 자의적으로 main에 push하지 않음
5. **merge 전 검증** - `tsc --noEmit` + `vite build` 통과 확인

### 리모트 정보

```
remote: platform-origin
url: https://github.com/yohrran/malsseum-platform.git
main branch: main
```

---

## 예시 시나리오

### 일반 작업

```
사용자: "다크모드 수정해줘"
→ git checkout -b fix/dark-mode-improvements
→ 작업 & 커밋 (여러 번 가능)
→ git push -u platform-origin fix/dark-mode-improvements
→ "수정 완료했습니다. main에 merge할까요?"
→ 사용자 승인 시 PR 생성 & merge
```

### 여러 날에 걸친 작업

```
Day 1: feat/offline-bible 브랜치에서 작업, push
Day 2: 같은 브랜치에서 계속 작업, push
Day 3: 사용자 "main에 합쳐줘" → PR merge
```
