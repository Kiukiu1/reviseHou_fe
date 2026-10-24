import { useState } from 'react'
import { useParams } from 'react-router-dom'
import folder from '../../assets/images/folder-lg.svg'
import Button from '../../components/common/Button'
import CardGrid from '../../components/common/CardGrid'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import PageHeader from '../../components/common/PageHeader'
import SelectMenu from '../../components/common/SelectMenu'
import StateView from '../../components/common/StateView'
import DocumentCard from '../../components/document/DocumentCard'
import { usePaged } from '../../hooks/usePaged'
import { useSubjectWith } from '../../hooks/useSubjectWith'
import { PATHS } from '../../routes/paths'
import { documentApi } from '../../services/api/documentApi'
import styles from './SubjectDocumentsPage.module.css'

type Sort = 'newest' | 'oldest'

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Mới nhất' },
  { value: 'oldest' as const, label: 'Cũ nhất' },
]

const PAGE_SIZE = 12

export default function SubjectDocumentsPage() {
  const subjectId = Number(useParams().subjectId)
  const { data, loading, error, reload } = useSubjectWith(
    subjectId,
    documentApi.listApprovedBySubject,
    'subject-documents',
  )
  const [sort, setSort] = useState<Sort>('newest')
  const subject = data?.subject

  const documents = [...(data?.items ?? [])]
  if (sort === 'oldest') documents.reverse()
  const paged = usePaged(documents, PAGE_SIZE)

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Tài liệu' },
          { label: 'Thư viện tài liệu', to: PATHS.documentLibrary },
          { label: subject?.name ?? '...' },
        ]}
        leading={<img src={folder} alt="" width={40} height={40} />}
        title={subject?.name ?? (loading ? 'Đang tải...' : 'Môn học')}
        meta={[
          ...(subject?.major
            ? [{ icon: 'graduation-cap' as const, label: `${subject.major.faculty.name} · ${subject.major.name}` }]
            : []),
          ...(subject?.code ? [{ icon: 'subject-cap' as const, label: subject.code }] : []),
          { icon: 'document-sm', label: `${data?.items.length ?? 0} tài liệu` },
        ]}
        actions={
          subject && (
            <Button to={PATHS.subjectQuizzes(subject.id)}>
              <Icon name="nav-test" />
              Làm bài kiểm tra
              <Icon name="arrow-right" size={16} />
            </Button>
          )
        }
      />
      <Container>
        <div className={styles.toolbar}>
          <SelectMenu label="Sắp xếp" value={sort} options={SORT_OPTIONS} onChange={setSort} />
        </div>
        <StateView
          loading={loading}
          error={error}
          onRetry={reload}
          empty={!subject || documents.length === 0}
          emptyText={subject ? 'Môn học này chưa có tài liệu nào được duyệt.' : 'Không tìm thấy môn học.'}
        >
          <CardGrid page={paged.page} totalPages={paged.totalPages} onPageChange={paged.setPage}>
            {paged.items.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </CardGrid>
        </StateView>
      </Container>
    </>
  )
}
