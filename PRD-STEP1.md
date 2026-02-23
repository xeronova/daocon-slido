# STEP 1: 프로젝트 셋업 + 백엔드 API + 데이터베이스

## 목표
Express 서버와 SQLite 데이터베이스를 구성하고, 참석자/관리자 API를 완성합니다.

---

## 1. 프로젝트 구조 생성

### 디렉토리 구조
```
slido/
├── server/              # 백엔드
│   ├── src/
│   │   ├── index.ts     # Express 서버 진입점
│   │   ├── db.ts        # SQLite 데이터베이스 초기화
│   │   ├── routes/      # API 라우트
│   │   │   ├── sessions.ts      # 참석자 세션 API
│   │   │   ├── questions.ts     # 질문 API
│   │   │   └── admin.ts         # 관리자 API
│   │   ├── middleware/
│   │   │   └── auth.ts          # 관리자 인증 미들웨어
│   │   └── types.ts     # TypeScript 타입 정의
│   ├── package.json
│   └── tsconfig.json
├── client/              # 프론트엔드 (STEP 2에서 생성)
└── database.db          # SQLite 데이터베이스 파일 (런타임 생성)
```

### package.json (server/)
```json
{
  "name": "slido-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "better-sqlite3": "^9.2.2",
    "nanoid": "^5.0.4",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/better-sqlite3": "^7.6.8",
    "@types/bcrypt": "^5.0.2",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

## 2. 데이터베이스 스키마 (db.ts)

### 테이블 정의

**sessions 테이블**
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  isActive INTEGER DEFAULT 0,  -- SQLite는 boolean이 없어서 0/1
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**questions 테이블**
```sql
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  authorName TEXT NOT NULL,
  content TEXT NOT NULL,
  password TEXT NOT NULL,  -- bcrypt 해시
  likeCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
);
```

**likes 테이블**
```sql
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY,
  questionId TEXT NOT NULL,
  browserId TEXT NOT NULL,  -- localStorage 기반 UUID
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(questionId, browserId),  -- 중복 좋아요 방지
  FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
);
```

### 초기화 함수
- `initDatabase()`: 테이블 생성, 인덱스 추가
- `generateAdminCode()`: 서버 시작 시 6자리 랜덤 접속코드 생성 및 콘솔 출력

---

## 3. API 엔드포인트 구현

### 3.1 참석자 API (routes/sessions.ts, routes/questions.ts)

#### GET /api/sessions
전체 세션 목록 (id, title, isActive만 반환)
```json
[
  { "id": "abc123", "title": "PART 1: AI 시대...", "isActive": true },
  { "id": "def456", "title": "PART 2: 느슨한 연결...", "isActive": false }
]
```

#### GET /api/sessions/active
현재 활성 세션 조회
```json
{ "id": "abc123", "title": "PART 1: AI 시대...", "isActive": true }
```

#### GET /api/sessions/:id
특정 세션 정보 조회

#### GET /api/sessions/:id/questions
세션의 질문 목록 (likeCount 내림차순 정렬)
```json
[
  {
    "id": "q1",
    "authorName": "홍길동",
    "content": "AI 윤리에 대한 질문...",
    "likeCount": 15,
    "createdAt": "2026-02-28T10:30:00Z"
  }
]
```

#### POST /api/sessions/:id/questions
질문 제출
- Request body: `{ authorName, content, password }`
- password는 bcrypt로 해시 후 저장
- Response: 생성된 질문 객체

#### PUT /api/questions/:id
질문 수정 (비밀번호 검증 필요)
- Request body: `{ content, password }`
- bcrypt.compare()로 비밀번호 검증
- 실패 시 401 Unauthorized

#### POST /api/questions/:id/like
좋아요 토글
- Request body: `{ browserId }`
- 이미 좋아요 했으면 삭제 (토글)
- 없으면 추가
- likeCount 업데이트 (트랜잭션 사용)
- Response: `{ liked: boolean, likeCount: number }`

### 3.2 관리자 API (routes/admin.ts)

#### 인증 방식
- 서버 시작 시 생성된 접속코드를 `X-Admin-Code` 헤더로 전달
- 미들웨어에서 검증 (middleware/auth.ts)

#### POST /api/admin/auth
접속코드 검증
- Request body: `{ code }`
- 일치하면 200, 불일치하면 401

#### GET /api/admin/sessions
전체 세션 목록 (createdAt 오름차순)

#### POST /api/admin/sessions
세션 생성
- Request body: `{ title }`
- 첫 번째 세션은 자동으로 isActive = true

#### POST /api/admin/sessions/:id/activate
현재 세션으로 설정
- 기존 활성 세션의 isActive를 0으로 변경
- 해당 세션의 isActive를 1로 변경 (트랜잭션)

#### DELETE /api/admin/sessions/:id
세션 삭제 (CASCADE로 질문도 함께 삭제)

#### DELETE /api/admin/questions/:id
질문 삭제

---

## 4. 서버 설정 (index.ts)

### Express 서버 구성
```typescript
import express from 'express';
import cors from 'cors';
import { initDatabase, generateAdminCode } from './db.js';
import sessionsRouter from './routes/sessions.js';
import questionsRouter from './routes/questions.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = 3000;

// 관리자 코드 생성 및 출력
const ADMIN_CODE = generateAdminCode();
console.log('\n========================================');
console.log(`🔑 관리자 접속코드: ${ADMIN_CODE}`);
console.log('========================================\n');

// DB 초기화
initDatabase();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api', sessionsRouter);
app.use('/api', questionsRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 5. 구현 체크리스트

- [ ] 프로젝트 초기화 (`npm init`, TypeScript 설정)
- [ ] 의존성 설치
- [ ] `db.ts`: SQLite 테이블 생성, 접속코드 생성 함수
- [ ] `routes/sessions.ts`: 세션 조회 API
- [ ] `routes/questions.ts`: 질문 CRUD + 좋아요 API
- [ ] `routes/admin.ts`: 관리자 API
- [ ] `middleware/auth.ts`: 관리자 인증 미들웨어
- [ ] `index.ts`: Express 서버 설정
- [ ] 서버 실행 테스트 (`npm run dev`)
- [ ] Postman/curl로 API 동작 확인

---

## 6. 테스트 시나리오

1. 서버 실행 시 관리자 코드가 콘솔에 출력되는가?
2. `POST /api/admin/sessions`로 세션 생성되는가?
3. `GET /api/sessions`에서 세션 목록이 반환되는가?
4. `POST /api/sessions/:id/questions`로 질문이 등록되는가?
5. `POST /api/questions/:id/like`로 좋아요가 토글되는가?
6. 비밀번호 없이 질문 수정 시 401 에러가 발생하는가?
7. 관리자 API가 `X-Admin-Code` 헤더 없이 403 에러를 반환하는가?

---

**STEP 1 완료 후**: 백엔드 API가 완성되어 STEP 2에서 프론트엔드 UI를 연결할 준비가 됩니다.
