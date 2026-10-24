import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import { PATHS } from '../../routes/paths'
import styles from './SearchBox.module.css'

interface SearchBoxProps {
  className?: string
}

export default function SearchBox({ className }: SearchBoxProps) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [keyword, setKeyword] = useState(params.get('q') ?? '')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = keyword.trim()
    if (value) navigate(`${PATHS.search}?q=${encodeURIComponent(value)}`)
  }

  return (
    <form role="search" className={className ? `${styles.box} ${className}` : styles.box} onSubmit={handleSubmit}>
      <label htmlFor="global-search" className="visually-hidden">
        Tìm kiếm
      </label>
      <input
        id="global-search"
        className={styles.input}
        type="search"
        placeholder="Tìm kiếm tài liệu, bài kiểm tra"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <button type="submit" className={styles.submit} aria-label="Tìm kiếm">
        <Icon name="search" />
      </button>
    </form>
  )
}
