import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Star, StarOff, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import api from '../utils/api'

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#F5F5F7', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
}

const categories = ['Web', 'Mobile', 'AI', 'Design', 'Other']
const statuses = ['draft', 'published']

const emptyForm = {
  title: '', slug: '', category: 'Web', description: '', fullDescription: '',
  techStack: '', clientName: '', projectUrl: '', githubUrl: '',
  featured: false, status: 'published', coverImage: null,
}

export default function ManageProjects() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => api.get('/projects?limit=100&status=published').then(r => r.data),
  })

  const upsert = useMutation({
    mutationFn: async (fd) => {
      if (editing) return api.put(`/projects/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      return api.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      toast.success(editing ? 'Project updated!' : 'Project created!')
      qc.invalidateQueries(['admin-projects'])
      qc.invalidateQueries(['featured-projects'])
      setShowModal(false)
      setEditing(null)
      setForm(emptyForm)
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => { toast.success('Project deleted'); qc.invalidateQueries(['admin-projects']) },
    onError: () => toast.error('Delete failed'),
  })

  const toggleFeatured = useMutation({
    mutationFn: (id) => api.patch(`/projects/${id}/featured`),
    onSuccess: () => qc.invalidateQueries(['admin-projects']),
  })

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ ...p, techStack: p.techStack?.join(', ') || '', coverImage: null })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'coverImage' && v) fd.append('coverImage', v)
      else if (k === 'techStack') fd.append('techStack', JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)))
      else if (k !== 'coverImage') fd.append(k, v)
    })
    upsert.mutate(fd)
  }

  const projects = data?.data || []

  return (
    <AdminLayout>
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#F5F5F7' }}>Manage Projects</h1>
            <p style={{ color: '#9999AA', fontSize: '14px', marginTop: '4px' }}>{projects.length} projects total</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Project</button>
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Project', 'Category', 'Featured', 'Status', 'Date', 'Actions'].map(col => (
                    <th key={col} style={{ textAlign: 'left', padding: '14px 20px', color: '#9999AA', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9999AA' }}>Loading...</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9999AA' }}>No projects yet. Add your first project.</td></tr>
                ) : projects.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.coverImage && <img src={p.coverImage} alt={p.title} style={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover' }} />}
                        <div>
                          <p style={{ color: '#F5F5F7', fontSize: '14px', fontWeight: 600 }}>{p.title}</p>
                          <p style={{ color: '#9999AA', fontSize: '12px' }}>{p.techStack?.slice(0, 2).join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', background: 'rgba(108,99,255,0.15)', borderRadius: '100px', fontSize: '12px', color: '#6C63FF', fontWeight: 600 }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => toggleFeatured.mutate(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {p.featured ? <Star size={18} color="#FFB74D" fill="#FFB74D" /> : <StarOff size={18} color="#9999AA" />}
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '12px', background: p.status === 'published' ? 'rgba(0,201,167,0.15)' : 'rgba(255,255,255,0.05)', color: p.status === 'published' ? '#00C9A7' : '#9999AA', fontWeight: 600 }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#9999AA', fontSize: '13px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEdit(p)} style={{ width: 32, height: 32, background: 'rgba(108,99,255,0.15)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} color="#6C63FF" /></button>
                        <button onClick={() => { if (confirm('Delete this project?')) deleteMut.mutate(p._id) }} style={{ width: 32, height: 32, background: 'rgba(255,107,107,0.12)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color="#ff6b6b" /></button>
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
              style={{ background: '#0E0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: '#F5F5F7' }}>{editing ? 'Edit Project' : 'Add Project'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#F5F5F7" /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input placeholder="Title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ ...inputStyle, gridColumn: '1/-1' }} />
                <input placeholder="Slug (auto-generated)" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} style={inputStyle} />
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea placeholder="Short Description *" required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, gridColumn: '1/-1', resize: 'vertical' }} />
                <input placeholder="Tech Stack (comma separated)" value={form.techStack} onChange={e => setForm(p => ({ ...p, techStack: e.target.value }))} style={{ ...inputStyle, gridColumn: '1/-1' }} />
                <input placeholder="Client Name" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} style={inputStyle} />
                <input placeholder="Project URL (https://...)" value={form.projectUrl} onChange={e => setForm(p => ({ ...p, projectUrl: e.target.value }))} style={inputStyle} />
                <input placeholder="GitHub URL" value={form.githubUrl} onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))} style={inputStyle} />
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={inputStyle}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Cover Image Upload */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', color: '#9999AA', fontSize: '14px' }}>
                    <Upload size={16} /> {form.coverImage ? form.coverImage.name : (editing?.coverImage ? 'Change cover image' : 'Upload cover image')}
                    <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, coverImage: e.target.files[0] }))} style={{ display: 'none' }} />
                  </label>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9999AA', fontSize: '14px', cursor: 'pointer', gridColumn: '1/-1' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
                  Mark as Featured
                </label>

                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
                  <button type="submit" className="btn-primary" disabled={upsert.isPending}>{upsert.isPending ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
