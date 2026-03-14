import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Calendar, ArrowRight, Star } from 'lucide-react'
import api from '../utils/api'

const categories = ['All', 'Technology', 'Design', 'AI', 'Business', 'Development', 'Strategy']

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default function Blog() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)

  const debouncedUpdate = useCallback(
    debounce((value) => setDebouncedSearch(value), 400),
    []
  )

  const handleSearch = (e) => {
    setSearch(e.target.value)
    debouncedUpdate(e.target.value)
    setPage(1)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', category, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams({ status: 'published', page, limit: 9 })
      if (category !== 'All') params.append('category', category)
      if (debouncedSearch) params.append('search', debouncedSearch)
      return api.get(`/blogs?${params}`).then(r => r.data)
    },
  })

  const blogs = data?.data || []
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
          <span className="section-tag">Knowledge Base</span>
          <h1 className="section-heading" style={{ margin: '0 auto 20px' }}>
            Insights &<br /><span className="gradient-text">Ideas</span>
          </h1>
          <p className="section-subheading" style={{ margin: '0 auto 40px' }}>
            Thoughts on technology, design, and building exceptional digital products.
          </p>
          {/* Search */}
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9999AA' }} />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={handleSearch}
              style={{
                width: '100%', padding: '14px 18px 14px 48px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#F5F5F7', fontSize: '14px', outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div style={{ background: '#060608', paddingBottom: '40px' }}>
        <div className="container-fluid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1) }}
              style={{
                padding: '8px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${category === cat ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
                background: category === cat ? 'rgba(108,99,255,0.15)' : 'transparent',
                color: category === cat ? '#6C63FF' : '#9999AA', transition: 'all 0.3s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="section-padding" style={{ background: '#060608', paddingTop: '20px' }}>
        <div className="container-fluid">
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 340, borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
              {blogs.map((blog, i) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  style={{ borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div style={{ height: '180px', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,212,255,0.05))' }}>
                        <Star size={36} color="rgba(108,99,255,0.3)" />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '100px', fontSize: '11px', color: '#00D4FF', fontWeight: 600 }}>{blog.category}</span>
                      <span style={{ color: '#9999AA', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: '#F5F5F7', marginBottom: '8px', lineHeight: 1.3 }}>{blog.title}</h2>
                    <p style={{ color: '#9999AA', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{blog.excerpt?.substring(0, 100)}...</p>
                    <Link to={`/blog/${blog.slug}`} style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Read Article <ArrowRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9999AA' }}>
              <p style={{ fontSize: '16px' }}>No posts found. Try a different search or category.</p>
            </div>
          )}

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
