import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { adminAPI, getAdminCode, clearAdminCode } from '../api/admin';
import type { Session } from '../types';

interface SessionWithCount extends Session {
  questionCount: number;
}

export function AdminDashboard() {
  const [sessions, setSessions] = useState<SessionWithCount[]>([]);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const adminCode = getAdminCode();

  const participantUrl = window.location.origin;

  useEffect(() => {
    if (!adminCode) {
      navigate('/admin');
      return;
    }
    loadSessions();
  }, [adminCode, navigate]);

  const loadSessions = async () => {
    if (!adminCode) return;

    try {
      const res = await adminAPI.getSessions(adminCode);
      setSessions(res.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode || !newSessionTitle.trim()) return;

    setIsLoading(true);
    try {
      await adminAPI.createSession(adminCode, newSessionTitle.trim());
      setNewSessionTitle('');
      loadSessions();
    } catch (error: any) {
      alert(error.response?.data?.error || '세션 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateSession = async (sessionId: string) => {
    if (!adminCode) return;

    try {
      await adminAPI.activateSession(adminCode, sessionId);
      loadSessions();
    } catch (error: any) {
      alert(error.response?.data?.error || '세션 활성화에 실패했습니다');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!adminCode) return;
    if (!confirm('이 세션을 삭제하시겠습니까? 모든 질문도 함께 삭제됩니다.')) return;

    try {
      await adminAPI.deleteSession(adminCode, sessionId);
      loadSessions();
    } catch (error: any) {
      alert(error.response?.data?.error || '세션 삭제에 실패했습니다');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(participantUrl);
    alert('링크가 복사되었습니다!');
  };

  const handleLogout = () => {
    clearAdminCode();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gold-400">관리자 대시보드</h1>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* QR 코드 섹션 */}
        <div className="bg-navy-800/50 rounded-xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-xl font-bold text-lime-400 mb-4">📱 참석자용 QR 코드</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-4 rounded-xl">
              <QRCode value={participantUrl} size={180} />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 mb-2">참석자들에게 이 QR 코드를 보여주세요</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={participantUrl}
                  readOnly
                  className="flex-1 bg-navy-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
                <button
                  onClick={handleCopyUrl}
                  className="bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold px-6 py-2 rounded-lg transition-colors"
                >
                  복사
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 세션 생성 */}
        <div className="bg-navy-800/50 rounded-xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-xl font-bold text-lime-400 mb-4">➕ 새 세션 생성</h2>
          <form onSubmit={handleCreateSession} className="flex gap-2">
            <input
              type="text"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="세션 제목 입력 (예: PART 1: AI 시대...)"
              className="flex-1 bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newSessionTitle.trim()}
              className="bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold px-8 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              생성
            </button>
          </form>
        </div>

        {/* 세션 목록 */}
        <div>
          <h2 className="text-xl font-bold text-lime-400 mb-4">📋 세션 목록</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>아직 생성된 세션이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`bg-navy-800/50 rounded-xl p-5 border transition-all ${
                    session.isActive
                      ? 'border-gold-400'
                      : 'border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{session.title}</h3>
                        {session.isActive && (
                          <span className="bg-gold-400 text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
                            현재 세션
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        질문: {session.questionCount}개 | 생성일:{' '}
                        {new Date(session.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!session.isActive && (
                      <button
                        onClick={() => handleActivateSession(session.id)}
                        className="bg-lime-400 hover:bg-lime-500 text-navy-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        현재 세션으로 설정
                      </button>
                    )}
                    <Link
                      to={`/admin/session/${session.id}`}
                      className="bg-navy-700 hover:bg-navy-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      질문 관리
                    </Link>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
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
