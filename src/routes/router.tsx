import { Navigate, createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/auth/LoginPage'
import DocumentDetailPage from '../pages/documents/DocumentDetailPage'
import DocumentFormPage from '../pages/documents/DocumentFormPage'
import SearchPage from '../pages/documents/SearchPage'
import SubjectDocumentsPage from '../pages/documents/SubjectDocumentsPage'
import SubjectPickerPage from '../pages/documents/SubjectPickerPage'
import NotFoundPage from '../pages/errors/NotFoundPage'
import MinePage from '../pages/mine/MinePage'
import HomePage from '../pages/home/HomePage'
import AttemptPage from '../pages/quiz/AttemptPage'
import QuizFormPage from '../pages/quiz/QuizFormPage'
import QuizDetailPage from '../pages/quiz/QuizDetailPage'
import SubjectQuizzesPage from '../pages/quiz/SubjectQuizzesPage'
import SavedPage from '../pages/saved/SavedPage'
import SettingsPage from '../pages/settings/SettingsPage'
import { authCallbackLoader } from './authCallbackLoader'
import { PATHS } from './paths'
import RequireAuth from './RequireAuth'

export const router = createBrowserRouter([
  { path: PATHS.login, element: <LoginPage /> },
  { path: PATHS.authCallback, loader: authCallbackLoader },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: PATHS.home, element: <HomePage /> },
          { path: PATHS.search, element: <SearchPage /> },
          { path: PATHS.documentLibrary, element: <SubjectPickerPage key="document" target="document" /> },
          { path: PATHS.subjectDocuments(':subjectId'), element: <SubjectDocumentsPage /> },
          { path: PATHS.mine, element: <MinePage /> },
          { path: '/documents/mine', element: <Navigate to={PATHS.myDocuments} replace /> },
          { path: PATHS.documentCreate, element: <DocumentFormPage key="create" mode="create" /> },
          { path: PATHS.documentEdit(':documentId'), element: <DocumentFormPage key="update" mode="update" /> },
          { path: PATHS.documentDetail(':documentId'), element: <DocumentDetailPage /> },
          { path: PATHS.quizLibrary, element: <SubjectPickerPage key="quiz" target="quiz" /> },
          { path: PATHS.subjectQuizzes(':subjectId'), element: <SubjectQuizzesPage /> },
          { path: '/quizzes/mine', element: <Navigate to={PATHS.myQuizzes} replace /> },
          { path: PATHS.quizCreate, element: <QuizFormPage key="create" mode="create" /> },
          { path: PATHS.quizEdit(':quizId'), element: <QuizFormPage key="update" mode="update" /> },
          { path: PATHS.quizDetail(':quizId'), element: <QuizDetailPage /> },
          { path: PATHS.attempt(':attemptId'), element: <AttemptPage /> },
          { path: PATHS.saved, element: <SavedPage /> },
          { path: PATHS.settings, element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
