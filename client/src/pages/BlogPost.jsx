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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ paddingTop: '72px' }}
    >
      {/* Cover */}
      {data.coverImage && (
        <div style={{ height: '480px', overflow: 'hidden', position: 'relative' }}>
          <img src={data.coverImage} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #060608 100%)' }} />
        </div>
      )}

      <div className="container-fluid" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        {/* Back */}
        <div style={{ marginTop: data.coverImage ? '-60px' : '60px', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9999AA', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <span style={{ padding: '4px 14px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '100px', fontSize: '12px', color: '#00D4FF', fontWeight: 600 }}>{data.category}</span>
          <span style={{ color: '#9999AA', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} /> {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span style={{ color: '#9999AA', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> {data.readTime || 5} min read</span>
        </div>

        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', color: '#F5F5F7', lineHeight: 1.2, marginBottom: '24px' }}>
          {data.title}
        </h1>

        <p style={{ color: '#9999AA', fontSize: '16px', marginBottom: '48px' }}>{data.author}</p>

        {/* Content */}
        <div
          dangerouslySetInnerHTML={{ __html: data.content }}
          style={{ color: '#9999AA', fontSize: '16px', lineHeight: 1.9 }}
          className="blog-content"
        />

        {/* Tags */}
        {data.tags?.length > 0 && (
          <div style={{ marginTop: '48px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <Tag size={14} color="#9999AA" />
            {data.tags.map(tag => (
              <span key={tag} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', fontSize: '12px', color: '#9999AA' }}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section-padding" style={{ background: '#0E0E12', marginTop: '80px' }}>
          <div className="container-fluid">
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#F5F5F7', marginBottom: '36px' }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {related.map(post => (
                <Link key={post._id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ y: -4 }} style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '24px' }}>
                    <span style={{ fontSize: '11px', color: '#00D4FF', fontWeight: 600 }}>{post.category}</span>
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F5F5F7', marginTop: '8px', lineHeight: 1.3 }}>{post.title}</h3>
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
