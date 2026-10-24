import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useMemo, useState } from 'react'
import type { Subject } from '../../types/document'
import { buildSubjectTree } from '../../utils/subjectTree'
import Icon from './Icon'
import styles from './SubjectSelect.module.css'

interface SubjectSelectProps {
  id?: string
  subjects: Subject[]
  value: string
  onChange: (subjectId: string) => void
  invalid?: boolean
  triggerClassName?: string
}

interface Group {
  key: number
  label: string
  subjects: Subject[]
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

const subjectLabel = (subject: Subject | null) =>
  subject ? (subject.code ? `${subject.title} (${subject.code})` : subject.title) : ''

export default function SubjectSelect({
  id,
  subjects,
  value,
  onChange,
  invalid,
  triggerClassName,
}: SubjectSelectProps) {
  const [keyword, setKeyword] = useState('')

  const groups = useMemo<Group[]>(
    () =>
      buildSubjectTree(subjects).flatMap((faculty) =>
        faculty.majors.map((major) => ({
          key: major.id,
          label: `${faculty.name} › ${major.name}`,
          subjects: major.subjects,
        })),
      ),
    [subjects],
  )

  const filtered = useMemo(() => {
    const query = normalize(keyword.trim())
    if (!query) return groups
    return groups
      .map((group) => {
        if (normalize(group.label).includes(query)) return group
        const matched = group.subjects.filter((subject) =>
          normalize(`${subject.title} ${subject.code ?? ''}`).includes(query),
        )
        return { ...group, subjects: matched }
      })
      .filter((group) => group.subjects.length > 0)
  }, [groups, keyword])

  const selected = subjects.find((subject) => String(subject.id) === value) ?? null

  return (
    <Combobox
      value={selected}
      by="id"
      immediate
      onChange={(subject: Subject | null) => subject && onChange(String(subject.id))}
      onClose={() => setKeyword('')}
    >
      <div className={styles.root}>
        <ComboboxInput
          id={id}
          className={[triggerClassName, styles.input, invalid && styles.invalid].filter(Boolean).join(' ')}
          displayValue={subjectLabel}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Chọn hoặc gõ tên môn, mã môn, khoa, ngành"
          aria-invalid={invalid}
          autoComplete="off"
        />
        <ComboboxButton className={styles.toggle} aria-label="Mở danh sách môn học">
          <Icon name="chevron-down" size={16} />
        </ComboboxButton>

        <ComboboxOptions className={styles.popover}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>Không tìm thấy môn học phù hợp.</p>
          ) : (
            filtered.map((group) => (
              <div key={group.key} className={styles.group}>
                <p className={styles.groupLabel}>{group.label}</p>
                {group.subjects.map((subject) => (
                  <ComboboxOption
                    key={subject.id}
                    value={subject}
                    className={({ focus, selected: isSelected }) =>
                      [styles.option, focus && styles.active, isSelected && styles.selected].filter(Boolean).join(' ')
                    }
                  >
                    {({ selected: isSelected }) => (
                      <>
                        <span className={styles.optionTitle}>{subject.title}</span>
                        {subject.code && <span className={styles.code}>{subject.code}</span>}
                        {isSelected && <Icon name="check" size={16} className={styles.check} />}
                      </>
                    )}
                  </ComboboxOption>
                ))}
              </div>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  )
}
