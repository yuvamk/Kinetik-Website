import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Home, ArrowRight } from 'lucide-react'

function FloatingGeometry() {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.4
    ref.current.rotation.y = state.clock.elapsedTime * 0.6
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
  })
  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[2]} />
      <meshStandardMaterial color="#6C63FF" emissive="#3d38aa" emissiveIntensity={0.5} wireframe />
    </mesh>
  )
}

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060608', position: 'relative', overflow: 'hidden' }}
    >
      {/* 3D Canvas Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#6C63FF" />
          <pointLight position={[-10, -10, -5]} intensity={1} color="#00D4FF" />
          <FloatingGeometry />
        </Canvas>
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
        >
          <div className="gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(100px, 20vw, 180px)', fontWeight: 900, lineHeight: 1 }}>
            404
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#F5F5F7', marginBottom: '16px' }}
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#9999AA', fontSize: '16px', marginBottom: '40px', maxWidth: '420px' }}
        >
          Looks like you've wandered into the void. Let's get you back to reality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/" className="btn-primary">
            <Home size={16} /> Back to Home
          </Link>
          <Link to="/contact" className="btn-outline">
            Contact Us <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
