import { useState } from 'react';
import { sessionsAPI } from '../api/client';

interface QuestionFormProps {
  sessionId: string;
  onSubmit: () => void;
}

export function QuestionForm({ sessionId, onSubmit }: QuestionFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !content.trim() || !password.trim()) {
      alert('모든 필드를 입력해주세요');
      return;
    }

    if (!/^\d{4}$/.test(password)) {
      alert('비밀번호는 4자리 숫자여야 합니다');
      return;
    }

    setIsSubmitting(true);
    try {
      await sessionsAPI.submitQuestion(sessionId, {
        authorName: authorName.trim(),
        content: content.trim(),
        password,
      });

      // 폼 초기화
      setAuthorName('');
      setContent('');
      setPassword('');

      // 부모 컴포넌트에 알림
      onSubmit();
    } catch (error: any) {
      console.error('Failed to submit question:', error);
      alert(error.response?.data?.error || '질문 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-navy-800/30 rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lime-400 font-semibold mb-4">질문하기</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">이름</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="홍길동"
            className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">질문 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="질문을 입력하세요..."
            rows={4}
            className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white resize-none focus:outline-none focus:ring-2 focus:ring-gold-400"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">
            4자리 비밀번호 (수정 시 필요)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="1234"
            maxLength={4}
            pattern="[0-9]{4}"
            className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '등록 중...' : '질문 제출'}
        </button>
      </div>
    </form>
  );
}
