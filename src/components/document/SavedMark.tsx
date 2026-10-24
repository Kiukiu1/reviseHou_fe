import Icon from '../common/Icon'
import styles from './SavedMark.module.css'

export default function SavedMark() {
  return (
    <span className={styles.mark} aria-label="Đã lưu">
      <Icon name="bookmark" size={16} />
    </span>
  )
}
