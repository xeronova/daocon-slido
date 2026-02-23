import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { sessionsAPI } from '../api/client';
import { adminAPI, getAdminCode } from '../api/admin';
import type { Session, Question } from '../types';

export function AdminSessionView() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();
  const adminCode = getAdminCode();

  useEffect(() => {
    if (!adminCode) {
      navigate('/admin');
      return;
    }
    if (!id) return;

    loadSessionAndQuestions();
  }, [id, adminCode, navigate]);

  const loadSessionAndQuestions = async () => {
    if (!id) return;

    try {
      const [sessionRes, questionsRes] = await Promise.all([
        sessionsAPI.getById(id),
        sessionsAPI.getQuestions(id),
      ]);
      setSession(sessionRes.data);
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!adminCode) return;
    if (!confirm('이 질문을 삭제하시겠습니까?')) return;

    try {
      await adminAPI.deleteQuestion(adminCode, questionId);
      loadSessionAndQuestions();
    } catch (error: any) {
      alert(error.response?.data?.error || '질문 삭제에 실패했습니다');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="text-gold-400 hover:text-gold-500 transition-colors mb-4 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">{session.title}</h1>
          {session.isActive && (
            <span className="inline-block mt-2 bg-gold-400 text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
              현재 활성 세션
            </span>
          )}
        </div>

        {/* 질문 목록 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-lime-400">
              질문 목록 ({questions.length}개)
            </h2>
            <button
              onClick={loadSessionAndQuestions}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              🔄 새로고침
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>아직 질문이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-navy-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-gray-400 text-sm font-medium mb-1">
                        {question.authorName}
                      </div>
                      <p className="text-white text-base leading-relaxed">{question.content}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-1 text-gold-400">
                        <span>👍</span>
                        <span className="font-semibold">{question.likeCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-500 text-xs">
                      {new Date(question.createdAt).toLocaleString('ko-KR')}
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
