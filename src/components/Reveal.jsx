import { useEffect, useRef, useState } from 'react'

/**
 * Adds the "in" class once the element scrolls into view.
 * Pairs with [data-reveal] styles; `as` lets sections reuse it
 * for non-translating triggers (path draw, bar fills).
 *
 * The "in" class is applied through React (not classList) so it survives a
 * className change on the same element — e.g. an .ap-primary card whose cover
 * class swaps when the hero follows a different plan.
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
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Already in view when it mounts? Reveal on the next frame. The
    // IntersectionObserver's initial callback can be missed for above-the-fold
    // content (it never "crosses" the threshold), which would leave it stuck.
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) {
      const raf = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={shown ? `${className} in` : className}
      style={delay ? { '--d': `${delay}s` } : undefined}
      {...(reveal ? { 'data-reveal': '' } : {})}
      {...rest}
    >
      {children}
    </Tag>
  )
}
