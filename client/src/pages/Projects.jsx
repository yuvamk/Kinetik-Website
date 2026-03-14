import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Filter } from 'lucide-react'
import api from '../utils/api'

const categories = ['All', 'Web', 'Mobile', 'AI', 'Design', 'Other']

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', activeCategory, page],
    queryFn: () => api.get(`/projects?${activeCategory !== 'All' ? `category=${activeCategory}&` : ''}status=published&page=${page}&limit=12`).then(r => r.data),
  })

  const projects = data?.data || []
  const pagination = data?.pagination

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
          <span className="section-tag">Our Work</span>
          <h1 className="section-heading" style={{ margin: '0 auto 20px' }}>
            Projects That<br /><span className="gradient-text">Define Excellence</span>
          </h1>
          <p className="section-subheading" style={{ margin: '0 auto' }}>
            A curated selection of projects we're proud to have built.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section style={{ background: '#060608', paddingBottom: '40px' }}>
        <div className="container-fluid">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1) }}
                style={{
                  padding: '9px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${activeCategory === cat ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
                  background: activeCategory === cat ? 'rgba(108,99,255,0.15)' : 'transparent',
                  color: activeCategory === cat ? '#6C63FF' : '#9999AA',
                  transition: 'all 0.3s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding" style={{ background: '#060608', paddingTop: '20px' }}>
        <div className="container-fluid">
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 360, borderRadius: '20px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 2s infinite' }} />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
              <AnimatePresence mode="popLayout">
                {projects.map(project => (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -6 }}
                    style={{ borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div style={{ height: '220px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', position: 'relative', overflow: 'hidden' }}>
                      {project.coverImage ? (
                        <img src={project.coverImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))' }}>
                          <Code2 size={48} color="rgba(108,99,255,0.3)" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 16, left: 16 }}>
                        <span style={{ padding: '4px 12px', background: 'rgba(108,99,255,0.9)', borderRadius: '100px', fontSize: '11px', fontWeight: 700, color: '#fff' }}>{project.category}</span>
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F5F5F7', marginBottom: '8px' }}>{project.title}</h3>
                      <p style={{ color: '#9999AA', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{project.description?.substring(0, 100)}...</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {project.techStack?.slice(0, 4).map(tech => (
                          <span key={tech} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '11px', color: '#9999AA', border: '1px solid rgba(255,255,255,0.08)' }}>{tech}</span>
                        ))}
                      </div>
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          View Live <ArrowRight size={13} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9999AA' }}>
              <Code2 size={48} color="rgba(108,99,255,0.2)" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px' }}>No projects found for this category.</p>
              <button onClick={() => setActiveCategory('All')} style={{ marginTop: '16px', color: '#6C63FF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                Show all projects
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: 36, height: 36, borderRadius: '8px', border: `1px solid ${page === i + 1 ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
                    background: page === i + 1 ? 'rgba(108,99,255,0.2)' : 'transparent',
                    color: page === i + 1 ? '#6C63FF' : '#9999AA', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
