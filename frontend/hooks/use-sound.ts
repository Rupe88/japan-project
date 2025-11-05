"use client"

import { useCallback } from "react"

const soundCache: { [key: string]: HTMLAudioElement } = {}

export const useSound = () => {
  const playSound = useCallback((soundName: string) => {
    // Map sound names to available paths
    const soundMap: { [key: string]: string } = {
      click: "/sounds/click.mp3",
      hover: "/sounds/hover.mp3",
      success: "/sounds/success.mp3",
      error: "/sounds/error.mp3",
      notification: "/sounds/notification.mp3",
    }

    const soundPath = soundMap[soundName]
    if (!soundPath) {
      console.warn(`Sound "${soundName}" not found`)
      return
    }

    // Reuse cached audio element or create a new one
    if (!soundCache[soundPath]) {
      soundCache[soundPath] = new Audio(soundPath)
    }

    const audio = soundCache[soundPath]
    audio.currentTime = 0 // Reset to start
    audio.play().catch((err) => {
      console.warn(`Failed to play sound: ${err}`)
    })
  }, [])

  return { playSound }
}
