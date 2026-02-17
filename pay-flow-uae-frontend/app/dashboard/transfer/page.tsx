"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ArrowLeftRight, Loader2, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { useAuth } from "@/lib/auth-context"
import { walletApi } from "@/lib/api"

export default function TransferPage() {
  const { walletId } = useAuth()

  const [receiverWalletId, setReceiverWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(false), 4000)
    return () => clearTimeout(timer)
  }, [success])

  function validateAmount(value: string) {
    const parsed = Number(value)
    if (!value || isNaN(parsed) || parsed <= 0) return null
    return Number(parsed.toFixed(2))
  }

  const parsedAmount = validateAmount(amount)

  const isInvalid =
    !walletId ||
    !receiverWalletId.trim() ||
    !parsedAmount ||
    loading

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()

    if (!walletId) {
      toast.error("Please create a wallet first")
      return
    }

    if (isInvalid) {
      toast.error("Please enter valid transfer details")
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      await walletApi.transfer(walletId, {
        receiverWalletId: receiverWalletId.trim(),
        amount: parsedAmount!,
      })

      setSuccess(true)
      setReceiverWalletId("")
      setAmount("")

      toast.success("Transfer completed successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfer failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Transfer
        </h1>
        <p className="text-sm text-muted-foreground">
          Send money to another wallet
        </p>
      </div>

      <div className="mx-auto w-full max-w-lg">

        {success && (
          <Alert className="mb-4 border-success/50 bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">
              Transfer Successful
            </AlertTitle>
            <AlertDescription className="text-success/80">
              Your money has been sent successfully.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </div>

            <CardTitle className="text-lg">P2P Transfer</CardTitle>
            <CardDescription>
              Transfer funds directly to another PayFlow wallet
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleTransfer} className="flex flex-col gap-4">

              <div className="flex flex-col gap-2">
                <Label htmlFor="receiver">Receiver Wallet ID</Label>
                <Input
                  id="receiver"
                  placeholder="Enter receiver wallet ID"
                  value={receiverWalletId}
                  onChange={(e) => setReceiverWalletId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount (AED)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={isInvalid}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                )}
                Send Money
              </Button>

              {!walletId && (
                <p className="text-center text-sm text-destructive">
                  Please create a wallet before transferring
                </p>
              )}

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}




// "use client"

// import { useState } from "react"
// import { toast } from "sonner"
// import { ArrowLeftRight, Loader2, CheckCircle2 } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { useAuth } from "@/lib/auth-context"
// import { walletApi } from "@/lib/api"

// export default function TransferPage() {
//   const { walletId } = useAuth()
//   const [receiverWalletId, setReceiverWalletId] = useState("")
//   const [amount, setAmount] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [success, setSuccess] = useState(false)

//   async function handleTransfer(e: React.FormEvent) {
//     e.preventDefault()
//     if (!walletId) {
//       toast.error("Please create a wallet first")
//       return
//     }
//     if (!receiverWalletId || !amount) {
//       toast.error("Please fill in all fields")
//       return
//     }
//     const parsedAmount = parseFloat(amount)
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       toast.error("Please enter a valid amount")
//       return
//     }
//     setLoading(true)
//     setSuccess(false)
//     try {
//       await walletApi.transfer(walletId, { receiverWalletId, amount: parsedAmount })
//       setSuccess(true)
//       setReceiverWalletId("")
//       setAmount("")
//       toast.success("Transfer completed successfully")
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Transfer failed")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="flex flex-col gap-6">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight text-foreground">Transfer</h1>
//         <p className="text-sm text-muted-foreground">Send money to another wallet</p>
//       </div>

//       <div className="mx-auto w-full max-w-lg">
//         {success && (
//           <Alert className="mb-4 border-success/50 bg-success/10">
//             <CheckCircle2 className="h-4 w-4 text-success" />
//             <AlertTitle className="text-success">Transfer Successful</AlertTitle>
//             <AlertDescription className="text-success/80">
//               Your money has been sent successfully.
//             </AlertDescription>
//           </Alert>
//         )}

//         <Card className="border-border shadow-sm">
//           <CardHeader>
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
//               <ArrowLeftRight className="h-5 w-5 text-primary" />
//             </div>
//             <CardTitle className="text-lg">P2P Transfer</CardTitle>
//             <CardDescription>
//               Transfer funds directly to another PayFlow wallet
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleTransfer} className="flex flex-col gap-4">
//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="receiver">Receiver Wallet ID</Label>
//                 <Input
//                   id="receiver"
//                   placeholder="Enter receiver wallet ID"
//                   value={receiverWalletId}
//                   onChange={(e) => setReceiverWalletId(e.target.value)}
//                 />
//               </div>
//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="amount">Amount (AED)</Label>
//                 <Input
//                   id="amount"
//                   type="number"
//                   step="0.01"
//                   min="0.01"
//                   placeholder="0.00"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" className="mt-2 w-full" disabled={loading || !walletId}>
//                 {loading ? (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 ) : (
//                   <ArrowLeftRight className="mr-2 h-4 w-4" />
//                 )}
//                 Send Money
//               </Button>
//               {!walletId && (
//                 <p className="text-center text-sm text-destructive">
//                   Please create a wallet before transferring
//                 </p>
//               )}
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
