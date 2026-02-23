import { QuestionCard } from './QuestionCard';
import type { Question } from '../types';

interface QuestionListProps {
  questions: Question[];
  onLike: (questionId: string) => void;
  likedQuestions: Set<string>;
}

export function QuestionList({ questions, onLike, likedQuestions }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">아직 질문이 없습니다</p>
        <p className="text-sm mt-2">첫 번째 질문을 등록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-gray-400 text-sm mb-4">
        총 {questions.length}개의 질문
      </div>
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onLike={onLike}
          isLiked={likedQuestions.has(question.id)}
        />
      ))}
    </div>
  );
}
