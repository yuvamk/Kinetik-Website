import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

/**
 * AnimatedText — GSAP text reveal with clip-path or blur-in
 * mode: 'words' | 'chars' | 'lines'
 * animation: 'blur' | 'slide'
 */
export default function AnimatedText({
  text,
  tag: Tag = 'h2',
  mode = 'words',
  animation = 'slide',
  delay = 0,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Manual word/char split since SplitText may not be available in free GSAP
    const words = text.split(' ')
    el.innerHTML = words
      .map((word) => `<span class="word-wrap" style="display:inline-block; overflow:hidden; vertical-align:bottom"><span class="word" style="display:inline-block">${word}</span></span>`)
      .join(' ')

    const wordEls = el.querySelectorAll('.word')

    const fromProps =
      animation === 'blur'
        ? { opacity: 0, y: 20, filter: 'blur(10px)' }
        : { opacity: 0, y: '100%' }

    const toProps =
      animation === 'blur'
        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
        : { opacity: 1, y: '0%' }

    gsap.set(wordEls, fromProps)
    gsap.to(wordEls, {
      ...toProps,
      stagger: 0.06,
      duration: 0.8,
      ease: 'power3.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      gsap.killTweensOf(wordEls)
    }
  }, [text, animation, delay])

  return (
    <Tag ref={containerRef} className={className} style={style}>
      {text}
    </Tag>
  )
}
