// src/lib/api.ts

const API_BASE = "http://localhost:8080"

/* =========================================================
   AUTH HELPERS (SAFE)
========================================================= */

function getToken(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("payflow_token") || ""
}

function getUserId(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("payflow_userId") || ""
}

function getRole(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("payflow_role") || ""
}

/* =========================================================
   GENERIC REQUEST (SAFE + FLEXIBLE)
========================================================= */

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token = getToken()

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  // attach JWT automatically
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // JSON header (skip FormData)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(
      err?.message ||
      err?.error ||
      `HTTP ${res.status}`
    )
  }

  const text = await res.text()

  if (!text) return {} as T

  try {
    return JSON.parse(text)
  } catch {
    return text as unknown as T
  }
}

/* =========================================================
   AUTH API
========================================================= */

export const authApi = {

  login: (data: { email: string; password: string }) =>
    request<{ token: string; userId: string; role: string }>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  register: (data: { email: string; password: string; role: string }) =>
    request<{ message: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /* ================================
     FORGOT PASSWORD
  ================================= */

  forgotPassword: (email: string) =>
    request<string>(
      `/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`,
      {
        method: "POST",
      }
    ),

  /* ================================
     RESET PASSWORD
  ================================= */

  resetPassword: (data: { token: string; newPassword: string }) =>
    request<string>(
      `/api/v1/auth/reset-password?token=${encodeURIComponent(
        data.token
      )}&newPassword=${encodeURIComponent(data.newPassword)}`,
      {
        method: "POST",
      }
    ),
}

/* =========================================================
   WALLET API
========================================================= */

export const walletApi = {

  create: () =>
    request<{ walletId: string }>("/api/v1/wallet/create", {
      method: "POST",
      headers: {
        userId: getUserId(),
      },
    }),

  getMyWallet: () =>
    request<{ walletId: string }>("/api/v1/wallet/my-wallet", {
      headers: {
        userId: getUserId(),
      },
    }),

  getBalance: (walletId: string) =>
    request<{ walletId: string; balance: number }>(
      `/api/v1/wallet/balance/${walletId}`
    ),

  addMoney: (walletId: string, data: { amount: number }) =>
    request(`/api/v1/wallet/add-money/${walletId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTransactions: (walletId: string) =>
    request(`/api/v1/wallet/transactions/${walletId}`),

  transfer: (walletId: string, data: any) =>
    request(`/api/v1/wallet/transfer/${walletId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

/* =========================================================
   PAYMENT API
========================================================= */

export const paymentApi = {

  p2p: (data: any) =>
    request("/api/v1/payment/p2p", {
      method: "POST",
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
        userId: getUserId(),
        role: getRole(),
      },
      body: JSON.stringify(data),
    }),

  merchant: (data: any) =>
    request("/api/v1/payment/merchant", {
      method: "POST",
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
        userId: getUserId(),
        role: getRole(),
      },
      body: JSON.stringify(data),
    }),

  getSettlement: (walletId: string) =>
    request<number>(
      `/api/v1/payment/merchant/settlement/${walletId}`,
      {
        headers: {
          role: getRole(),
        },
      }
    ),
}

/* =========================================================
   KYC API
========================================================= */

export const kycApi = {

  submit: (formData: FormData) =>
    request("/api/v1/kyc/submit", {
      method: "POST",
      headers: {
        userId: getUserId(),
      },
      body: formData,
    }),

  getStatus: () =>
    request("/api/v1/kyc/status", {
      headers: {
        userId: getUserId(),
      },
    }),

  approve: (id: string) =>
    request(`/api/v1/kyc/approve/${id}`, {
      method: "PUT",
      headers: {
        role: getRole(),
      },
    }),

      // ⭐ ADD THIS (MISSING)
  reject: (id: number | string) =>
  request(`/api/v1/kyc/reject/${id}`, {
    method: "PUT",
    headers: {
      role: getRole(),
    },
  }),

  getPending: () =>
    request("/api/v1/kyc/pending", {
      headers: {
        role: getRole(),
      },
    }),
}
