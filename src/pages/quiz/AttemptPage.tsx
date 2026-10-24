import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import StateView from '../../components/common/StateView'
import { useRequest } from '../../hooks/useRequest'
import { PATHS } from '../../routes/paths'
import { quizApi } from '../../services/api/quizApi'
import type { AnswerSelection, Attempt, AttemptQuestion } from '../../types/quiz'
import { formatDuration } from '../../utils/format'
import { QUESTIONS_PER_PAGE } from './attemptRules'
import { LETTERS } from './quizDraft'
import styles from './AttemptPage.module.css'

type Selections = Record<number, number | null>


function selectionsOf(attempt: Attempt): Selections {
  return Object.fromEntries(attempt.questions.map((question) => [question.id, question.selectedAnswerId]))
}

function secondsUntil(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000))
}

function pageOf(attempt: Attempt, questionId: number) {
  return Math.floor(attempt.questions.findIndex((question) => question.id === questionId) / QUESTIONS_PER_PAGE)
}

function scrollToQuestion(questionId: number) {
  window.setTimeout(
    () => document.getElementById(`question-${questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    50,
  )
}

function answerState(question: AttemptQuestion, answerId: number, selected: number | null, submitted: boolean) {
  if (!submitted) return selected === answerId ? 'selected' : undefined
  const answer = question.answers.find((item) => item.id === answerId)
  if (selected === answerId) return answer?.isCorrect ? 'correct' : 'wrong'
  return answer?.isCorrect ? 'answerKey' : undefined
}

interface QuestionPageProps {
  attempt: Attempt
  page: number
  selections: Selections
  submitted: boolean
  onChoose?: (questionId: number, answerId: number) => void
}

function QuestionPage({ attempt, page, selections, submitted, onChoose }: QuestionPageProps) {
  const start = page * QUESTIONS_PER_PAGE
  const questions = attempt.questions.slice(start, start + QUESTIONS_PER_PAGE)

  return (
    <ol className={styles.questions} start={start + 1}>
      {questions.map((question, index) => (
        <li key={question.id} id={`question-${question.id}`} className={styles.question}>
          <h2 className={styles.questionTitle}>
            Câu {start + index + 1}: {question.title}
          </h2>
          {submitted && question.selectedAnswerId === null && <span className={styles.skippedTag}>Chưa trả lời</span>}
          <div className={styles.answers} role="radiogroup" aria-label={`Câu ${start + index + 1}`}>
            {question.answers.map((answer, answerIndex) => {
              const state = answerState(question, answer.id, selections[question.id] ?? null, submitted)
              return (
                <div key={answer.id} className={styles.answerRow}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selections[question.id] === answer.id}
                    disabled={submitted}
                    className={state ? `${styles.answer} ${styles[state]}` : styles.answer}
                    onClick={() => onChoose?.(question.id, answer.id)}
                  >
                    <span className={styles.letter}>{LETTERS[answerIndex]}</span>
                    {answer.title}
                  </button>
                  {state === 'correct' && <Icon name="check" className={styles.markCorrect} />}
                  {state === 'wrong' && <Icon name="close" className={styles.markWrong} />}
                </div>
              )
            })}
          </div>
          {submitted && question.explanation && (
            <p className={styles.explanation}>
              <Icon name="info" size={16} />
              {question.explanation}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}

interface GridProps {
  attempt: Attempt
  page: number
  selections: Selections
  submitted: boolean
  onJump: (questionId: number) => void
}

function QuestionGrid({ attempt, page, selections, submitted, onJump }: GridProps) {
  return (
    <div className={styles.grid}>
      {attempt.questions.map((question, index) => {
        const answered = selections[question.id] != null
        const tone = submitted
          ? !answered
            ? styles.gridSkipped
            : question.isCorrect
              ? styles.gridCorrect
              : styles.gridWrong
          : answered
            ? styles.gridAnswered
            : undefined
        const current = Math.floor(index / QUESTIONS_PER_PAGE) === page
        return (
          <button
            key={question.id}
            type="button"
            className={[styles.gridItem, tone, current && styles.gridCurrent].filter(Boolean).join(' ')}
            onClick={() => onJump(question.id)}
            aria-label={`Đến câu ${index + 1}`}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}

function PageNav({
  page,
  totalPages,
  onPrev,
  onNext,
  nextLabel,
  busy,
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  nextLabel: string
  busy: boolean
}) {
  return (
    <div className={styles.pageNav}>
      <span className={styles.pageInfo}>
        Trang {page + 1}/{totalPages}
      </span>
      <div className={styles.pageButtons}>
        {page > 0 && (
          <Button variant="outline" onClick={onPrev} disabled={busy}>
            Quay lại
          </Button>
        )}
        <Button onClick={onNext} disabled={busy}>
          {nextLabel}
          <Icon name="arrow-right" size={16} />
        </Button>
      </div>
    </div>
  )
}

function AttemptRunner({ attempt, onSubmitted }: { attempt: Attempt; onSubmitted: (result: Attempt) => void }) {
  const [selections, setSelections] = useState<Selections>(() => selectionsOf(attempt))
  const [dirty, setDirty] = useState<Set<number>>(() => new Set())
  const [page, setPage] = useState(0)
  const [remaining, setRemaining] = useState(() => secondsUntil(attempt.expiresAt))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const submittingRef = useRef(false)
  const totalPages = Math.ceil(attempt.questions.length / QUESTIONS_PER_PAGE)
  const unanswered = attempt.questions.filter((question) => selections[question.id] == null).length

  const pendingAnswers = (): AnswerSelection[] =>
    [...dirty].map((questionId) => ({ questionId, answerId: selections[questionId] ?? null }))

  const choose = (questionId: number, answerId: number) => {
    setSelections((prev) => ({ ...prev, [questionId]: answerId }))
    setDirty((prev) => new Set(prev).add(questionId))
  }

  const goTo = async (nextPage: number, focusQuestion?: number) => {
    if (nextPage !== page) {
      const answers = pendingAnswers()
      if (answers.length > 0) {
        setBusy(true)
        setError('')
        try {
          await quizApi.saveAnswers(attempt.id, answers)
          setDirty(new Set())
        } catch {
          setError('Không lưu được đáp án, vui lòng thử lại.')
          setBusy(false)
          return
        }
        setBusy(false)
      }
      setPage(nextPage)
    }
    if (focusQuestion) scrollToQuestion(focusQuestion)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setConfirming(false)
    setBusy(true)
    setError('')
    try {
      onSubmitted(await quizApi.submit(attempt.id, pendingAnswers()))
    } catch {
      setError('Nộp bài không thành công, vui lòng thử lại.')
      submittingRef.current = false
      setBusy(false)
    }
  }

  const submitRef = useRef(submit)
  useEffect(() => {
    submitRef.current = submit
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = secondsUntil(attempt.expiresAt)
      setRemaining(left)
      if (left === 0) {
        window.clearInterval(timer)
        submitRef.current()
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [attempt.expiresAt])

  useEffect(() => {
    if (dirty.size === 0) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const isLastPage = page === totalPages - 1

  return (
    <>
      <div className={styles.main}>
        <QuestionPage attempt={attempt} page={page} selections={selections} submitted={false} onChoose={choose} />
        <PageNav
          page={page}
          totalPages={totalPages}
          busy={busy}
          onPrev={() => goTo(page - 1)}
          onNext={() => (isLastPage ? setConfirming(true) : goTo(page + 1))}
          nextLabel={isLastPage ? 'Nộp bài' : 'Tiếp theo'}
        />
      </div>

      <aside className={styles.panel} aria-label="Bảng câu hỏi">
        <h2 className={styles.panelTitle}>Câu hỏi</h2>
        <QuestionGrid
          attempt={attempt}
          page={page}
          selections={selections}
          submitted={false}
          onJump={(questionId) => goTo(pageOf(attempt, questionId), questionId)}
        />
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Button block onClick={() => setConfirming(true)} disabled={busy}>
          {busy ? 'Đang xử lý...' : 'Nộp bài'}
        </Button>
        <hr className={styles.divider} />
        <p className={styles.timer}>
          Thời gian còn lại:
          <strong aria-live="polite">{formatDuration(remaining)}</strong>
        </p>
      </aside>

      <Modal
        open={confirming}
        tone="warning"
        title="Nộp bài?"
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Làm tiếp
            </Button>
            <Button onClick={submit}>Nộp bài</Button>
          </>
        }
      >
        {unanswered > 0
          ? `Bạn còn ${unanswered} câu chưa trả lời. Sau khi nộp sẽ không sửa được nữa.`
          : 'Sau khi nộp sẽ không sửa được nữa.'}
      </Modal>
    </>
  )
}

function AttemptResult({ attempt }: { attempt: Attempt }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const selections = selectionsOf(attempt)
  const totalPages = Math.ceil(attempt.questions.length / QUESTIONS_PER_PAGE)
  const correct = attempt.totalCorrect ?? 0
  const wrong = attempt.totalWrong ?? 0
  const skipped = attempt.totalSkipped ?? 0

  const retry = async () => {
    setBusy(true)
    setError('')
    try {
      const next = await quizApi.startAttempt(attempt.quiz.id)
      navigate(PATHS.attempt(next.id))
    } catch {
      setError('Không bắt đầu được lượt mới, vui lòng thử lại.')
      setBusy(false)
    }
  }

  const goTo = (nextPage: number, focusQuestion?: number) => {
    setPage(nextPage)
    if (focusQuestion) scrollToQuestion(focusQuestion)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className={styles.main}>
        <QuestionPage attempt={attempt} page={page} selections={selections} submitted />
        {totalPages > 1 && (
          <PageNav
            page={page}
            totalPages={totalPages}
            busy={false}
            onPrev={() => goTo(page - 1)}
            onNext={() => goTo(page === totalPages - 1 ? 0 : page + 1)}
            nextLabel={page === totalPages - 1 ? 'Về trang đầu' : 'Trang sau'}
          />
        )}
      </div>

      <aside className={styles.panel} aria-label="Kết quả">
        <h2 className={styles.panelTitle}>Câu hỏi</h2>
        <QuestionGrid
          attempt={attempt}
          page={page}
          selections={selections}
          submitted
          onJump={(questionId) => goTo(pageOf(attempt, questionId), questionId)}
        />
        <hr className={styles.divider} />
        <div className={styles.result}>
          <h3>Kết quả</h3>
          <p>
            <Icon name="check" size={18} className={styles.markCorrect} />
            Số câu đúng: <strong>{`${correct}/${attempt.totalQuestion}`}</strong>
          </p>
          <p>
            <Icon name="close" size={18} className={styles.markWrong} />
            Số câu sai: <strong>{wrong}</strong>
          </p>
          {skipped > 0 && (
            <p>
              <Icon name="help-circle" size={18} className={styles.markSkipped} />
              Chưa trả lời: <strong>{skipped}</strong>
            </p>
          )}
          <p className={styles.score}>
            Điểm: <strong>{attempt.score ?? 0}/10</strong>
          </p>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Button block variant="outline" onClick={retry} disabled={busy}>
          {busy ? 'Đang chuẩn bị...' : 'Làm lại'}
        </Button>
      </aside>
    </>
  )
}

export default function AttemptPage() {
  const attemptId = Number(useParams().attemptId)
  const request = useRequest(() => quizApi.getAttempt(attemptId), `attempt-${attemptId}`)
  const [result, setResult] = useState<Attempt>()
  const attempt = result?.id === attemptId ? result : request.data

  return (
    <StateView
      loading={request.loading}
      error={request.error}
      onRetry={request.reload}
      empty={!attempt}
      emptyText="Không tìm thấy lượt làm bài."
    >
      {attempt && (
        <>
          <PageHeader
            width="wide"
            breadcrumbs={[
              { label: 'Bài kiểm tra', to: PATHS.quizLibrary },
              { label: attempt.quiz.subject.name, to: PATHS.subjectQuizzes(attempt.quiz.subject.id) },
              { label: attempt.quiz.name, to: PATHS.quizDetail(attempt.quiz.id) },
              { label: attempt.status === 'SUBMITTED' ? 'Kết quả' : 'Làm bài' },
            ]}
            title={attempt.quiz.name}
            meta={[
              { icon: 'folder-sm', label: attempt.quiz.subject.name },
              { icon: 'clock', label: `${attempt.quiz.estimateMinute} phút` },
              { icon: 'quiz-sm', label: `${attempt.totalQuestion} câu hỏi` },
            ]}
          />
          <Container width="wide" className={styles.layout}>
            {attempt.status === 'SUBMITTED' ? (
              <AttemptResult key={`result-${attempt.id}`} attempt={attempt} />
            ) : (
              <AttemptRunner
                key={`run-${attempt.id}`}
                attempt={attempt}
                onSubmitted={(submitted) => {
                  setResult(submitted)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </Container>
        </>
      )}
    </StateView>
  )
}
