export interface Session {
  id: string;
  title: string;
  isActive: number; // SQLite에서는 0 또는 1
  createdAt: string;
}

export interface Question {
  id: string;
  sessionId: string;
  authorName: string;
  content: string;
  password: string; // bcrypt 해시
  likeCount: number;
  createdAt: string;
}

export interface Like {
  id: string;
  questionId: string;
  browserId: string;
  createdAt: string;
}

export interface QuestionWithoutPassword extends Omit<Question, 'password'> {}
