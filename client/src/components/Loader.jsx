import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'

export default function Loader({ onComplete }) {
  const [show, setShow] = useState(true)
  const textRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const letters = textRef.current?.querySelectorAll('span')
    if (!letters) return

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          setShow(false)
          onComplete?.()
        }, 400)
      },
    })

    tl.set(letters, { y: 80, opacity: 0, rotateX: -45 })
    tl.to(letters, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      stagger: 0.07,
      duration: 0.6,
      ease: 'power3.out',
    })
    tl.to(barRef.current, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut',
      delay: 0.2,
    })
    tl.to(letters, {
      y: -80,
      opacity: 0,
      stagger: 0.05,
      duration: 0.5,
      ease: 'power3.in',
      delay: 0.2,
    })

    return () => tl.kill()
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loader-overlay"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div
            className="overflow-hidden mb-12"
            style={{ perspective: '600px' }}
          >
            <div
              ref={textRef}
              className="flex gap-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(48px, 10vw, 96px)', fontWeight: 800 }}
            >
              {'KINETIK'.split('').map((l, i) => (
                <span
                  key={i}
                  className="gradient-text"
                  style={{ display: 'inline-block' }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '280px',
              height: '2px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              ref={barRef}
              style={{
                width: '0%',
                height: '100%',
                background: 'linear-gradient(90deg, #6C63FF, #00D4FF)',
                borderRadius: '2px',
              }}
            />
          </div>

          <p style={{ color: '#9999AA', fontSize: '13px', marginTop: '16px', letterSpacing: '0.2em' }}>
            LOADING EXPERIENCE
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
