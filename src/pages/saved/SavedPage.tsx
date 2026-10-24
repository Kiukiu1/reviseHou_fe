import CarouselSection from '../../components/common/CarouselSection'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import DocumentCard from '../../components/document/DocumentCard'
import QuizCard from '../../components/quiz/QuizCard'
import { useRequest } from '../../hooks/useRequest'
import { savedApi } from '../../services/api/savedApi'
import styles from './SavedPage.module.css'

export default function SavedPage() {
  const { data, loading, error, reload } = useRequest(savedApi.list, 'saved-list')
  const documents = data?.documents ?? []
  const quizzes = data?.quizzes ?? []

  return (
    <Container className={styles.page}>
      <h1 className={styles.title}>
        <Icon name="bookmark" />
        Danh sách đã lưu
      </h1>

      <CarouselSection
        title="Tài liệu"
        count={documents.length}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyText="Bạn chưa lưu tài liệu nào. Bấm “Lưu” ở trang tài liệu để thêm vào đây."
      >
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} saved />
        ))}
      </CarouselSection>

      <CarouselSection
        title="Bài kiểm tra"
        count={quizzes.length}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyText="Bạn chưa lưu bài kiểm tra nào. Bấm “Lưu” ở trang bài kiểm tra để thêm vào đây."
      >
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} saved />
        ))}
      </CarouselSection>
    </Container>
  )
}
