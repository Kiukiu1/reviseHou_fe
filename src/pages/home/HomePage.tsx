import { Link } from 'react-router-dom'
import banner from '../../assets/images/banner.png'
import Icon, { type IconName } from '../../components/common/Icon'
import StateView from '../../components/common/StateView'
import DocumentCard from '../../components/document/DocumentCard'
import QuizCard from '../../components/quiz/QuizCard'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import SearchBox from '../../layouts/components/SearchBox'
import { PATHS } from '../../routes/paths'
import { documentApi } from '../../services/api/documentApi'
import { quizApi } from '../../services/api/quizApi'
import { subjectApi } from '../../services/api/subjectApi'
import { buildSubjectTree } from '../../utils/subjectTree'
import styles from './HomePage.module.css'

const ENTRY_POINTS: { icon: IconName; title: string; text: string; to: string; cta: string }[] = [
  {
    icon: 'nav-document',
    title: 'Thư viện tài liệu',
    text: 'Giáo trình, đề cương, đề thi do sinh viên và giảng viên chia sẻ, đã được kiểm duyệt theo từng môn.',
    to: PATHS.documentLibrary,
    cta: 'Mở thư viện',
  },
  {
    icon: 'nav-test',
    title: 'Luyện bài kiểm tra',
    text: 'Làm bài trắc nghiệm có giờ, nộp là biết điểm ngay, xem lại đáp án và lời giải từng câu.',
    to: PATHS.quizLibrary,
    cta: 'Chọn bài kiểm tra',
  },
  {
    icon: 'upload',
    title: 'Chia sẻ tài liệu',
    text: 'Tải lên tài liệu bạn có, giảng viên phụ trách môn sẽ duyệt trước khi hiển thị cho mọi người.',
    to: PATHS.documentCreate,
    cta: 'Tải tài liệu lên',
  },
]

const STEPS = [
  { title: 'Chọn khoa, ngành, môn', text: 'Tìm đúng môn bạn đang học trong cây khoa – ngành – môn.' },
  { title: 'Đọc tài liệu', text: 'Xem trực tiếp trên web, không cần tải về.' },
  { title: 'Làm bài kiểm tra', text: 'Mỗi trang 10 câu, đáp án được lưu khi sang trang.' },
  { title: 'Xem lại kết quả', text: 'Biết câu đúng, câu sai, lời giải và lịch sử điểm.' },
]

const MAX_FACULTIES = 6
const MAX_MAJORS = 3

const FACULTY_TONES = [styles.toneBlue, styles.toneGreen, styles.toneAmber, styles.toneRose]

function firstNameOf(fullName?: string) {
  const words = fullName?.trim().split(/\s+/) ?? []
  return words[words.length - 1] ?? 'bạn'
}

export default function HomePage() {
  const { user } = useAuth()
  const documents = useRequest(documentApi.listApproved, 'home-documents')
  const quizzes = useRequest(() => quizApi.list(), 'home-quizzes')
  const subjects = useRequest(subjectApi.list, 'home-subjects')

  const faculties = buildSubjectTree(subjects.data ?? [])
  const latestDocuments = (documents.data ?? []).slice(0, 4)
  const popularQuizzes = [...(quizzes.data ?? [])].sort((a, b) => b.attemptCount - a.attemptCount).slice(0, 4)

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={`${styles.eyebrow} ${styles.reveal}`}>Xin chào, {firstNameOf(user?.fullName)}</p>
            <h1 className={`${styles.heroTitle} ${styles.reveal}`}>
              Học lại,
              <br />
              nhớ <em>mãi mãi.</em>
            </h1>
            <p className={`${styles.heroText} ${styles.reveal}`}>
              Nơi sinh viên Đại học Mở Hà Nội ôn tập cùng nhau: tài liệu đã kiểm duyệt theo từng môn và bài kiểm tra
              chấm điểm ngay.
            </p>
            <div className={`${styles.heroSearch} ${styles.reveal}`}>
              <SearchBox className={styles.searchBox} />
            </div>
          </div>

          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.paper}>
              <img src={banner} alt="" width={347} height={157} />
            </div>
            <div className={`${styles.floatCard} ${styles.floatTop}`}>
              <Icon name="check-circle" size={20} />
              <span>
                <strong>Đã duyệt</strong>
                Giáo trình Lập trình hướng đối tượng
              </span>
            </div>
            <div className={`${styles.floatCard} ${styles.floatBottom}`}>
              <span className={styles.scoreBadge}>9.0</span>
              <span>
                <strong>Điểm bài kiểm tra</strong>
                Cấu trúc dữ liệu · 15 phút
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section} aria-labelledby="entry-title">
          <header className={styles.sectionHead}>
            <p className={styles.kicker}>Bắt đầu từ đâu</p>
            <h2 id="entry-title" className={styles.sectionTitle}>
              Ba việc bạn có thể làm ngay
            </h2>
          </header>
          <div className={styles.entries}>
            {ENTRY_POINTS.map((entry, index) => (
              <Link key={entry.title} to={entry.to} className={styles.entry}>
                <span className={styles.entryIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.entryIcon}>
                  <Icon name={entry.icon} size={26} />
                </span>
                <h3>{entry.title}</h3>
                <p>{entry.text}</p>
                <span className={styles.entryCta}>
                  {entry.cta}
                  <Icon name="arrow-right" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faculty-title">
          <header className={styles.sectionHeadRow}>
            <div>
              <p className={styles.kicker}>Khám phá theo khoa</p>
              <h2 id="faculty-title" className={styles.sectionTitle}>
                Chọn khoa của bạn
              </h2>
            </div>
            {faculties.length > MAX_FACULTIES && (
              <Link to={PATHS.documentLibrary} className={styles.moreLink}>
                Xem tất cả {faculties.length} khoa
                <Icon name="arrow-right" size={16} />
              </Link>
            )}
          </header>
          <StateView
            loading={subjects.loading}
            error={subjects.error}
            onRetry={subjects.reload}
            empty={faculties.length === 0}
            emptyText="Chưa có khoa nào."
          >
            <div className={styles.faculties}>
              {faculties.slice(0, MAX_FACULTIES).map((faculty, index) => {
                const subjectCount = faculty.majors.reduce((sum, major) => sum + major.subjects.length, 0)
                const hiddenMajors = faculty.majors.length - MAX_MAJORS
                return (
                  <Link
                    key={faculty.id}
                    to={`${PATHS.documentLibrary}?faculty=${faculty.id}`}
                    className={`${styles.faculty} ${FACULTY_TONES[index % FACULTY_TONES.length]}`}
                  >
                    <span className={styles.facultyCode}>{faculty.code}</span>
                    <h3>{faculty.name}</h3>
                    <p className={styles.facultyMeta}>
                      {faculty.majors.length} ngành · {subjectCount} môn học
                    </p>
                    <ul className={styles.majors}>
                      {faculty.majors.slice(0, MAX_MAJORS).map((major) => (
                        <li key={major.id}>{major.name}</li>
                      ))}
                      {hiddenMajors > 0 && <li className={styles.moreMajors}>+{hiddenMajors} ngành</li>}
                    </ul>
                    <span className={styles.facultyArrow}>
                      <Icon name="arrow-right" size={18} />
                    </span>
                  </Link>
                )
              })}
            </div>
          </StateView>
        </section>

        <section className={styles.section} aria-labelledby="docs-title">
          <header className={styles.sectionHeadRow}>
            <div>
              <p className={styles.kicker}>Mới cập nhật</p>
              <h2 id="docs-title" className={styles.sectionTitle}>
                Tài liệu mới được duyệt
              </h2>
            </div>
            <Link to={PATHS.documentLibrary} className={styles.moreLink}>
              Xem thư viện
              <Icon name="arrow-right" size={16} />
            </Link>
          </header>
          <StateView
            loading={documents.loading}
            error={documents.error}
            onRetry={documents.reload}
            empty={latestDocuments.length === 0}
            emptyText="Chưa có tài liệu nào được duyệt."
          >
            <div className={styles.cardRow}>
              {latestDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </StateView>
        </section>

        <section className={styles.section} aria-labelledby="quiz-title">
          <header className={styles.sectionHeadRow}>
            <div>
              <p className={styles.kicker}>Được làm nhiều</p>
              <h2 id="quiz-title" className={styles.sectionTitle}>
                Bài kiểm tra nổi bật
              </h2>
            </div>
            <Link to={PATHS.quizLibrary} className={styles.moreLink}>
              Tất cả bài kiểm tra
              <Icon name="arrow-right" size={16} />
            </Link>
          </header>
          <StateView
            loading={quizzes.loading}
            error={quizzes.error}
            onRetry={quizzes.reload}
            empty={popularQuizzes.length === 0}
            emptyText="Chưa có bài kiểm tra nào."
          >
            <div className={styles.cardRow}>
              {popularQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </StateView>
        </section>

        <section className={`${styles.section} ${styles.howto}`} aria-labelledby="howto-title">
          <header className={styles.sectionHead}>
            <p className={styles.kicker}>Cách ôn tập trên Revise HOU</p>
            <h2 id="howto-title" className={styles.sectionTitle}>
              Bốn bước, không cần hướng dẫn
            </h2>
          </header>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.cta} aria-labelledby="cta-title">
          <div>
            <h2 id="cta-title" className={styles.ctaTitle}>
              Có tài liệu hay? <em>Chia sẻ cho cả lớp.</em>
            </h2>
            <p className={styles.ctaText}>
              Tài liệu sẽ được giảng viên phụ trách môn duyệt trước khi xuất hiện trong thư viện.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link to={PATHS.documentCreate} className={styles.ctaPrimary}>
              <Icon name="upload" size={20} />
              Tải tài liệu lên
            </Link>
            <Link to={PATHS.myDocuments} className={styles.ctaSecondary}>
              Tài liệu của tôi
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
