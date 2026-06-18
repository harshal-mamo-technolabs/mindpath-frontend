import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="MindPath home">
      <span className="logo-mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
          <path
            d="M14 46 C 22 46, 20 22, 30 22 C 40 22, 36 42, 46 38 C 51 36, 51 28, 49 24"
            stroke="#A78BFA"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="49" cy="18" r="5" fill="#EEB381" />
        </svg>
      </span>
      MindPath
    </Link>
  )
}
