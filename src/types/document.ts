export type DocumentStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE'

export type ActiveStatus = 'ACTIVE' | 'INACTIVE'

export interface Faculty {
  id: number
  code: string
  name: string
  status: ActiveStatus
}

export interface Major {
  id: number
  code: string
  name: string
  status: ActiveStatus
  faculty: Faculty
}

export interface Subject {
  id: number
  title: string
  description?: string | null
  code?: string | null
  status: ActiveStatus
  createdAt: string
  major?: Major | null
}

export interface DocumentAuthor {
  id: number
  username: string
  email: string
  avatarUrl?: string | null
}

export interface DocumentAttachments {
  category?: string
  fileName?: string
  mimeType?: string
  size?: number
}

export interface DocumentItem {
  id: number
  title: string
  description?: string | null
  content: string
  status: DocumentStatus
  rejectReason?: string | null
  fileUrl?: string | null
  attachments?: DocumentAttachments | null
  createdAt: string
  updateAt: string
  subject?: Subject | null
  author?: DocumentAuthor | null
}

export interface DocumentPayload {
  title: string
  description?: string
  content: string
  subjectId: number
  fileUrl?: string
  attachments?: DocumentAttachments
}

export interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
}
