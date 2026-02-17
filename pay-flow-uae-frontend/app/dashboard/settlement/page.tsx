"use client"

import { useEffect, useState } from "react"
import { Loader2, Landmark } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { useAuth } from "@/lib/auth-context"
import { paymentApi } from "@/lib/api"

export default function SettlementPage() {
  const { role } = useAuth()

  const [amount, setAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [walletId, setWalletId] = useState("")

  /* =====================================================
     FETCH SETTLEMENT
  ===================================================== */

  async function fetchSettlement(id: string) {
    if (!id) return

    setLoading(true)

    try {
      const res = await paymentApi.getSettlement(Number(id))
      setAmount(typeof res === "number" ? res : 0)
    } catch {
      setAmount(null)
    } finally {
      setLoading(false)
    }
  }

  /* =====================================================
     SUBMIT LOOKUP
  ===================================================== */

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    await fetchSettlement(walletId)
  }

  const formatAmount = (value?: number | null) => {
    if (typeof value !== "number") return "0.00"
    return value.toLocaleString("en-AE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  /* =====================================================
     BLOCK NON ADMIN
  ===================================================== */

  if (role !== "ADMIN") {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Only ADMIN can view merchant settlement
      </div>
    )
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Merchant Settlement (Admin)</h1>
        <p className="text-sm text-muted-foreground">
          Lookup merchant total settlement amount
        </p>
      </div>

      <div className="mx-auto w-full max-w-lg">

        {/* LOOKUP CARD */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lookup Settlement</CardTitle>
            <CardDescription>
              Enter Merchant Wallet ID
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLookup} className="flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <Label>Wallet ID</Label>
                <Input
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  placeholder="Enter wallet ID"
                />
              </div>

              <Button type="submit" disabled={loading || !walletId}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Lookup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RESULT CARD */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">

            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : amount !== null ? (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Landmark className="h-8 w-8 text-success" />
                </div>

                <p className="text-sm text-muted-foreground">
                  Total Settlement
                </p>

                <p className="mt-2 text-4xl font-bold">
                  AED {formatAmount(amount)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No settlement data
              </p>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
