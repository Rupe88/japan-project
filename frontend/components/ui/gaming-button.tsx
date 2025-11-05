"use client"

import React from "react"
import { motion } from "framer-motion"

export interface GamingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "secondary"
  size?: "sm" | "md" | "lg" | "xl"
  glowColor?: "cyan" | "pink" | "purple" | "green"
  icon?: React.ReactNode
}

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
}

const glowColors = {
  cyan: "shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)]",
  pink: "shadow-[0_0_20px_rgba(255,0,128,0.5)] hover:shadow-[0_0_30px_rgba(255,0,128,0.7)]",
  purple: "shadow-[0_0_20px_rgba(128,0,255,0.5)] hover:shadow-[0_0_30px_rgba(128,0,255,0.7)]",
  green: "shadow-[0_0_20px_rgba(0,255,136,0.5)] hover:shadow-[0_0_30px_rgba(0,255,136,0.7)]",
}

const variantStyles = {
  primary: "bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-bold border-0",
  outline: "bg-transparent text-cyan-400 border-2 border-cyan-400 hover:bg-cyan-400/10",
  secondary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold border-0",
}

export const GamingButton = React.forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ variant = "primary", size = "md", glowColor = "cyan", icon, className, children, ...props }, ref) => {
    const { type, form, formAction, formEncType, formMethod, formNoValidate, formTarget, ...motionProps } = props

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative
          font-bold uppercase tracking-widest
          transition-all duration-300
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${glowColors[glowColor]}
          ${className || ""}
        `}
        type={type as any}
        {...motionProps}
      >
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="flex items-center justify-center">{icon}</span>}
          {children}
        </div>
      </motion.button>
    )
  },
)

GamingButton.displayName = "GamingButton"
