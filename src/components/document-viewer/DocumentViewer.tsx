import Icon from '../common/Icon'
import type { DocumentItem } from '../../types/document'
import { fileExtension } from '../../utils/format'
import styles from './DocumentViewer.module.css'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif']
const OFFICE_EXTENSIONS = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']

function viewerSource(url: string, extension: string) {
  if (OFFICE_EXTENSIONS.includes(extension)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
  }
  return url
}

export default function DocumentViewer({ document }: { document: DocumentItem }) {
  const url = document.fileUrl
  const extension = fileExtension(url)
  const label = extension ? extension.toUpperCase() : 'Nội dung'

  return (
    <section className={styles.viewer} aria-label="Xem tài liệu">
      <div className={styles.toolbar}>
        <span>{document.attachments?.fileName ?? label}</span>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className={styles.open}>
            Mở tab mới
            <Icon name="external" size={16} />
          </a>
        )}
      </div>
      <div className={styles.stage}>
        {url && IMAGE_EXTENSIONS.includes(extension) ? (
          <img src={url} alt={document.title} className={styles.image} />
        ) : url ? (
          <iframe src={viewerSource(url, extension)} title={document.title} className={styles.frame} />
        ) : (
          <article className={styles.paper}>
            <h2>{document.title}</h2>
            {document.description && <p className={styles.lead}>{document.description}</p>}
            <p>{document.content}</p>
          </article>
        )}
      </div>
    </section>
  )
}
