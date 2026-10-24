import { useEffect, useRef, useState } from 'react'
import documentIcon from '../../assets/images/document-lg.svg'
import { PATHS } from '../../routes/paths'
import type { DocumentItem } from '../../types/document'
import { formatDate } from '../../utils/format'
import Button from '../common/Button'
import Icon from '../common/Icon'
import StatusBadge from '../common/StatusBadge'
import styles from './DocumentRow.module.css'

interface DocumentRowProps {
  document: DocumentItem
  onDelete: (document: DocumentItem) => void
}

export default function DocumentRow({ document, onDelete }: DocumentRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    globalThis.document.addEventListener('mousedown', handleClick)
    return () => globalThis.document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <li className={styles.row}>
      <img src={documentIcon} alt="" width={64} height={64} className={styles.thumb} />
      <div className={styles.info}>
        <div className={styles.titleLine}>
          <h3 className={styles.title}>{document.title}</h3>
          <StatusBadge status={document.status} />
        </div>
        {document.subject && (
          <span className={styles.meta}>
            <Icon name="folder-sm" />
            {document.subject.name}
          </span>
        )}
        <span className={styles.meta}>
          <Icon name="calendar" />
          {formatDate(document.dateCreated)}
        </span>
        {document.status === 'REJECTED' && document.rejectReason && (
          <span className={styles.reason}>Lý do: {document.rejectReason}</span>
        )}
      </div>
      <div className={styles.side}>
        <div ref={menuRef} className={styles.menuRoot}>
          <button
            type="button"
            className={styles.kebab}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Thao tác khác"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Icon name="kebab" />
          </button>
          {menuOpen && (
            <div className={styles.menu} role="menu">
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false)
                  onDelete(document)
                }}
              >
                <Icon name="trash" />
                Xóa
              </button>
            </div>
          )}
        </div>
        <div className={styles.buttons}>
          <Button variant="outline" size="sm" to={PATHS.documentEdit(document.id)} className={styles.edit}>
            Chỉnh sửa
          </Button>
          <Button variant="muted" size="sm" to={PATHS.documentDetail(document.id)}>
            Xem chi tiết
          </Button>
        </div>
      </div>
    </li>
  )
}
