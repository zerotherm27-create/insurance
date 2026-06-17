'use client'

import { useState, useId, useEffect } from 'react'
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
        autoComplete="off"
        value={focused ? raw : formatted}
        placeholder="₱0"
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'w-full bg-navy-card border rounded-lg px-3 py-2.5',
          'font-sans text-sm text-white placeholder:text-white/20',
          'focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20',
          'border-white/10',
          'transition-[border-color,box-shadow] duration-150',
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
  const [focused, setFocused] = useState(false)
  const [rawStr, setRawStr] = useState(value === 0 ? '' : String(value))

  // Sync from props when not focused (e.g. parent resets a dependent value)
  useEffect(() => {
    if (!focused) {
      setRawStr(value === 0 ? '' : String(value))
    }
  }, [value, focused])

  function handleFocus() {
    setFocused(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const str = e.target.value.replace(/[^0-9]/g, '')
    setRawStr(str)
    const n = parseInt(str, 10)
    if (!isNaN(n)) {
      onChange(n)
    }
  }

  function handleBlur() {
    setFocused(false)
    const n = parseInt(rawStr, 10)
    const lo = min ?? 0
    const hi = max ?? Infinity
    const clamped = isNaN(n) ? lo : Math.min(hi, Math.max(lo, n))
    onChange(clamped)
    setRawStr(String(clamped))
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
        autoComplete="off"
        value={rawStr}
        placeholder={String(min ?? 0)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'w-full bg-navy-card border rounded-lg px-3 py-2.5',
          'font-sans text-sm text-white placeholder:text-white/20',
          'focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20',
          'border-white/10',
          'transition-[border-color,box-shadow] duration-150',
          'min-h-[44px]'
        )}
      />
    </div>
  )
}
