import express from 'express';
import cors from 'cors';
import { initDatabase, generateAdminCode } from './db.js';
import { setAdminCode } from './middleware/auth.js';
import sessionsRouter from './routes/sessions.js';
import questionsRouter from './routes/questions.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = 3000;

// 관리자 코드 고정
const ADMIN_CODE = 'daoCON0228';
setAdminCode(ADMIN_CODE);

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

// 정적 파일 서빙
app.use(express.static('public'));

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SPA fallback - 모든 라우트를 index.html로
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
