import { useState } from 'react'
import clsx from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

export function Input({ label, placeholder, value, onChange, type = 'text', icon, error, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const inputType  = isPassword && showPass ? 'text' : type

  return (
    <div className="w-full mb-2.5">
      {label && (
        <span className="block text-[9px] font-bold text-t3 tracking-[1.2px] uppercase mb-1.5">
          {label}
        </span>
      )}

      <div className={clsx(
        'flex items-center bg-inp rounded-[11px] px-3 py-[10px] gap-2',
        'border-[1.5px] transition-[border-color,box-shadow] duration-[250ms]',
        focused
          ? 'border-blue shadow-[0_0_0_3px_var(--blue-sub)]'
          : error
            ? 'border-red'
            : 'border-bdr'
      )}>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-t1 text-[13px] font-sans placeholder:text-t3"
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="bg-transparent border-none cursor-pointer text-icon flex items-center p-0 hover:text-t2 transition-colors duration-[350ms]"
          >
            {showPass ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
          </button>
        ) : icon ? (
          <span className="text-icon flex items-center flex-shrink-0">{icon}</span>
        ) : null}
      </div>

      {error && (
        <span className="block text-[10px] text-red mt-1">{error}</span>
      )}
    </div>
  )
}

export function Textarea({ label, placeholder, value, onChange, rows = 4, error }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="w-full mb-2.5">
      {label && (
        <span className="block text-[9px] font-bold text-t3 tracking-[1.2px] uppercase mb-1.5">
          {label}
        </span>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={clsx(
          'w-full bg-inp rounded-[11px] px-3 py-[10px] text-t1 text-[13px] font-sans resize-y outline-none',
          'border-[1.5px] transition-[border-color,box-shadow] duration-[250ms] placeholder:text-t3',
          focused
            ? 'border-blue shadow-[0_0_0_3px_var(--blue-sub)]'
            : error ? 'border-red' : 'border-bdr'
        )}
      />
      {error && (
        <span className="block text-[10px] text-red mt-1">{error}</span>
      )}
    </div>
  )
}
