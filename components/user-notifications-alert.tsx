"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useAppStore } from "@/lib/store"

export function UserNotificationsAlert() {
  const { user, subscription, userNotifications, setShowPaymentModal } = useAppStore()

  const handlePaymentClick = () => {
    if (setShowPaymentModal) {
      setShowPaymentModal(true)
    } else {
      // Fallback - you can implement alternative logic here
      console.log("Payment modal would open here")
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-4">
      {user && !subscription?.active && (
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <Icon name="bell" className="h-4 w-4" />
          <AlertDescription className="text-blue-800 flex items-center justify-between">
            <span>
              <strong>Активирайте известията:</strong> Получавайте мигновени известия за аварии във вашия квартал за
              само 1 лев месечно.
            </span>
            <Button onClick={handlePaymentClick} size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700">
              Активирай за 1 лв/месец
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {user && userNotifications.length > 0 && (
        <Alert className="border-red-200 bg-red-50 mb-4">
          <Icon name="alert-circle" className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>Известие за вашия район ({user.district}):</strong> Има {userNotifications.length} активни аварии
            във вашия квартал.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
