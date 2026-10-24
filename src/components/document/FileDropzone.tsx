import { useRef, useState, type DragEvent } from 'react'
import Icon from '../common/Icon'
import { ACCEPTED_EXTENSIONS } from './fileRules'
import styles from './FileDropzone.module.css'

interface FileDropzoneProps {
  file: File | null
  currentFileName?: string
  invalid?: boolean
  onChange: (file: File | null) => void
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`
}

export default function FileDropzone({ file, currentFileName, invalid, onChange }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files[0]
    if (dropped) onChange(dropped)
  }

  const className = [styles.zone, dragging && styles.dragging, invalid && styles.invalid].filter(Boolean).join(' ')

  return (
    <div
      className={className}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <Icon name="upload" size={24} className={styles.icon} />
      {file ? (
        <>
          <p className={styles.title}>{file.name}</p>
          <p className={styles.hint}>{formatSize(file.size)}</p>
        </>
      ) : (
        <>
          <p className={styles.title}>Kéo thả tệp vào đây</p>
          <p className={styles.hint}>hoặc chọn tệp từ thiết bị</p>
          {currentFileName && <p className={styles.current}>Tệp hiện tại: {currentFileName}</p>}
        </>
      )}
      <p className={styles.hint}>Định dạng PDF, DOCX, PPTX · Tối đa 10 MB</p>
      <div className={styles.buttons}>
        <button type="button" className={styles.pick} onClick={() => inputRef.current?.click()}>
          {file ? 'Chọn tệp khác' : 'Chọn tệp'}
        </button>
        {file && (
          <button type="button" className={styles.pick} onClick={() => onChange(null)}>
            Bỏ chọn
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className="visually-hidden"
        tabIndex={-1}
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null)
          event.target.value = ''
        }}
      />
    </div>
  )
}
