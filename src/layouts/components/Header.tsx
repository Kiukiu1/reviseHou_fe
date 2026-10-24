import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.svg'
import Icon from '../../components/common/Icon'
import { PATHS } from '../../routes/paths'
import ProfileMenu from './ProfileMenu'
import SearchBox from './SearchBox'
import ThemeToggle from './ThemeToggle'
import TopNav from './TopNav'
import styles from './Header.module.css'

interface HeaderProps {
  showSearch: boolean
  menuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
}

export default function Header({ showSearch, menuOpen, onToggleMenu, onCloseMenu }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onToggleMenu}
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
        <Link to={PATHS.home} aria-label="Revise HOU – Trang chủ" className={styles.brand}>
          <img src={logo} alt="Revise HOU" width={221} height={40} className={styles.logo} />
        </Link>

        <div className={styles.nav}>
          <TopNav />
        </div>

        <div className={styles.actions}>
          {showSearch && <SearchBox className={styles.search} />}
          <ThemeToggle />
          <Link to={PATHS.saved} className={styles.iconButton} aria-label="Danh sách đã lưu" title="Danh sách đã lưu">
            <Icon name="bookmark" />
          </Link>
          <ProfileMenu />
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobilePanel}>
          <SearchBox className={styles.mobileSearch} />
          <TopNav mobile onNavigate={onCloseMenu} />
        </div>
      )}
    </header>
  )
}
