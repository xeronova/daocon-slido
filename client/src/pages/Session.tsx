import { useState, useEffect, useCallback } from 'react';
import { SessionSelect } from '../components/SessionSelect';
import { QuestionForm } from '../components/QuestionForm';
import { QuestionList } from '../components/QuestionList';
import { sessionsAPI, questionsAPI, getBrowserId } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import type { Session, Question } from '../types';

export function SessionPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());
  const [isUserSelection, setIsUserSelection] = useState(false);

  // 좋아요 상태 복원
  useEffect(() => {
    const stored = localStorage.getItem('likedQuestions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLikedQuestions(new Set(parsed));
        }
      } catch (error) {
        console.error('Failed to parse likedQuestions:', error);
        localStorage.removeItem('likedQuestions');
      }
    }
  }, []);

  // 세션 목록 로드
  const loadSessions = useCallback(async () => {
    try {
      const res = await sessionsAPI.getAll();
      setSessions(res.data);

      // 활성 세션 찾기
      const active = res.data.find((s) => s.isActive === 1);
      if (active) {
        setActiveSessionId(active.id);

        // 사용자가 직접 선택하지 않았으면 활성 세션으로 자동 전환
        if (!isUserSelection) {
          setSelectedSessionId(active.id);
        }
      }

      // 초기 로드 시 선택된 세션이 없으면 활성 세션 선택
      if (!selectedSessionId && active) {
        setSelectedSessionId(active.id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [isUserSelection, selectedSessionId]);

  // 질문 목록 로드
  const loadQuestions = useCallback(async () => {
    if (!selectedSessionId) return;

    try {
      const res = await sessionsAPI.getQuestions(selectedSessionId);
      setQuestions(res.data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  }, [selectedSessionId]);

  // 초기 로드
  useEffect(() => {
    loadSessions();
  }, []);

  // 세션 변경 시 질문 로드
  useEffect(() => {
    if (selectedSessionId) {
      loadQuestions();
    }
  }, [selectedSessionId, loadQuestions]);

  // 폴링: 5초마다 세션 및 질문 갱신
  usePolling(loadSessions, 5000, [isUserSelection, selectedSessionId]);
  usePolling(loadQuestions, 5000, [selectedSessionId]);

  // 세션 선택 핸들러
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsUserSelection(sessionId !== activeSessionId); // 현재 세션이 아닌 걸 선택하면 자동 전환 비활성화
  };

  // 좋아요 핸들러
  const handleLike = async (questionId: string) => {
    try {
      const browserId = getBrowserId();
      const res = await questionsAPI.like(questionId, browserId);

      // 좋아요 상태 업데이트
      const newLiked = new Set(likedQuestions);
      if (res.data.liked) {
        newLiked.add(questionId);
      } else {
        newLiked.delete(questionId);
      }
      setLikedQuestions(newLiked);
      localStorage.setItem('likedQuestions', JSON.stringify([...newLiked]));

      // 질문 목록 즉시 갱신
      loadQuestions();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // 질문 제출 후 핸들러
  const handleQuestionSubmit = () => {
    loadQuestions();
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gold-400">다오콘 2026</h1>
            <div className="flex gap-2">
              <span className="bg-gold-400 text-navy-900 px-4 py-1.5 rounded-full text-sm font-bold">
                다오콘
              </span>
              <span className="bg-gold-400 text-navy-900 px-4 py-1.5 rounded-full text-sm font-bold">
                연결지능
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            AI 시대 연결의 힘: 커뮤니티가 미래다
          </p>
        </div>

        {/* 세션 선택 */}
        {sessions.length > 0 && (
          <div className="mb-6">
            <SessionSelect
              sessions={sessions}
              activeSessionId={activeSessionId}
              selectedSessionId={selectedSessionId}
              onSelect={handleSessionSelect}
            />
          </div>
        )}

        {/* 질문 제출 폼 */}
        {selectedSessionId && (
          <div className="mb-8">
            <QuestionForm sessionId={selectedSessionId} onSubmit={handleQuestionSubmit} />
          </div>
        )}

        {/* 질문 목록 */}
        {selectedSessionId && (
          <div>
            <h2 className="text-xl font-bold text-lime-400 mb-4">질문 목록</h2>
            <QuestionList
              questions={questions}
              onLike={handleLike}
              likedQuestions={likedQuestions}
            />
          </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">세션이 아직 생성되지 않았습니다</p>
            <p className="text-sm mt-2">관리자가 세션을 생성할 때까지 기다려주세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
