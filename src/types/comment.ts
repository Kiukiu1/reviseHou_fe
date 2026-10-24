export type CommentSourceType = 'DOCUMENT' | 'QUIZ'

export interface CommentUser {
  id: number
  username: string
  avatarUrl?: string | null
}

export interface CommentItem {
  id: number
  parentId: number | null
  content: string | null
  deleted: boolean
  createdAt: string
  updateAt: string
  user: CommentUser
  replyToUser: CommentUser | null
  replies?: CommentItem[]
}

export interface CreateCommentPayload {
  sourceType: CommentSourceType
  sourceId: number
  content: string
  parentId?: number
  replyToUserId?: number
}
