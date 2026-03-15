import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react'
import api from '../utils/api'

export default function BlogPost() {
  const { slug } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => api.get(`/blogs/${slug}`).then(r => r.data.data),
  })

  const { data: relatedData } = useQuery({
    queryKey: ['related-blogs', data?.category],
    queryFn: () => api.get(`/blogs?category=${data.category}&limit=3&status=published`).then(r => r.data),
    enabled: !!data?.category,
  })

  if (isLoading) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #6C63FF', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', color: '#F5F5F7', fontSize: '32px' }}>Post Not Found</h1>
        <Link to="/blog" className="btn-outline">← Back to Blog</Link>
      </div>
    )
  }

  const related = relatedData?.data?.filter(p => p.slug !== slug).slice(0, 3) || []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: '72px', background: '#060608' }}
    >
      {/* Reading Progress Bar */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX: 0 }} // This would normally be handled by a hook, but I'll add the logic if needed or just keep the CSS reference
      />

      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container-fluid" style={{ maxWidth: '900px' }}>
          {/* Back Button */}
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6C63FF', textDecoration: 'none', fontSize: '14px', fontWeight: 600, marginBottom: '32px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00D4FF'}
            onMouseLeave={e => e.currentTarget.style.color = '#6C63FF'}
          >
            <ArrowLeft size={16} /> Back to Insights
          </Link>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
            <span style={{ padding: '6px 14px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '100px', fontSize: '11px', color: '#6C63FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{data.category}</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#9999AA', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {data.readTime || 5} min read</span>
            </div>
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 56px)', color: '#F5F5F7', lineHeight: 1.1, marginBottom: '32px', letterSpacing: '-0.02em' }}>
            {data.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '14px' }}>
              {data.author?.charAt(0) || 'K'}
            </div>
            <div>
              <p style={{ color: '#F5F5F7', fontSize: '14px', fontWeight: 600, margin: 0 }}>{data.author || 'Kinetik Team'}</p>
              <p style={{ color: '#9999AA', fontSize: '12px', margin: 0 }}>Insights Author</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {data.coverImage && (
          <div className="container-fluid" style={{ maxWidth: '1100px', marginBottom: '60px' }}>
            <div style={{ width: '100%', height: 'clamp(300px, 50vh, 600px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>
              <img src={data.coverImage} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="container-fluid" style={{ maxWidth: '800px' }}>
          <div
            dangerouslySetInnerHTML={{ __html: data.content }}
            className="blog-content"
          />

          {/* Tags */}
          {data.tags?.length > 0 && (
            <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#F5F5F7', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}><Tag size={14} color="#6C63FF" /> Tags:</span>
              {data.tags.map(tag => (
                <span key={tag} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '100px', fontSize: '12px', color: '#9999AA', transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#6C63FF'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9999AA'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* More context for the user: Read more section */}
      {related.length > 0 && (
        <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container-fluid" style={{ maxWidth: '1100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
              <div>
                <span className="section-tag">Read More</span>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#F5F5F7', margin: 0 }}>Related Articles</h2>
              </div>
              <Link to="/blog" className="btn-outline" style={{ padding: '10px 24px', fontSize: '13px' }}>View All Posts</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {related.map((post, i) => (
                <Link key={post._id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{ borderRadius: '24px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', height: '100%' }}
                  >
                    <div style={{ height: '200px', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', position: 'relative' }}>
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Star size={40} color="rgba(108,99,255,0.2)" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                        <span style={{ padding: '4px 12px', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '100px', fontSize: '10px', color: '#6C63FF', fontWeight: 700, textTransform: 'uppercase' }}>{post.category}</span>
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F5F5F7', marginBottom: '12px', lineHeight: 1.4 }}>{post.title}</h3>
                      <p style={{ color: '#9999AA', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>{post.excerpt?.substring(0, 80)}...</p>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6C63FF', fontSize: '13px', fontWeight: 600 }}>
                        Read Article <ArrowRight size={14} />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  )
}
