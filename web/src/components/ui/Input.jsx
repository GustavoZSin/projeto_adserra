import { useState } from 'react'
import clsx from 'clsx'

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
            {showPass ? <EyeOffIcon /> : <EyeIcon />}
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

function EyeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}
function EyeOffIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
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
