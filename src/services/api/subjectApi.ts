import type { Subject } from '../../types/document'
import { http } from '../http/httpClient'

export const subjectApi = {
  async list(): Promise<Subject[]> {
    const { data } = await http.get<Subject[]>('/subjects')
    return data.filter((subject) => subject.status === 'ACTIVE')
  },
}
