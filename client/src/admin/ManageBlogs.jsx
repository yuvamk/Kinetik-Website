import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Sparkles, Upload, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import api from '../utils/api'

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#F5F5F7', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
}

const categories = ['Technology', 'Design', 'AI', 'Business', 'Development', 'Strategy']

const emptyForm = {
  title: '', slug: '', category: 'Technology', tags: '',
  content: '', excerpt: '', status: 'draft', aiGenerated: false, coverImage: null,
}

export default function ManageBlogs() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [aiTopic, setAiTopic] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => api.get('/blogs?limit=100').then(r => r.data),
  })

  const upsert = useMutation({
    mutationFn: async (fd) => {
      if (editing) return api.put(`/blogs/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      return api.post('/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      toast.success(editing ? 'Blog updated!' : 'Blog created!')
      qc.invalidateQueries(['admin-blogs'])
      qc.invalidateQueries(['recent-blogs'])
      setShowModal(false); setEditing(null); setForm(emptyForm)
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/blogs/${id}`),
    onSuccess: () => { toast.success('Blog deleted'); qc.invalidateQueries(['admin-blogs']) },
    onError: () => toast.error('Delete failed'),
  })

  const openAdd = () => { setEditing(null); setForm(emptyForm); setAiTopic(''); setShowModal(true) }
  const openEdit = (b) => {
    setEditing(b)
    setForm({ ...b, tags: b.tags?.join(', ') || '', coverImage: null })
    setShowModal(true)
  }

  const generateWithAI = async () => {
    if (!aiTopic.trim()) return toast.error('Enter a topic first')
    setAiLoading(true)
    try {
      const res = await api.post('/blogs/generate', { topic: aiTopic })
      const { title, content, excerpt, suggestedTags, category } = res.data.data
      setForm(p => ({
        ...p, title, content, excerpt,
        tags: suggestedTags?.join(', ') || '',
        category: categories.includes(category) ? category : 'Technology',
        aiGenerated: true,
      }))
      toast.success('✨ AI content generated!')
    } catch (e) {
      toast.error('AI generation failed: ' + (e.response?.data?.message || e.message))
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'coverImage' && v) fd.append('coverImage', v)
      else if (k === 'tags') fd.append('tags', JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)))
      else if (k !== 'coverImage') fd.append(k, v)
    })
    upsert.mutate(fd)
  }

  const blogs = data?.data || []

  return (
    <AdminLayout>
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#F5F5F7' }}>Manage Blog Posts</h1>
            <p style={{ color: '#9999AA', fontSize: '14px', marginTop: '4px' }}>{blogs.length} posts total</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Write Blog</button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Title', 'Category', 'Status', 'AI', 'Date', 'Actions'].map(col => (
                    <th key={col} style={{ textAlign: 'left', padding: '14px 20px', color: '#9999AA', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9999AA' }}>Loading...</td></tr>
                ) : blogs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9999AA' }}>No blog posts yet. Write your first post.</td></tr>
                ) : blogs.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', maxWidth: '280px' }}>
                      <p style={{ color: '#F5F5F7', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                      <p style={{ color: '#9999AA', fontSize: '12px' }}>/{b.slug}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', background: 'rgba(0,212,255,0.1)', borderRadius: '100px', fontSize: '12px', color: '#00D4FF', fontWeight: 600 }}>{b.category}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '12px', background: b.status === 'published' ? 'rgba(0,201,167,0.15)' : 'rgba(255,255,255,0.05)', color: b.status === 'published' ? '#00C9A7' : '#9999AA', fontWeight: 600 }}>{b.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {b.aiGenerated && <span style={{ padding: '3px 8px', background: 'rgba(108,99,255,0.15)', borderRadius: '100px', fontSize: '11px', color: '#6C63FF', fontWeight: 600 }}>✨ AI</span>}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#9999AA', fontSize: '13px' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEdit(b)} style={{ width: 32, height: 32, background: 'rgba(108,99,255,0.15)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} color="#6C63FF" /></button>
                        <button onClick={() => { if (confirm('Delete this post?')) deleteMut.mutate(b._id) }} style={{ width: 32, height: 32, background: 'rgba(255,107,107,0.12)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color="#ff6b6b" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background: '#0E0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: '#F5F5F7' }}>{editing ? 'Edit Post' : 'Write Blog Post'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#F5F5F7" /></button>
              </div>

              {/* AI Generator */}
              <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <p style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> AI Blog Generator (Gemini)</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    placeholder="Enter blog topic (e.g. 'The Future of AI in Web Development')"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generateWithAI()}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={generateWithAI} disabled={aiLoading} className="btn-primary" style={{ flexShrink: 0, padding: '12px 20px', fontSize: '13px' }}>
                    {aiLoading ? '...' : <><Sparkles size={14} /> Generate</>}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input placeholder="Title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ ...inputStyle, gridColumn: '1/-1' }} />
                <input placeholder="Slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} style={inputStyle} />
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} style={{ ...inputStyle, gridColumn: '1/-1' }} />

                {/* Content */}
                <div style={{ gridColumn: '1/-1' }}>
                  <p style={{ color: '#9999AA', fontSize: '12px', marginBottom: '8px' }}>Content (HTML)</p>
                  <textarea
                    rows={12}
                    placeholder="<h2>Introduction</h2><p>Your content here...</p>"
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                </div>

                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={inputStyle}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', color: '#9999AA', fontSize: '14px', gap: '10px' }}>
                  <Upload size={15} /> {form.coverImage ? form.coverImage.name : 'Upload cover image'}
                  <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, coverImage: e.target.files[0] }))} style={{ display: 'none' }} />
                </label>

                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
                  <button type="submit" className="btn-primary" disabled={upsert.isPending}>{upsert.isPending ? 'Saving...' : (editing ? 'Update' : 'Publish')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
