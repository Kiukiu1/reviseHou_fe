import type { UploadedFile } from '../../types/document'
import { http } from '../http/httpClient'

export const uploadApi = {
  async upload(file: File): Promise<UploadedFile> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await http.post<UploadedFile>('/upload', form)
    return data
  },
}
