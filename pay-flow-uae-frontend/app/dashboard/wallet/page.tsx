
"use client"

import { useEffect, useState } from "react"
import { Loader2, Wallet, PlusCircle } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth-context"
import { walletApi } from "@/lib/api"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Transaction {
  id: string
  type: string
  amount: number
  timestamp: string
  reference?: string
}

export default function WalletPage() {

  const { walletId, setWalletId } = useAuth()

  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const [receiverWalletId, setReceiverWalletId] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferring, setTransferring] = useState(false)


  /* =====================================================
      LOAD BALANCE + TRANSACTIONS
  ===================================================== */

  async function loadWallet(activeWalletId: string) {

    try {
      const bal = await walletApi.getBalance(activeWalletId)
      setBalance(bal?.balance ?? 0)
    } catch {
      setBalance(null)
    }

    try {
      const tx = await walletApi.getTransactions(activeWalletId)
      setTransactions(Array.isArray(tx) ? tx : [])
    } catch {
      setTransactions([])
    }
  }

  /* =====================================================
      INITIAL LOAD (FIXED LOGIC)
  ===================================================== */

  useEffect(() => {

    let mounted = true

    async function init() {

      setLoading(true)

      let activeWalletId = walletId

      /* =================================================
          ⭐ FINTECH FLOW
          1. GET EXISTING WALLET
          2. CREATE ONLY IF MISSING
      ================================================= */

      if (!activeWalletId) {

        // try existing wallet first
        try {
          const existing = await walletApi.getMyWallet()
          activeWalletId = existing.walletId
          setWalletId(existing.walletId)

        } catch {

          // create only if no wallet
          try {
            const created = await walletApi.create()
            activeWalletId = created.walletId
            setWalletId(created.walletId)

            toast.success("Wallet created successfully")

          } catch (err: any) {

            // safety fallback (wallet already exists)
            if (err?.message?.includes("already exists")) {
              try {
                const existing = await walletApi.getMyWallet()
                activeWalletId = existing.walletId
                setWalletId(existing.walletId)
              } catch {
                toast.error("Failed to load wallet")
              }
            } else {
              toast.error("Failed to load wallet")
            }
          }
        }
      }

      if (activeWalletId && mounted) {
        await loadWallet(activeWalletId)
      }

      if (mounted) setLoading(false)
    }

    init()

    return () => {
      mounted = false
    }

  }, [walletId, setWalletId])

  /* =====================================================
      ADD MONEY
  ===================================================== */

  async function handleAddMoney() {

    if (!walletId) return

    const value = Number(amount)

    if (!value || value <= 0) {
      toast.error("Enter valid amount")
      return
    }

    try {
      setAdding(true)

      await walletApi.addMoney(walletId, {
        amount: value,
      })

      toast.success("Money added successfully")

      setAmount("")

      // refresh wallet
      await loadWallet(walletId)

    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add money"
      )
    } finally {
      setAdding(false)
    }
  }


  async function handleTransfer() {

    if (!walletId) return
  
    const amountValue = Number(transferAmount)
    const receiver = Number(receiverWalletId)
  
    if (!receiver || amountValue <= 0) {
      toast.error("Enter valid transfer details")
      return
    }
  
    try {
      setTransferring(true)
  
      await walletApi.transfer(walletId, {
        receiverWalletId: receiver.toString(),
        amount: amountValue,
      })
  
      toast.success("Transfer successful")
  
      setReceiverWalletId("")
      setTransferAmount("")
  
      // refresh wallet immediately
      await loadWallet(walletId)
  
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Transfer failed"
      )
    } finally {
      setTransferring(false)
    }
  }
  

  /* =====================================================
      UI
  ===================================================== */

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Manage your wallet balance and transactions
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* BALANCE CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {balance !== null
                  ? `AED ${balance.toLocaleString("en-AE", {
                      minimumFractionDigits: 2,
                    })}`
                  : "No Balance"}
              </p>
            </CardContent>
          </Card>

          {/* ADD MONEY */}
          <Card>
            <CardHeader>
              <CardTitle>Add Money</CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddMoney()
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="number"
                  placeholder="Enter amount (AED)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <Button type="submit" disabled={adding}>
                  {adding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Add Money
                </Button>
              </form>
            </CardContent>
          </Card>

          
                    <Card>
            <CardHeader>
              <CardTitle>Transfer Money</CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleTransfer()
                }}
                className="flex flex-col gap-3"
              >
                <Input
                  type="number"
                  placeholder="Receiver Wallet ID"
                  value={receiverWalletId}
                  onChange={(e) => setReceiverWalletId(e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Amount (AED)"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />

                <Button type="submit" disabled={transferring}>
                  {transferring ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Transfer
                </Button>
              </form>
            </CardContent>
          </Card>



          {/* TRANSACTIONS */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>

            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.id ?? `${tx.timestamp}-${index}`}

                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <p
                        className={`font-semibold ${
                          tx.type === "CREDIT"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "CREDIT" ? "+" : "-"} AED {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}


