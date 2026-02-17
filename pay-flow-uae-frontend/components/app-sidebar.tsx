"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  ShieldCheck,
  Receipt,
  Landmark,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["USER", "MERCHANT", "ADMIN"] },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet, roles: ["USER", "MERCHANT"] },
  { label: "Transfer", href: "/dashboard/transfer", icon: ArrowLeftRight, roles: ["USER"] },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["USER"] },
  { label: "KYC", href: "/dashboard/kyc", icon: ShieldCheck, roles: ["USER"] },
  { label: "Transactions", href: "/dashboard/transactions", icon: Receipt, roles: ["USER", "MERCHANT"] },
  { label: "Settlement", href: "/dashboard/settlement", icon: Landmark, roles: ["MERCHANT", "ADMIN"] },
  { label: "KYC Approvals", href: "/dashboard/admin/kyc", icon: CheckCircle, roles: ["ADMIN"] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { role } = useAuth()

  const filteredItems = navItems.filter((item) => role && item.roles.includes(role))

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-foreground">
          PayFlow <span className="text-primary">UAE</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
