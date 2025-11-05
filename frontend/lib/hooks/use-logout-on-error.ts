"use client"

import { useEffect } from "react"
import { useAuth } from "./use-auth"

export function useLogoutOnError() {
  const { logout } = useAuth()

  useEffect(() => {
    const handleUnauthorized = (error: Error) => {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        logout()
      }
    }

    // Could listen to global error events here
    window.addEventListener("error", (event) => {
      handleUnauthorized(event.error)
    })

    return () => {
      window.removeEventListener("error", (event) => {
        handleUnauthorized(event.error)
      })
    }
  }, [logout])
}
