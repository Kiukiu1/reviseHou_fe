import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'
import styles from './Modal.module.css'

type Tone = 'warning' | 'success' | 'danger'

interface ModalProps {
  open: boolean
  tone: Tone
  title: string
  children?: ReactNode
  actions: ReactNode
  onClose?: () => void
}

const TONE_ICON: Record<Tone, IconName> = {
  warning: 'help-circle',
  success: 'check-circle',
  danger: 'trash',
}

const ignoreClose = () => {}

export default function Modal({ open, tone, title, children, actions, onClose }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose ?? ignoreClose}>
      <div className={styles.overlay}>
        <DialogPanel className={styles.dialog}>
          <span className={`${styles.badge} ${styles[tone]}`}>
            <Icon name={TONE_ICON[tone]} size={24} />
          </span>
          <DialogTitle as="h2" className={styles.title}>
            {title}
          </DialogTitle>
          {children && <div className={styles.body}>{children}</div>}
          <div className={styles.actions}>{actions}</div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
