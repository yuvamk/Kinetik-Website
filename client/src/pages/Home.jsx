import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Code2, Smartphone, Palette, Brain, TrendingUp, Lightbulb,
  ArrowRight, ChevronDown, Star, Calendar, Clock
} from 'lucide-react'
import HeroScene from '../components/HeroScene'
import MagneticButton from '../components/MagneticButton'
import ChatWidget from '../components/ChatWidget'
import Loader from '../components/Loader'
import api from '../utils/api'

gsap.registerPlugin(ScrollTrigger)

// ── Ticker ──────────────────────────────────────────────────────
const tickerItems = ['KINETIK', 'DESIGN', 'DEVELOP', 'DEPLOY', 'AI SOLUTIONS', 'DIGITAL STRATEGY', 'WEB APPS', 'MOBILE']

function Ticker() {
  const items = [...tickerItems, ...tickerItems]
  return (
    <div className="marquee-wrapper" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', background: 'rgba(255,255,255,0.02)' }}>
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} style={{ padding: '0 40px', color: '#9999AA', fontSize: '13px', fontWeight: 600, letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
            {item} <span style={{ color: '#6C63FF', marginLeft: '40px' }}>•</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Service Card ─────────────────────────────────────────────
const services = [
  { icon: Code2, title: 'Web Development', desc: 'Blazing-fast, SEO-optimized websites and web apps built with cutting-edge technologies.' },
  { icon: Smartphone, title: 'Mobile App Dev', desc: 'Native and cross-platform mobile experiences for iOS and Android.' },
  { icon: Palette, title: 'UI/UX Design', desc: 'Award-worthy interfaces that convert visitors into loyal customers.' },
  { icon: Brain, title: 'AI Integration', desc: 'Intelligent automation and AI-powered features that give you a competitive edge.' },
  { icon: TrendingUp, title: 'Digital Strategy', desc: 'Data-driven SEO and digital marketing strategies that grow your online presence.' },
  { icon: Lightbulb, title: 'Business Consulting', desc: 'From idea to execution — we guide your vision with proven frameworks.' },
]

function ServiceCard({ service, index }) {
  const ref = useRef(null)
  const { icon: Icon } = service

  useEffect(() => {
    gsap.fromTo(ref.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: index * 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none none' } }
    )
  }, [])

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20
    ref.current.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-4px)`
  }
  const handleMouseLeave = () => {
    ref.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '36px',
        transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(108,99,255,0.12)' }}
    >
      <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(108,99,255,0.2)' }}>
        <Icon size={24} color="#6C63FF" />
      </div>
      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '19px', color: '#F5F5F7', marginBottom: '10px' }}>{service.title}</h3>
      <p style={{ color: '#9999AA', fontSize: '14px', lineHeight: 1.7 }}>{service.desc}</p>
    </div>
  )
}

// ── Project Card ─────────────────────────────────────────────
function ProjectCard({ project }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      style={{ borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', position: 'relative', group: 'true' }}
    >
      <div style={{ height: '220px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', position: 'relative', overflow: 'hidden' }} className="md-h-60">
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6C63FF22, #00D4FF22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code2 size={48} color="rgba(108,99,255,0.4)" />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,8,0)', transition: 'background 0.3s' }} className="card-overlay" />
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <span style={{ padding: '4px 12px', background: 'rgba(108,99,255,0.9)', borderRadius: '100px', fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>
            {project.category}
          </span>
        </div>
      </div>
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F5F5F7', marginBottom: '8px' }}>{project.title}</h3>
        <p style={{ color: '#9999AA', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{project.description?.substring(0, 100)}...</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {project.techStack?.slice(0, 3).map(tech => (
            <span key={tech} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '11px', color: '#9999AA', border: '1px solid rgba(255,255,255,0.08)' }}>{tech}</span>
          ))}
        </div>
        <Link to={`/projects`} style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          View Project <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  )
}

// ── Blog Card ────────────────────────────────────────────────
function BlogCard({ post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4 }}
      style={{ borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div style={{ height: '180px', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6C63FF22, #00D4FF22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={36} color="rgba(108,99,255,0.4)" />
          </div>
        )}
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ padding: '3px 10px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '100px', fontSize: '11px', color: '#00D4FF', fontWeight: 600 }}>{post.category}</span>
          <span style={{ color: '#9999AA', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: '#F5F5F7', marginBottom: '8px', lineHeight: 1.4 }}>{post.title}</h3>
        <p style={{ color: '#9999AA', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{post.excerpt?.substring(0, 100)}...</p>
        <Link to={`/blog/${post.slug}`} style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Read More <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  )
}

// ── Stat Counter ─────────────────────────────────────────────
function StatCounter({ value, label, suffix = '+' }) {
  const ref = useRef(null)
  const countRef = useRef(null)

  useEffect(() => {
    const el = countRef.current
    if (!el) return
    gsap.fromTo({ val: 0 }, { val: value }, {
      duration: 2, ease: 'power2.out',
      onUpdate: function () { el.textContent = Math.floor(this.targets()[0].val) + suffix },
      scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none none' },
    })
  }, [value, suffix])

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div ref={countRef} className="gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1 }}>0{suffix}</div>
      <p style={{ color: '#9999AA', fontSize: '14px', marginTop: '8px', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

// ── Contact Form ─────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', service: '', message: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contacts', form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', company: '', service: '', message: '' })
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#F5F5F7', fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.3s',
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md-grid-cols-2 gap-4">
      {[
        { name: 'name', placeholder: 'Your Name *', required: true },
        { name: 'email', placeholder: 'Email Address *', type: 'email', required: true },
        { name: 'phone', placeholder: 'Phone Number' },
        { name: 'company', placeholder: 'Company (optional)' },
      ].map(field => (
        <input
          key={field.name}
          {...field}
          value={form[field.name]}
          onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#6C63FF'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      ))}
      <select
        value={form.service}
        onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
        style={{ ...inputStyle, gridColumn: '1/-1' }}
      >
        <option value="">Service Interested In</option>
        {['Web Development', 'Mobile App Development', 'UI/UX Design', 'AI Integration', 'Digital Strategy', 'Business Consulting', 'Other'].map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <textarea
        placeholder="Tell us about your project *"
        required
        rows={5}
        value={form.message}
        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
        style={{ ...inputStyle, gridColumn: '1/-1', resize: 'vertical' }}
        onFocus={e => e.target.style.borderColor = '#6C63FF'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Sending...' : 'Send Message'} <ArrowRight size={16} />
        </button>
        {status === 'success' && <span style={{ color: '#00D4FF', fontSize: '14px' }}>✓ Message sent! We'll reply shortly.</span>}
        {status === 'error' && <span style={{ color: '#ff6b6b', fontSize: '14px' }}>Something went wrong. Please try again.</span>}
      </div>
    </form>
  )
}

// ── HOME PAGE ────────────────────────────────────────────────
export default function Home() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const [loaderDone, setLoaderDone] = useState(false)
  const heroRef = useRef()

  const { data: projectsData } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => api.get('/projects?featured=true&limit=6').then(r => r.data),
  })

  const { data: blogsData } = useQuery({
    queryKey: ['recent-blogs'],
    queryFn: () => api.get('/blogs?limit=3&status=published').then(r => r.data),
  })

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      mouseRef.current = { x, y }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const projects = projectsData?.data || []
  const blogs = blogsData?.data || []

  return (
    <>
      {!loaderDone && <Loader onComplete={() => setLoaderDone(true)} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaderDone ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >

        {/* ── 1. HERO ──────────────────────────────────────── */}
        <section
          ref={heroRef}
          style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#060608' }}
        >
          <HeroScene mouseRef={mouseRef} />

          {/* Overlay gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, #060608 100%)', zIndex: 1 }} />

          {/* Hero Content */}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaderDone ? 1 : 0, y: loaderDone ? 0 : 20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="section-tag" style={{ marginBottom: '24px' }}>Digital Agency</span>
            </motion.div>

            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(42px, 8vw, 96px)', fontWeight: 800, lineHeight: 1.05, marginBottom: '24px' }}>
              {['We', 'Build', 'the', 'Digital', 'Future'].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: loaderDone ? 1 : 0, y: loaderDone ? 0 : 40, filter: loaderDone ? 'blur(0px)' : 'blur(10px)' }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.7, ease: 'easeOut' }}
                  style={{ display: 'inline-block', marginRight: '0.25em', color: i === 3 || i === 4 ? undefined : '#F5F5F7' }}
                  className={i === 3 || i === 4 ? 'gradient-text' : ''}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaderDone ? 1 : 0, y: loaderDone ? 0 : 20 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#9999AA', marginBottom: '44px', maxWidth: '560px', margin: '0 auto 44px' }}
            >
              Apps. Websites. AI Solutions. We turn your ideas into reality.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaderDone ? 1 : 0, y: loaderDone ? 0 : 20 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <MagneticButton>
                <Link to="/projects" className="btn-outline" style={{ fontSize: '15px' }}>
                  See Our Work <ArrowRight size={16} />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact" className="btn-primary" style={{ fontSize: '15px' }}>
                  Let's Talk
                </Link>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loaderDone ? 1 : 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            style={{ position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ color: '#9999AA', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown size={20} color="#6C63FF" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Ticker ──────────────────────────────────────── */}
        <Ticker />

        {/* ── 2. SERVICES ─────────────────────────────────── */}
        <section className="section-padding" style={{ background: '#060608' }}>
          <div className="container-fluid">
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <span className="section-tag">Our Expertise</span>
              <h2 className="section-heading" style={{ margin: '0 auto 16px' }}>What We Do</h2>
              <p className="section-subheading" style={{ margin: '0 auto' }}>
                End-to-end digital solutions crafted to accelerate your business
              </p>
            </div>
            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
              {services.map((service, i) => (
                <ServiceCard key={service.title} service={service} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. FEATURED PROJECTS ──────────────────────────── */}
        <section className="section-padding" style={{ background: '#0E0E12' }}>
          <div className="container-fluid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="section-tag">Portfolio</span>
                <h2 className="section-heading">Work That Speaks</h2>
              </div>
              <Link to="/projects" className="btn-outline" style={{ fontSize: '14px' }}>
                View All Projects <ArrowRight size={14} />
              </Link>
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
                {projects.map(project => <ProjectCard key={project._id} project={project} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9999AA' }}>
                <Code2 size={48} color="rgba(108,99,255,0.3)" style={{ margin: '0 auto 16px' }} />
                <p>Projects will appear here once added from the admin dashboard.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── 4. STATS / VISION ─────────────────────────────── */}
        <section className="section-padding" style={{ background: '#060608' }}>
          <div className="container-fluid">
          <div className="grid grid-cols-1 md-grid-cols-2 gap-12 md-gap-20 items-center">
              <div>
                <span className="section-tag">Our Numbers</span>
                <h2 className="section-heading">Results That<br /><span className="gradient-text">Matter</span></h2>
                <div className="grid grid-cols-2 gap-8 md-gap-10 mt-12">
                  <StatCounter value={50} label="Projects Delivered" />
                  <StatCounter value={40} label="Happy Clients" />
                  <StatCounter value={3} label="Years Experience" />
                  <StatCounter value={20} label="Technologies Used" />
                </div>
                <blockquote style={{ marginTop: '48px', borderLeft: '3px solid #6C63FF', paddingLeft: '24px' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)', color: '#F5F5F7', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "We don't just build products — we engineer experiences that define the future of digital."
                  </p>
                </blockquote>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 340, height: 340, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)' }} />
                  <div className="animate-spin-slow" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '75%', height: '75%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '50%', height: '50%', borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF33, #00D4FF33)', border: '1px solid rgba(108,99,255,0.4)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. BLOG ──────────────────────────────────────── */}
        <section className="section-padding" style={{ background: '#0E0E12' }}>
          <div className="container-fluid">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="section-tag">Knowledge Base</span>
                <h2 className="section-heading">Insights & Ideas</h2>
              </div>
              <Link to="/blog" className="btn-outline" style={{ fontSize: '14px' }}>
                All Posts <ArrowRight size={14} />
              </Link>
            </div>
            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-8">
                {blogs.map(blog => <BlogCard key={blog._id} post={blog} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9999AA' }}>
                <p>Blog posts will appear here once published from the admin dashboard.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── 6. CONTACT CTA ───────────────────────────────── */}
        <section className="section-padding" style={{ background: '#060608', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container-fluid">
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1 }}
              >
                Have an Idea?<br />
                <span className="gradient-text">Let's Build It.</span>
              </motion.h2>
              <p style={{ color: '#9999AA', fontSize: '18px' }}>Talk to us — we respond within 24 hours.</p>
            </div>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <ContactForm />
            </div>
          </div>
        </section>

      </motion.div>
    </>
  )
}
