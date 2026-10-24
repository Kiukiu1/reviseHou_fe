import { useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import Icon, { type IconName } from '../../components/common/Icon'
import PageHeader from '../../components/common/PageHeader'
import { PATHS } from '../../routes/paths'
import MyDocumentsPanel from './MyDocumentsPanel'
import MyQuizzesPanel from './MyQuizzesPanel'
import styles from './MinePage.module.css'

type MineTab = 'documents' | 'quizzes'

const TABS: { value: MineTab; label: string; icon: IconName; action: string; to: string }[] = [
  {
    value: 'documents',
    label: 'Tài liệu của tôi',
    icon: 'nav-document',
    action: 'Tải tài liệu lên',
    to: PATHS.documentCreate,
  },
  {
    value: 'quizzes',
    label: 'Bài kiểm tra của tôi',
    icon: 'nav-test',
    action: 'Tạo bài kiểm tra',
    to: PATHS.quizCreate,
  },
]

export default function MinePage() {
  const [params, setParams] = useSearchParams()
  const tab: MineTab = params.get('tab') === 'quizzes' ? 'quizzes' : 'documents'
  const current = TABS.find((item) => item.value === tab)!

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Của tôi' }, { label: current.label }]}
        title="Của tôi"
        description="Theo dõi trạng thái duyệt và quản lý tài liệu, bài kiểm tra bạn đã đăng."
        actions={
          <Button to={current.to}>
            <Icon name="plus" />
            {current.action}
          </Button>
        }
        footer={
          <div className={styles.tabs} role="tablist" aria-label="Nội dung của tôi">
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                className={tab === item.value ? `${styles.tab} ${styles.active}` : styles.tab}
                onClick={() => setParams({ tab: item.value }, { replace: true })}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </button>
            ))}
          </div>
        }
      />
      <Container>{tab === 'documents' ? <MyDocumentsPanel /> : <MyQuizzesPanel />}</Container>
    </>
  )
}
