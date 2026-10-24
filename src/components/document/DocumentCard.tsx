import { Link } from 'react-router-dom'
import documentIcon from '../../assets/images/document-lg.svg'
import { PATHS } from '../../routes/paths'
import type { DocumentItem } from '../../types/document'
import { formatDate, isImageUrl } from '../../utils/format'
import Icon from '../common/Icon'
import SavedMark from './SavedMark'
import styles from './DocumentCard.module.css'

interface DocumentCardProps {
  document: DocumentItem
  saved?: boolean
  compact?: boolean
}

export default function DocumentCard({ document, saved, compact }: DocumentCardProps) {
  const isImage = isImageUrl(document.filePath)

  return (
    <Link to={PATHS.documentDetail(document.id)} className={compact ? `${styles.card} ${styles.compact}` : styles.card}>
      <div className={styles.thumb}>
        {isImage && document.filePath ? (
          <img src={document.filePath} alt="" className={styles.cover} loading="lazy" />
        ) : (
          <img src={documentIcon} alt="" width={64} height={64} />
        )}
        {saved && <SavedMark />}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{document.title}</h3>
        <div className={styles.meta}>
          {document.subject && (
            <span className={styles.metaItem}>
              <Icon name="folder-sm" />
              <span className={styles.ellipsis}>{document.subject.name}</span>
            </span>
          )}
          <span className={styles.metaItem}>
            <Icon name="calendar" />
            {formatDate(document.dateCreated)}
          </span>
        </div>
      </div>
    </Link>
  )
}
