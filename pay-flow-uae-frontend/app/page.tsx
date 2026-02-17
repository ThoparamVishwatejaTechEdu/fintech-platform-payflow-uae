"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/lib/auth-context"
import { authApi, walletApi } from "@/lib/api"

export default function LoginPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { login, setWalletId } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {

      /* ==============================
         LOGIN
      ============================== */

      const res = await authApi.login({ email, password })

      login(
        res.token,
        String(res.userId),
        res.role as UserRole
      )

      /* ==============================
         AUTO WALLET BOOTSTRAP
      ============================== */

      try {
        const existing = await walletApi.getMyWallet()
        setWalletId(existing.walletId)

      } catch {

        // wallet not found → auto create
        try {
          const created = await walletApi.create()
          setWalletId(created.walletId)
        } catch {
          console.log("Wallet create skipped")
        }
      }

      toast.success("Login successful")
      router.push("/dashboard")

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            PayFlow <span className="text-primary">UAE</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digital payments, simplified
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label>Password</Label>

                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Sign In
              </Button>

            </form>

            {/* Register */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Create account
              </Link>
            </p>

          </CardContent>
        </Card>
      </div>
    </main>
  )
}
