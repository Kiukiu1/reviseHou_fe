export const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']
export const MAX_FILE_SIZE = 10 * 1024 * 1024

export function fileError(file: File): string | undefined {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ACCEPTED_EXTENSIONS.includes(extension)) return 'Chỉ hỗ trợ tệp PDF, DOC, DOCX, PPT, PPTX.'
  if (file.size > MAX_FILE_SIZE) return 'Tệp vượt quá dung lượng tối đa 10 MB.'
  return undefined
}
