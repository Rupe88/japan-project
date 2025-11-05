"use client"

import type React from "react"

import { useState, useCallback } from "react"

export interface ValidationRule {
  validate: (value: any) => boolean
  message: string
}

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

export function useFormValidation<T extends Record<string, any>>(initialValues: T, rules: ValidationRules) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback(
    (name: string, value: any): string => {
      const fieldRules = rules[name]
      if (!fieldRules) return ""

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          return rule.message
        }
      }

      return ""
    },
    [rules],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setValues((prev) => ({ ...prev, [name]: value }))

      if (touched[name]) {
        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error }))
      }
    },
    [touched, validateField],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setTouched((prev) => ({ ...prev, [name]: true }))

      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    },
    [validateField],
  )

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    Object.keys(values).forEach((key) => {
      const error = validateField(key, values[key])
      if (error) {
        newErrors[key] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validateField])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldValue: (name: string, value: any) => setValues((prev) => ({ ...prev, [name]: value })),
  }
}
