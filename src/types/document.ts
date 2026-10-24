export type DocumentStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE'

type ActiveStatus = 'ACTIVE' | 'INACTIVE'

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
  code: string
  name: string
  description?: string | null
  status: ActiveStatus
  dateCreated: string
  major?: Major | null
}

interface DocumentUploader {
  id: string
  fullName: string
  avatar?: string | null
}

export interface DocumentItem {
  id: string
  title: string
  description?: string | null
  year?: number | null
  filePath?: string | null
  mediaType?: string | null
  status: DocumentStatus
  rejectReason?: string | null
  dateCreated: string
  subject?: Subject | null
  uploader?: DocumentUploader | null
}

export interface DocumentPayload {
  title: string
  description?: string
  year?: number
  filePath?: string
  mediaType?: string
  subjectId: number
}

export interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
}
