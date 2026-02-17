"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

import type { UserRole } from "./types"
import { walletApi } from "./api"

/* =====================================================
   TYPES
===================================================== */

interface AuthState {
  token: string | null
  userId: string | null
  role: UserRole | null
  walletId: string | null
  walletBalance: number | null
}

interface AuthContextType extends AuthState {
  login: (token: string, userId: string, role: UserRole) => void
  logout: () => void
  setWalletId: (id: string) => void
  refreshWallet: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

/* =====================================================
   PROVIDER
===================================================== */

export function AuthProvider({ children }: { children: ReactNode }) {

  const [auth, setAuth] = useState<AuthState>({
    token: null,
    userId: null,
    role: null,
    walletId: null,
    walletBalance: null,
  })

  const [mounted, setMounted] = useState(false)

  /* =====================================================
     INIT FROM LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    const token = localStorage.getItem("payflow_token")
    const userId = localStorage.getItem("payflow_userId")
    const role = localStorage.getItem("payflow_role") as UserRole | null
    const walletId = localStorage.getItem("payflow_walletId")

    setAuth({
      token,
      userId,
      role,
      walletId,
      walletBalance: null,
    })

    setMounted(true)
  }, [])

  /* =====================================================
     LOGIN
  ===================================================== */

const login = useCallback(
  (token: string, userId: string, role: UserRole) => {

    localStorage.setItem("payflow_token", token)
    localStorage.setItem("payflow_userId", String(userId))
    localStorage.setItem("payflow_role", role)

    setAuth((prev) => ({
      ...prev,
      token,
      userId: String(userId),
      role,
    }))
  },
  []
)



  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = useCallback(() => {

    localStorage.removeItem("payflow_token")
    localStorage.removeItem("payflow_userId")
    localStorage.removeItem("payflow_role")
    localStorage.removeItem("payflow_walletId")

    setAuth({
      token: null,
      userId: null,
      role: null,
      walletId: null,
      walletBalance: null,
    })
  }, [])

  /* =====================================================
     SET WALLET ID
  ===================================================== */

  const setWalletId = useCallback((id: string) => {

    localStorage.setItem("payflow_walletId", id)

    setAuth((prev) => ({
      ...prev,
      walletId: id,
    }))
  }, [])



  /* =====================================================
   AUTO LOAD / CREATE WALLET
===================================================== */

useEffect(() => {
  async function initWallet() {

    if (!mounted) return
    if (!auth.token) return
    if (auth.walletId) return

    try {
      // try existing wallet
      const existing = await walletApi.getMyWallet()

      setAuth((prev) => ({
        ...prev,
        walletId: existing.walletId,
      }))

      localStorage.setItem(
        "payflow_walletId",
        existing.walletId
      )

    } catch {

      // create wallet if not found
      try {
        const created = await walletApi.create()

        setAuth((prev) => ({
          ...prev,
          walletId: created.walletId,
        }))

        localStorage.setItem(
          "payflow_walletId",
          created.walletId
        )
      } catch {
        // silent fail
      }
    }
  }

  initWallet()
}, [mounted, auth.token, auth.walletId])


  /* =====================================================
     ⭐ GLOBAL WALLET REFRESH (FINTECH MAGIC)
  ===================================================== */

  const refreshWallet = useCallback(async () => {

    if (!auth.walletId) return

    try {

      const bal = await walletApi.getBalance(auth.walletId)

      setAuth((prev) => ({
        ...prev,
        walletBalance: bal?.balance ?? null,
      }))

    } catch {
      // silent fail (wallet unavailable)
    }

  }, [auth.walletId])

  if (!mounted) return null

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
        setWalletId,
        refreshWallet,
        isAuthenticated: !!auth.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* =====================================================
   HOOK
===================================================== */

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
