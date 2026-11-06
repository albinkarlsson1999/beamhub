import { Link } from 'react-router-dom'
import './SourceCard.css'

function SourceCard({ title, description, icon: Icon, accent, to, disabled = false }) {
  const style = accent ? { '--accent': accent } : undefined

  const content = (
    <>
      {Icon && <Icon className="source-card__icon" aria-hidden="true" />}
      <h3 className="source-card__title">{title}</h3>
      <p className="source-card__description">{description}</p>
      {disabled && <span className="source-card__badge">Coming soon</span>}
    </>
  )

  if (disabled) {
    return (
      <div className="source-card source-card--disabled" style={style} aria-disabled="true">
        {content}
      </div>
    )
  }

  return (
    <Link to={to} className="source-card" style={style}>
      {content}
    </Link>
  )
}

export default SourceCard