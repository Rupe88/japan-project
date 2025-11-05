"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/auth/form-input"
import { GamingButton } from "@/components/ui/gaming-button"
import { useAuth } from "@/lib/hooks/use-auth"
import { useFormValidation, type ValidationRules } from "@/lib/hooks/use-form-validation";
import { toast } from "@/components/ui/use-toast"

import Link from "next/link"

const validationRules: ValidationRules = {
  email: [
    {
      validate: (v) => v.length > 0,
      message: "Email is required",
    },
    {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "Invalid email format",
    },
  ],
  password: [
    {
      validate: (v) => v.length > 0,
      message: "Password is required",
    },
  ],
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useFormValidation(
    {
      email: "",
      password: "",
    },
    validationRules,
  )

const handleLogin = useCallback(
  async (e: React.FormEvent) => { 
    e.preventDefault()
    setError("")

    // ✅ Frontend Validation Check
    if (!form.validateForm()) {
      // Find which field failed validation
      const emailError = validationRules.email.find(
        (rule) => !rule.validate(form.values.email),
      )?.message
      const passwordError = validationRules.password.find(
        (rule) => !rule.validate(form.values.password),
      )?.message

      toast({
        title: "Invalid Input ❌",
        description:
          emailError || passwordError || "Please fill all required fields correctly.",
      })
      return
    }

    try {
      setIsLoading(true)

      // Attempt login
      await login(form.values.email, form.values.password)

      // ✅ Success Toast
      toast({
        title: "Login Successful 🎉",
        description: "Welcome back to your account.",
      })

      router.push("/") // Redirect after success
    } catch (err: any) {
      const message =
        err instanceof Error
          ? err.message
          : err?.response?.data?.message || "Login failed"

      setError(message)
      console.error("[v0] Login error:", err)

      const msg = message.toLowerCase()

      // 🎯 Specific Error Handling
      if (msg.includes("user already exists") || msg.includes("email already exists")) {
        toast({
          title: "Account Already Exists ⚠️",
          description: "This email is already registered. Please log in instead.",
        })
      } else if (msg.includes("verify your email")) {
        toast({
          title: "Email Not Verified ⚠️",
          description: "Please verify your email before logging in.",
        })
      } else if (msg.includes("invalid email or password")) {
        toast({
          title: "Invalid Credentials ❌",
          description: "The email or password you entered is incorrect.",
        })
      } else if (msg.includes("user not found")) {
        toast({
          title: "Account Not Found ❓",
          description: "No account found with this email. Please sign up first.",
        })
      } else if (msg.includes("too many requests")) {
        toast({
          title: "Too Many Attempts 🚫",
          description: "You’ve tried too many times. Please wait a few minutes.",
        })
      } else if (msg.includes("network error")) {
        toast({
          title: "Network Error 🌐",
          description: "Please check your internet connection and try again.",
        })
      } else if (msg.includes("server") || msg.includes("internal")) {
        toast({
          title: "Server Error 💥",
          description: "Something went wrong on our end. Please try again later.",
        })
      } else {
        // ❌ Fallback error toast
        toast({
          title: "Login Failed",
          description: message || "Something went wrong during login.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  },
  [form, login, router],
)



  return (
    <div className="min-h-screen bg-black overflow-hidden flex items-center justify-center px-6 py-12">
      {/* Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Glow Effects */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
        }}
      />

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">Login to your trading account</p>
          </div>

          <FormInput
            label="Email"
            type="email"
            name="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.email}
            touched={form.touched.email}
            placeholder="your@email.com"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
            glowColor="cyan"
            disabled={isLoading}
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.password}
            touched={form.touched.password}
            placeholder="••••••••"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            glowColor="pink"
            disabled={isLoading}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/20 border border-red-500 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <GamingButton variant="primary" size="lg" type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Login"}
          </GamingButton>

          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-cyan-400 opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-pink-400 opacity-20" />
    </div>
  )
}
