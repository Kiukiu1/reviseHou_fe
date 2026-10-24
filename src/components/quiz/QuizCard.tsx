import { Link } from 'react-router-dom'
import quizIcon from '../../assets/images/quiz.svg'
import { PATHS } from '../../routes/paths'
import type { QuizSummary } from '../../types/quiz'
import Icon from '../common/Icon'
import SavedMark from '../document/SavedMark'
import styles from './QuizCard.module.css'

interface QuizCardProps {
  quiz: QuizSummary
  saved?: boolean
}

export default function QuizCard({ quiz, saved }: QuizCardProps) {
  return (
    <Link to={PATHS.quizDetail(quiz.id)} className={styles.card}>
      <div className={styles.top}>
        <div className={styles.cover}>
          <img src={quizIcon} alt="" width={59} height={63} />
          {saved && <SavedMark />}
        </div>
        <ul className={styles.stats}>
          <li>
            <Icon name="clock" />
            {quiz.estimateMinute} Phút
          </li>
          <li>
            <Icon name="list" />
            {quiz.totalQuestion} Câu
          </li>
          <li>
            <Icon name="user" />
            {quiz.attemptCount}
          </li>
        </ul>
      </div>
      <h3 className={styles.title}>{quiz.name}</h3>
      <span className={styles.subject}>
        <Icon name="folder-sm" />
        <span className={styles.ellipsis}>{quiz.subject.name}</span>
      </span>
    </Link>
  )
}
