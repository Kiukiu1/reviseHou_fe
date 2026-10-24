import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import SubjectSelect from '../../components/common/SubjectSelect'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import StateView from '../../components/common/StateView'
import { useRequest } from '../../hooks/useRequest'
import { PATHS } from '../../routes/paths'
import { quizApi } from '../../services/api/quizApi'
import { subjectApi } from '../../services/api/subjectApi'
import type { Subject } from '../../types/document'
import {
  LETTERS,
  QUIZ_LIMITS,
  contextFromDraft,
  draftFromContext,
  emptyDraft,
  loadStoredDraft,
  newAnswer,
  newQuestion,
  storeDraft,
  validateInfo,
  validateQuestion,
  type DraftQuestion,
  type InfoErrors,
  type QuizDraft,
} from './quizDraft'
import styles from './QuizFormPage.module.css'

type Step = 0 | 1 | 2
type Phase = 'editing' | 'confirming' | 'submitting' | 'done'

const STEPS = ['Thông tin bài', 'Câu hỏi', 'Xem lại & gửi duyệt']

function apiMessage(error: unknown) {
  return (
    (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) ||
    'Gửi bài kiểm tra không thành công, vui lòng thử lại.'
  )
}

function Stepper({ step, onGo }: { step: Step; onGo: (step: Step) => void }) {
  return (
    <ol className={styles.stepper}>
      {STEPS.map((label, index) => {
        const state = index < step ? styles.stepDone : index === step ? styles.stepCurrent : ''
        return (
          <li key={label} className={`${styles.stepItem} ${state}`}>
            <button type="button" onClick={() => onGo(index as Step)} disabled={index > step}>
              <span className={styles.stepDot}>{index < step ? <Icon name="check" size={16} /> : index + 1}</span>
              <span className={styles.stepLabel}>{label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

interface InfoStepProps {
  draft: QuizDraft
  errors: InfoErrors
  subjects: Subject[]
  onChange: (patch: Partial<QuizDraft>) => void
}

function InfoStep({ draft, errors, subjects, onChange }: InfoStepProps) {
  const control = (field: keyof InfoErrors) => (errors[field] ? `${styles.control} ${styles.invalid}` : styles.control)

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Thông tin bài kiểm tra</h2>
      <div className={styles.field}>
        <label htmlFor="quiz-title">Tên bài kiểm tra *</label>
        <input
          id="quiz-title"
          className={control('name')}
          value={draft.name}
          maxLength={QUIZ_LIMITS.name}
          placeholder="Ví dụ: Kiểm tra 15 phút chương 3 – Kế thừa"
          onChange={(event) => onChange({ name: event.target.value })}
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="quiz-subject">Môn học *</label>
          <SubjectSelect
            id="quiz-subject"
            subjects={subjects}
            value={draft.subjectId}
            onChange={(subjectId) => onChange({ subjectId })}
            invalid={!!errors.subjectId}
            triggerClassName={styles.control}
          />
          {errors.subjectId && <p className={styles.error}>{errors.subjectId}</p>}
        </div>
        <div className={`${styles.field} ${styles.durationField}`}>
          <label htmlFor="quiz-duration">Thời gian (phút) *</label>
          <input
            id="quiz-duration"
            type="number"
            min={QUIZ_LIMITS.minDuration}
            max={QUIZ_LIMITS.maxDuration}
            className={control('estimateMinute')}
            value={draft.estimateMinute}
            onChange={(event) => onChange({ estimateMinute: event.target.value })}
          />
          {errors.estimateMinute && <p className={styles.error}>{errors.estimateMinute}</p>}
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="quiz-description">Mô tả</label>
        <textarea
          id="quiz-description"
          className={`${control('description')} ${styles.textarea}`}
          rows={4}
          maxLength={QUIZ_LIMITS.description}
          placeholder="Phạm vi kiến thức, đối tượng, lưu ý khi làm bài…"
          value={draft.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
        <p className={styles.hint}>
          {draft.description.length}/{QUIZ_LIMITS.description}
        </p>
      </div>
    </section>
  )
}

interface QuestionsStepProps {
  questions: DraftQuestion[]
  current: number
  showErrors: boolean
  onSelect: (index: number) => void
  onChange: (update: (questions: DraftQuestion[]) => DraftQuestion[]) => void
}

function QuestionsStep({ questions, current, showErrors, onSelect, onChange }: QuestionsStepProps) {
  const question = questions[current]
  const error = validateQuestion(question)

  const updateQuestion = (update: (question: DraftQuestion) => Partial<DraftQuestion>) =>
    onChange((list) => list.map((item, index) => (index === current ? { ...item, ...update(item) } : item)))

  const updateAnswer = (answerIndex: number, title: string) =>
    updateQuestion((item) => ({
      answers: item.answers.map((answer, index) => (index === answerIndex ? { ...answer, title } : answer)),
    }))

  const markCorrect = (answerIndex: number) =>
    updateQuestion((item) => ({
      answers: item.answers.map((answer, index) => ({ ...answer, isCorrect: index === answerIndex })),
    }))

  const removeAnswer = (answerIndex: number) =>
    updateQuestion((item) => {
      const answers = item.answers.filter((_, index) => index !== answerIndex)
      if (!answers.some((answer) => answer.isCorrect)) answers[0] = { ...answers[0], isCorrect: true }
      return { answers }
    })

  const addQuestion = () => {
    onChange((list) => [...list, newQuestion()])
    onSelect(questions.length)
  }

  const removeQuestion = () => {
    onChange((list) => list.filter((_, index) => index !== current))
    onSelect(Math.max(0, current - 1))
  }

  return (
    <section className={styles.questionsLayout}>
      <aside className={styles.questionList} aria-label="Danh sách câu hỏi">
        <p className={styles.listTitle}>{questions.length} câu hỏi</p>
        <div className={styles.listItems}>
          {questions.map((item, index) => {
            const invalid = validateQuestion(item) !== null
            return (
              <button
                key={item.key}
                type="button"
                className={[
                  styles.listItem,
                  index === current && styles.listCurrent,
                  showErrors && invalid && styles.listInvalid,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(index)}
              >
                <span className={styles.listNumber}>{index + 1}</span>
                <span className={styles.listText}>{item.title.trim() || 'Câu hỏi chưa có nội dung'}</span>
                {!invalid && <Icon name="check" size={14} className={styles.listOk} />}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className={styles.addQuestion}
          onClick={addQuestion}
          disabled={questions.length >= QUIZ_LIMITS.maxQuestions}
        >
          <Icon name="plus" size={18} />
          Thêm câu hỏi
        </button>
      </aside>

      <div className={styles.card}>
        <div className={styles.editorHead}>
          <h2 className={styles.cardTitle}>
            Câu {current + 1}
            <span className={styles.muted}> / {questions.length}</span>
          </h2>
          <button
            type="button"
            className={styles.dangerLink}
            onClick={removeQuestion}
            disabled={questions.length === 1}
          >
            <Icon name="trash" size={18} />
            Xóa câu này
          </button>
        </div>

        <div className={styles.field}>
          <label htmlFor="question-title">Nội dung câu hỏi *</label>
          <textarea
            id="question-title"
            className={`${styles.control} ${styles.textarea}`}
            rows={3}
            maxLength={QUIZ_LIMITS.question}
            placeholder="Nhập câu hỏi…"
            value={question.title}
            onChange={(event) => {
              const title = event.target.value
              updateQuestion(() => ({ title }))
            }}
          />
        </div>

        <fieldset className={styles.answers}>
          <legend>Phương án trả lời · bấm vòng tròn để chọn đáp án đúng</legend>
          {question.answers.map((answer, index) => (
            <div
              key={answer.key}
              className={answer.isCorrect ? `${styles.answer} ${styles.answerCorrect}` : styles.answer}
            >
              <button
                type="button"
                role="radio"
                aria-checked={answer.isCorrect}
                aria-label={`Chọn ${LETTERS[index]} là đáp án đúng`}
                className={styles.correctToggle}
                onClick={() => markCorrect(index)}
              >
                {answer.isCorrect ? <Icon name="check" size={16} /> : LETTERS[index]}
              </button>
              <input
                className={styles.answerInput}
                value={answer.title}
                maxLength={QUIZ_LIMITS.answer}
                placeholder={`Phương án ${LETTERS[index]}`}
                aria-label={`Phương án ${LETTERS[index]}`}
                onChange={(event) => updateAnswer(index, event.target.value)}
              />
              <button
                type="button"
                className={styles.removeAnswer}
                onClick={() => removeAnswer(index)}
                disabled={question.answers.length <= QUIZ_LIMITS.minAnswers}
                aria-label={`Xóa phương án ${LETTERS[index]}`}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          ))}
          {question.answers.length < QUIZ_LIMITS.maxAnswers && (
            <button
              type="button"
              className={styles.addAnswer}
              onClick={() => updateQuestion((item) => ({ answers: [...item.answers, newAnswer()] }))}
            >
              <Icon name="plus" size={16} />
              Thêm phương án
            </button>
          )}
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="question-explanation">Giải thích đáp án (hiện sau khi nộp bài)</label>
          <textarea
            id="question-explanation"
            className={`${styles.control} ${styles.textarea}`}
            rows={2}
            maxLength={QUIZ_LIMITS.explanation}
            placeholder="Vì sao đáp án này đúng…"
            value={question.explanation}
            onChange={(event) => {
              const explanation = event.target.value
              updateQuestion(() => ({ explanation }))
            }}
          />
        </div>

        {showErrors && error && (
          <p className={styles.errorBox} role="alert">
            <Icon name="info" size={16} />
            {error}
          </p>
        )}

        <div className={styles.editorNav}>
          <Button variant="outline" size="sm" onClick={() => onSelect(current - 1)} disabled={current === 0}>
            Câu trước
          </Button>
          {current < questions.length - 1 ? (
            <Button variant="outline" size="sm" onClick={() => onSelect(current + 1)}>
              Câu tiếp
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Icon name="plus" size={16} />
              Thêm câu tiếp
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

function ReviewStep({ draft, subjects }: { draft: QuizDraft; subjects: Subject[] }) {
  const subject = subjects.find((item) => String(item.id) === draft.subjectId)
  return (
    <section className={styles.reviewLayout}>
      <div className={`${styles.card} ${styles.summary}`}>
        <h2 className={styles.summaryTitle}>{draft.name}</h2>
        <dl className={styles.summaryList}>
          <div>
            <dt>Môn học</dt>
            <dd>
              {subject
                ? [subject.major?.faculty.name, subject.major?.name, subject.name].filter(Boolean).join(' › ')
                : '—'}
            </dd>
          </div>
          <div>
            <dt>Thời gian</dt>
            <dd>{draft.estimateMinute} phút</dd>
          </div>
          <div>
            <dt>Số câu</dt>
            <dd>{draft.questions.length} câu</dd>
          </div>
        </dl>
        {draft.description.trim() && <p className={styles.summaryText}>{draft.description}</p>}
        <p className={styles.notice}>
          <Icon name="info" size={16} />
          Bài kiểm tra sẽ được gửi tới quản trị viên để duyệt trước khi hiển thị cho mọi người.
        </p>
      </div>

      <ol className={styles.reviewQuestions}>
        {draft.questions.map((question, index) => (
          <li key={question.key} className={styles.card}>
            <h3 className={styles.reviewQuestion}>
              Câu {index + 1}: {question.title}
            </h3>
            <ul className={styles.reviewAnswers}>
              {question.answers.map((answer, answerIndex) => (
                <li key={answer.key} className={answer.isCorrect ? styles.reviewCorrect : undefined}>
                  <span className={styles.reviewLetter}>{LETTERS[answerIndex]}</span>
                  {answer.title}
                  {answer.isCorrect && <Icon name="check" size={16} />}
                </li>
              ))}
            </ul>
            {question.explanation.trim() && <p className={styles.reviewExplanation}>{question.explanation}</p>}
          </li>
        ))}
      </ol>
    </section>
  )
}

interface QuizFormProps {
  quizId?: number
  initial: QuizDraft
  subjects: Subject[]
}

function QuizForm({ quizId, initial, subjects }: QuizFormProps) {
  const navigate = useNavigate()
  const isUpdate = quizId !== undefined
  const [draft, setDraft] = useState<QuizDraft>(initial)
  const [step, setStep] = useState<Step>(0)
  const [current, setCurrent] = useState(0)
  const [infoErrors, setInfoErrors] = useState<InfoErrors>({})
  const [showQuestionErrors, setShowQuestionErrors] = useState(false)
  const [phase, setPhase] = useState<Phase>('editing')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!isUpdate && phase !== 'done') storeDraft(draft)
  }, [draft, isUpdate, phase])

  const patch = (next: Partial<QuizDraft>) => {
    setDraft((prev) => ({ ...prev, ...next }))
    setInfoErrors((prev) => {
      const copy = { ...prev }
      for (const key of Object.keys(next)) delete copy[key as keyof InfoErrors]
      return copy
    })
  }

  const goTo = (target: Step) => {
    if (target <= step) {
      setStep(target)
      return
    }
    const errors = validateInfo(draft)
    setInfoErrors(errors)
    if (Object.keys(errors).length > 0) {
      setStep(0)
      return
    }
    if (target === 2) {
      const invalid = draft.questions.findIndex((question) => validateQuestion(question) !== null)
      if (invalid !== -1) {
        setShowQuestionErrors(true)
        setCurrent(invalid)
        setStep(1)
        return
      }
    }
    setStep(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    setPhase('submitting')
    setSubmitError('')
    const context = contextFromDraft(draft)
    try {
      if (isUpdate) await quizApi.update(quizId, context)
      else await quizApi.create(context)
      storeDraft(null)
      setPhase('done')
    } catch (error) {
      setSubmitError(apiMessage(error))
      setPhase('editing')
    }
  }

  const restart = () => {
    storeDraft(null)
    setDraft(emptyDraft())
    setStep(0)
    setCurrent(0)
    setShowQuestionErrors(false)
    setPhase('editing')
  }

  return (
    <>
      <Stepper step={step} onGo={goTo} />

      {step === 0 && <InfoStep draft={draft} errors={infoErrors} subjects={subjects} onChange={patch} />}
      {step === 1 && (
        <QuestionsStep
          questions={draft.questions}
          current={Math.min(current, draft.questions.length - 1)}
          showErrors={showQuestionErrors}
          onSelect={setCurrent}
          onChange={(update) => setDraft((prev) => ({ ...prev, questions: update(prev.questions) }))}
        />
      )}
      {step === 2 && <ReviewStep draft={draft} subjects={subjects} />}

      {submitError && (
        <p className={styles.errorBox} role="alert">
          <Icon name="info" size={16} />
          {submitError}
        </p>
      )}

      <div className={styles.actions}>
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((step - 1) as Step)}>
            Quay lại
          </Button>
        ) : (
          <span />
        )}
        {step < 2 ? (
          <Button onClick={() => goTo((step + 1) as Step)}>
            Tiếp tục
            <Icon name="arrow-right" size={16} />
          </Button>
        ) : (
          <Button onClick={() => setPhase('confirming')} disabled={phase === 'submitting'}>
            {isUpdate ? 'Cập nhật & gửi duyệt' : 'Gửi duyệt bài kiểm tra'}
          </Button>
        )}
      </div>

      <Modal
        open={phase === 'confirming' || phase === 'submitting'}
        tone="warning"
        title={isUpdate ? 'Gửi lại bài kiểm tra?' : 'Gửi duyệt bài kiểm tra?'}
        onClose={phase === 'confirming' ? () => setPhase('editing') : undefined}
        actions={
          <>
            <Button variant="outline" onClick={() => setPhase('editing')} disabled={phase === 'submitting'}>
              Quay lại
            </Button>
            <Button onClick={submit} disabled={phase === 'submitting'}>
              {phase === 'submitting' ? 'Đang gửi...' : 'Xác nhận'}
            </Button>
          </>
        }
      >
        {`Bài kiểm tra gồm ${draft.questions.length} câu sẽ ở trạng thái chờ duyệt cho tới khi được quản trị viên duyệt.`}
      </Modal>

      <Modal
        open={phase === 'done'}
        tone="success"
        title={isUpdate ? 'Đã cập nhật bài kiểm tra!' : 'Đã gửi bài kiểm tra!'}
        actions={
          <div className={styles.successActions}>
            <Button block onClick={() => navigate(PATHS.myQuizzes)}>
              Xem bài kiểm tra của tôi
            </Button>
            {!isUpdate && (
              <Button block variant="outline" onClick={restart}>
                Tạo bài kiểm tra khác
              </Button>
            )}
          </div>
        }
      >
        Bài kiểm tra đang chờ duyệt. Bạn có thể theo dõi trạng thái trong “Bài kiểm tra của tôi”.
      </Modal>
    </>
  )
}

export default function QuizFormPage({ mode }: { mode: 'create' | 'update' }) {
  const quizId = Number(useParams().quizId)
  const isUpdate = mode === 'update'
  const subjects = useRequest(subjectApi.list, 'subjects')
  const context = useRequest(() => quizApi.getContext(quizId), `quiz-context-${quizId}`, isUpdate)
  const locked = isUpdate && (context.data?.attemptCount ?? 0) > 0

  const initial = isUpdate ? context.data && draftFromContext(context.data) : (loadStoredDraft() ?? emptyDraft())

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Bài kiểm tra', to: PATHS.quizLibrary },
          { label: 'Bài kiểm tra của tôi', to: PATHS.myQuizzes },
          { label: isUpdate ? 'Sửa bài' : 'Tạo bài mới' },
        ]}
        title={isUpdate ? 'Sửa bài kiểm tra' : 'Tạo bài kiểm tra'}
        description="Soạn câu hỏi trắc nghiệm một đáp án đúng. Bài sẽ hiển thị sau khi được duyệt."
      />
      <Container>
        <StateView
          loading={subjects.loading || context.loading}
          error={subjects.error || context.error}
          onRetry={() => {
            subjects.reload()
            context.reload()
          }}
          empty={locked || !initial}
          emptyText="Bài kiểm tra đã có người làm nên không sửa được. Hãy tạo bài mới."
        >
          {initial && (
            <div className={styles.page}>
              <QuizForm
                key={context.data?.id ?? 'new'}
                quizId={isUpdate ? quizId : undefined}
                initial={initial}
                subjects={subjects.data ?? []}
              />
            </div>
          )}
        </StateView>
        {locked && (
          <p className={styles.lockedLinks}>
            <Link to={PATHS.myQuizzes}>Về bài kiểm tra của tôi</Link>
            <Link to={PATHS.quizCreate}>Tạo bài mới</Link>
          </p>
        )}
      </Container>
    </>
  )
}
