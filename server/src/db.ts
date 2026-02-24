import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../database.db');

export const db = new Database(dbPath);

// 외래 키 제약 조건 활성화
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // sessions 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      isActive INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // questions 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      authorName TEXT NOT NULL,
      content TEXT NOT NULL,
      password TEXT NOT NULL,
      likeCount INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);

  // likes 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      browserId TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(questionId, browserId),
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );
  `);

  // 인덱스 생성
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_questions_sessionId ON questions(sessionId);
    CREATE INDEX IF NOT EXISTS idx_questions_likeCount ON questions(likeCount DESC);
    CREATE INDEX IF NOT EXISTS idx_likes_questionId ON likes(questionId);
  `);

  // 세션 데이터 초기화 (비어있을 경우에만)
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number };
  if (sessionCount.count === 0) {
    const sessions = [
      { id: '1', title: '(10:00 - 10:10) [웰컴] From AI to WE: 연결이 만드는 미래의 일' },
      { id: '2', title: '(10:10 - 10:40) [기조연설] 경량문명 시대 연결의 가치' },
      { id: '3', title: '(10:40 - 11:10) [강연] 커뮤니티 1.0에서 4.0까지 총정리' },
      { id: '4', title: '(11:10 - 11:50) [패널] 커뮤니티는 어떻게 나의 삶과 일을 변화시켰는가?' },
      { id: '5', title: '(11:50 - 12:10) [인터랙티브] Community Map: From Data to Connection' },
      { id: '6', title: "(13:30 - 14:00) [강연] 커뮤니티를 '이벤트'가 아닌 '일상'으로 만들기" },
      { id: '7', title: '(14:00 - 14:30) [강연] 커뮤니티, 브랜드의 등대가 되다 - BAC 사례' },
      { id: '8', title: '(14:30 - 15:10) [패널] 고객 경험의 미래: 고객 커뮤니티에서 답을 찾다' },
      { id: '9', title: "(15:30 - 16:00) [강연] 소속감의 시대: 왜 '직장'이 아니라 '길드'인가?" },
      { id: '10', title: '(16:00 - 16:40) [패널] 커뮤니티의 진화 - 일과 조직을 바꾸다' },
      { id: '11', title: '(16:40 - 17:00) [인터랙티브] 오픈 마이크 <우리 커뮤니티를 소개합니다>' },
      { id: '12', title: '(17:00 - 17:30) [클로징] 다오랩, 커뮤니티형 자율조직을 꿈꾸다' },
    ];

    const insertSession = db.prepare('INSERT INTO sessions (id, title) VALUES (?, ?)');
    const insertMany = db.transaction((sessions) => {
      for (const session of sessions) {
        insertSession.run(session.id, session.title);
      }
    });
    insertMany(sessions);
    console.log(`✅ Inserted ${sessions.length} default sessions`);
  }

  console.log('✅ Database initialized');
}

export function generateAdminCode(): string {
  // 6자리 랜덤 코드 생성 (영문 소문자 + 숫자)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
