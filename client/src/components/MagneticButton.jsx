import { useRef } from 'react'

/**
 * MagneticButton — wraps children and applies a magnetic hover effect
 * The element subtly follows the cursor on hover.
 */
export default function MagneticButton({ children, className = '', style = {}, onClick, as: Tag = 'div' }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.03)`
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0, 0) scale(1)'
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)', cursor: 'pointer', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-magnetic="true"
    >
      {children}
    </Tag>
  )
}
