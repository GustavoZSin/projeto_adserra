import { useState } from 'react'

/**
 * Input field fiel ao design ADSerra
 */
export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  error,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const inputType  = isPassword && showPass ? 'text' : type

  return (
    <div style={{ width: '100%', marginBottom: 10 }}>
      {label && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--t3)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: 4,
            display: 'block',
            transition: 'color .35s',
          }}
        >
          {label}
        </span>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--inp)',
          border: `1.5px solid ${focused ? 'var(--blue)' : error ? 'var(--red)' : 'var(--bdr)'}`,
          borderRadius: 11,
          padding: '10px 12px',
          boxShadow: focused ? '0 0 0 3px var(--blue-sub)' : 'none',
          transition: 'border-color .25s, box-shadow .25s',
          gap: 8,
        }}
      >
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--t1)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
          }}
        />

        {/* Ícone ou toggle de senha */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--icon-clr)',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
              transition: 'color .35s',
            }}
          >
            {showPass ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : icon ? (
          <span style={{ color: 'var(--icon-clr)', display: 'flex', alignItems: 'center', transition: 'color .35s' }}>
            {icon}
          </span>
        ) : null}
      </div>

      {error && (
        <span style={{ fontSize: 10, color: 'var(--red)', marginTop: 4, display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

/**
 * Textarea — mesma estética do Input
 */
export function Textarea({ label, placeholder, value, onChange, rows = 4, error }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ width: '100%', marginBottom: 10 }}>
      {label && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--t3)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: 4,
            display: 'block',
          }}
        >
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
        style={{
          width: '100%',
          background: 'var(--inp)',
          border: `1.5px solid ${focused ? 'var(--blue)' : error ? 'var(--red)' : 'var(--bdr)'}`,
          borderRadius: 11,
          padding: '10px 12px',
          color: 'var(--t1)',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
          resize: 'vertical',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px var(--blue-sub)' : 'none',
          transition: 'border-color .25s, box-shadow .25s',
        }}
      />
      {error && (
        <span style={{ fontSize: 10, color: 'var(--red)', marginTop: 4, display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}
