import type { CommentSourceType } from '../../types/comment'
import type { DocumentItem } from '../../types/document'
import type { QuizSummary } from '../../types/quiz'
import { http } from '../http/httpClient'

export type SavedSourceType = CommentSourceType

export interface SavedKey {
  sourceType: SavedSourceType
  sourceId: number
}

interface SavedList {
  documents: DocumentItem[]
  quizzes: QuizSummary[]
}

export const savedApi = {
  async keys(): Promise<SavedKey[]> {
    const { data } = await http.get<SavedKey[]>('/saved/keys')
    return data
  },

  async list(): Promise<SavedList> {
    const { data } = await http.get<SavedList>('/saved')
    return data
  },

  async save(key: SavedKey): Promise<void> {
    await http.post('/saved', key)
  },

  async remove(key: SavedKey): Promise<void> {
    await http.delete('/saved', { params: key })
  },
}
