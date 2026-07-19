import { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

interface BaseProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
}

interface InputFieldProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  type: 'text' | 'date' | 'email' | 'number'
}

interface SelectFieldProps extends BaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  type: 'select'
  options: { value: string; label: string }[]
}

interface ToggleFieldProps extends BaseProps {
  type: 'toggle'
  checked: boolean
  onChange: (checked: boolean) => void
}

type FormFieldProps = InputFieldProps | SelectFieldProps | ToggleFieldProps

export function FormField(props: FormFieldProps) {
  const { label, hint, error, required } = props

  const fieldId = label.toLowerCase().replace(/\s+/g, '-')

  const labelEl = (
    <label htmlFor={fieldId} className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
      {label}
      {required && <span className="text-gold ml-1">*</span>}
    </label>
  )

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-gold/40 focus:bg-white/8 transition-[background-color,border-color]'

  if (props.type === 'toggle') {
    const { checked, onChange } = props as ToggleFieldProps
    return (
      <div className="space-y-1">
        {labelEl}
        <button
          type="button"
          onClick={() => onChange(!checked)}
          aria-label={label}
          className={`relative w-12 h-6 rounded-full transition-[background-color] duration-200 ${
            checked ? 'bg-gold' : 'bg-white/20'
          }`}
          role="switch"
          aria-checked={checked}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        {hint && <p className="text-xs text-white/30">{hint}</p>}
      </div>
    )
  }

  if (props.type === 'select') {
    const { options, type: _t, label: _l, hint: _h, error: _e, required: _r, ...selectProps } =
      props as SelectFieldProps
    return (
      <div className="space-y-1">
        {labelEl}
        <select
          id={fieldId}
          className={`${inputClass} appearance-none cursor-pointer`}
          {...selectProps}
        >
          <option value="" disabled hidden>Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-navy-dark">
              {opt.label}
            </option>
          ))}
        </select>
        {hint && <p className="text-xs text-white/30">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  const { type, label: _l, hint: _h, error: _e, required: _r, ...inputProps } =
    props as InputFieldProps
  return (
    <div className="space-y-1">
      {labelEl}
      <input id={fieldId} type={type} className={inputClass} {...inputProps} />
      {hint && <p className="text-xs text-white/30">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
