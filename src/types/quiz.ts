interface QuizSubject {
  id: number
  name: string
  code: string
}

interface QuizAnswer {
  id: number
  title: string
  position: number
  isCorrect?: boolean
}

interface QuizQuestion {
  id: number
  title: string
  position: number
  answers: QuizAnswer[]
}

export interface QuizSummary {
  id: number
  name: string
  description?: string | null
  estimateMinute: number
  totalQuestion: number
  attemptCount: number
  subject: QuizSubject
  dateCreated: string
}

type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED'

export interface AttemptQuestion extends QuizQuestion {
  selectedAnswerId: number | null
  isCorrect?: boolean
  explanation?: string | null
}

export interface Attempt {
  id: number
  status: AttemptStatus
  expiresAt: string
  totalQuestion: number
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
  dateModified: string
}

interface QuizAnswerContext {
  id?: number
  title: string
  isCorrect: boolean
}

interface QuizQuestionContext {
  id?: number
  title: string
  explanation?: string | null
  answers: QuizAnswerContext[]
}

export interface QuizContext {
  id?: number
  name: string
  description?: string | null
  subjectId: number
  estimateMinute: number
  questions: QuizQuestionContext[]
  attemptCount?: number
}
