import { useSearchParams } from 'react-router-dom'
import folder from '../../assets/images/folder-lg.svg'
import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import PageHeader from '../../components/common/PageHeader'
import SelectMenu from '../../components/common/SelectMenu'
import StateView from '../../components/common/StateView'
import SubjectTile from '../../components/document/SubjectTile'
import { useRequest } from '../../hooks/useRequest'
import { PATHS } from '../../routes/paths'
import { subjectApi } from '../../services/api/subjectApi'
import { buildSubjectTree, type MajorNode } from '../../utils/subjectTree'
import styles from './SubjectPickerPage.module.css'

type Target = 'document' | 'quiz'

const ALL = 'all'

const COPY: Record<
  Target,
  { section: string; library: string; libraryPath: string; description: string; action: string; actionPath: string }
> = {
  document: {
    section: 'Tài liệu',
    library: 'Thư viện tài liệu',
    libraryPath: PATHS.documentLibrary,
    description: 'Chọn khoa, ngành rồi chọn môn học bạn muốn ôn tập để khám phá tài liệu liên quan.',
    action: 'Tải tài liệu lên',
    actionPath: PATHS.documentCreate,
  },
  quiz: {
    section: 'Bài kiểm tra',
    library: 'Chọn môn học',
    libraryPath: PATHS.quizLibrary,
    description: 'Chọn khoa, ngành rồi chọn môn học để xem danh sách bài kiểm tra.',
    action: 'Tạo bài kiểm tra',
    actionPath: PATHS.quizCreate,
  },
}

function matches(keyword: string, ...values: (string | null | undefined)[]) {
  return values.some((value) => value?.toLowerCase().includes(keyword))
}

export default function SubjectPickerPage({ target }: { target: Target }) {
  const subjects = useRequest(subjectApi.list, 'subjects')
  const [params, setParams] = useSearchParams()
  const copy = COPY[target]
  const tree = buildSubjectTree(subjects.data ?? [])

  const facultyId = params.get('faculty') ?? ALL
  const majorId = params.get('major') ?? ALL
  const keyword = (params.get('q') ?? '').trim().toLowerCase()
  const faculty = tree.find((item) => String(item.id) === facultyId)
  const majorsInScope = faculty ? faculty.majors : tree.flatMap((item) => item.majors)
  const selectedMajor = majorsInScope.find((item) => String(item.id) === majorId)

  const updateParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === ALL) next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  const groups: (MajorNode & { facultyName: string })[] = (faculty ? [faculty] : tree).flatMap((item) =>
    item.majors
      .filter((major) => !selectedMajor || major.id === selectedMajor.id)
      .map((major) => ({
        ...major,
        facultyName: item.name,
        subjects: major.subjects.filter((subject) => !keyword || matches(keyword, subject.title, subject.code)),
      }))
      .filter((major) => major.subjects.length > 0),
  )

  const facultyOptions = [
    { value: ALL, label: 'Tất cả khoa' },
    ...tree.map((item) => ({ value: String(item.id), label: item.name })),
  ]
  const majorOptions = [
    { value: ALL, label: 'Tất cả ngành' },
    ...majorsInScope.map((item) => ({ value: String(item.id), label: item.name })),
  ]

  const linkFor = (id: number) => (target === 'document' ? PATHS.subjectDocuments(id) : PATHS.subjectQuizzes(id))

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: copy.section }, { label: copy.library, to: copy.libraryPath }]}
        leading={<img src={folder} alt="" width={40} height={40} />}
        title="Chọn môn học"
        description={copy.description}
        actions={
          <Button to={copy.actionPath}>
            <Icon name="plus" />
            {copy.action}
          </Button>
        }
      />
      <Container>
        <div className={styles.toolbar}>
          <SelectMenu
            label="Khoa"
            value={faculty ? facultyId : ALL}
            options={facultyOptions}
            onChange={(value) => updateParams({ faculty: value, major: ALL })}
          />
          <SelectMenu
            label="Ngành"
            value={selectedMajor ? majorId : ALL}
            options={majorOptions}
            onChange={(value) => updateParams({ major: value })}
          />
          <label htmlFor="subject-filter" className="visually-hidden">
            Lọc môn học
          </label>
          <input
            id="subject-filter"
            className={styles.filter}
            type="search"
            placeholder="Lọc theo tên hoặc mã môn"
            value={params.get('q') ?? ''}
            onChange={(event) => updateParams({ q: event.target.value })}
          />
        </div>

        <StateView
          loading={subjects.loading && !subjects.data}
          error={subjects.error}
          onRetry={subjects.reload}
          empty={groups.length === 0}
          emptyText={keyword ? 'Không tìm thấy môn học phù hợp.' : 'Chưa có môn học nào.'}
        >
          <div className={styles.groups}>
            {groups.map((major) => (
              <section key={major.id} className={styles.group} aria-labelledby={`major-${major.id}`}>
                <div className={styles.groupHead}>
                  <h2 id={`major-${major.id}`} className={styles.groupTitle}>
                    {major.name}
                  </h2>
                  <span className={styles.groupMeta}>
                    {major.facultyName} · {major.subjects.length} môn
                  </span>
                </div>
                <div className={styles.grid}>
                  {major.subjects.map((subject) => (
                    <SubjectTile key={subject.id} subject={subject} to={linkFor(subject.id)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </StateView>
      </Container>
    </>
  )
}
