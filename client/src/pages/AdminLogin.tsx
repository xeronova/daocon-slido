import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, setAdminCode } from '../api/admin';

export function AdminLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('접속코드를 입력하세요');
      return;
    }

    setIsLoading(true);
    try {
      await adminAPI.login(code.trim());
      setAdminCode(code.trim());
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || '접속코드가 올바르지 않습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold-400 mb-2">🔑 관리자 로그인</h1>
          <p className="text-gray-400">서버 콘솔에서 접속코드를 확인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-navy-800/50 rounded-xl p-8 border border-gray-700/50">
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">접속코드</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="접속코드 입력"
              className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-400"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-400 hover:text-gold-400 transition-colors">
            ← 참석자 화면으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
