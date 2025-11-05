"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  touched?: boolean
  icon?: React.ReactNode
  glowColor?: "cyan" | "pink" | "purple"
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, touched, icon, glowColor = "cyan", className, ...props }, ref) => {
    const glowClass = {
      cyan: "focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,240,255,0.5)]",
      pink: "focus:border-pink-400 focus:shadow-[0_0_20px_rgba(255,0,128,0.5)]",
      purple: "focus:border-purple-400 focus:shadow-[0_0_20px_rgba(128,0,255,0.5)]",
    }[glowColor]

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">{label}</label>
        )}

        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}

          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 text-white",
              "rounded-lg transition-all duration-300",
              "focus:outline-none focus:border-opacity-100 focus:bg-gray-800",
              icon && "pl-10",
              glowClass,
              touched && error && "border-red-500 focus:shadow-[0_0_20px_rgba(255,0,0,0.5)]",
              className,
            )}
            {...props}
          />
        </div>

        {touched && error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  },
)

FormInput.displayName = "FormInput"
