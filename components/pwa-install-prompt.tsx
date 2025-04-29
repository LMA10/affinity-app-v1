"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(
    typeof window !== "undefined" && localStorage.getItem('pwaInstallDismissed') === 'true'
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem('pwaInstallDismissed') === 'true') {
      setDismissed(true)
      setShowPrompt(false)
      return
    }

    const handler = (e: Event) => {
      if (localStorage.getItem('pwaInstallDismissed') === 'true') {
        setDismissed(true)
        return
      }
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    const isInstalled = window.matchMedia("(display-mode: standalone)").matches
    if (isInstalled) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  // Defensive: close popup if pwaInstallDismissed is set while open
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem('pwaInstallDismissed') === 'true') {
      setShowPrompt(false);
      setDismissed(true);
    }
  }, [showPrompt]);

  const handleInstall = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const choiceResult = await installPrompt.userChoice

    setInstallPrompt(null)
    setShowPrompt(false)
  }

  const dismissPrompt = () => {
    localStorage.setItem('pwaInstallDismissed', 'true')
    setDismissed(true)
    setShowPrompt(false)
  }

  if (dismissed || !showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg max-w-sm z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white">Install Affinity</h3>
        <button
          onClick={dismissPrompt}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Install this application on your device for quick and easy access when you're on the go.
      </p>
      <div className="flex justify-end">
        <button
          onClick={handleInstall}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Install
        </button>
      </div>
    </div>
  )
}
