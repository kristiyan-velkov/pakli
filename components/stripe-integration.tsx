"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Lock } from "lucide-react"

interface StripeIntegrationProps {
  amount: number
  description: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

export default function StripeIntegration({ amount, description, onSuccess, onError }: StripeIntegrationProps) {
  const [loading, setLoading] = useState(false)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  const handleStripePayment = async () => {
    setLoading(true)

    try {
      // In a real implementation, this would:
      // 1. Use Stripe.js to tokenize the card
      // 2. Send token to your backend
      // 3. Backend processes payment with Stripe
      // 4. Return success/failure

      // Simulate Stripe payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate successful payment
      const transactionId = `STRIPE-${Date.now()}`
      onSuccess(transactionId)
    } catch (error) {
      onError("Грешка при обработка на картовото плащане")
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Банкова карта
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <img src="/placeholder.svg?height=24&width=38" alt="Visa" className="h-6" />
          <img src="/placeholder.svg?height=24&width=38" alt="Mastercard" className="h-6" />
          <img src="/placeholder.svg?height=24&width=38" alt="Maestro" className="h-6" />
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="card-number">Номер на картата</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => setCardData((prev) => ({ ...prev, number: formatCardNumber(e.target.value) }))}
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Валидност</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) => setCardData((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cardData.cvc}
                onChange={(e) => setCardData((prev) => ({ ...prev, cvc: e.target.value.replace(/\D/g, "") }))}
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="card-name">Име на картодържателя</Label>
            <Input
              id="card-name"
              placeholder="IVAN PETROV"
              value={cardData.name}
              onChange={(e) => setCardData((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <Lock className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <strong>SSL защита</strong> - Данните ви са криптирани и сигурни
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Сума:</span>
            <span className="font-bold">{amount.toFixed(2)} лв</span>
          </div>
          <div className="flex justify-between">
            <span>Такса:</span>
            <span className="text-gray-600">Включена</span>
          </div>
        </div>

        <Button
          onClick={handleStripePayment}
          disabled={loading || !cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name}
          className="w-full"
        >
          {loading ? "Обработване..." : `Плати ${amount.toFixed(2)} лв`}
        </Button>

        <div className="text-xs text-gray-500 text-center">Powered by Stripe - Сигурни международни плащания</div>
      </CardContent>
    </Card>
  )
}
