export interface QuizSubject {
  id: number
  title: string
  code?: string | null
}

export interface QuizAnswer {
  id: number
  title: string
  position: number
  isCorrect?: boolean
}

export interface QuizQuestion {
  id: number
  title: string
  position: number
  answers: QuizAnswer[]
}

export interface QuizSummary {
  id: number
  title: string
  description?: string | null
  durationMinutes: number
  questionCount: number
  attemptCount: number
  subject: QuizSubject
  createdAt: string
}

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED'

export interface AttemptQuestion extends QuizQuestion {
  selectedAnswerId: number | null
  isCorrect?: boolean
  explanation?: string | null
}

export interface Attempt {
  id: number
  status: AttemptStatus
  dateStarted: string
  dateSubmitted?: string | null
  expiresAt: string
  totalQuestion: number
  totalAnswered: number
  totalCorrect?: number | null
  totalWrong?: number | null
  totalSkipped?: number | null
  score?: number | null
  quiz: QuizSummary
  questions: AttemptQuestion[]
}

export interface AttemptHistory {
  id: number
  status: AttemptStatus
  dateStarted: string
  dateSubmitted?: string | null
  totalCorrect?: number | null
  score?: number | null
}

export interface AnswerSelection {
  questionId: number
  answerId: number | null
}

export type QuizStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE'

export interface MyQuiz extends QuizSummary {
  status: QuizStatus
  rejectReason?: string | null
  updateAt: string
}

export interface QuizAnswerContext {
  id?: number
  title: string
  isCorrect: boolean
}

export interface QuizQuestionContext {
  id?: number
  title: string
  explanation?: string | null
  answers: QuizAnswerContext[]
}

export interface QuizContext {
  id?: number
  title: string
  description?: string | null
  subjectId: number
  durationMinutes: number
  questions: QuizQuestionContext[]
  status?: QuizStatus
  rejectReason?: string | null
  attemptCount?: number
}
