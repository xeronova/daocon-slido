import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import { requireAdmin, getAdminCode } from '../middleware/auth.js';
import { Session } from '../types.js';

const router = Router();

// POST /api/admin/auth - 접속코드 검증
router.post('/auth', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  if (code === getAdminCode()) {
    return res.json({ success: true });
  }

  res.status(401).json({ error: 'Invalid code' });
});

// 이하 모든 라우트는 관리자 인증 필요
router.use(requireAdmin);

// GET /api/admin/sessions - 전체 세션 목록
router.get('/sessions', (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM questions WHERE sessionId = s.id) as questionCount
      FROM sessions s
      ORDER BY createdAt ASC
    `).all();

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/admin/sessions - 세션 생성
router.post('/sessions', (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const sessionId = nanoid();
    const now = new Date().toISOString();

    // 첫 번째 세션인지 확인
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number };
    const isFirstSession = sessionCount.count === 0;

    db.prepare(`
      INSERT INTO sessions (id, title, isActive, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, title, isFirstSession ? 1 : 0, now);

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// POST /api/admin/sessions/:id/activate - 현재 세션으로 설정
router.post('/sessions/:id/activate', (req, res) => {
  try {
    const sessionId = req.params.id;

    // 세션 존재 확인
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 트랜잭션으로 원자적 업데이트
    const transaction = db.transaction(() => {
      // 모든 세션 비활성화
      db.prepare('UPDATE sessions SET isActive = 0').run();
      // 해당 세션만 활성화
      db.prepare('UPDATE sessions SET isActive = 1 WHERE id = ?').run(sessionId);
    });

    transaction();

    const updated = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to activate session' });
  }
});

// DELETE /api/admin/sessions/:id - 세션 삭제
router.delete('/sessions/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// DELETE /api/admin/questions/:id - 질문 삭제
router.delete('/questions/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
