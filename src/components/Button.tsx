import React from 'react'
import '../css/Button.css'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = `btn btn-${variant} btn-${size} ${className || ''}`
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

