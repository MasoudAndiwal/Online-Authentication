'use client'

import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Box } from '@react-three/drei'
import { motion } from 'framer-motion'

interface Card3DProps {
  children: React.ReactNode
  className?: string
  depth?: number
  rotateOnHover?: boolean
}

export function Card3D({ 
  children, 
  className = '', 
  depth = 20,
  rotateOnHover = true 
}: Card3DProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      animate={{
        rotateX: isHovered && rotateOnHover ? 5 : 0,
        rotateY: isHovered && rotateOnHover ? 5 : 0,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg border"
        style={{
          transform: `translateZ(${depth}px)`,
          boxShadow: isHovered 
            ? `0 ${depth}px ${depth * 2}px rgba(0,0,0,0.15)` 
            : `0 ${depth/2}px ${depth}px rgba(0,0,0,0.1)`
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

interface Button3DProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button3D({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className = ''
}: Button3DProps) {
  const [isPressed, setIsPressed] = React.useState(false)

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <motion.button
      className={`
        relative rounded-lg font-medium transition-all duration-150 
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        transform: isPressed ? 'translateZ(-4px)' : 'translateZ(0px)',
        boxShadow: isPressed 
          ? '0 2px 4px rgba(0,0,0,0.2)' 
          : '0 6px 12px rgba(0,0,0,0.15)'
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
      }}
      whileTap={{ scale: 0.95 }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 rounded-lg bg-black opacity-20"
        style={{
          transform: 'translateZ(-6px)',
        }}
      />
      {children}
    </motion.button>
  )
}

interface AttendanceVisualizerProps {
  attendanceData: Array<{
    date: string
    present: number
    total: number
  }>
  className?: string
}

export function AttendanceVisualizer3D({ 
  attendanceData, 
  className = '' 
}: AttendanceVisualizerProps) {
  return (
    <div className={`h-64 w-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} />
        
        {attendanceData.map((data, index) => {
          const percentage = (data.present / data.total) * 100
          const height = (percentage / 100) * 3
          const color = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444'
          
          return (
            <Box
              key={index}
              position={[index * 1.5 - (attendanceData.length * 0.75), height / 2, 0]}
              args={[1, height, 1]}
            >
              <meshStandardMaterial color={color} />
            </Box>
          )
        })}
        
        <Text
          position={[0, -2, 0]}
          fontSize={0.5}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          Attendance Overview
        </Text>
      </Canvas>
    </div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  amplitude?: number
  speed?: number
  className?: string
}

export function FloatingElement({ 
  children, 
  amplitude = 10,
  speed = 2,
  className = ''
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxContainerProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function ParallaxContainer({ 
  children, 
  speed = 0.5,
  className = ''
}: ParallaxContainerProps) {
  const [scrollY, setScrollY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={className}
      style={{
        transform: `translateY(${scrollY * speed}px)`
      }}
    >
      {children}
    </div>
  )
}

export function GlassCard({ 
  children, 
  className = '',
  blur = 'md',
  disableHover = false
}: {
  children: React.ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  disableHover?: boolean
}) {
  const blurClasses: Record<string, string> = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  return (
    <motion.div
      className={`
        relative rounded-xl border border-white/20 
        bg-white/10 ${blurClasses[blur]}
        shadow-xl ${className}
      `}
      whileHover={disableHover ? undefined : {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}