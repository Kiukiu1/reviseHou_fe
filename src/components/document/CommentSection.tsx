import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import { commentApi } from '../../services/api/commentApi'
import type { CommentItem, CommentSourceType } from '../../types/comment'
import { formatDate } from '../../utils/format'
import Avatar from '../common/Avatar'
import Icon from '../common/Icon'
import StateView from '../common/StateView'
import styles from './CommentSection.module.css'

const PAGE_SIZE = 5
const MAX_LENGTH = 1000

interface ComposerProps {
  id: string
  placeholder: string
  autoFocus?: boolean
  onSubmit: (content: string) => Promise<void>
}

function Composer({ id, placeholder, autoFocus, onSubmit }: ComposerProps) {
  const { user } = useAuth()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setError('')
    try {
      await onSubmit(content)
      setDraft('')
    } catch {
      setError('Gửi bình luận không thành công, vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Avatar name={user?.username} src={user?.avatarUrl} size={32} />
      <div className={styles.composer}>
        <div className={styles.inputBox}>
          <label htmlFor={id} className="visually-hidden">
            {placeholder}
          </label>
          <input
            id={id}
            className={styles.input}
            placeholder={placeholder}
            value={draft}
            maxLength={MAX_LENGTH}
            autoFocus={autoFocus}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className={styles.send} aria-label="Gửi bình luận" disabled={!draft.trim() || sending}>
            <Icon name="send" />
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </form>
  )
}

interface CommentProps {
  comment: CommentItem
  rootId: number
  replyingTo: number | null
  onReply: (comment: CommentItem) => void
  onCreateReply: (rootId: number, target: CommentItem, content: string) => Promise<void>
  onDelete: (comment: CommentItem) => void
}

function Comment({ comment, rootId, replyingTo, onReply, onCreateReply, onDelete }: CommentProps) {
  const { user } = useAuth()
  const isOwner = user?.id === comment.user.id
  const nested = comment.parentId !== null

  return (
    <li className={nested ? `${styles.comment} ${styles.nested}` : styles.comment}>
      <Avatar name={comment.user.username} src={comment.user.avatarUrl} />
      <div className={styles.commentBody}>
        <div className={styles.commentHead}>
          <strong>{comment.deleted ? 'Bình luận đã bị xóa' : comment.user.username}</strong>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.date}>{formatDate(comment.createdAt)}</span>
        </div>
        {!comment.deleted && (
          <p className={styles.content}>
            {comment.replyToUser && <span className={styles.mention}>@{comment.replyToUser.username} </span>}
            {comment.content}
          </p>
        )}
        {!comment.deleted && (
          <div className={styles.commentFoot}>
            <button type="button" className={styles.link} onClick={() => onReply(comment)}>
              Trả lời
            </button>
            {isOwner && (
              <button type="button" className={`${styles.link} ${styles.danger}`} onClick={() => onDelete(comment)}>
                Xóa
              </button>
            )}
          </div>
        )}
        {replyingTo === comment.id && (
          <Composer
            id={`reply-${comment.id}`}
            placeholder={`Trả lời ${comment.user.username}`}
            autoFocus
            onSubmit={(content) => onCreateReply(rootId, comment, content)}
          />
        )}
        {comment.replies && comment.replies.length > 0 && (
          <ul className={styles.list}>
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                rootId={rootId}
                replyingTo={replyingTo}
                onReply={onReply}
                onCreateReply={onCreateReply}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

interface CommentSectionProps {
  id?: string
  sourceType: CommentSourceType
  sourceId: number
  placeholder?: string
}

export default function CommentSection({
  id,
  sourceType,
  sourceId,
  placeholder = 'Đánh giá của bạn về tài liệu này',
}: CommentSectionProps) {
  const { data, loading, error, reload } = useRequest(
    () => commentApi.list(sourceType, sourceId),
    `comments-${sourceType}-${sourceId}`,
  )
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')
  const comments = data ?? []

  const createRoot = async (content: string) => {
    await commentApi.create({ sourceType, sourceId, content })
    reload()
  }

  const createReply = async (rootId: number, target: CommentItem, content: string) => {
    await commentApi.create({
      sourceType,
      sourceId,
      content,
      parentId: rootId,
      replyToUserId: target.parentId === null ? undefined : target.user.id,
    })
    setReplyingTo(null)
    reload()
  }

  const remove = async (comment: CommentItem) => {
    if (!window.confirm('Xóa bình luận này?')) return
    setActionError('')
    try {
      await commentApi.remove(comment.id)
      reload()
    } catch {
      setActionError('Xóa bình luận không thành công.')
    }
  }

  return (
    <section id={id} className={styles.section} aria-labelledby="comments-title">
      <h2 id="comments-title" className={styles.title}>
        Bình luận {comments.length > 0 && <span className={styles.count}>({comments.length})</span>}
      </h2>
      <Composer id="comment-input" placeholder={placeholder} onSubmit={createRoot} />
      {actionError && <p className={styles.error}>{actionError}</p>}
      <StateView
        loading={loading && !data}
        error={error}
        onRetry={reload}
        empty={comments.length === 0}
        emptyText="Chưa có bình luận nào. Hãy là người đầu tiên!"
      >
        <ul className={styles.list}>
          {comments.slice(0, visible).map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              rootId={comment.id}
              replyingTo={replyingTo}
              onReply={(target) => setReplyingTo((prev) => (prev === target.id ? null : target.id))}
              onCreateReply={createReply}
              onDelete={remove}
            />
          ))}
        </ul>
      </StateView>
      {visible < comments.length && (
        <button type="button" className={styles.more} onClick={() => setVisible((prev) => prev + PAGE_SIZE)}>
          Tải thêm bình luận
        </button>
      )}
    </section>
  )
}
