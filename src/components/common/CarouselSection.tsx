import { useRef, type ReactNode } from 'react'
import Icon from './Icon'
import StateView from './StateView'
import styles from './CarouselSection.module.css'

interface CarouselSectionProps {
  title: ReactNode
  count: number
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  emptyText?: string
  children: ReactNode
}

export default function CarouselSection({
  title,
  count,
  loading,
  error,
  onRetry,
  emptyText,
  children,
}: CarouselSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const ready = !loading && !error && count > 0

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {ready && (
          <div className={styles.controls}>
            <button type="button" className={styles.control} onClick={() => scroll(-1)} aria-label="Xem trước">
              <Icon name="chevron-right" size={16} className={styles.flip} />
            </button>
            <button type="button" className={styles.control} onClick={() => scroll(1)} aria-label="Xem tiếp">
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        )}
      </div>
      <StateView loading={loading} error={error} onRetry={onRetry} empty={count === 0} emptyText={emptyText}>
        <div ref={trackRef} className={styles.track}>
          {children}
        </div>
      </StateView>
    </section>
  )
}
