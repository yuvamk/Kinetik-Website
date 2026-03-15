import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Mail, Phone, ArrowRight } from 'lucide-react'
import api from '../utils/api'

export default function Contact() {
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

  const inpStyle = {
    width: '100%', padding: '14px 18px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#F5F5F7', fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.3s',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ paddingTop: '72px' }}
    >
      {/* Hero */}
      <section style={{ padding: '100px 0 80px', background: '#060608', textAlign: 'center' }}>
        <div className="container-fluid">
          <span className="section-tag">Get In Touch</span>
          <h1 className="section-heading" style={{ margin: '0 auto 20px', fontSize: 'clamp(36px, 10vw, 64px)' }}>
            Start Something<br /><span className="gradient-text">Great</span>
          </h1>
          <p className="section-subheading" style={{ margin: '0 auto', fontSize: 'clamp(14px, 3vw, 18px)' }}>
            Have a project in mind? We'd love to hear about it.
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ background: '#060608', paddingTop: '0' }}>
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-20 items-start">

            {/* Info */}
            <div className="lg:col-span-2">
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#F5F5F7', marginBottom: '24px' }}>Contact Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {[
                  { icon: Mail, label: 'Email', value: 'hello@kinetik.agency' },
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: MapPin, label: 'Location', value: 'New Delhi, India' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} color="#6C63FF" />
                      </div>
                      <div>
                        <p style={{ color: '#9999AA', fontSize: '12px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</p>
                        <p style={{ color: '#F5F5F7', fontSize: '15px', fontWeight: 500 }}>{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Abstract map bg */}
              <div style={{
                height: 200, borderRadius: '16px', overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(108,99,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div style={{ width: 16, height: 16, background: '#6C63FF', borderRadius: '50%', boxShadow: '0 0 30px #6C63FF', position: 'relative', zIndex: 1 }} />
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px' }} className="lg:col-span-3 p-6 md:p-12">
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F5F5F7', marginBottom: '32px' }}>Send a Message</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'name', placeholder: 'Your Name *', required: true },
                  { name: 'email', type: 'email', placeholder: 'Email Address *', required: true },
                  { name: 'phone', placeholder: 'Phone Number' },
                  { name: 'company', placeholder: 'Company (optional)' },
                ].map(field => (
                  <input
                    key={field.name}
                    {...field}
                    value={form[field.name]}
                    onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                    style={inpStyle}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                ))}
                <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} style={{ ...inpStyle, gridColumn: '1/-1' }}>
                  <option value="">Service Interested In</option>
                  {['Web Development', 'Mobile App Development', 'UI/UX Design', 'AI Integration', 'Digital Strategy', 'Business Consulting', 'Other'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <textarea placeholder="Tell us about your project *" required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...inpStyle, gridColumn: '1/-1', resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#6C63FF'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Sending...' : 'Send Message'} <ArrowRight size={16} />
                  </button>
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '10px', color: '#00D4FF', fontSize: '14px' }}>
                      ✓ Message sent! We'll get back to you within 24 hours.
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '10px', color: '#ff6b6b', fontSize: '14px' }}>
                      Something went wrong. Please try again or email us directly.
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
