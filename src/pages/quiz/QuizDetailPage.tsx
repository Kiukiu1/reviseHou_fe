import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import quizIcon from '../../assets/images/quiz.svg'
import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import PageHeader from '../../components/common/PageHeader'
import StateView from '../../components/common/StateView'
import CommentSection from '../../components/document/CommentSection'
import SaveButton from '../../components/document/SaveButton'
import { useRequest } from '../../hooks/useRequest'
import { useSavedToggle } from '../../hooks/useSaved'
import { PATHS } from '../../routes/paths'
import { quizApi } from '../../services/api/quizApi'
import type { AttemptHistory, QuizSummary } from '../../types/quiz'
import { formatDate } from '../../utils/format'
import { QUESTIONS_PER_PAGE } from './attemptRules'
import styles from './QuizDetailPage.module.css'

function isOpen(item: AttemptHistory, quiz: QuizSummary) {
  const deadline = new Date(item.dateStarted).getTime() + quiz.estimateMinute * 60_000
  return item.status === 'IN_PROGRESS' && deadline > Date.now()
}

export default function QuizDetailPage() {
  const quizId = Number(useParams().quizId)
  const navigate = useNavigate()
  const quizRequest = useRequest(() => quizApi.get(quizId), `quiz-${quizId}`)
  const historyRequest = useRequest(() => quizApi.history(quizId), `quiz-history-${quizId}`)
  const quiz = quizRequest.data
  const { saved, toggle } = useSavedToggle('QUIZ', quiz?.id)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const start = async () => {
    setStarting(true)
    setError('')
    try {
      const attempt = await quizApi.startAttempt(quizId)
      navigate(PATHS.attempt(attempt.id))
    } catch {
      setError('Không bắt đầu được bài kiểm tra, vui lòng thử lại.')
      setStarting(false)
    }
  }

  return (
    <StateView
      loading={quizRequest.loading}
      error={quizRequest.error}
      onRetry={quizRequest.reload}
      empty={!quiz}
      emptyText="Không tìm thấy bài kiểm tra."
    >
      {quiz && (
        <>
          <PageHeader
            width="wide"
            breadcrumbs={[
              { label: 'Bài kiểm tra', to: PATHS.quizLibrary },
              { label: quiz.subject.name, to: PATHS.subjectQuizzes(quiz.subject.id) },
              { label: quiz.name },
            ]}
            title={quiz.name}
            meta={[
              { icon: 'folder-sm', label: quiz.subject.name },
              { icon: 'clock', label: `${quiz.estimateMinute} phút` },
              { icon: 'quiz-sm', label: `${quiz.totalQuestion} câu hỏi` },
              { icon: 'user', label: `${quiz.attemptCount} lượt làm` },
            ]}
            actions={<SaveButton saved={saved} onToggle={toggle} />}
          />

          <Container width="wide" className={styles.page}>
            <div className={styles.columns}>
              <section className={styles.card} aria-labelledby="quiz-intro">
                <div className={styles.intro}>
                  <img src={quizIcon} alt="" width={59} height={63} />
                  <div>
                    <h2 id="quiz-intro" className={styles.cardTitle}>
                      Sẵn sàng làm bài?
                    </h2>
                    {quiz.description && <p className={styles.description}>{quiz.description}</p>}
                  </div>
                </div>
                <ul className={styles.rules}>
                  <li>
                    <Icon name="clock" size={18} />
                    Thời gian làm bài {quiz.estimateMinute} phút, hết giờ hệ thống tự nộp.
                  </li>
                  <li>
                    <Icon name="list" size={18} />
                    {quiz.totalQuestion} câu, mỗi trang {QUESTIONS_PER_PAGE} câu. Đáp án được lưu khi bấm “Tiếp theo”.
                  </li>
                  <li>
                    <Icon name="check-circle" size={18} />
                    Mỗi lượt chỉ nộp một lần. Muốn làm lại thì bắt đầu lượt mới.
                  </li>
                </ul>
                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}
                <Button size="lg" onClick={start} disabled={starting} className={styles.start}>
                  {starting ? 'Đang chuẩn bị...' : 'Bắt đầu làm bài'}
                </Button>
              </section>

              <aside className={styles.card} aria-labelledby="quiz-history">
                <h2 id="quiz-history" className={styles.cardTitle}>
                  Lịch sử làm bài
                </h2>
                <StateView
                  loading={historyRequest.loading}
                  error={historyRequest.error}
                  onRetry={historyRequest.reload}
                  empty={(historyRequest.data ?? []).length === 0}
                  emptyText="Bạn chưa làm bài này."
                >
                  <ul className={styles.history}>
                    {(historyRequest.data ?? []).map((item) => (
                      <li key={item.id}>
                        <span className={styles.historyDate}>{formatDate(item.dateSubmitted ?? item.dateStarted)}</span>
                        {item.status === 'SUBMITTED' ? (
                          <strong>{item.score ?? 0} điểm</strong>
                        ) : (
                          <span className={styles.pending}>{isOpen(item, quiz) ? 'Đang làm' : 'Chưa nộp'}</span>
                        )}
                        <Link to={PATHS.attempt(item.id)} className={styles.historyLink}>
                          {item.status === 'SUBMITTED' ? 'Xem lại' : 'Mở'}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </StateView>
              </aside>
            </div>

            <CommentSection
              sourceType="QUIZ"
              sourceId={quiz.id}
              placeholder="Chia sẻ cảm nhận của bạn về bài kiểm tra"
            />
          </Container>
        </>
      )}
    </StateView>
  )
}
