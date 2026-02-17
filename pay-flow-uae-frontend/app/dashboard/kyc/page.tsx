"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Loader2, Upload, ShieldCheck, FileText, Eye } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { kycApi } from "@/lib/api"

/* =====================================================
   TYPES (UPDATED TO MATCH BACKEND)
===================================================== */

interface KycStatus {
  kycId?: number
  userId?: number
  status: string
  documentType: string
  documentUrl?: string
}

export default function KYCPage() {
  const [documentType, setDocumentType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* =====================================================
     LOAD KYC STATUS
  ===================================================== */

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const res = await kycApi.getStatus()
        if (mounted) setKycStatus(res ?? null)
      } catch {
        if (mounted) setKycStatus(null)
      } finally {
        if (mounted) setStatusLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  /* =====================================================
     HELPERS
  ===================================================== */

  const isSubmitted =
    kycStatus &&
    (kycStatus.status === "PENDING" ||
      kycStatus.status === "APPROVED")

  function getStatusColor(status?: string) {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700"
      case "PENDING":
        return "bg-yellow-100 text-yellow-700"
      case "REJECTED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  /* =====================================================
     FILE VALIDATION
  ===================================================== */

  function validateFile(f: File) {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ]

    if (!allowed.includes(f.type)) {
      toast.error("Only image or PDF allowed")
      return false
    }

    if (f.size > 10 * 1024 * 1024) {
      toast.error("Max file size 10MB")
      return false
    }

    return true
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!validateFile(selected)) {
      setFile(null)
      e.target.value = ""
      return
    }

    setFile(selected)
  }

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!documentType || !file) {
      toast.error("Select document & file")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("documentType", documentType)
      formData.append("file", file)

      await kycApi.submit(formData)

      toast.success("KYC submitted successfully")

      // instant UI update
      setKycStatus({
        status: "PENDING",
        documentType,
      })

      setDocumentType("")
      setFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submit failed")
    } finally {
      setLoading(false)
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-sm text-muted-foreground">
          Upload your identity documents
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* STATUS CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            {statusLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : kycStatus ? (
              <div className="space-y-3">

                <Badge className={getStatusColor(kycStatus.status)}>
                  {kycStatus.status}
                </Badge>

                <p className="text-sm">
                  <strong>Document:</strong> {kycStatus.documentType}
                </p>

                {kycStatus.documentUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `http://localhost:8080${kycStatus.documentUrl}`,
                        "_blank"
                      )
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Document
                  </Button>
                )}

              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No KYC submitted yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* UPLOAD CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Document
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isSubmitted ? (
              <p className="text-sm text-muted-foreground">
                KYC already submitted. Please wait for admin review.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div className="flex flex-col gap-2">
                  <Label>Document Type</Label>
                  <Select
                    value={documentType}
                    onValueChange={setDocumentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSPORT">Passport</SelectItem>
                      <SelectItem value="EMIRATES_ID">Emirates ID</SelectItem>
                      <SelectItem value="DRIVING_LICENSE">
                        Driving License
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>File</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={onFileChange}
                    className="border rounded-md p-2 text-sm"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Submit KYC
                </Button>

              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
