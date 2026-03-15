import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(6,6,8,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.4s ease',
        }}
        className="md-px-10"
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
            background: '#06101f',
            boxShadow: '0 0 15px rgba(108,99,255,0.3)',
          }} className="md-w-11 md-h-11">
            <img
              src="/kinetik-logo.png"
              alt="Kinetik"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 22%',
                display: 'block',
              }}
            />
          </div>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800, fontSize: '18px',
            background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }} className="md-text-xl">
            KINETIK
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md-flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: location.pathname === link.to ? '#6C63FF' : '#9999AA',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                transition: 'color 0.3s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => { e.target.style.color = '#F5F5F7' }}
              onMouseLeave={(e) => { e.target.style.color = location.pathname === link.to ? '#6C63FF' : '#9999AA' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link to="/contact" className="btn-primary hidden md-inline-flex" style={{ padding: '10px 24px', fontSize: '14px' }}>
          Start a Project
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="md-hidden"
          onClick={() => setOpen(!open)}
          style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            color: '#F5F5F7', 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: '#060608',
              display: 'flex', flexDirection: 'column',
              padding: '100px 40px', gap: '20px',
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '40px', opacity: 0.1, pointerEvents: 'none' }}>
               <span style={{ fontSize: '120px', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#6C63FF' }}>K</span>
            </div>

            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link
                  to={link.to}
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '36px', fontWeight: 800,
                    color: location.pathname === link.to ? '#6C63FF' : '#F5F5F7', 
                    textDecoration: 'none',
                    display: 'block',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            
            <motion.div 
               initial={{ y: 20, opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               transition={{ delay: 0.5 }}
               style={{ marginTop: 'auto' }}
            >
              <Link to="/contact" className="btn-primary" style={{ fontSize: '16px', width: '100%', justifyContent: 'center', padding: '18px' }}>
                Start a Project
              </Link>
              <div style={{ marginTop: '32px', display: 'flex', gap: '20px' }}>
                 <p style={{ color: '#9999AA', fontSize: '13px' }}>Follow us</p>
                 <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'center' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
