import { useState } from 'react'
import quizIcon from '../../assets/images/quiz.svg'
import Button from '../../components/common/Button'
import Icon from '../../components/common/Icon'
import Modal from '../../components/common/Modal'
import StateView from '../../components/common/StateView'
import StatusBadge from '../../components/common/StatusBadge'
import { useRequest } from '../../hooks/useRequest'
import { PATHS } from '../../routes/paths'
import { quizApi } from '../../services/api/quizApi'
import type { MyQuiz, QuizStatus } from '../../types/quiz'
import { formatDate } from '../../utils/format'
import styles from './MyQuizzesPanel.module.css'

type Tab = 'ALL' | Exclude<QuizStatus, 'INACTIVE'>

const TABS: { value: Tab; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'ACTIVE', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
]

export default function MyQuizzesPanel() {
  const { data, loading, error, reload } = useRequest(quizApi.mine, 'my-quizzes')
  const [tab, setTab] = useState<Tab>('ALL')
  const [pendingDelete, setPendingDelete] = useState<MyQuiz | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const quizzes = (data ?? []).filter((quiz) => tab === 'ALL' || quiz.status === tab)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await quizApi.remove(pendingDelete.id)
      setPendingDelete(null)
      reload()
    } catch {
      setDeleteError('Xóa không thành công, vui lòng thử lại.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div>
        <div className={styles.tabs} role="tablist" aria-label="Lọc theo trạng thái">
          {TABS.map((item) => {
            const count =
              item.value === 'ALL' ? data?.length : data?.filter((quiz) => quiz.status === item.value).length
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                className={tab === item.value ? `${styles.tab} ${styles.activeTab}` : styles.tab}
                onClick={() => setTab(item.value)}
              >
                {item.label}
                {count !== undefined && <span className={styles.count}>{count}</span>}
              </button>
            )
          })}
        </div>

        <StateView
          loading={loading}
          error={error}
          onRetry={reload}
          empty={quizzes.length === 0}
          emptyText={tab === 'ALL' ? 'Bạn chưa tạo bài kiểm tra nào.' : 'Không có bài kiểm tra ở trạng thái này.'}
        >
          <ul className={styles.list}>
            {quizzes.map((quiz) => {
              const locked = quiz.attemptCount > 0
              return (
                <li key={quiz.id} className={styles.row}>
                  <img src={quizIcon} alt="" width={44} height={47} className={styles.icon} />
                  <div className={styles.info}>
                    <div className={styles.titleLine}>
                      <h3 className={styles.title}>{quiz.name}</h3>
                      <StatusBadge status={quiz.status} />
                    </div>
                    <p className={styles.meta}>
                      <span>
                        <Icon name="folder-sm" />
                        {quiz.subject.name}
                      </span>
                      <span>
                        <Icon name="list" />
                        {quiz.totalQuestion} câu
                      </span>
                      <span>
                        <Icon name="clock" />
                        {quiz.estimateMinute} phút
                      </span>
                      <span>
                        <Icon name="user" />
                        {quiz.attemptCount} lượt làm
                      </span>
                      <span>
                        <Icon name="calendar" />
                        Cập nhật {formatDate(quiz.dateModified)}
                      </span>
                    </p>
                    {quiz.status === 'REJECTED' && quiz.rejectReason && (
                      <p className={styles.reason}>Lý do từ chối: {quiz.rejectReason}</p>
                    )}
                  </div>
                  <div className={styles.actions}>
                    {quiz.status === 'ACTIVE' && (
                      <Button variant="muted" size="sm" to={PATHS.quizDetail(quiz.id)}>
                        Xem bài
                      </Button>
                    )}
                    {!locked && (
                      <Button variant="outline" size="sm" to={PATHS.quizEdit(quiz.id)}>
                        Chỉnh sửa
                      </Button>
                    )}
                    <button
                      type="button"
                      className={styles.delete}
                      onClick={() => setPendingDelete(quiz)}
                      aria-label={`Xóa ${quiz.name}`}
                      title="Xóa"
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </StateView>
      </div>

      <Modal
        open={pendingDelete !== null}
        tone="danger"
        title="Xóa bài kiểm tra?"
        onClose={deleting ? undefined : () => setPendingDelete(null)}
        actions={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Quay lại
            </Button>
            <Button onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </>
        }
      >
        Bài “{pendingDelete?.name}” sẽ bị ẩn khỏi danh sách và người khác không làm được nữa.
        {deleteError && <p className={styles.error}>{deleteError}</p>}
      </Modal>
    </>
  )
}
