import { useState } from 'react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import StateView from '../../components/common/StateView'
import DocumentRow from '../../components/document/DocumentRow'
import { useAuth } from '../../hooks/useAuth'
import { usePaged } from '../../hooks/usePaged'
import { useRequest } from '../../hooks/useRequest'
import { documentApi } from '../../services/api/documentApi'
import type { DocumentItem, DocumentStatus } from '../../types/document'
import styles from './MyDocumentsPanel.module.css'

type Tab = 'ALL' | Extract<DocumentStatus, 'PENDING' | 'ACTIVE' | 'REJECTED'>

const TABS: { value: Tab; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'ACTIVE', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
]

const PAGE_SIZE = 5

export default function MyDocumentsPanel() {
  const { user } = useAuth()
  const userId = user?.id ?? 0
  const { data, loading, error, reload } = useRequest(() => documentApi.listByAuthor(userId), `my-documents-${userId}`)
  const [tab, setTab] = useState<Tab>('ALL')
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const documents = (data ?? []).filter((document) => tab === 'ALL' || document.status === tab)
  const paged = usePaged(documents, PAGE_SIZE)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await documentApi.remove(pendingDelete.id)
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
              item.value === 'ALL' ? data?.length : data?.filter((document) => document.status === item.value).length
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                className={tab === item.value ? `${styles.tab} ${styles.activeTab}` : styles.tab}
                onClick={() => {
                  setTab(item.value)
                  paged.setPage(1)
                }}
              >
                {item.label}
                {count !== undefined && <span className={styles.count}>{count}</span>}
              </button>
            )
          })}
        </div>

        <StateView
          loading={loading && !data}
          error={error}
          onRetry={reload}
          empty={documents.length === 0}
          emptyText={tab === 'ALL' ? 'Bạn chưa tải lên tài liệu nào.' : 'Không có tài liệu ở trạng thái này.'}
        >
          <ul className={styles.list}>
            {paged.items.map((document) => (
              <DocumentRow key={document.id} document={document} onDelete={setPendingDelete} />
            ))}
          </ul>
          <Pagination page={paged.page} totalPages={paged.totalPages} onChange={paged.setPage} />
        </StateView>
      </div>

      <Modal
        open={pendingDelete !== null}
        tone="danger"
        title="Xóa tài liệu?"
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
        Tài liệu “{pendingDelete?.title}” sẽ bị xóa vĩnh viễn và không thể khôi phục.
        {deleteError && <p className={styles.error}>{deleteError}</p>}
      </Modal>
    </>
  )
}
