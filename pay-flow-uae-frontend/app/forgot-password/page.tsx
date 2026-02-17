"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { authApi } from "@/lib/api"

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter email")
      return
    }

    setLoading(true)

    try {

      const res = await authApi.forgotPassword(email)

      /* ===================================
         AUTO REDIRECT TO RESET PAGE
      =================================== */

      if (typeof res === "string" && res.includes("reset-password")) {

        toast.success("Redirecting to reset page...")

        // small delay for smooth UX
        setTimeout(() => {
          window.location.href = res
        }, 1000)

        return
      }

      // fallback (if backend sends normal message)
      setMsg(res)
      toast.success("Reset link sent")

    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email to receive reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Reset Link
              </Button>

              {msg && (
                <p className="text-sm text-green-600 text-center">
                  {msg}
                </p>
              )}

            </form>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
