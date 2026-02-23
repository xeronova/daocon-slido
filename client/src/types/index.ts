export interface Session {
  id: string;
  title: string;
  isActive: number; // 0 or 1
  createdAt: string;
}

export interface Question {
  id: string;
  sessionId: string;
  authorName: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

export interface QuestionSubmit {
  authorName: string;
  content: string;
  password: string;
}
