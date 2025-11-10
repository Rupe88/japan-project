"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export default function SelectPlatformPage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  const particles = useMemo(
    () =>
      [...Array(20)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 6 + Math.random() * 4,
        delay: Math.random() * 2,
        size: 2 + Math.random() * 3,
      })),
    [],
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const platforms = [
    { id: "hr", name: "HR Platform", path: "/hr-kyc", color: "cyan" },
    { id: "marketplace", name: "Marketplace", path: "/platforms/marketplace", color: "pink" },
    { id: "tender", name: "Tender System", path: "/platforms/tender", color: "purple" },
    { id: "services", name: "Services", path: "/platforms/services", color: "orange" },
  ]

  const handlePlatformSelect = (path: string) => {
    setSelectedPlatform(path)
    setTimeout(() => router.push(path), 400)
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              boxShadow: i % 2 === 0 ? "0 0 12px rgba(0, 240, 255, 0.8)" : "0 0 12px rgba(255, 0, 128, 0.6)",
              background: i % 2 === 0 ? "rgba(0, 240, 255, 0.9)" : "rgba(255, 0, 128, 0.8)",
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{ y: ["0%", "100vh"] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <motion.div
        className="fixed w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%)",
        }}
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30, mass: 0.8 }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-wider">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              SELECT PLATFORM
            </span>
          </h1>
          <p className="text-lg text-white/50 font-mono tracking-wide">EARN • LEARN • LEVEL UP</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
          {platforms.map((platform, index) => {
            const colorClass = {
              cyan: "border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:text-cyan-300",
              pink: "border-pink-400 hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] hover:text-pink-300",
              purple: "border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:text-purple-300",
              orange: "border-orange-400 hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] hover:text-orange-300",
            }[platform.color]

            return (
              <motion.button
                key={platform.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => handlePlatformSelect(platform.path)}
                className={`
                  relative px-8 py-6 text-2xl font-black tracking-widest
                  border-2 border-solid
                  bg-black/40 backdrop-blur-md
                  transition-all duration-300
                  text-white hover:text-white/80
                  font-mono uppercase
                  ${colorClass}
                `}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`absolute inset-0 -z-10 blur-lg ${
                    platform.color === "cyan"
                      ? "bg-cyan-400"
                      : platform.color === "pink"
                        ? "bg-pink-400"
                        : platform.color === "purple"
                          ? "bg-purple-400"
                          : "bg-orange-400"
                  }`}
                  animate={{
                    opacity: selectedPlatform === platform.path ? 0.3 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />

                <span className="relative z-20">{platform.name}</span>

                {selectedPlatform === platform.path && (
                  <motion.div
                    className="absolute inset-0 border-2 border-current"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-white/40 font-mono text-sm tracking-widest"
        >
          {"> CLICK TO ENTER >"} |{" "}
          {Math.floor(Math.random() * 9999)
            .toString()
            .padStart(4, "0")}
        </motion.p>
      </div>

      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400/40" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-pink-400/40" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-purple-400/40" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-orange-400/40" />
    </div>
  )
}
