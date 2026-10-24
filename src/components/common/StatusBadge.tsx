import type { DocumentStatus } from '../../types/document'
import styles from './StatusBadge.module.css'

const LABELS: Record<DocumentStatus, string> = {
  PENDING: 'Chờ duyệt',
  ACTIVE: 'Đã duyệt',
  REJECTED: 'Từ chối',
  INACTIVE: 'Đã ẩn',
}

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{LABELS[status]}</span>
}
