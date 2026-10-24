import Button from '../common/Button'
import Icon from '../common/Icon'
import styles from './SaveButton.module.css'

interface SaveButtonProps {
  saved: boolean
  onToggle: () => void
}

export default function SaveButton({ saved, onToggle }: SaveButtonProps) {
  return (
    <Button variant="outline" onClick={onToggle} aria-pressed={saved} className={saved ? styles.saved : undefined}>
      <Icon name="bookmark" />
      {saved ? 'Đã lưu' : 'Lưu'}
    </Button>
  )
}
