import type { DocumentItem, DocumentPayload } from '../../types/document'
import { http } from '../http/httpClient'

const byNewest = (a: DocumentItem, b: DocumentItem) => b.createdAt.localeCompare(a.createdAt)

const approvedOnly = (documents: DocumentItem[]) =>
  documents.filter((document) => document.status === 'ACTIVE').sort(byNewest)

export const documentApi = {
  async listApproved(): Promise<DocumentItem[]> {
    const { data } = await http.get<DocumentItem[]>('/documents')
    return approvedOnly(data)
  },

  async listApprovedBySubject(subjectId: number): Promise<DocumentItem[]> {
    const { data } = await http.get<DocumentItem[]>(`/documents/subject/${subjectId}`)
    return approvedOnly(data)
  },

  async listByAuthor(authorId: number): Promise<DocumentItem[]> {
    const { data } = await http.get<DocumentItem[]>(`/documents/author/${authorId}`)
    return data.sort(byNewest)
  },

  async get(id: number): Promise<DocumentItem> {
    const { data } = await http.get<DocumentItem>(`/documents/${id}`)
    return data
  },

  async create(authorId: number, payload: DocumentPayload): Promise<DocumentItem> {
    const { data } = await http.post<DocumentItem>('/documents', { ...payload, authorId })
    return data
  },

  async update(id: number, payload: DocumentPayload): Promise<DocumentItem> {
    const { data } = await http.patch<DocumentItem>(`/documents/${id}`, {
      ...payload,
      updateAt: new Date().toISOString(),
    })
    return data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/documents/${id}`)
  },
}
