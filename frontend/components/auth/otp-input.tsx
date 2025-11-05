"use client"

import React, { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  error?: string
  disabled?: boolean
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ length = 6, value, onChange, onComplete, error, disabled }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, length)
    }, [length])

    const handleChange = (index: number, val: string) => {
      if (!/^\d*$/.test(val)) return

      const newValue = value.split("")
      newValue[index] = val
      const updatedValue = newValue.join("")

      onChange(updatedValue)

      if (val && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      if (updatedValue.length === length) {
        onComplete?.(updatedValue)
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    return (
      <div ref={ref} className="flex flex-col gap-3">
        <div className="flex justify-center gap-3">
          {Array.from({ length }).map((_, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ""}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={disabled}
              className={cn(
                "w-12 h-12 text-center text-lg font-bold",
                "bg-gray-900 border-2 border-gray-700 rounded-lg",
                "text-cyan-400 focus:outline-none",
                "focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,240,255,0.5)]",
                "transition-all duration-300 uppercase",
                error && "border-red-500 focus:shadow-[0_0_20px_rgba(255,0,0,0.5)]",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            />
          ))}
        </div>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}
      </div>
    )
  },
)

OTPInput.displayName = "OTPInput"
