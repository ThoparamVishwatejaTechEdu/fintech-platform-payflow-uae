"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Wallet,
  ArrowUpDown,
  CreditCard,
  ShieldCheck,
  Loader2,
  Send,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { walletApi, kycApi } from "@/lib/api"

interface DashboardData {
  balance: number | null
  transactionCount: number
  kycStatus: string | null
}

interface SummaryCard {
  title: string
  value: string
  icon: any
  color: string
  bgColor: string
  route?: string
}

export default function DashboardPage() {

  const router = useRouter()
  const { walletId, role, isAuthenticated, setWalletId } = useAuth()

  const [data, setData] = useState<DashboardData>({
    balance: null,
    transactionCount: 0,
    kycStatus: null,
  })

  const [loading, setLoading] = useState(true)

  /* =========================
     PROFILE LABEL
  ========================= */

  const profileLabel =
    role === "MERCHANT"
      ? "Merchant Account"
      : role === "ADMIN"
      ? "Admin Account"
      : "User Account"

  function handleCardClick(route?: string) {
    if (route) router.push(route)
  }

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */

  useEffect(() => {

    if (!isAuthenticated) {
      router.push("/")
      return
    }

    let mounted = true

    async function fetchData() {

      try {
        setLoading(true)

        let activeWalletId = walletId

        // LOAD OR CREATE WALLET
        if (!activeWalletId) {
          try {
            const existing = await walletApi.getMyWallet()
            activeWalletId = existing.walletId
            setWalletId(existing.walletId)
          } catch {
            try {
              const created = await walletApi.create()
              activeWalletId = created.walletId
              setWalletId(created.walletId)
            } catch {
              activeWalletId = null
            }
          }
        }

        const result: DashboardData = {
          balance: null,
          transactionCount: 0,
          kycStatus: null,
        }

        if (activeWalletId) {

          try {
            const bal = await walletApi.getBalance(activeWalletId)
            result.balance = bal?.balance ?? null
          } catch {}

          try {
            const txns = await walletApi.getTransactions(activeWalletId)
            result.transactionCount =
              Array.isArray(txns) ? txns.length : 0
          } catch {}
        }

        if (role === "USER") {
          try {
            const kyc = await kycApi.getStatus()
            result.kycStatus = kyc?.status ?? "NOT_SUBMITTED"
          } catch {
            result.kycStatus = "NOT_SUBMITTED"
          }
        }

        if (mounted) setData(result)

      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      mounted = false
    }

  }, [walletId, role, isAuthenticated, router, setWalletId])

  /* =========================
     SUMMARY CARDS
  ========================= */

  const summaryCards: SummaryCard[] = [
    {
      title: "Wallet Balance",
      route: "/dashboard/wallet",
      value:
        data.balance !== null
          ? `AED ${data.balance.toLocaleString("en-AE", {
              minimumFractionDigits: 2,
            })}`
          : "No wallet",
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Payments",
      route: "/dashboard/payments",
      value: "Send Money",
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Transactions",
      value: data.transactionCount.toString(),
      icon: ArrowUpDown,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Recent Payments",
      value: Math.min(data.transactionCount, 5).toString(),
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    ...(role === "USER"
      ? [
          {
            title: "KYC Status",
            route: "/dashboard/kyc", // ⭐ ADDED NAVIGATION
            value: data.kycStatus || "Unknown",
            icon: ShieldCheck,
            color:
              data.kycStatus === "APPROVED"
                ? "text-green-600"
                : "text-muted-foreground",
            bgColor:
              data.kycStatus === "APPROVED"
                ? "bg-green-100"
                : "bg-muted",
          },
        ]
      : []),
  ]

  /* =========================
     UI
  ========================= */

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your PayFlow UAE overview
        </p>
        <p className="mt-1 text-sm font-medium text-primary">
          {profileLabel}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {summaryCards.map((card) => (
            <Card
              key={card.title}
              onClick={() => handleCardClick(card.route)}
              className="cursor-pointer transition hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {card.title}
                </CardTitle>

                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.bgColor}`}
                >
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>

              <CardContent>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          ))}

        </div>
      )}
    </div>
  )
}
