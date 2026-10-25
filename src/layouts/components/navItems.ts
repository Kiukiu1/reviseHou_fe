import { PATHS } from '../../routes/paths'

interface NavItem {
  label: string
  to: string
  isActive: (pathname: string) => boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Tài liệu', to: PATHS.documentLibrary, isActive: (pathname) => pathname.startsWith('/documents') },
  {
    label: 'Bài kiểm tra',
    to: PATHS.quizLibrary,
    isActive: (pathname) => pathname.startsWith('/quizzes') || pathname.startsWith('/attempts'),
  },
  { label: 'Góc của tôi', to: PATHS.mine, isActive: (pathname) => pathname === PATHS.mine },
]
