import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Animated Particle Field ───────────────────────────────
function ParticleField({ count = 3000 }) {
  const ref = useRef()
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      const color = new THREE.Color().setHSL(Math.random() * 0.15 + 0.65, 1, 0.6)
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return { positions: pos, colors: col }
  }, [count])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Central 3D Shape with mouse parallax ──────────────────
function CentralShape({ mouseRef }) {
  const meshRef = useRef()
  const targetRef = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    // Slow auto-rotation
    meshRef.current.rotation.y = t * 0.15
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2

    // Mouse parallax
    if (mouseRef?.current) {
      targetRef.current.x += (mouseRef.current.x * 0.6 - targetRef.current.x) * 0.05
      targetRef.current.y += (mouseRef.current.y * 0.6 - targetRef.current.y) * 0.05
      meshRef.current.position.x = targetRef.current.x
      meshRef.current.position.y = targetRef.current.y
    }

    // Floating bob
    meshRef.current.position.y += Math.sin(t * 0.5) * 0.002
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 5]} />
      <meshStandardMaterial
        color="#6C63FF"
        emissive="#3d38aa"
        emissiveIntensity={0.4}
        roughness={0.1}
        metalness={0.8}
        wireframe={false}
      />
    </mesh>
  )
}

// ─── Inner wireframe shell ──────────────────────────────────
function WireframeShell({ mouseRef }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = -state.clock.elapsedTime * 0.1
      ref.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[2.4, 0.04, 200, 20]} />
      <meshStandardMaterial
        color="#00D4FF"
        emissive="#00D4FF"
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

// ─── Scene ──────────────────────────────────────────────────
function Scene({ mouseRef }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#6C63FF" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#00D4FF" />
      <pointLight position={[0, 5, -10]} intensity={0.5} color="#ffffff" />

      <ParticleField count={2500} />
      <WireframeShell mouseRef={mouseRef} />
      <CentralShape mouseRef={mouseRef} />

      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export default function HeroScene({ mouseRef }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Scene mouseRef={mouseRef} />
    </Canvas>
  )
}
