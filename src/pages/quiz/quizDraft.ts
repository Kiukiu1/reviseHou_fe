import type { QuizContext } from '../../types/quiz'

export const QUIZ_LIMITS = {
  title: 200,
  description: 500,
  minDuration: 1,
  maxDuration: 180,
  maxQuestions: 200,
  question: 1000,
  explanation: 2000,
  answer: 500,
  minAnswers: 2,
  maxAnswers: 6,
}

export interface DraftAnswer {
  key: string
  title: string
  isCorrect: boolean
}

export interface DraftQuestion {
  key: string
  title: string
  explanation: string
  answers: DraftAnswer[]
}

export interface QuizDraft {
  title: string
  description: string
  subjectId: string
  durationMinutes: string
  questions: DraftQuestion[]
}

export type InfoErrors = Partial<Record<'title' | 'description' | 'subjectId' | 'durationMinutes', string>>

const newKey = () => Math.random().toString(36).slice(2, 10)

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function newAnswer(): DraftAnswer {
  return { key: newKey(), title: '', isCorrect: false }
}

export function newQuestion(): DraftQuestion {
  return {
    key: newKey(),
    title: '',
    explanation: '',
    answers: [newAnswer(), newAnswer(), newAnswer(), newAnswer()].map((answer, index) => ({
      ...answer,
      isCorrect: index === 0,
    })),
  }
}

export function emptyDraft(): QuizDraft {
  return { title: '', description: '', subjectId: '', durationMinutes: '15', questions: [newQuestion()] }
}

export function draftFromContext(context: QuizContext): QuizDraft {
  return {
    title: context.title,
    description: context.description ?? '',
    subjectId: String(context.subjectId),
    durationMinutes: String(context.durationMinutes),
    questions: context.questions.map((question) => ({
      key: newKey(),
      title: question.title,
      explanation: question.explanation ?? '',
      answers: question.answers.map((answer) => ({ key: newKey(), title: answer.title, isCorrect: answer.isCorrect })),
    })),
  }
}

export function contextFromDraft(draft: QuizDraft): QuizContext {
  return {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    subjectId: Number(draft.subjectId),
    durationMinutes: Number(draft.durationMinutes),
    questions: draft.questions.map((question) => ({
      title: question.title.trim(),
      explanation: question.explanation.trim() || null,
      answers: question.answers.map((answer) => ({ title: answer.title.trim(), isCorrect: answer.isCorrect })),
    })),
  }
}

export function validateInfo(draft: QuizDraft): InfoErrors {
  const errors: InfoErrors = {}
  const title = draft.title.trim()
  if (!title) errors.title = 'Vui lòng nhập tên bài kiểm tra.'
  else if (title.length > QUIZ_LIMITS.title) errors.title = `Tối đa ${QUIZ_LIMITS.title} ký tự.`
  if (draft.description.trim().length > QUIZ_LIMITS.description) {
    errors.description = `Tối đa ${QUIZ_LIMITS.description} ký tự.`
  }
  if (!draft.subjectId) errors.subjectId = 'Vui lòng chọn môn học.'
  const duration = Number(draft.durationMinutes)
  if (!Number.isInteger(duration) || duration < QUIZ_LIMITS.minDuration || duration > QUIZ_LIMITS.maxDuration) {
    errors.durationMinutes = `Thời gian từ ${QUIZ_LIMITS.minDuration} đến ${QUIZ_LIMITS.maxDuration} phút.`
  }
  return errors
}

export function validateQuestion(question: DraftQuestion): string | null {
  if (!question.title.trim()) return 'Chưa nhập nội dung câu hỏi.'
  if (question.title.trim().length > QUIZ_LIMITS.question) return `Câu hỏi tối đa ${QUIZ_LIMITS.question} ký tự.`
  if (question.answers.length < QUIZ_LIMITS.minAnswers) return `Cần ít nhất ${QUIZ_LIMITS.minAnswers} phương án.`
  if (question.answers.some((answer) => !answer.title.trim())) return 'Có phương án chưa nhập nội dung.'
  if (question.answers.some((answer) => answer.title.trim().length > QUIZ_LIMITS.answer)) {
    return `Phương án tối đa ${QUIZ_LIMITS.answer} ký tự.`
  }
  if (question.answers.filter((answer) => answer.isCorrect).length !== 1) return 'Chọn đúng 1 đáp án đúng.'
  if (question.explanation.trim().length > QUIZ_LIMITS.explanation) {
    return `Giải thích tối đa ${QUIZ_LIMITS.explanation} ký tự.`
  }
  return null
}

const DRAFT_KEY = 'revise.quizDraft'

export function loadStoredDraft(): QuizDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as QuizDraft
    return Array.isArray(draft.questions) && draft.questions.length > 0 ? draft : null
  } catch {
    return null
  }
}

export function storeDraft(draft: QuizDraft | null) {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else localStorage.removeItem(DRAFT_KEY)
  } catch {}
}
