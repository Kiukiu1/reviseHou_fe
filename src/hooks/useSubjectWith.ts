import { subjectApi } from '../services/api/subjectApi'
import type { Subject } from '../types/document'
import { useRequest } from './useRequest'

export function useSubjectWith<T>(subjectId: number, loadItems: (subjectId: number) => Promise<T[]>, key: string) {
  return useRequest(async (): Promise<{ subject: Subject | undefined; items: T[] }> => {
    const [subjects, items] = await Promise.all([subjectApi.list(), loadItems(subjectId)])
    return { subject: subjects.find((subject) => subject.id === subjectId), items }
  }, `${key}-${subjectId}`)
}
