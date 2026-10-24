import Avatar from '../../components/common/Avatar'
import Container from '../../components/common/Container'
import Icon, { type IconName } from '../../components/common/Icon'
import { useAuth } from '../../hooks/useAuth'
import { usePreferences } from '../../hooks/usePreferences'
import { formatDate } from '../../utils/format'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { preferences, update } = usePreferences()

  const infoItems: { icon: IconName; label: string; value: string; tone: string }[] = [
    { icon: 'mail', label: 'Email', value: user?.email ?? '', tone: styles.toneBlue },
    { icon: 'user', label: 'Tên hiển thị', value: user?.username ?? '', tone: styles.toneDark },
    ...(user?.createdAt
      ? [
          {
            icon: 'calendar' as const,
            label: 'Ngày tham gia',
            value: formatDate(user.createdAt),
            tone: styles.toneGreen,
          },
        ]
      : []),
  ]

  return (
    <Container width="narrow" className={styles.page}>
      <h1 className={styles.title}>
        <Icon name="nav-setting" />
        Cài đặt
      </h1>

      <section className={styles.card} aria-label="Thông tin tài khoản">
        <div className={styles.profile}>
          <span className={styles.avatarRing}>
            <Avatar name={user?.username} src={user?.avatarUrl} size={48} />
          </span>
          <div className={styles.profileText}>
            <strong>{user?.username}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <dl className={styles.info}>
          {infoItems.map((item) => (
            <div key={item.label} className={styles.infoItem}>
              <Icon name={item.icon} className={item.tone} />
              <div>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.card} aria-labelledby="notify-title">
        <h2 id="notify-title" className={styles.cardTitle}>
          <Icon name="bell" className={styles.toneBlue} />
          Thông báo
        </h2>
        <div className={styles.toggleRow}>
          <div>
            <p className={styles.toggleLabel}>Thông báo trong ứng dụng</p>
            <p className={styles.toggleHint}>Nhận thông báo về tài liệu và hoạt động</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.notifications}
            aria-label="Thông báo trong ứng dụng"
            className={preferences.notifications ? `${styles.switch} ${styles.switchOn}` : styles.switch}
            onClick={() => update({ notifications: !preferences.notifications })}
          >
            <span className={styles.knob} />
          </button>
        </div>
      </section>

      <section className={styles.card} aria-labelledby="account-title">
        <h2 id="account-title" className={styles.cardTitle}>
          <Icon name="user" className={styles.toneBlue} />
          Tài khoản
        </h2>
        <button type="button" className={styles.logout} onClick={signOut}>
          <Icon name="logout" />
          Đăng xuất khỏi tài khoản hiện tại
        </button>
      </section>
    </Container>
  )
}
