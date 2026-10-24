import { PATHS } from '../../routes/paths'

export interface NavItem {
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
  { label: 'Của tôi', to: PATHS.mine, isActive: (pathname) => pathname === PATHS.mine },
]
