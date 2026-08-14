'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

interface ModalBackdropProps {
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function ModalBackdrop({ onClose, children, className }: ModalBackdropProps) {
  return (
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm', className)}
    >
      {children}
    </motion.div>
  )
}

interface ModalPanelProps {
  children: React.ReactNode
  className?: string
}

export function ModalPanel({ children, className }: ModalPanelProps) {
  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 8 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
