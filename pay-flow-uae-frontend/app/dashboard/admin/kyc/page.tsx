"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Loader2,
  CheckCircle,
  ShieldCheck,
  Eye,
  XCircle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import { kycApi } from "@/lib/api"

interface KYCRequest {
  kycId: number
  userId: number
  documentType: string
  documentUrl: string
  status: string
}

export default function AdminKYCPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  /* =====================================================
     LOAD PENDING
  ===================================================== */

  async function loadPending() {
    try {
      setLoading(true)
      const res = await kycApi.getPending()
      setRequests(Array.isArray(res) ? res : [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPending()
  }, [])

  /* =====================================================
     APPROVE
  ===================================================== */

  async function handleApprove(id: number) {
    setActionId(id)
    try {
      await kycApi.approve(id)
      toast.success("KYC approved")
      loadPending()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approve failed")
    } finally {
      setActionId(null)
    }
  }

  /* =====================================================
     REJECT
  ===================================================== */

  async function handleReject(id: number) {
    setActionId(id)
    try {
      await kycApi.reject(id)
      toast.success("KYC rejected")
      loadPending()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reject failed")
    } finally {
      setActionId(null)
    }
  }

  /* =====================================================
     VIEW DOC
  ===================================================== */

  function viewDoc(url: string) {
    window.open(`http://localhost:8080${url}`, "_blank")
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Admin KYC Panel
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and approve/reject user KYC documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                {requests.length} pending request
                {requests.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-14">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-3" />
              <p className="text-sm text-muted-foreground">
                No pending KYC requests
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>

                <TableHeader>
                  <TableRow>
                    <TableHead>KYC ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>View</TableHead>
                    <TableHead className="text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.kycId}>

                      <TableCell>{req.kycId}</TableCell>

                      <TableCell>{req.userId}</TableCell>

                      <TableCell>{req.documentType}</TableCell>

                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {req.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDoc(req.documentUrl)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>

                      <TableCell className="text-right flex gap-2 justify-end">

                        <Button
                          size="sm"
                          disabled={actionId === req.kycId}
                          onClick={() => handleApprove(req.kycId)}
                        >
                          {actionId === req.kycId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionId === req.kycId}
                          onClick={() => handleReject(req.kycId)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>

                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
