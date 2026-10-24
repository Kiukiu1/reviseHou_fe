import { useState } from 'react'
import { useParams } from 'react-router-dom'
import folder from '../../assets/images/folder-lg.svg'
import CardGrid from '../../components/common/CardGrid'
import Container from '../../components/common/Container'
import PageHeader from '../../components/common/PageHeader'
import SelectMenu from '../../components/common/SelectMenu'
import StateView from '../../components/common/StateView'
import QuizCard from '../../components/quiz/QuizCard'
import { usePaged } from '../../hooks/usePaged'
import { useSubjectWith } from '../../hooks/useSubjectWith'
import { PATHS } from '../../routes/paths'
import { quizApi } from '../../services/api/quizApi'
import styles from '../documents/SubjectDocumentsPage.module.css'

type Sort = 'popular' | 'newest'

const SORT_OPTIONS = [
  { value: 'popular' as const, label: 'Phổ biến' },
  { value: 'newest' as const, label: 'Mới nhất' },
]

const PAGE_SIZE = 12

export default function SubjectQuizzesPage() {
  const subjectId = Number(useParams().subjectId)
  const { data, loading, error, reload } = useSubjectWith(subjectId, quizApi.list, 'subject-quizzes')
  const [sort, setSort] = useState<Sort>('popular')
  const subject = data?.subject

  const quizzes = [...(data?.items ?? [])].sort((a, b) =>
    sort === 'popular' ? b.attemptCount - a.attemptCount : b.dateCreated.localeCompare(a.dateCreated),
  )
  const paged = usePaged(quizzes, PAGE_SIZE)

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Bài kiểm tra' },
          { label: 'Chọn môn học', to: PATHS.quizLibrary },
          { label: subject?.name ?? '...' },
        ]}
        leading={<img src={folder} alt="" width={40} height={40} />}
        title={subject?.name ?? (loading ? 'Đang tải...' : 'Môn học')}
        meta={[
          ...(subject?.major
            ? [{ icon: 'graduation-cap' as const, label: `${subject.major.faculty.name} · ${subject.major.name}` }]
            : []),
          ...(subject?.code ? [{ icon: 'subject-cap' as const, label: subject.code }] : []),
          { icon: 'quiz-sm', label: `${quizzes.length} bài kiểm tra` },
        ]}
      />
      <Container>
        <div className={styles.toolbar}>
          <SelectMenu label="Sắp xếp" value={sort} options={SORT_OPTIONS} onChange={setSort} />
        </div>
        <StateView
          loading={loading}
          error={error}
          onRetry={reload}
          empty={!subject || quizzes.length === 0}
          emptyText={subject ? 'Môn học này chưa có bài kiểm tra.' : 'Không tìm thấy môn học.'}
        >
          <CardGrid page={paged.page} totalPages={paged.totalPages} onPageChange={paged.setPage}>
            {paged.items.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </CardGrid>
        </StateView>
      </Container>
    </>
  )
}
