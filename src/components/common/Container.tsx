import type { ReactNode } from 'react'
import styles from './Container.module.css'

interface ContainerProps {
  children: ReactNode
  width?: 'wide' | 'normal' | 'narrow'
  className?: string
}

export default function Container({ children, width = 'normal', className }: ContainerProps) {
  return <div className={[styles.container, styles[width], className].filter(Boolean).join(' ')}>{children}</div>
}
