import { useState } from 'react'
import { useParams } from 'react-router-dom'
import likeFilled from '../../assets/images/like-filled.svg'
import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import PageHeader from '../../components/common/PageHeader'
import StateView from '../../components/common/StateView'
import StatusBadge from '../../components/common/StatusBadge'
import CommentSection from '../../components/document/CommentSection'
import DocumentCard from '../../components/document/DocumentCard'
import DocumentViewer from '../../components/document-viewer/DocumentViewer'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import { useSavedToggle } from '../../hooks/useSaved'
import { PATHS } from '../../routes/paths'
import { documentApi } from '../../services/api/documentApi'
import { formatDate } from '../../utils/format'
import styles from './DocumentDetailPage.module.css'

const RELATED_LIMIT = 6

async function loadDetail(id: number) {
  const document = await documentApi.get(id)
  const related = document.subject ? await documentApi.listApprovedBySubject(document.subject.id) : []
  return { document, related: related.filter((item) => Number(item.id) !== id).slice(0, RELATED_LIMIT) }
}

export default function DocumentDetailPage() {
  const documentId = Number(useParams().documentId)
  const { user } = useAuth()
  const { data, loading, error, reload } = useRequest(() => loadDetail(documentId), `document-${documentId}`)
  const document = data?.document
  const { saved, toggle } = useSavedToggle('DOCUMENT', document ? Number(document.id) : undefined)
  const [liked, setLiked] = useState(false)
  const isOwner = !!document && document.uploader?.id === user?.id

  const scrollToComments = () => globalThis.document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <StateView loading={loading} error={error} onRetry={reload} empty={!document} emptyText="Không tìm thấy tài liệu.">
      {document && (
        <>
          <PageHeader
            width="wide"
            breadcrumbs={[
              { label: 'Tài liệu' },
              { label: 'Thư viện tài liệu', to: PATHS.documentLibrary },
              ...(document.subject
                ? [{ label: document.subject.name, to: PATHS.subjectDocuments(document.subject.id) }]
                : []),
              { label: document.title },
            ]}
            title={document.title}
            meta={[
              ...(document.subject ? [{ icon: 'graduation-cap' as const, label: document.subject.name }] : []),
              { icon: 'calendar', label: formatDate(document.dateCreated) },
              ...(document.uploader ? [{ icon: 'student' as const, label: document.uploader.fullName }] : []),
            ]}
            actions={
              <>
                {document.status !== 'ACTIVE' && <StatusBadge status={document.status} />}
                {isOwner && (
                  <Button variant="outline" size="sm" to={PATHS.documentEdit(document.id)}>
                    Chỉnh sửa
                  </Button>
                )}
              </>
            }
            footer={
              <div className={styles.actionBar}>
                <button
                  type="button"
                  className={liked ? `${styles.action} ${styles.liked}` : styles.action}
                  onClick={() => setLiked((prev) => !prev)}
                  aria-pressed={liked}
                >
                  {liked ? <img src={likeFilled} alt="" width={16} height={14} /> : <Icon name="heart" size={16} />}
                  {liked ? 'Đã thích' : 'Thích'}
                </button>
                <button type="button" className={styles.action} onClick={scrollToComments}>
                  <Icon name="comment" />
                  Bình luận
                </button>
                <button
                  type="button"
                  className={saved ? `${styles.action} ${styles.saved}` : styles.action}
                  onClick={toggle}
                  aria-pressed={saved}
                >
                  <Icon name="bookmark" size={16} />
                  {saved ? 'Đã lưu' : 'Lưu'}
                </button>
                <button type="button" className={styles.action} disabled title="Tính năng đang phát triển">
                  <Icon name="flag" />
                  Báo cáo
                </button>
              </div>
            }
          />

          <Container width="wide" className={styles.page}>
            {document.status === 'REJECTED' && document.rejectReason && (
              <p className={styles.rejected} role="note">
                <Icon name="info" size={20} />
                Lý do từ chối: {document.rejectReason}
              </p>
            )}

            <div className={styles.viewer}>
              <DocumentViewer document={document} />
            </div>

            <hr className={styles.divider} />

            <div className={styles.columns}>
              <CommentSection id="comments" sourceType="DOCUMENT" sourceId={Number(document.id)} />
              {data.related.length > 0 && (
                <aside className={styles.related} aria-labelledby="related-title">
                  <h2 id="related-title" className={styles.relatedTitle}>
                    Tài liệu cùng môn học
                  </h2>
                  <div className={styles.relatedGrid}>
                    {data.related.map((item) => (
                      <DocumentCard key={item.id} document={item} compact />
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </Container>
        </>
      )}
    </StateView>
  )
}
