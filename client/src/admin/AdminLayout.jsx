import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, FileText, Users,
  MessageSquare, Bot, LogOut, ChevronLeft, ChevronRight, Menu,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
  { icon: FolderKanban, label: 'Projects', to: '/admin/projects' },
  { icon: FileText, label: 'Blog Posts', to: '/admin/blogs' },
  { icon: Users, label: 'Partners', to: '/admin/partners' },
  { icon: MessageSquare, label: 'Inquiries', to: '/admin/contacts' },
  { icon: Bot, label: 'AI Chats', to: '/admin/chats' },
]

const SIDEBAR_WIDTH = 240
const COLLAPSED_WIDTH = 68

export default function AdminLayout({ children, newInquiries = 0 }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const w = collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#060608' }}>

      {/* ── Fixed Sidebar ── */}
      <motion.aside
        animate={{ width: w }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        style={{
          width: w,
          minWidth: w,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 100,
          background: '#0E0E12',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        {/* Logo + Collapse Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '20px 0' : '20px 16px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          minHeight: 72,
          flexShrink: 0,
        }}>
          {!collapsed && (
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', overflow: 'hidden' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#06101f', boxShadow: '0 0 12px rgba(108,99,255,0.45)' }}>
                <img src="/kinetik-logo.png" alt="Kinetik" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }} />
              </div>
              <motion.span
                initial={false}
                animate={{ opacity: 1 }}
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '17px', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}
              >
                KINETIK
              </motion.span>
            </Link>
          )}

          {collapsed && (
            <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', overflow: 'hidden', background: '#06101f', boxShadow: '0 0 12px rgba(108,99,255,0.45)' }}>
                <img src="/kinetik-logo.png" alt="Kinetik" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }} />
              </div>
            </Link>
          )}

          {!collapsed && (
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <ChevronLeft size={15} color="#9999AA" />
            </motion.button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight size={15} color="#9999AA" />
            </motion.button>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.to
            const isInquiries = item.to === '/admin/contacts'
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : '12px',
                  padding: collapsed ? '11px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '10px', textDecoration: 'none',
                  background: active ? 'rgba(108,99,255,0.15)' : 'transparent',
                  color: active ? '#6C63FF' : '#9999AA',
                  fontSize: '14px', fontWeight: 500,
                  transition: 'background 0.2s, color 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F5F7' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9999AA' } }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ flex: 1 }}>{item.label}</span>
                )}
                {!collapsed && isInquiries && newInquiries > 0 && (
                  <span style={{ background: '#6C63FF', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', minWidth: 20, textAlign: 'center' }}>
                    {newInquiries}
                  </span>
                )}
                {!collapsed && active && (
                  <ChevronRight size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
                )}
                {/* Active dot when collapsed */}
                {collapsed && active && (
                  <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#6C63FF' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin info + logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '4px', overflow: 'hidden' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {admin?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ color: '#F5F5F7', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.name || 'Admin'}</p>
                <p style={{ color: '#9999AA', fontSize: '11px' }}>{admin?.role}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', marginBottom: '4px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                {admin?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px', width: '100%', padding: collapsed ? '10px 0' : '10px 12px',
              background: 'none', border: 'none', color: '#9999AA',
              cursor: 'pointer', borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.08)'; e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9999AA' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </motion.aside>

      {/* ── Scrollable Main Content ── */}
      <motion.main
        animate={{ marginLeft: w }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        data-lenis-prevent
        style={{
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#060608',
        }}
      >
        {children}
      </motion.main>
    </div>
  )
}
