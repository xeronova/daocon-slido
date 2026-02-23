import { Router } from 'express';
import { db } from '../db.js';
import { Session } from '../types.js';

const router = Router();

// GET /api/sessions - 전체 세션 목록
router.get('/sessions', (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT id, title, isActive, createdAt
      FROM sessions
      ORDER BY createdAt ASC
    `).all() as Session[];

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/active - 현재 활성 세션
router.get('/sessions/active', (req, res) => {
  try {
    const session = db.prepare(`
      SELECT id, title, isActive, createdAt
      FROM sessions
      WHERE isActive = 1
      LIMIT 1
    `).get() as Session | undefined;

    if (!session) {
      return res.status(404).json({ error: 'No active session found' });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
});

// GET /api/sessions/:id - 특정 세션 조회
router.get('/sessions/:id', (req, res) => {
  try {
    const session = db.prepare(`
      SELECT id, title, isActive, createdAt
      FROM sessions
      WHERE id = ?
    `).get(req.params.id) as Session | undefined;

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// GET /api/sessions/:id/questions - 세션의 질문 목록 (좋아요순)
router.get('/sessions/:id/questions', (req, res) => {
  try {
    const questions = db.prepare(`
      SELECT id, sessionId, authorName, content, likeCount, createdAt
      FROM questions
      WHERE sessionId = ?
      ORDER BY likeCount DESC, createdAt DESC
    `).all(req.params.id);

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

export default router;
