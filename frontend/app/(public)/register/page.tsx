"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/auth/form-input"
import { GamingButton } from "@/components/ui/gaming-button"
import { useAuth } from "@/lib/hooks/use-auth"
import { useFormValidation, type ValidationRules } from "@/lib/hooks/use-form-validation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

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
      validate: (v) => v.length >= 8,
      message: "Password must be at least 8 characters",
    },
    {
      validate: (v) => /[A-Z]/.test(v),
      message: "Password must contain uppercase letter",
    },
    {
      validate: (v) => /[a-z]/.test(v),
      message: "Password must contain lowercase letter",
    },
    {
      validate: (v) => /\d/.test(v),
      message: "Password must contain number",
    },
  ],
  phoneNumber: [
    {
      validate: (v) => !v || /^\d{10,}$/.test(v),
      message: "Phone number must be at least 10 digits",
    },
  ],
}

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"register" | "verify">("register")
  const [registeredEmail, setRegisteredEmail] = useState("")

  const form = useFormValidation(
    {
      email: "",
      password: "",
      phoneNumber: "",
    },
    validationRules,
  )

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!form.validateForm()) {
        toast({
          title: "Invalid Input ⚠️",
          description: "Please fill all required fields correctly.",
        })
        return
      }

      try {
        setIsLoading(true)
        const result = await register(form.values.email, form.values.password, form.values.phoneNumber)

        setRegisteredEmail(form.values.email)
        setStep("verify")

        toast({
          title: "Registration Successful 🎉",
          description: "Please verify your email with the code sent to your inbox.",
        })

        console.log("[Register] Registration successful:", result)
      } catch (err: any) {
        console.error("[Register] Registration failed:", err)

        if (err?.status === 409) {
          toast({
            title: "Email Already Registered ⚠️",
            description: "This email is already in use. Try logging in or reset your password.",
          })
        } else if (err instanceof Error) {
          toast({
            title: "Registration Failed ❌",
            description: err.message,
          })
        } else {
          toast({
            title: "Registration Failed ❌",
            description: "Something went wrong. Please try again.",
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [form, register]
  )

  return (
    <div className="min-h-screen bg-black overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {step === "register" ? (
          <RegisterForm {...form} onSubmit={handleRegister} isLoading={isLoading} />
        ) : (
          <VerifyEmailStep email={registeredEmail} onSuccess={() => router.push("/login")} />
        )}
      </motion.div>

      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-cyan-400 opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-pink-400 opacity-20" />
    </div>
  )
}

function RegisterForm({ values, errors, touched, handleChange, handleBlur, onSubmit, isLoading }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Create Account
        </h1>
        <p className="text-gray-400">Join the trading ecosystem</p>
      </div>

      <FormInput
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        touched={touched.email}
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
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        touched={touched.password}
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

      <FormInput
        label="Phone Number (Optional)"
        type="tel"
        name="phoneNumber"
        value={values.phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.phoneNumber}
        touched={touched.phoneNumber}
        placeholder="+1234567890"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        }
        glowColor="purple"
        disabled={isLoading}
      />

      <GamingButton variant="primary" size="lg" type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating Account..." : "Create Account"}
      </GamingButton>

      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </form>
  )
}

function VerifyEmailStep({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const { verifyEmail, resendVerification } = useAuth()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)

  // ✅ FIX: Changed useState to useEffect for timer
  useEffect(() => {
    if (!canResend && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [canResend, resendTimer])

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Please enter 6-digit code")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      await verifyEmail(email, otp)
      
      toast({
        title: "Email Verified! 🎉",
        description: "Your account has been verified successfully.",
      })
      
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed"
      setError(message)
      
      toast({
        title: "Verification Failed ❌",
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [otp, email, verifyEmail, onSuccess])

  const handleResend = useCallback(async () => {
    try {
      await resendVerification(email)
      setCanResend(false)
      setResendTimer(60)
      
      toast({
        title: "Code Resent 📧",
        description: "A new verification code has been sent to your email.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Resend failed"
      setError(message)
      
      toast({
        title: "Resend Failed ❌",
        description: message,
      })
    }
  }, [email, resendVerification])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Verify Email
        </h1>
        <p className="text-gray-400">Enter the 6-digit code sent to {email}</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full text-center text-3xl tracking-widest px-4 py-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
          disabled={isLoading}
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <GamingButton
          variant="primary"
          size="lg"
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </GamingButton>
      </div>

      <div className="text-center">
        {canResend ? (
          <button 
            onClick={handleResend} 
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            type="button"
          >
            Resend Code
          </button>
        ) : (
          <p className="text-gray-400">
            Resend code in <span className="text-cyan-400 font-semibold">{resendTimer}s</span>
          </p>
        )}
      </div>
    </div>
  )
}