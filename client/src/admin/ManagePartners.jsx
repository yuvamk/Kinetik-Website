import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, X, Upload, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import api from '../utils/api'

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#F5F5F7', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
}

export default function ManagePartners() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', website: '', category: 'client', logo: null })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => api.get('/partners').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: async (fd) => api.post('/partners', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      toast.success('Partner added!')
      qc.invalidateQueries(['admin-partners'])
      setShowModal(false)
      setForm({ name: '', website: '', category: 'client', logo: null })
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/partners/${id}`),
    onSuccess: () => { toast.success('Partner removed'); qc.invalidateQueries(['admin-partners']) },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.logo) return toast.error('Logo image is required')
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('website', form.website)
    fd.append('category', form.category)
    fd.append('logo', form.logo)
    create.mutate(fd)
  }

  const partners = data?.data || []

  return (
    <AdminLayout>
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#F5F5F7' }}>Partners & Clients</h1>
            <p style={{ color: '#9999AA', fontSize: '14px', marginTop: '4px' }}>{partners.length} partners</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Add Partner</button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 140, borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {partners.map(partner => (
              <motion.div
                key={partner._id}
                whileHover={{ y: -4 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', position: 'relative' }}
              >
                <button
                  onClick={() => { if (confirm('Remove partner?')) deleteMut.mutate(partner._id) }}
                  style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, background: 'rgba(255,107,107,0.12)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={12} color="#ff6b6b" />
                </button>
                <img src={partner.logo} alt={partner.name} style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#F5F5F7', fontSize: '14px', fontWeight: 600 }}>{partner.name}</p>
                  <span style={{ fontSize: '11px', color: '#9999AA', textTransform: 'capitalize' }}>{partner.category}</span>
                </div>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" style={{ color: '#6C63FF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                    <Globe size={11} /> Visit
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {partners.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9999AA' }}>
            <p>No partners yet. Add your first client or partner logo.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{ background: '#0E0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '480px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: '#F5F5F7' }}>Add Partner</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#F5F5F7" /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input placeholder="Company Name *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                <input placeholder="Website URL (https://...)" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} style={inputStyle} />
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                  <option value="client">Client</option>
                  <option value="partner">Partner</option>
                  <option value="technology">Technology</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', color: form.logo ? '#F5F5F7' : '#9999AA', fontSize: '14px' }}>
                  <Upload size={15} /> {form.logo ? form.logo.name : 'Upload Logo *'}
                  <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, logo: e.target.files[0] }))} style={{ display: 'none' }} />
                </label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={create.isPending} style={{ flex: 1, justifyContent: 'center' }}>{create.isPending ? 'Adding...' : 'Add Partner'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
