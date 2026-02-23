import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { Question } from '../types.js';

const router = Router();

// POST /api/sessions/:id/questions - 질문 제출
router.post('/sessions/:id/questions', async (req, res) => {
  try {
    const { authorName, content, password } = req.body;

    if (!authorName || !content || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 비밀번호는 4자리 숫자여야 함
    if (!/^\d{4}$/.test(password)) {
      return res.status(400).json({ error: 'Password must be 4 digits' });
    }

    // 세션 존재 확인
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    const questionId = nanoid();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO questions (id, sessionId, authorName, content, password, likeCount, createdAt)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(questionId, req.params.id, authorName, content, hashedPassword, now);

    const question = db.prepare(`
      SELECT id, sessionId, authorName, content, likeCount, createdAt
      FROM questions
      WHERE id = ?
    `).get(questionId);

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// PUT /api/questions/:id - 질문 수정 (비밀번호 검증)
router.put('/questions/:id', async (req, res) => {
  try {
    const { content, password } = req.body;

    if (!content || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const question = db.prepare(`
      SELECT password FROM questions WHERE id = ?
    `).get(req.params.id) as Question | undefined;

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, question.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 질문 수정
    db.prepare(`
      UPDATE questions
      SET content = ?
      WHERE id = ?
    `).run(content, req.params.id);

    const updated = db.prepare(`
      SELECT id, sessionId, authorName, content, likeCount, createdAt
      FROM questions
      WHERE id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// POST /api/questions/:id/like - 좋아요 토글
router.post('/questions/:id/like', (req, res) => {
  try {
    const { browserId } = req.body;

    if (!browserId) {
      return res.status(400).json({ error: 'Missing browserId' });
    }

    const questionId = req.params.id;

    // 질문 존재 확인
    const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // 이미 좋아요 했는지 확인
    const existingLike = db.prepare(`
      SELECT id FROM likes WHERE questionId = ? AND browserId = ?
    `).get(questionId, browserId);

    const transaction = db.transaction(() => {
      if (existingLike) {
        // 좋아요 취소
        db.prepare('DELETE FROM likes WHERE id = ?').run((existingLike as any).id);
        db.prepare('UPDATE questions SET likeCount = likeCount - 1 WHERE id = ?').run(questionId);
        return false; // liked = false
      } else {
        // 좋아요 추가
        const likeId = nanoid();
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO likes (id, questionId, browserId, createdAt)
          VALUES (?, ?, ?, ?)
        `).run(likeId, questionId, browserId, now);
        db.prepare('UPDATE questions SET likeCount = likeCount + 1 WHERE id = ?').run(questionId);
        return true; // liked = true
      }
    });

    const liked = transaction();

    // 최신 likeCount 가져오기
    const updated = db.prepare('SELECT likeCount FROM questions WHERE id = ?').get(questionId) as { likeCount: number };

    res.json({ liked, likeCount: updated.likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

export default router;
