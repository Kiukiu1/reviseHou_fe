import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PATHS } from '../routes/paths'
import Footer from './components/Footer'
import Header from './components/Header'
import styles from './MainLayout.module.css'

export default function MainLayout() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const showSearch = pathname !== PATHS.home

  return (
    <div className={styles.shell}>
      <Header
        showSearch={showSearch}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
        onCloseMenu={() => setMenuOpen(false)}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
