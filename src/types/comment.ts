export type CommentSourceType = 'DOCUMENT' | 'QUIZ'

interface CommentUser {
  id: string
  fullName: string
  avatar?: string | null
}

export interface CommentItem {
  id: number
  parentId: number | null
  content: string | null
  deleted: boolean
  dateCreated: string
  user: CommentUser
  replyToUser: CommentUser | null
  replies?: CommentItem[]
}

export interface CreateCommentPayload {
  sourceType: CommentSourceType
  sourceId: number
  content: string
  parentId?: number
  replyToUserId?: string
}
