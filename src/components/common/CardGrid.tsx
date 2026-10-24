import type { ReactNode } from 'react'
import Pagination from './Pagination'
import styles from './CardGrid.module.css'

interface CardGridProps {
  children: ReactNode
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export default function CardGrid({ children, page, totalPages, onPageChange }: CardGridProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.grid}>{children}</div>
      {page !== undefined && totalPages !== undefined && onPageChange && (
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      )}
    </div>
  )
}
