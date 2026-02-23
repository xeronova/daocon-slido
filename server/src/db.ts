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
