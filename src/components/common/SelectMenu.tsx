import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import Icon from './Icon'
import styles from './SelectMenu.module.css'

interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectMenuProps<T extends string> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  label: string
}

export default function SelectMenu<T extends string>({ value, options, onChange, label }: SelectMenuProps<T>) {
  const current = options.find((option) => option.value === value)
  const active = !!current && current.value !== options[0]?.value

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={styles.root}>
        <ListboxButton
          className={({ open }) =>
            [styles.trigger, open && styles.open, active && styles.active].filter(Boolean).join(' ')
          }
        >
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{current?.label ?? 'Chọn'}</span>
          <Icon name="chevron-down" size={16} className={styles.chevron} />
        </ListboxButton>
        <ListboxOptions className={styles.menu} aria-label={label}>
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className={({ focus, selected }) =>
                [styles.option, focus && styles.focused, selected && styles.selected].filter(Boolean).join(' ')
              }
            >
              {({ selected }) => (
                <>
                  <span className={styles.optionText}>{option.label}</span>
                  {selected && <Icon name="check" size={16} />}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
