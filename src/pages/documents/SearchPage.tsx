import { useSearchParams } from 'react-router-dom'
import CardGrid from '../../components/common/CardGrid'
import Container from '../../components/common/Container'
import PageHeader from '../../components/common/PageHeader'
import StateView from '../../components/common/StateView'
import DocumentCard from '../../components/document/DocumentCard'
import QuizCard from '../../components/quiz/QuizCard'
import { usePaged } from '../../hooks/usePaged'
import { useRequest } from '../../hooks/useRequest'
import { documentApi } from '../../services/api/documentApi'
import { quizApi } from '../../services/api/quizApi'
import { matches } from '../../utils/format'
import styles from './SearchPage.module.css'

const PAGE_SIZE = 12

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const keyword = query.toLowerCase()
  const documents = useRequest(documentApi.listApproved, 'search-documents')
  const quizzes = useRequest(() => quizApi.list(), 'search-quizzes')

  const documentResults = (documents.data ?? []).filter((document) =>
    matches(keyword, document.title, document.description, document.subject?.name),
  )
  const quizResults = (quizzes.data ?? []).filter((quiz) => matches(keyword, quiz.name, quiz.subject.name))
  const paged = usePaged(documentResults, PAGE_SIZE)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Tìm kiếm' }]}
        title={`Kết quả cho “${query}”`}
        description={`${documentResults.length} tài liệu · ${quizResults.length} bài kiểm tra`}
      />
      <Container className={styles.page}>
        <section className={styles.section}>
          <h2 className={styles.heading}>Tài liệu</h2>
          <StateView
            loading={documents.loading}
            error={documents.error}
            onRetry={documents.reload}
            empty={documentResults.length === 0}
            emptyText="Không tìm thấy tài liệu phù hợp."
          >
            <CardGrid page={paged.page} totalPages={paged.totalPages} onPageChange={paged.setPage}>
              {paged.items.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </CardGrid>
          </StateView>
        </section>

        {quizResults.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.heading}>Bài kiểm tra</h2>
            <CardGrid>
              {quizResults.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </CardGrid>
          </section>
        )}
      </Container>
    </>
  )
}
