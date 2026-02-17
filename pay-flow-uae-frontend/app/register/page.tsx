// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { toast } from "sonner"
// import { Loader2, UserPlus } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// import { authApi } from "@/lib/api"
// import type { UserRole } from "@/lib/types"

// export default function RegisterPage() {

//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [role, setRole] = useState<UserRole>("USER")
//   const [loading, setLoading] = useState(false)

//   const router = useRouter()

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()

//     if (!email || !password) {
//       toast.error("Please fill in all fields")
//       return
//     }

//     setLoading(true)

//     try {
//       // backend expects email + password + role
//       await authApi.register({
//         email,
//         password,
//         role,
//       })

//       toast.success("Registration successful! Please sign in.")
//       router.push("/")

//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Registration failed")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-background p-4">
//       <div className="w-full max-w-md">

//         {/* Brand */}
//         <div className="mb-8 text-center">
//           <h1 className="text-3xl font-bold tracking-tight text-foreground">
//             PayFlow <span className="text-primary">UAE</span>
//           </h1>
//           <p className="mt-2 text-sm text-muted-foreground">
//             Create your account
//           </p>
//         </div>

//         <Card className="border-border shadow-lg">
//           <CardHeader className="text-center">
//             <CardTitle className="text-xl">Get started</CardTitle>
//             <CardDescription>
//               Choose your account type and register
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="flex flex-col gap-4">

//               {/* ROLE */}
//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="role">Account Type</Label>
//                 <Select
//                   value={role}
//                   onValueChange={(v) => setRole(v as UserRole)}
//                 >
//                   <SelectTrigger id="role">
//                     <SelectValue placeholder="Select account type" />
//                   </SelectTrigger>

//                   <SelectContent>
//                     <SelectItem value="USER">
//                       Personal Account
//                     </SelectItem>
//                     <SelectItem value="MERCHANT">
//                       Merchant Account
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* EMAIL */}
//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   disabled={loading}
//                   onChange={(e) => setEmail(e.target.value)}
//                   autoComplete="email"
//                 />
//               </div>

//               {/* PASSWORD */}
//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="Create a password"
//                   value={password}
//                   disabled={loading}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="new-password"
//                 />
//               </div>

//               <Button type="submit" className="mt-2 w-full" disabled={loading}>
//                 {loading ? (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 ) : (
//                   <UserPlus className="mr-2 h-4 w-4" />
//                 )}
//                 Create Account
//               </Button>

//             </form>

//             <p className="mt-6 text-center text-sm text-muted-foreground">
//               Already have an account?{" "}
//               <Link href="/login" className="font-medium text-primary hover:underline">
//                 Sign in
//               </Link>
//             </p>

//           </CardContent>
//         </Card>
//       </div>
//     </main>
//   )
// }

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { authApi } from "@/lib/api"
import type { UserRole } from "@/lib/types"

export default function RegisterPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("USER")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      await authApi.register({
        email,
        password,
        role,
      })

      toast.success("Registration successful! Please sign in.")
      router.push("/")

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            PayFlow <span className="text-primary">UAE</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Get started</CardTitle>
            <CardDescription>
              Choose your account type and register
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* ROLE */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Account Type</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>

                  <SelectContent>

                      <SelectItem value="USER">
                        Personal Account
                      </SelectItem>

                      <SelectItem value="MERCHANT">
                        Merchant Account
                      </SelectItem>

                      {/* ADMIN ONLY IN DEVELOPMENT */}
                      {process.env.NODE_ENV === "development" && (
                        <SelectItem value="ADMIN">
                          Admin Account
                        </SelectItem>
                      )}

                      </SelectContent>

                </Select>
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Create Account
              </Button>

            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>

          </CardContent>
        </Card>
      </div>
    </main>
  )
}

