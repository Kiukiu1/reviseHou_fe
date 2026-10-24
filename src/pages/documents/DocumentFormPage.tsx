import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../components/common/Button'
import Container from '../../components/common/Container'
import Icon from '../../components/common/Icon'
import Modal from '../../components/common/Modal'
import StateView from '../../components/common/StateView'
import SubjectSelect from '../../components/common/SubjectSelect'
import FileDropzone from '../../components/document/FileDropzone'
import { fileError } from '../../components/document/fileRules'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import { PATHS } from '../../routes/paths'
import { documentApi } from '../../services/api/documentApi'
import { subjectApi } from '../../services/api/subjectApi'
import { uploadApi } from '../../services/api/uploadApi'
import type { DocumentItem, DocumentPayload, Subject } from '../../types/document'
import styles from './DocumentFormPage.module.css'

const documentSchema = (requireFile: boolean) =>
  z
    .object({
      title: z.string().trim().min(1, 'Vui lòng nhập tên tài liệu.'),
      subjectId: z.string().min(1, 'Vui lòng chọn môn học.'),
      year: z
        .string()
        .trim()
        .refine(
          (value) => value === '' || (/^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 2100),
          'Năm không hợp lệ.',
        ),
      description: z.string(),
      file: z.instanceof(File).nullable(),
    })
    .superRefine((values, context) => {
      const message = values.file ? fileError(values.file) : requireFile ? 'Vui lòng chọn tệp tài liệu.' : undefined
      if (message) context.addIssue({ code: z.ZodIssueCode.custom, path: ['file'], message })
    })

type FormValues = z.infer<ReturnType<typeof documentSchema>>

type Step = 'editing' | 'confirming' | 'submitting' | 'done'

function valuesFrom(document?: DocumentItem, presetSubjectId = ''): FormValues {
  return {
    title: document?.title ?? '',
    subjectId: document?.subject ? String(document.subject.id) : presetSubjectId,
    year: document?.year ? String(document.year) : '',
    description: document?.description ?? '',
    file: null,
  }
}

function buildPayload(
  values: FormValues,
  uploaded: Awaited<ReturnType<typeof uploadApi.upload>> | undefined,
  previous?: DocumentItem,
): DocumentPayload {
  const title = values.title.trim()
  const description = values.description.trim()
  return {
    title,
    description,
    year: values.year ? Number(values.year) : undefined,
    subjectId: Number(values.subjectId),
    filePath: uploaded?.url ?? previous?.filePath ?? undefined,
    mediaType: uploaded?.type ?? previous?.mediaType ?? undefined,
  }
}

interface DocumentFormProps {
  subjects: Subject[]
  existing?: DocumentItem
}

function DocumentForm({ subjects, existing }: DocumentFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isUpdate = existing !== undefined

  const [params] = useSearchParams()
  const preset = params.get('subjectId') ?? ''
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(documentSchema(!isUpdate)),
    defaultValues: valuesFrom(existing, subjects.some((subject) => String(subject.id) === preset) ? preset : ''),
  })
  const [step, setStep] = useState<Step>('editing')
  const [submitError, setSubmitError] = useState('')

  const submit = async () => {
    if (!user) return
    setStep('submitting')
    setSubmitError('')
    try {
      const values = getValues()
      const uploaded = values.file ? await uploadApi.upload(values.file) : undefined
      const payload = buildPayload(values, uploaded, existing)
      if (existing) await documentApi.update(existing.id, payload)
      else await documentApi.create(user.id, payload)
      setStep('done')
    } catch {
      setSubmitError('Gửi tài liệu không thành công. Vui lòng kiểm tra lại tệp hoặc thử lại sau.')
      setStep('editing')
    }
  }

  const titleClass = [styles.control, errors.title && styles.invalid].filter(Boolean).join(' ')

  return (
    <>
      <form className={styles.card} onSubmit={handleSubmit(() => setStep('confirming'))} noValidate>
        <h1 className={styles.heading}>{isUpdate ? 'Cập nhật tài liệu' : 'Tải tài liệu lên'}</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>01 · Thông tin tài liệu</h2>

          <div className={styles.field}>
            <label htmlFor="doc-title">Tên tài liệu *</label>
            <input
              id="doc-title"
              className={titleClass}
              placeholder="Ví dụ: Giáo trình Lập trình hướng đối tượng"
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title && <p className={styles.error}>{errors.title.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="doc-subject">Môn học *</label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <SubjectSelect
                  id="doc-subject"
                  subjects={subjects}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.subjectId}
                  triggerClassName={styles.control}
                />
              )}
            />
            {errors.subjectId && <p className={styles.error}>{errors.subjectId.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="doc-year">Năm</label>
            <input
              id="doc-year"
              inputMode="numeric"
              maxLength={4}
              className={[styles.control, errors.year && styles.invalid].filter(Boolean).join(' ')}
              placeholder="Ví dụ: 2025"
              aria-invalid={!!errors.year}
              {...register('year')}
            />
            {errors.year && <p className={styles.error}>{errors.year.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="doc-description">Mô tả tài liệu</label>
            <textarea
              id="doc-description"
              className={`${styles.control} ${styles.textarea}`}
              rows={5}
              {...register('description')}
            />
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>02 · Tệp tài liệu</h2>
          <Controller
            control={control}
            name="file"
            render={({ field }) => (
              <FileDropzone
                file={field.value}
                currentFileName={existing?.filePath ?? undefined}
                invalid={!!errors.file}
                onChange={field.onChange}
              />
            )}
          />
          {errors.file && <p className={styles.error}>{errors.file.message}</p>}
        </section>

        <p className={styles.note}>
          <Icon name="info" size={16} />
          Tài liệu sẽ được gửi đến giảng viên phụ trách môn học để xét duyệt.
        </p>

        {submitError && (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" className={styles.submit} disabled={step === 'submitting'}>
          {step === 'submitting' ? 'Đang gửi...' : isUpdate ? 'Cập nhật tài liệu' : 'Gửi duyệt tài liệu'}
        </Button>
      </form>

      <Modal
        open={step === 'confirming' || step === 'submitting'}
        tone="warning"
        title={isUpdate ? 'Xác nhận cập nhật tài liệu?' : 'Xác nhận gửi tài liệu?'}
        onClose={step === 'confirming' ? () => setStep('editing') : undefined}
        actions={
          <>
            <Button variant="outline" onClick={() => setStep('editing')} disabled={step === 'submitting'}>
              Quay lại
            </Button>
            <Button onClick={submit} disabled={step === 'submitting'}>
              {step === 'submitting' ? 'Đang gửi...' : 'Xác nhận'}
            </Button>
          </>
        }
      >
        {isUpdate
          ? 'Bạn có chắc chắn muốn cập nhật tài liệu này không?'
          : 'Bạn có chắc chắn muốn gửi tài liệu này để giảng viên xét duyệt không? Sau khi gửi, tài liệu sẽ ở trạng thái chờ duyệt.'}
      </Modal>

      <Modal
        open={step === 'done'}
        tone="success"
        title={isUpdate ? 'Cập nhật tài liệu thành công!' : 'Gửi tài liệu thành công!'}
        actions={
          <div className={styles.successActions}>
            <Button block onClick={() => navigate(PATHS.myDocuments)}>
              Xem tài liệu của tôi
            </Button>
            <Button block variant="outline" onClick={() => navigate(PATHS.documentLibrary)}>
              Quay lại thư viện tài liệu
            </Button>
          </div>
        }
      >
        {isUpdate
          ? 'Thông tin tài liệu của bạn đã được cập nhật.'
          : 'Tài liệu của bạn đã được gửi và đang chờ giảng viên duyệt.'}
      </Modal>
    </>
  )
}

export default function DocumentFormPage({ mode }: { mode: 'create' | 'update' }) {
  const { user } = useAuth()
  const documentId = Number(useParams().documentId)
  const isUpdate = mode === 'update'

  const subjects = useRequest(subjectApi.list, 'subjects')
  const existing = useRequest(() => documentApi.get(documentId), `document-form-${documentId}`, isUpdate)

  const isForeign = isUpdate && !!existing.data && existing.data.uploader?.id !== user?.id

  return (
    <Container width="narrow">
      <StateView
        loading={subjects.loading || existing.loading}
        error={subjects.error || existing.error}
        onRetry={() => {
          subjects.reload()
          existing.reload()
        }}
        empty={isForeign}
        emptyText="Bạn chỉ có thể chỉnh sửa tài liệu do mình tải lên."
      >
        <DocumentForm key={existing.data?.id ?? 'new'} subjects={subjects.data ?? []} existing={existing.data} />
      </StateView>
    </Container>
  )
}
