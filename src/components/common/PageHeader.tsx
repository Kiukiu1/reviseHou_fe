import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Container from './Container'
import Icon, { type IconName } from './Icon'
import styles from './PageHeader.module.css'

export interface Crumb {
  label: string
  to?: string
}

export interface MetaItem {
  icon: IconName
  label: ReactNode
}

interface PageHeaderProps {
  breadcrumbs?: Crumb[]
  title: ReactNode
  leading?: ReactNode
  description?: ReactNode
  meta?: MetaItem[]
  actions?: ReactNode
  footer?: ReactNode
  width?: 'wide' | 'normal' | 'narrow'
}

export default function PageHeader({
  breadcrumbs,
  title,
  leading,
  description,
  meta,
  actions,
  footer,
  width = 'normal',
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <Container width={width} className={styles.inner}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className={styles.breadcrumbs}>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <li key={`${crumb.label}-${index}`} className={isLast ? styles.current : undefined}>
                    {crumb.to && !isLast ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        <div className={styles.body}>
          <div className={styles.main}>
            <div className={styles.titleRow}>
              {leading}
              <h1 className={styles.title}>{title}</h1>
            </div>
            {description && <p className={styles.description}>{description}</p>}
            {meta && meta.length > 0 && (
              <ul className={styles.meta}>
                {meta.map((item, index) => (
                  <li key={index}>
                    <Icon name={item.icon} size={17} />
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </Container>
    </header>
  )
}
