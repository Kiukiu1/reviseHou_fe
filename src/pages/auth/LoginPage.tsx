import { Navigate, useSearchParams } from 'react-router-dom'
import logo from '../../assets/images/logo.svg'
import Icon from '../../components/common/Icon'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../routes/paths'
import { authApi } from '../../services/auth/authApi'
import { rememberReturnTo } from '../../services/auth/returnTo'
import styles from './LoginPage.module.css'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized_email: 'Chỉ chấp nhận tài khoản email của trường (@hou.edu.vn).',
  missing_tokens: 'Đăng nhập không thành công, vui lòng thử lại.',
  auth_failed: 'Đăng nhập không thành công, vui lòng thử lại.',
}

const HIGHLIGHTS = [
  'Lặp lại cách quãng dựa trên trí nhớ của bạn',
  'Flashcard thông minh tự thích nghi',
  'Theo dõi tiến độ học tập mỗi ngày',
]

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const [params] = useSearchParams()
  const error = params.get('error')

  if (isAuthenticated) return <Navigate to={PATHS.home} replace />

  const handleLogin = () => {
    rememberReturnTo(params.get('returnTo'))
    window.location.assign(authApi.googleLoginUrl())
  }

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.left}>
          <img src={logo} alt="Revise HOU" width={221} height={40} className={styles.logo} />
          <section className={styles.card} aria-labelledby="login-title">
            <h1 id="login-title" className={styles.cardTitle}>
              Chào mừng bạn đến với Revise Hou
            </h1>
            <p className={styles.cardText}>Đăng nhập bằng tài khoản email của trường để tiếp tục.</p>
            {error && (
              <p className={styles.error} role="alert">
                {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.auth_failed}
              </p>
            )}
            <button type="button" className={styles.loginButton} onClick={handleLogin}>
              Đăng nhập với HOU gmail
            </button>
            <p className={styles.terms}>Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật</p>
          </section>
        </div>

        <section className={styles.hero}>
          <h2 className={styles.heroTitle}>
            Học lại,
            <br />
            nhớ <em>mãi mãi</em>
          </h2>
          <p className={styles.heroText}>
            Hệ thống ôn tập thông minh dành cho sinh viên Đại học Mở Hà Nội – giúp bạn ghi nhớ kiến thức bền vững, đơn
            giản và hiệu quả.
          </p>
          <ul className={styles.highlights}>
            {HIGHLIGHTS.map((item) => (
              <li key={item}>
                <span className={styles.check}>
                  <Icon name="check" size={14} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className={styles.tag}>Dành cho sinh viên Trường Đại học Mở Hà Nội</p>
        </section>
      </div>
    </main>
  )
}
