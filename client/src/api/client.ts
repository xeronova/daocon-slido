import axios from 'axios';
import type { Session, Question, QuestionSubmit } from '../types';

export const api = axios.create({
  baseURL: '/api',
});

// browserId 생성 및 저장
export function getBrowserId(): string {
  let id = localStorage.getItem('browserId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('browserId', id);
  }
  return id;
}

// 세션 API
export const sessionsAPI = {
  getAll: () => api.get<Session[]>('/sessions'),
  getActive: () => api.get<Session>('/sessions/active'),
  getById: (id: string) => api.get<Session>(`/sessions/${id}`),
  getQuestions: (id: string) => api.get<Question[]>(`/sessions/${id}/questions`),
  submitQuestion: (id: string, data: QuestionSubmit) =>
    api.post<Question>(`/sessions/${id}/questions`, data),
};

// 질문 API
export const questionsAPI = {
  like: (id: string, browserId: string) =>
    api.post<{ liked: boolean; likeCount: number }>(`/questions/${id}/like`, { browserId }),
  update: (id: string, content: string, password: string) =>
    api.put<Question>(`/questions/${id}`, { content, password }),
};
