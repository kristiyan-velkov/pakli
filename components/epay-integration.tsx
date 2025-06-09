"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Shield } from "lucide-react"

interface EPayIntegrationProps {
  amount: number
  description: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

export default function EPayIntegration({ amount, description, onSuccess, onError }: EPayIntegrationProps) {
  const [loading, setLoading] = useState(false)

  const handleEPayPayment = async () => {
    setLoading(true)

    try {
      // In a real implementation, this would:
      // 1. Create payment request to your backend
      // 2. Backend creates ePay.bg payment
      // 3. Redirect user to ePay.bg
      // 4. Handle callback from ePay.bg

      // Simulate ePay.bg payment flow
      const paymentData = {
        MIN: "YOUR_EPAY_MIN", // Your ePay.bg merchant number
        INVOICE: `INV-${Date.now()}`,
        AMOUNT: amount.toFixed(2),
        EXP_TIME: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        DESCR: description,
        ENCODING: "utf-8",
      }

      // Simulate redirect to ePay.bg
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful payment
      const transactionId = `EPAY-${Date.now()}`
      onSuccess(transactionId)
    } catch (error) {
      onError("Грешка при обработка на плащането")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-red-600" />
          ePay.bg - Български банки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <img src="/placeholder.svg?height=20&width=30" alt="УниКредит" className="h-5" />
            <span className="text-xs">УниКредит</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <img src="/placeholder.svg?height=20&width=30" alt="ДСК" className="h-5" />
            <span className="text-xs">ДСК Банк</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <img src="/placeholder.svg?height=20&width=30" alt="Райфайзен" className="h-5" />
            <span className="text-xs">Райфайзен</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <img src="/placeholder.svg?height=20&width=30" alt="Fibank" className="h-5" />
            <span className="text-xs">Fibank</span>
          </div>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            <strong>Сигурно плащане</strong> - Директно към вашата банка
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Сума:</span>
            <span className="font-bold">{amount.toFixed(2)} лв</span>
          </div>
          <div className="flex justify-between">
            <span>Такса:</span>
            <span className="text-green-600">Безплатно</span>
          </div>
        </div>

        <Button onClick={handleEPayPayment} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? "Пренасочване..." : "Плати с ePay.bg"}
        </Button>

        <div className="text-xs text-gray-500 text-center">Ще бъдете пренасочени към сигурната страница на ePay.bg</div>
      </CardContent>
    </Card>
  )
}
