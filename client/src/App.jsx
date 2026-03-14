import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'
import CustomCursor from './components/CustomCursor'
import ScrollProgress from './components/ScrollProgress'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'

gsap.registerPlugin(ScrollTrigger)

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Projects = lazy(() => import('./pages/Projects'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Admin pages
const AdminLogin = lazy(() => import('./admin/Login'))
const AdminDashboard = lazy(() => import('./admin/Dashboard'))
const ManageProjects = lazy(() => import('./admin/ManageProjects'))
const ManageBlogs = lazy(() => import('./admin/ManageBlogs'))
const ManagePartners = lazy(() => import('./admin/ManagePartners'))
const ContactInquiries = lazy(() => import('./admin/ContactInquiries'))
const ChatSessions = lazy(() => import('./admin/ChatSessions'))

const publicPaths = ['/', '/about', '/services', '/projects', '/blog', '/contact']

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    // Disable Lenis smooth scrolling on admin routes to prevent conflicts with local scrolling
    if (isAdminRoute) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [isAdminRoute])

  return (
    <AuthProvider>
      <CustomCursor />
      <ScrollProgress />
      {!isAdminRoute && <Navbar />}

      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><ManageProjects /></ProtectedRoute>} />
            <Route path="/admin/blogs" element={<ProtectedRoute><ManageBlogs /></ProtectedRoute>} />
            <Route path="/admin/partners" element={<ProtectedRoute><ManagePartners /></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute><ContactInquiries /></ProtectedRoute>} />
            <Route path="/admin/chats" element={<ProtectedRoute><ChatSessions /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatWidget />}
    </AuthProvider>
  )
}
