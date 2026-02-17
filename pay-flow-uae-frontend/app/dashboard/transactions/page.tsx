"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import { useAuth } from "@/lib/auth-context"
import { walletApi } from "@/lib/api"

interface Transaction {
  id?: string | number
  type?: string
  amount?: number
  timestamp?: string
  description?: string
  status?: string
}

export default function TransactionsPage() {
  const { walletId } = useAuth()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchTransactions() {
      if (!walletId) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const txns = await walletApi.getTransactions(walletId)

        if (isMounted) {
          setTransactions(Array.isArray(txns) ? txns : [])
        }
      } catch {
        if (isMounted) setTransactions([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTransactions()

    return () => {
      isMounted = false
    }
  }, [walletId])

  function formatAmount(amount?: number) {
    if (typeof amount !== "number") return "0.00"
    return amount.toLocaleString("en-AE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function formatDate(date?: string) {
    if (!date) return "-"
    try {
      return new Date(date).toLocaleString("en-AE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "-"
    }
  }

  function getStatusStyle(status?: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-success text-success-foreground"
      case "PENDING":
        return "bg-chart-4/20 text-chart-4"
      case "FAILED":
        return "bg-destructive text-destructive-foreground"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Transactions
        </h1>
        <p className="text-sm text-muted-foreground">
          View all your transaction history
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">All Transactions</CardTitle>
          <CardDescription>
            Complete record of your wallet activity
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !walletId ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Create a wallet to view transactions
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {transactions.map((txn, index) => {
                    const txId = txn.id?.toString()

                    return (
                      <TableRow key={txId ?? index}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {txId ? `${txId.slice(0, 8)}...` : "-"}
                        </TableCell>

                        <TableCell className="font-medium">
                          {txn.type || "-"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {txn.description || "-"}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          AED {formatAmount(txn.amount)}
                        </TableCell>

                        <TableCell>
                          <Badge className={getStatusStyle(txn.status)}>
                            {txn.status || "UNKNOWN"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {formatDate(txn.timestamp)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>

              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
