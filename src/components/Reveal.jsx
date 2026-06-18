import { useEffect, useRef } from 'react'

/**
 * Adds the "in" class once the element scrolls into view.
 * Pairs with [data-reveal] styles; `as` lets sections reuse it
 * for non-translating triggers (path draw, bar fills).
 */
export default function Reveal({
  as: Tag = 'div',
  children,
  delay = 0,
  reveal = true,
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Already in view when it mounts? Reveal immediately. The IntersectionObserver's
    // initial callback can be missed for above-the-fold content (it never "crosses"
    // the threshold), which would leave the element stuck at opacity 0.
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.classList.add('in')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          io.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={className}
      style={delay ? { '--d': `${delay}s` } : undefined}
      {...(reveal ? { 'data-reveal': '' } : {})}
      {...rest}
    >
      {children}
    </Tag>
  )
}
