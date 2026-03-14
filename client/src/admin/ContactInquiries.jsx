import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, X, Eye, EyeOff, MailOpen, Mail } from 'lucide-react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import api from '../utils/api'

export default function ContactInquiries() {
  const [selected, setSelected] = useState(null)
  const [newCount, setNewCount] = useState(0)
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', page],
    queryFn: () => api.get(`/contacts?page=${page}&limit=15`).then(r => r.data),
  })

  useEffect(() => {
    if (data?.newCount) setNewCount(data.newCount)
  }, [data])

  // Real-time new inquiry
  useEffect(() => {
    const socket = io('/')
    socket.emit('admin_join')
    socket.on('new_inquiry', (inquiry) => {
      setNewCount(p => p + 1)
      qc.invalidateQueries(['contacts'])
      toast.custom(<div style={{ background: '#0E0E12', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#F5F5F7', fontSize: '13px' }}>
        🔔 New inquiry from <strong>{inquiry.name}</strong>
      </div>)
    })
    return () => socket.disconnect()
  }, [])

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/contacts/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries(['contacts']),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      toast.success('Inquiry deleted')
      qc.invalidateQueries(['contacts'])
      setSelected(null)
    },
  })

  const contacts = data?.data || []
  const pagination = data?.pagination

  const statusColors = {
    new: { bg: 'rgba(108,99,255,0.15)', color: '#6C63FF' },
    read: { bg: 'rgba(255,255,255,0.06)', color: '#9999AA' },
    replied: { bg: 'rgba(0,201,167,0.15)', color: '#00C9A7' },
    closed: { bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b' },
  }

  return (
    <AdminLayout newInquiries={newCount}>
      <div style={{ padding: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#F5F5F7' }}>
            Contact Inquiries
            {newCount > 0 && <span style={{ marginLeft: '12px', padding: '4px 10px', background: '#6C63FF', borderRadius: '100px', fontSize: '14px', color: '#fff' }}>{newCount} new</span>}
          </h1>
          <p style={{ color: '#9999AA', fontSize: '14px', marginTop: '4px' }}>All form submissions and inquiries</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Email', 'Service', 'Date', 'Status', 'Actions'].map(col => (
                    <th key={col} style={{ textAlign: 'left', padding: '14px 20px', color: '#9999AA', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9999AA' }}>Loading...</td></tr>
                ) : contacts.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9999AA' }}>No inquiries yet.</td></tr>
                ) : contacts.map(c => (
                  <tr
                    key={c._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', cursor: 'pointer' }}
                    onClick={() => { setSelected(c); if (c.status === 'new') updateStatus.mutate({ id: c._id, status: 'read' }) }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.status === 'new' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C63FF', flexShrink: 0 }} />}
                        <p style={{ color: '#F5F5F7', fontSize: '14px', fontWeight: c.status === 'new' ? 700 : 400 }}>{c.name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#9999AA', fontSize: '13px' }}>{c.email}</td>
                    <td style={{ padding: '14px 20px', color: '#9999AA', fontSize: '13px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.service || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#9999AA', fontSize: '13px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, ...statusColors[c.status] }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => updateStatus.mutate({ id: c._id, status: c.status === 'read' ? 'new' : 'read' })}
                          style={{ width: 32, height: 32, background: 'rgba(108,99,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title={c.status === 'read' ? 'Mark as new' : 'Mark as read'}
                        >
                          {c.status === 'new' ? <MailOpen size={13} color="#6C63FF" /> : <Mail size={13} color="#9999AA" />}
                        </button>
                        <button onClick={() => { if (confirm('Delete inquiry?')) deleteMut.mutate(c._id) }} style={{ width: 32, height: 32, background: 'rgba(255,107,107,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={13} color="#ff6b6b" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{ width: 36, height: 36, borderRadius: '8px', border: `1px solid ${page === i + 1 ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`, background: page === i + 1 ? 'rgba(108,99,255,0.2)' : 'transparent', color: page === i + 1 ? '#6C63FF' : '#9999AA', cursor: 'pointer', fontSize: '13px' }}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 8999 }} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '420px', background: '#0E0E12', borderLeft: '1px solid rgba(255,255,255,0.1)', zIndex: 9000, padding: '32px', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: '#F5F5F7' }}>Inquiry Details</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#F5F5F7" /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || 'Not provided' },
                  { label: 'Company', value: selected.company || 'Not provided' },
                  { label: 'Service', value: selected.service || 'Not specified' },
                  { label: 'Date', value: new Date(selected.createdAt).toLocaleString() },
                ].map(field => (
                  <div key={field.label}>
                    <p style={{ color: '#9999AA', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{field.label}</p>
                    <p style={{ color: '#F5F5F7', fontSize: '14px' }}>{field.value}</p>
                  </div>
                ))}
                <div>
                  <p style={{ color: '#9999AA', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Message</p>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', color: '#F5F5F7', fontSize: '14px', lineHeight: 1.7 }}>
                    {selected.message}
                  </div>
                </div>

                {/* Status change */}
                <div>
                  <p style={{ color: '#9999AA', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Update Status</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['new', 'read', 'replied', 'closed'].map(s => (
                      <button
                        key={s}
                        onClick={() => { updateStatus.mutate({ id: selected._id, status: s }); setSelected(p => ({ ...p, status: s })) }}
                        style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, border: `1px solid ${selected.status === s ? statusColors[s].color : 'rgba(255,255,255,0.1)'}`, background: selected.status === s ? statusColors[s].bg : 'transparent', color: selected.status === s ? statusColors[s].color : '#9999AA', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => { if (confirm('Delete this inquiry?')) deleteMut.mutate(selected._id) }} style={{ width: '100%', padding: '12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '10px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                  Delete Inquiry
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
