import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import { PATHS } from '../../routes/paths'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <Container width="narrow" className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Không tìm thấy trang</h1>
      <p className={styles.text}>Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Button to={PATHS.home}>Về trang chủ</Button>
    </Container>
  )
}
