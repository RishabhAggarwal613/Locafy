'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.12
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.07) * 0.15
  })

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.7}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshPhysicalMaterial
          color="#4f46e5"
          metalness={0.5}
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  )
}

function OrbitRing({ radius, rotX, color }: { radius: number; rotX: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = clock.getElapsedTime() * 0.25
  })
  return (
    <mesh ref={ref} rotation={[rotX, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 16, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  )
}

function OrbitingDot({ angle, radius, speed, color, yOffset = 0 }: {
  angle: number; radius: number; speed: number; color: string; yOffset?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const a = angle + t * speed
    ref.current.position.x = Math.cos(a) * radius
    ref.current.position.z = Math.sin(a) * radius
    ref.current.position.y = yOffset + Math.sin(t * 0.8 + angle) * 0.15
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  )
}

function ParticleField() {
  const count = 600
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.015
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#818cf8" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0.5, 5.5], fov: 52 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.3} />
        <pointLight position={[8, 8, 8]} intensity={1.5} color="#818cf8" />
        <pointLight position={[-8, -4, -8]} intensity={1.0} color="#a78bfa" />
        <pointLight position={[0, -6, 4]} intensity={0.5} color="#6366f1" />

        <ParticleField />
        <AnimatedSphere />

        <OrbitRing radius={2.3} rotX={Math.PI / 4} color="#818cf8" />
        <OrbitRing radius={2.8} rotX={-Math.PI / 5} color="#a78bfa" />

        {[
          { angle: 0.0, radius: 2.3, speed:  0.5,  color: '#818cf8' },
          { angle: 2.1, radius: 2.3, speed:  0.5,  color: '#34d399' },
          { angle: 4.2, radius: 2.3, speed:  0.5,  color: '#fbbf24' },
          { angle: 1.0, radius: 2.8, speed: -0.35, color: '#f472b6' },
          { angle: 3.5, radius: 2.8, speed: -0.35, color: '#60a5fa' },
        ].map((props, i) => (
          <OrbitingDot key={i} {...props} />
        ))}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}
