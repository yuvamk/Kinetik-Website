import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, Mail, Phone, Building, Clock, Trash2, Bot, X } from 'lucide-react'
import AdminLayout from './AdminLayout'
import api from '../utils/api'

export default function ChatSessions() {
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const messagesEndRef = useRef(null)

  const fetchSessions = async () => {
    try {
      const res = await api.get('/chat/sessions')
      setSessions(res.data.data || [])
    } catch (err) {
      console.error('Failed to load chat sessions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  // Auto-scroll to bottom when a session is selected or messages update
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (selected) {
      // Small timeout to ensure DOM has updated
      setTimeout(scrollToBottom, 50)
    }
  }, [selected, selected?.messages?.length])

  const handleDelete = async (sessionId) => {
    if (!confirm('Delete this chat session?')) return
    setDeleting(sessionId)
    try {
      await api.delete(`/chat/sessions/${sessionId}`)
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId))
      if (selected?.sessionId === sessionId) setSelected(null)
    } catch (err) {
      alert('Failed to delete session')
    } finally {
      setDeleting(null)
    }
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getLastMessage = (session) => {
    const msgs = session.messages || []
    if (!msgs.length) return 'No messages yet'
    return msgs[msgs.length - 1].message.slice(0, 60) + (msgs[msgs.length - 1].message.length > 60 ? '...' : '')
  }

  return (
    <AdminLayout>
      {/* Outer wrapper: fills exactly 100% of viewport, handles its own inner scrolling */}
      <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden', // Prevents AdminLayout from scrolling the whole page
        background: '#060608',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#F5F5F7', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={20} color="#fff" />
            </div>
            AI Chat Sessions
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '6px' }}>
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} captured by Kira AI
          </p>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#666' }}>
            <MessageCircle size={48} style={{ opacity: 0.3 }} />
            <p>No chat sessions yet. They'll appear here once visitors start chatting.</p>
          </div>
        ) : (
          // Split pane — flex:1 fills remaining height, enabling inner scroll
          <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
            {/* Sessions list */}
            <div
              data-lenis-prevent
              style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}
            >
              {sessions.map(session => (
                <motion.div
                  key={session.sessionId}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelected(session)}
                  style={{
                    padding: '16px', borderRadius: '14px', cursor: 'pointer',
                    background: selected?.sessionId === session.sessionId
                      ? 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selected?.sessionId === session.sessionId ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.07)'}`,
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={13} color="#fff" />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.visitorName || 'Anonymous'}
                        </span>
                      </div>
                      {session.visitorEmail && (
                        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px 0', paddingLeft: '36px' }}>{session.visitorEmail}</p>
                      )}
                      <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0', paddingLeft: '36px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getLastMessage(session)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', color: '#555' }}>{formatTime(session.lastMessageAt)}</span>
                      <span style={{ fontSize: '10px', background: 'rgba(108,99,255,0.2)', color: '#6C63FF', padding: '2px 8px', borderRadius: '20px' }}>
                        {(session.messages || []).length} msgs
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(session.sessionId) }}
                    disabled={deleting === session.sessionId}
                    style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,71,87,0.1)', border: 'none', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', opacity: 0.6 }}
                  >
                    <Trash2 size={11} color="#ff4757" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Chat viewer */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!selected ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#444' }}>
                  <MessageCircle size={40} />
                  <p style={{ fontSize: '14px' }}>Select a conversation to view</p>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', margin: '0 0 8px 0' }}>{selected.visitorName || 'Anonymous'}</h2>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {selected.visitorEmail && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#888' }}>
                            <Mail size={11} />{selected.visitorEmail}
                          </span>
                        )}
                        {selected.visitorPhone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#888' }}>
                            <Phone size={11} />{selected.visitorPhone}
                          </span>
                        )}
                        {selected.visitorCompany && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#888' }}>
                            <Building size={11} />{selected.visitorCompany}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#888' }}>
                          <Clock size={11} />{formatTime(selected.startedAt)}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={14} color="#888" />
                    </button>
                  </div>

                  {/* Messages — flex:1 now has a resolved parent height and scrolls */}
                  <div
                    data-lenis-prevent
                    style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}
                  >
                    {(selected.messages || []).map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'visitor' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                        {msg.from === 'bot' && (
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Bot size={12} color="#fff" />
                          </div>
                        )}
                        <div style={{ maxWidth: '70%' }}>
                          <div style={{
                            padding: '10px 14px', borderRadius: msg.from === 'visitor' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: msg.from === 'visitor' ? 'linear-gradient(135deg, #6C63FF, #00D4FF)' : 'rgba(255,255,255,0.06)',
                            border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                            color: '#F5F5F7', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                          }}>
                            {msg.message}
                          </div>
                          <p style={{ fontSize: '10px', color: '#444', margin: '3px 4px 0', textAlign: msg.from === 'visitor' ? 'right' : 'left' }}>
                            {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {msg.from === 'visitor' && (
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={12} color="#888" />
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
