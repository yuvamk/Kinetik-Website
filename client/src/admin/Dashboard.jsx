import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FolderKanban, FileText, Users, MessageSquare, TrendingUp, Eye } from 'lucide-react'
import { io } from 'socket.io-client'
import AdminLayout from './AdminLayout'
import api from '../utils/api'

const COLORS = ['#6C63FF', '#00D4FF', '#FF6B9D', '#7B61FF', '#00C9A7', '#FFB74D']

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const [newInquiries, setNewInquiries] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/contacts/stats/overview').then(r => r.data.data),
  })

  const { data: contactsData } = useQuery({
    queryKey: ['recent-contacts'],
    queryFn: () => api.get('/contacts?limit=5').then(r => r.data),
  })

  useEffect(() => {
    if (data) setNewInquiries(data.newContacts || 0)
  }, [data])

  useEffect(() => {
    const token = localStorage.getItem('kinetik_token')
    const socket = io('/', { auth: { token } })
    socket.emit('admin_join')
    socket.on('new_inquiry', () => setNewInquiries(p => p + 1))
    return () => socket.disconnect()
  }, [])

  const stats = [
    { label: 'Total Projects', value: data?.totalProjects || 0, icon: FolderKanban, color: '#6C63FF' },
    { label: 'Blog Posts', value: data?.totalBlogs || 0, icon: FileText, color: '#00D4FF' },
    { label: 'Partners', value: data?.totalPartners || 0, icon: Users, color: '#00C9A7' },
    { label: 'New Inquiries', value: data?.newContacts || 0, icon: MessageSquare, color: '#FF6B9D' },
    { label: 'Total Contacts', value: data?.totalContacts || 0, icon: TrendingUp, color: '#7B61FF' },
    { label: 'Page Views', value: '2.4K', icon: Eye, color: '#FFB74D' },
  ]

  const monthlyChartData = (data?.monthlyData || []).map(d => ({
    name: months[d._id.month - 1],
    count: d.count,
  }))

  const serviceChartData = (data?.serviceData || []).map(d => ({
    name: d._id || 'Unknown',
    value: d.count,
  }))

  const recentContacts = contactsData?.data || []

  return (
    <AdminLayout newInquiries={newInquiries}>
      <div style={{ padding: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#F5F5F7' }}>Dashboard</h1>
          <p style={{ color: '#9999AA', fontSize: '14px', marginTop: '4px' }}>Welcome back! Here's what's happening.</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={stat.color} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 800, color: stat.color }}>
                  {isLoading ? '—' : stat.value}
                </div>
                <p style={{ color: '#9999AA', fontSize: '13px', marginTop: '4px' }}>{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
          {/* Bar chart */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F5F5F7', marginBottom: '24px' }}>Inquiries per Month</h3>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="name" tick={{ fill: '#9999AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9999AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0E0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F5F5F7' }} />
                  <Bar dataKey="count" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9999AA', fontSize: '14px' }}>No data yet</div>
            )}
          </div>

          {/* Pie chart */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F5F5F7', marginBottom: '24px' }}>By Service</h3>
            {serviceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={serviceChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {serviceChartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0E0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F5F5F7' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9999AA', fontSize: '14px' }}>No data yet</div>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F5F5F7', marginBottom: '20px' }}>Recent Inquiries</h3>
          {recentContacts.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Name', 'Email', 'Service', 'Date', 'Status'].map(col => (
                      <th key={col} style={{ textAlign: 'left', padding: '10px 16px', color: '#9999AA', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentContacts.map(contact => (
                    <tr key={contact._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px', color: '#F5F5F7', fontSize: '14px' }}>{contact.name}</td>
                      <td style={{ padding: '14px 16px', color: '#9999AA', fontSize: '13px' }}>{contact.email}</td>
                      <td style={{ padding: '14px 16px', color: '#9999AA', fontSize: '13px' }}>{contact.service || '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#9999AA', fontSize: '13px' }}>{new Date(contact.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: contact.status === 'new' ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)', color: contact.status === 'new' ? '#6C63FF' : '#9999AA' }}>
                          {contact.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#9999AA', fontSize: '14px', textAlign: 'center', padding: '24px' }}>No inquiries yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
