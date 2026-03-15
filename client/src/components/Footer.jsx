import { Link } from 'react-router-dom'
import { Zap, Twitter, Linkedin, Instagram, Github, ArrowUp } from 'lucide-react'

const footerLinks = {
  Company: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Services', to: '/services' },
    { label: 'Projects', to: '/projects' },
  ],
  Resources: [
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ],
}

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Github, href: '#', label: 'GitHub' },
]

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer style={{
      background: '#0E0E12',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '80px 0 40px',
      position: 'relative',
    }}>
      <div className="container-fluid">
        <div className="grid grid-cols-1 md-grid-cols-4 gap-12 md-gap-20 mb-16">

          {/* Brand */}
          <div className="md-col-span-2">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '20px' }}>
              <div style={{
                width: 36, height: 36, background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '22px', color: '#F5F5F7' }}>
                KINETIK
              </span>
            </Link>
            <p style={{ color: '#9999AA', fontSize: '15px', lineHeight: 1.7, maxWidth: '380px', marginBottom: '28px' }}>
              We build the digital future. Apps, websites, AI solutions — turning ideas into reality.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 40, height: 40, borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9999AA', textDecoration: 'none', transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6C63FF'
                    e.currentTarget.style.color = '#6C63FF'
                    e.currentTarget.style.background = 'rgba(108,99,255,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = '#9999AA'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#F5F5F7', marginBottom: '20px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {category}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {links.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{ color: '#9999AA', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#F5F5F7'}
                    onMouseLeave={(e) => e.target.style.color = '#9999AA'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }} className="mobile-text-center">
          <p style={{ color: '#9999AA', fontSize: '13px', width: '100%', textAlign: 'center' }} className="md-w-auto md-text-left">
            &copy; {new Date().getFullYear()} Kinetik. All rights reserved.
          </p>
          <p style={{ color: '#9999AA', fontSize: '13px', width: '100%', textAlign: 'center' }} className="md-w-auto md-text-right">
            Built with ❤️ by Kinetik
          </p>
        </div>
      </div>

      {/* Back to top */}
      <button
        onClick={scrollTop}
        style={{
          position: 'absolute', bottom: '24px', right: '24px',
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          zIndex: 10,
        }}
        className="md-bottom-10 md-right-10 md-w-12 md-h-12"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(108,99,255,0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        aria-label="Back to top"
      >
        <ArrowUp size={18} color="#fff" />
      </button>
    </footer>
  )
}
