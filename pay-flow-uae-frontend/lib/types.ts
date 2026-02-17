export type UserRole = "USER" | "MERCHANT" | "ADMIN"

export interface AuthResponse {
  token: string
  userId: string
  role: UserRole
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  role: UserRole
}

export interface LoginRequest {
  username: string
  password: string
}

export interface Wallet {
  walletId: string
  balance: number
  currency: string
  userId: string
}

export interface WalletTransaction {
  id: string
  type: string
  amount: number
  timestamp: string
  description: string
  status: string
}

export interface TransferRequest {
  receiverWalletId: string
  amount: number
}

export interface P2PPaymentRequest {
  senderWalletId: string
  receiverWalletId: string
  amount: number
}

export interface MerchantPaymentRequest {
  userWalletId: string
  merchantWalletId: string
  amount: number
}

export interface KYCSubmission {
  documentType: string
  file: File
}

export interface KYCStatus {
  id: string
  userId: string
  documentType: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  submittedAt: string
}

export interface Settlement {
  totalSettlement: number
  currency: string
}
