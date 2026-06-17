'use client'

import { useState, useId } from 'react'
import { cn } from '@/lib/utils'

interface PesoInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
  className?: string
}

export function PesoInput({ label, value, onChange, hint, className }: PesoInputProps) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')

  const formatted = value === 0 ? '' : `₱${value.toLocaleString('en-PH')}`

  function handleFocus() {
    setFocused(true)
    setRaw(value === 0 ? '' : String(value))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const stripped = e.target.value.replace(/[^0-9]/g, '')
    setRaw(stripped)
    const num = parseInt(stripped, 10)
    onChange(isNaN(num) ? 0 : Math.max(0, num))
  }

  function handleBlur() {
    setFocused(false)
    setRaw('')
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="block font-sans text-xs text-white/40 mb-1.5">
        {label}
      </label>
      {hint && <p className="font-sans text-xs text-white/25 mb-1.5 leading-snug">{hint}</p>}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={focused ? raw : formatted}
        placeholder="₱0"
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'w-full bg-navy-card border border-white/10 rounded-lg px-3 py-2.5',
          'font-sans text-sm text-white placeholder:text-white/20',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
          'transition-[border-color] duration-150',
          'min-h-[44px]'
        )}
      />
    </div>
  )
}

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  hint?: string
  className?: string
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  hint,
  className,
}: NumberInputProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-sans text-xs text-white/40 mb-1.5">
        {label}
      </label>
      {hint && <p className="font-sans text-xs text-white/25 mb-1.5 leading-snug">{hint}</p>}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value || ''}
        placeholder="0"
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          onChange(isNaN(n) ? 0 : Math.min(max ?? Infinity, Math.max(min, n)))
        }}
        className={cn(
          'w-full bg-navy-card border border-white/10 rounded-lg px-3 py-2.5',
          'font-sans text-sm text-white placeholder:text-white/20',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
          'transition-[border-color] duration-150',
          'min-h-[44px]',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
      />
    </div>
  )
}
