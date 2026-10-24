import { Link } from 'react-router-dom'
import folder from '../../assets/images/folder-lg.svg'
import type { Subject } from '../../types/document'
import Icon from '../common/Icon'
import styles from './SubjectTile.module.css'

interface SubjectTileProps {
  subject: Subject
  to: string
}

export default function SubjectTile({ subject, to }: SubjectTileProps) {
  const subtitle = [subject.code, subject.major?.faculty.name].filter(Boolean).join(' · ')
  return (
    <Link to={to} className={styles.tile}>
      <img src={folder} alt="" width={40} height={40} />
      <div className={styles.body}>
        <h3 className={styles.title}>{subject.name}</h3>
        {subtitle && (
          <span className={styles.meta}>
            <Icon name="subject-cap" />
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  )
}
