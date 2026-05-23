'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface DeckSlideProps {
  children: ReactNode
  slideKey: number
  direction: number
}

export function DeckSlide({ children, slideKey, direction }: DeckSlideProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={slideKey}
        custom={direction}
        initial={{ opacity: 0, x: direction * 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -60 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-16"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
