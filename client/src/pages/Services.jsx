import { motion } from 'framer-motion'
import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Code2, Smartphone, Palette, Brain, TrendingUp, Lightbulb } from 'lucide-react'

const services = [
  {
    icon: Code2,
    title: 'Web Development',
    description: 'We craft high-performance websites and web applications that are fast, secure, and scalable. From marketing sites to complex SaaS platforms.',
    features: ['React/Next.js SPAs', 'API Integration', 'E-commerce Solutions', 'CMS Development', 'Performance Optimization', 'SEO-Ready Architecture'],
    accent: '#6C63FF',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile apps that users love. Built with React Native for iOS and Android, with full backend integration.',
    features: ['React Native Apps', 'iOS & Android', 'App Store Deployment', 'Push Notifications', 'Offline Support', 'Payment Integration'],
    accent: '#00D4FF',
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Design systems and interfaces that convert. We follow human-centered design principles to create intuitive, beautiful experiences.',
    features: ['Figma Design Systems', 'Wireframing & Prototyping', 'User Research', 'Interaction Design', 'Brand Identity', 'Accessibility (WCAG)'],
    accent: '#FF6B9D',
  },
  {
    icon: Brain,
    title: 'AI Integration',
    description: 'Bring intelligence to your product. We integrate LLMs, build AI-powered features, and automate complex business workflows.',
    features: ['LLM Integration', 'Chatbot Development', 'Process Automation', 'Data Analytics', 'Computer Vision', 'Custom AI Models'],
    accent: '#7B61FF',
  },
  {
    icon: TrendingUp,
    title: 'Digital Strategy & SEO',
    description: 'Data-driven strategies that put you on the map. From technical SEO to content strategy, we grow your digital presence.',
    features: ['Technical SEO', 'Content Strategy', 'Analytics Setup', 'Conversion Optimization', 'Social Media Strategy', 'Growth Hacking'],
    accent: '#00C9A7',
  },
  {
    icon: Lightbulb,
    title: 'Business Idea Consulting',
    description: 'From napkin sketch to market-ready product. We validate ideas, create roadmaps, and help you build the right thing.',
    features: ['Idea Validation', 'MVP Planning', 'Technical Roadmap', 'Market Analysis', 'Technology Selection', 'Go-to-Market Strategy'],
    accent: '#FFB74D',
  },
]

export default function Services() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ paddingTop: '72px' }}
    >
      {/* Hero */}
      <section style={{ padding: '100px 0 60px', background: '#060608', textAlign: 'center' }}>
        <div className="container-fluid">
          <span className="section-tag">What We Offer</span>
          <h1 className="section-heading" style={{ margin: '0 auto 20px' }}>
            Services Built for<br /><span className="gradient-text">Bold Ambitions</span>
          </h1>
          <p className="section-subheading" style={{ margin: '0 auto' }}>
            Everything you need to go from idea to a live, thriving digital product.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding" style={{ background: '#060608' }}>
        <div className="container-fluid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '24px', padding: '48px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '16px', background: `${service.accent}18`, border: `1px solid ${service.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={26} color={service.accent} />
                      </div>
                      <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '24px', color: '#F5F5F7' }}>{service.title}</h2>
                    </div>
                    <p style={{ color: '#9999AA', fontSize: '15px', lineHeight: 1.8, marginBottom: '28px' }}>{service.description}</p>
                    <Link to="/contact" className="btn-primary" style={{ fontSize: '14px' }}>
                      Start a Project <ArrowRight size={15} />
                    </Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {service.features.map(feature => (
                      <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${service.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={11} color={service.accent} />
                        </div>
                        <span style={{ color: '#9999AA', fontSize: '13px' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding" style={{ background: '#0E0E12', textAlign: 'center' }}>
        <div className="container-fluid">
          <h2 className="section-heading">Ready to Start?</h2>
          <p style={{ color: '#9999AA', marginBottom: '32px', fontSize: '18px' }}>Let's discuss your project and build something great together.</p>
          <Link to="/contact" className="btn-primary" style={{ fontSize: '16px' }}>
            Get in Touch <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </motion.div>
  )
}
