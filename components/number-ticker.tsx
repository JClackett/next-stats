"use client"

import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

interface NumberTickerProps {
  value: number
  className?: string
}

export function NumberTicker({ value, className }: NumberTickerProps) {
  const [hasAnimated, setHasAnimated] = useState(false)

  // Create a spring animation
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
  })

  // Transform the spring value to the target value
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    if (!hasAnimated) {
      spring.set(value)
      setHasAnimated(true)
    }
  }, [spring, value, hasAnimated])

  return <motion.span className={className}>{display}</motion.span>
}
