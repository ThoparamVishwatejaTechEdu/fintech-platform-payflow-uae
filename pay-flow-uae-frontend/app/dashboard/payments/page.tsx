"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Send, Store, ShieldAlert } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { paymentApi, kycApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

/* ===================================================
   MAIN PAGE
=================================================== */

export default function PaymentsPage() {

  const { walletId, refreshWallet } = useAuth()

  const [canPay, setCanPay] = useState(false)
  const [loadingKyc, setLoadingKyc] = useState(true)

  /* =============================
     CHECK KYC STATUS
  ============================= */

  useEffect(() => {
    async function checkKyc() {
      try {
        const kyc = await kycApi.getStatus()
        setCanPay(kyc.status === "APPROVED")
      } catch {
        setCanPay(false)
      } finally {
        setLoadingKyc(false)
      }
    }

    checkKyc()
  }, [])

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Payments
        </h1>
        <p className="text-sm text-muted-foreground">
          Send secure payments with idempotency protection
        </p>
      </div>

      {/* KYC WARNING */}
      {!loadingKyc && !canPay && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="flex items-center gap-2 py-4">
            <ShieldAlert className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              KYC approval required before making payments.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="p2p">

        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="p2p">P2P Payment</TabsTrigger>
          <TabsTrigger value="merchant">Merchant Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="p2p" className="mt-4">
          <P2PPaymentForm
            walletId={walletId}
            refreshWallet={refreshWallet}
            canPay={canPay}
            loadingKyc={loadingKyc}
          />
        </TabsContent>

        <TabsContent value="merchant" className="mt-4">
          <MerchantPaymentForm
            walletId={walletId}
            refreshWallet={refreshWallet}
            canPay={canPay}
            loadingKyc={loadingKyc}
          />
        </TabsContent>

      </Tabs>
    </div>
  )
}

/* ===================================================
   HELPERS
=================================================== */

function validateAmount(value: string) {
  const parsed = Number(value)
  if (!value || isNaN(parsed) || parsed <= 0) return null
  return Number(parsed.toFixed(2))
}

/* ===================================================
   P2P PAYMENT
=================================================== */

function P2PPaymentForm({
  walletId,
  refreshWallet,
  canPay,
  loadingKyc,
}: any) {

  const [receiverWalletId, setReceiverWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const parsedAmount = validateAmount(amount)

  const isInvalid =
    !walletId ||
    !receiverWalletId.trim() ||
    !parsedAmount ||
    loading ||
    !canPay ||
    loadingKyc

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isInvalid) {
      toast.error("Payment not allowed")
      return
    }

    setLoading(true)

    try {
      await paymentApi.p2p({
        senderWalletId: walletId!,
        receiverWalletId: Number(receiverWalletId),
        amount: parsedAmount!,
      })

      await refreshWallet()

      toast.success("P2P payment successful")
      setReceiverWalletId("")
      setAmount("")

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>P2P Payment</CardTitle>
        <CardDescription>Send money securely</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Input
            placeholder="Receiver Wallet ID"
            value={receiverWalletId}
            onChange={(e) => setReceiverWalletId(e.target.value)}
          />

          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Button type="submit" disabled={isInvalid}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Payment
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}

/* ===================================================
   MERCHANT PAYMENT
=================================================== */

function MerchantPaymentForm({
  walletId,
  refreshWallet,
  canPay,
  loadingKyc,
}: any) {

  const [merchantWalletId, setMerchantWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const parsedAmount = validateAmount(amount)

  const isInvalid =
    !walletId ||
    !merchantWalletId.trim() ||
    !parsedAmount ||
    loading ||
    !canPay ||
    loadingKyc

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isInvalid) {
      toast.error("Payment not allowed")
      return
    }

    setLoading(true)

    try {
      await paymentApi.merchant({
        userWalletId: walletId!,
        merchantWalletId: Number(merchantWalletId),
        amount: parsedAmount!,
      })

      await refreshWallet()

      toast.success("Merchant payment successful")
      setMerchantWalletId("")
      setAmount("")

    } catch (err) {
      toast
          toast.error(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Merchant Payment</CardTitle>
        <CardDescription>Pay merchants securely</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Input
            placeholder="Merchant Wallet ID"
            value={merchantWalletId}
            onChange={(e) => setMerchantWalletId(e.target.value)}
          />

          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Button type="submit" disabled={isInvalid}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Store className="mr-2 h-4 w-4" />
            )}
            Pay Merchant
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}
