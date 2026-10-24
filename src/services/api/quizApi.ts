import type { AnswerSelection, Attempt, AttemptHistory, MyQuiz, QuizContext, QuizSummary } from '../../types/quiz'
import { http } from '../http/httpClient'

export const quizApi = {
  async list(subjectId?: number): Promise<QuizSummary[]> {
    const { data } = await http.get<QuizSummary[]>('/quizzes', { params: subjectId ? { subjectId } : undefined })
    return data
  },

  async get(id: number): Promise<QuizSummary> {
    const { data } = await http.get<QuizSummary>(`/quizzes/${id}`)
    return data
  },

  async startAttempt(quizId: number): Promise<Attempt> {
    const { data } = await http.post<Attempt>(`/quizzes/${quizId}/attempts`)
    return data
  },

  async history(quizId: number): Promise<AttemptHistory[]> {
    const { data } = await http.get<AttemptHistory[]>(`/quizzes/${quizId}/attempts/me`)
    return data
  },

  async getAttempt(attemptId: number): Promise<Attempt> {
    const { data } = await http.get<Attempt>(`/attempts/${attemptId}`)
    return data
  },

  async saveAnswers(attemptId: number, answers: AnswerSelection[]): Promise<void> {
    await http.put(`/attempts/${attemptId}/answers`, { answers })
  },

  async submit(attemptId: number, answers: AnswerSelection[]): Promise<Attempt> {
    const { data } = await http.post<Attempt>(`/attempts/${attemptId}/submit`, { answers })
    return data
  },

  async mine(): Promise<MyQuiz[]> {
    const { data } = await http.get<MyQuiz[]>('/quizzes/mine')
    return data
  },

  async getContext(id: number): Promise<QuizContext> {
    const { data } = await http.get<QuizContext>(`/quizzes/${id}/edit`)
    return data
  },

  async create(context: QuizContext): Promise<{ id: number }> {
    const { data } = await http.post<{ id: number }>('/quizzes', context)
    return data
  },

  async update(id: number, context: QuizContext): Promise<void> {
    await http.put(`/quizzes/${id}`, context)
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/quizzes/${id}`)
  },
}
