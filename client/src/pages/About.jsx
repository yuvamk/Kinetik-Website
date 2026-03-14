import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Users, Target, Zap, Globe, Heart, Award } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

function SpinningRing() {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.3
    ref.current.rotation.y = state.clock.elapsedTime * 0.5
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[2, 0.08, 20, 100]} />
      <meshStandardMaterial color="#6C63FF" emissive="#3d38aa" emissiveIntensity={0.5} />
    </mesh>
  )
}

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'Every project starts with your goals. We align our work with your vision.' },
  { icon: Zap, title: 'Speed & Quality', desc: 'We deliver fast without cutting corners. Perfection on a timeline.' },
  { icon: Globe, title: 'Global Thinking', desc: 'Building products for a world-wide audience with local sensitivity.' },
  { icon: Heart, title: 'We Actually Care', desc: 'Your success is our success. We invest in every client relationship.' },
  { icon: Users, title: 'Collaborative', desc: 'Transparent process, regular updates, and you\'re involved every step.' },
  { icon: Award, title: 'Award-Worthy Work', desc: 'We aim for awwwards-level quality in everything we produce.' },
]

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ paddingTop: '72px' }}
    >
      {/* Hero */}
      <section style={{ padding: '100px 0 60px', background: '#060608', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-100px', top: '50%', transform: 'translateY(-50%)', width: 500, height: 500, opacity: 0.4 }}>
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#6C63FF" />
            <SpinningRing />
          </Canvas>
        </div>
        <div className="container-fluid" style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-tag">About Kinetik</span>
          <h1 className="section-heading" style={{ maxWidth: '600px', marginBottom: '24px' }}>
            We Are Builders of the<br /><span className="gradient-text">Digital Future</span>
          </h1>
          <p style={{ color: '#9999AA', fontSize: '18px', lineHeight: 1.8, maxWidth: '560px' }}>
            Kinetik is a full-service digital agency founded on a simple belief: every great idea deserves extraordinary execution. We combine design artistry with engineering precision to create digital experiences that captivate, convert, and endure.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding" style={{ background: '#0E0E12' }}>
        <div className="container-fluid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <span className="section-tag">Our Story</span>
              <h2 className="section-heading">Born from a Passion for<br /><span className="gradient-text">Creation</span></h2>
              <p style={{ color: '#9999AA', fontSize: '15px', lineHeight: 1.9, marginBottom: '20px' }}>
                Kinetik was built by developers and designers who were tired of settling for mediocre digital products. We saw a gap between beautiful design and robust engineering — and we decided to close it.
              </p>
              <p style={{ color: '#9999AA', fontSize: '15px', lineHeight: 1.9 }}>
                Today, we help startups and established businesses alike transform their ideas into polished, high-performing digital products. From a sleek landing page to a complex AI-powered system — we build it all.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { num: '50+', label: 'Projects Done' },
                { num: '40+', label: 'Happy Clients' },
                { num: '3+', label: 'Years Building' },
                { num: '100%', label: 'Client Satisfaction' },
              ].map(stat => (
                <motion.div
                  key={stat.label}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true }}
                  className="card"
                  style={{ textAlign: 'center' }}
                >
                  <div className="gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '36px', fontWeight: 800 }}>{stat.num}</div>
                  <p style={{ color: '#9999AA', fontSize: '13px', marginTop: '4px' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding" style={{ background: '#060608' }}>
        <div className="container-fluid">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-tag">Our Values</span>
            <h2 className="section-heading">What Drives Us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card"
                >
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Icon size={22} color="#6C63FF" />
                  </div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: '#F5F5F7', marginBottom: '10px' }}>{v.title}</h3>
                  <p style={{ color: '#9999AA', fontSize: '14px', lineHeight: 1.7 }}>{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </motion.div>
  )
}
