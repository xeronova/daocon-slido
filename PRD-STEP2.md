# STEP 2: 참석자 UI 구현 + 디자인 시스템

## 목표
React + Vite + Tailwind로 참석자 화면을 구현하고, 컨퍼런스 포스터의 디자인 시스템을 적용합니다.

---

## 1. 프론트엔드 프로젝트 셋업

### 프로젝트 생성
```bash
cd client
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Tailwind 설정 (tailwind.config.js)
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 컨퍼런스 디자인 색상
        navy: {
          900: '#0f172a',  // 다크 네이비 배경
          800: '#1e293b',
        },
        gold: {
          400: '#fbbf24',  // 강조색 (버튼, 하이라이트)
          500: '#f59e0b',
        },
        lime: {
          400: '#a3e635',  // 보조색
          500: '#84cc16',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 추가 패키지 설치
```bash
npm install axios react-qr-code
```

---

## 2. 디자인 시스템 구성 요소

### 색상 팔레트
- **배경**: `bg-navy-900` (다크 네이비)
- **주 강조색**: `bg-gold-400` (노란색 버튼)
- **보조색**: `bg-lime-400` (녹색 액센트)
- **텍스트**: `text-white`, `text-gray-300`
- **카드**: `bg-navy-800/50` (반투명 네이비)

### 컴포넌트 스타일 가이드

**버튼 (노란색 필 버튼)**
```tsx
<button className="bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold px-6 py-2.5 rounded-full transition-colors">
  제출하기
</button>
```

**세션 드롭다운**
```tsx
<select className="bg-navy-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 w-full">
  <option>PART 1: AI 시대, 연결과 커뮤니티가...</option>
</select>
```

**질문 카드**
```tsx
<div className="bg-navy-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
  {/* 질문 내용 */}
</div>
```

**좋아요 버튼**
```tsx
<button className="flex items-center gap-2 text-gold-400 hover:text-gold-500">
  <span>👍</span>
  <span className="font-semibold">15</span>
</button>
```

---

## 3. 디렉토리 구조

```
client/src/
├── App.tsx              # 메인 라우팅
├── pages/
│   └── Session.tsx      # 참석자 메인 화면
├── components/
│   ├── SessionSelect.tsx    # 세션 드롭다운
│   ├── QuestionList.tsx     # 질문 목록
│   ├── QuestionCard.tsx     # 질문 카드
│   ├── QuestionForm.tsx     # 질문 제출 폼
│   └── LikeButton.tsx       # 좋아요 버튼
├── api/
│   └── client.ts        # Axios 인스턴스, API 함수들
├── hooks/
│   └── usePolling.ts    # 폴링 커스텀 훅
└── types/
    └── index.ts         # TypeScript 타입
```

---

## 4. 참석자 페이지 구현 (pages/Session.tsx)

### 기능 요구사항

1. **세션 드롭다운 (상단)**
   - 전체 세션 목록을 `GET /api/sessions`로 가져오기
   - 기본값: 현재 활성 세션 (`isActive: true`)
   - 선택 시 해당 세션의 질문 목록 로드

2. **현재 세션 자동 전환**
   - 5초마다 `GET /api/sessions/active`를 폴링
   - 드롭다운이 기본값(현재 세션)일 때만 자동 전환
   - 사용자가 과거/미래 세션을 선택한 경우 자동 전환 비활성화

3. **질문 목록 (`QuestionList` 컴포넌트)**
   - `GET /api/sessions/:id/questions`로 질문 가져오기
   - 좋아요 수 내림차순 정렬 (API에서 정렬)
   - 5초마다 폴링으로 실시간 갱신

4. **질문 카드 (`QuestionCard` 컴포넌트)**
   - 작성자 이름, 질문 내용, 좋아요 수 표시
   - 좋아요 버튼 (`LikeButton`)
   - 수정 버튼 (본인 질문만 - 추후 구현)

5. **질문 제출 폼 (`QuestionForm` 컴포넌트)**
   - 입력 필드: 이름, 질문, 4자리 비밀번호
   - `POST /api/sessions/:id/questions`로 제출
   - 제출 후 폼 초기화

6. **좋아요 버튼 (`LikeButton` 컴포넌트)**
   - `browserId`를 localStorage에 저장 (최초 1회)
   - `POST /api/questions/:id/like`로 토글
   - 좋아요한 질문은 localStorage에 기록하여 UI 반영

---

## 5. 주요 컴포넌트 구현 가이드

### 5.1 SessionSelect.tsx

```tsx
interface SessionSelectProps {
  sessions: Session[];
  activeSessionId: string | null;
  selectedSessionId: string;
  onSelect: (sessionId: string) => void;
}

// 구현 요구사항:
// - 현재 활성 세션은 "(현재)" 표시
// - 선택 시 onSelect 콜백 호출
// - Tailwind 스타일: bg-navy-800, text-white, rounded-lg
```

### 5.2 QuestionCard.tsx

```tsx
interface QuestionCardProps {
  question: Question;
  onLike: (questionId: string) => void;
  isLiked: boolean;
}

// 구현 요구사항:
// - 카드 스타일: bg-navy-800/50, backdrop-blur, border-gray-700
// - 작성자 이름: text-gray-400, 작은 크기
// - 질문 내용: text-white, 큰 크기
// - 좋아요 버튼: 우측 하단, isLiked 상태에 따라 색상 변경
```

### 5.3 QuestionForm.tsx

```tsx
interface QuestionFormProps {
  sessionId: string;
  onSubmit: () => void;
}

// 구현 요구사항:
// - 입력 필드: bg-navy-800, border-gray-700, text-white
// - 비밀번호는 type="password", maxLength={4}, pattern="[0-9]{4}"
// - 제출 버튼: bg-gold-400, rounded-full
// - 제출 후 성공 메시지 (토스트 또는 alert)
```

### 5.4 usePolling.ts 커스텀 훅

```tsx
function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number,
  deps: any[] = []
) {
  // 구현 요구사항:
  // - 컴포넌트 마운트 시 즉시 실행 + interval마다 반복
  // - cleanup 시 타이머 정리
  // - deps 변경 시 재시작
}
```

---

## 6. API 클라이언트 (api/client.ts)

### Axios 인스턴스
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// browserId 생성 함수
export function getBrowserId(): string {
  let id = localStorage.getItem('browserId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('browserId', id);
  }
  return id;
}
```

### API 함수들
```typescript
export const sessionsAPI = {
  getAll: () => api.get('/sessions'),
  getActive: () => api.get('/sessions/active'),
  getById: (id: string) => api.get(`/sessions/${id}`),
  getQuestions: (id: string) => api.get(`/sessions/${id}/questions`),
  submitQuestion: (id: string, data: {...}) => api.post(`/sessions/${id}/questions`, data),
};

export const questionsAPI = {
  like: (id: string, browserId: string) => api.post(`/questions/${id}/like`, { browserId }),
  update: (id: string, data: {...}) => api.put(`/questions/${id}`, data),
};
```

---

## 7. 레이아웃 구성

### Session.tsx 페이지 레이아웃
```
┌─────────────────────────────────────┐
│  [다오콘] 로고/타이틀         (우측) │
├─────────────────────────────────────┤
│  [세션 선택 드롭다운]               │
├─────────────────────────────────────┤
│  [질문 제출 폼]                     │
│  - 이름 입력                        │
│  - 질문 입력                        │
│  - 비밀번호 입력                    │
│  [제출 버튼]                        │
├─────────────────────────────────────┤
│  질문 목록 (좋아요순)               │
│  ┌───────────────────────────────┐  │
│  │ 홍길동                   👍 15 │  │
│  │ AI 윤리에 대한 질문...        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 김철수                   👍 12 │  │
│  │ 커뮤니티 거버넌스...          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 8. 구현 체크리스트

- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설정 (컨퍼런스 색상 추가)
- [ ] API 클라이언트 구현 (`api/client.ts`)
- [ ] TypeScript 타입 정의 (`types/index.ts`)
- [ ] `SessionSelect` 컴포넌트
- [ ] `QuestionCard` 컴포넌트
- [ ] `QuestionList` 컴포넌트
- [ ] `QuestionForm` 컴포넌트
- [ ] `LikeButton` 컴포넌트
- [ ] `usePolling` 커스텀 훅
- [ ] `Session.tsx` 페이지 통합
- [ ] 모바일 반응형 스타일링
- [ ] 로컬 테스트 (백엔드와 연동)

---

## 9. 테스트 시나리오

1. 세션 드롭다운에 모든 세션이 표시되는가?
2. 기본값이 현재 활성 세션인가?
3. 질문을 제출하면 목록에 즉시 추가되는가?
4. 좋아요를 누르면 숫자가 증가하는가?
5. 다른 브라우저/시크릿 모드에서 중복 좋아요가 되는가? (browserId 다름)
6. 5초마다 폴링으로 새 질문이 자동 갱신되는가?
7. 관리자가 현재 세션을 변경하면 참석자 화면이 자동 전환되는가?

---

**STEP 2 완료 후**: 참석자 UI가 완성되어 질문 제출/조회/좋아요 기능이 동작합니다. STEP 3에서 관리자 대시보드를 구현합니다.
