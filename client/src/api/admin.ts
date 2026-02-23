import { api } from './client';
import type { Session } from '../types';

interface SessionWithCount extends Session {
  questionCount: number;
}

export const adminAPI = {
  // 인증
  login: (code: string) => api.post('/admin/auth', { code }),

  // 세션 관리
  getSessions: (code: string) =>
    api.get<SessionWithCount[]>('/admin/sessions', {
      headers: { 'X-Admin-Code': code },
    }),

  createSession: (code: string, title: string) =>
    api.post<Session>(
      '/admin/sessions',
      { title },
      { headers: { 'X-Admin-Code': code } }
    ),

  activateSession: (code: string, sessionId: string) =>
    api.post<Session>(
      `/admin/sessions/${sessionId}/activate`,
      {},
      { headers: { 'X-Admin-Code': code } }
    ),

  deleteSession: (code: string, sessionId: string) =>
    api.delete(`/admin/sessions/${sessionId}`, {
      headers: { 'X-Admin-Code': code },
    }),

  // 질문 관리
  deleteQuestion: (code: string, questionId: string) =>
    api.delete(`/admin/questions/${questionId}`, {
      headers: { 'X-Admin-Code': code },
    }),
};

// 관리자 코드 헬퍼
export function getAdminCode(): string | null {
  return localStorage.getItem('adminCode');
}

export function setAdminCode(code: string): void {
  localStorage.setItem('adminCode', code);
}

export function clearAdminCode(): void {
  localStorage.removeItem('adminCode');
}
