import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onLike: (questionId: string) => void;
  isLiked: boolean;
}

export function QuestionCard({ question, onLike, isLiked }: QuestionCardProps) {
  return (
    <div className="bg-navy-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 transition-all hover:border-gray-600">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="text-gray-400 text-sm font-medium">{question.authorName}</div>
        <button
          onClick={() => onLike(question.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            isLiked
              ? 'bg-gold-400 text-navy-900'
              : 'bg-navy-900/50 text-gold-400 border border-gold-400/30 hover:bg-gold-400/10'
          }`}
        >
          <span>👍</span>
          <span className="font-semibold">{question.likeCount}</span>
        </button>
      </div>
      <p className="text-white text-base leading-relaxed">{question.content}</p>
      <div className="text-gray-500 text-xs mt-3">
        {new Date(question.createdAt).toLocaleString('ko-KR')}
      </div>
    </div>
  );
}
