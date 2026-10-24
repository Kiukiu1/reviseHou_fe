import type { CommentItem, CommentSourceType, CreateCommentPayload } from '../../types/comment'
import { http } from '../http/httpClient'

export const commentApi = {
  async list(sourceType: CommentSourceType, sourceId: number): Promise<CommentItem[]> {
    const { data } = await http.get<CommentItem[]>('/comments', { params: { sourceType, sourceId } })
    return data
  },

  async create(payload: CreateCommentPayload): Promise<CommentItem> {
    const { data } = await http.post<CommentItem>('/comments', payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/comments/${id}`)
  },
}
