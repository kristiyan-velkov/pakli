"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, AlertTriangle, Droplets, Zap, Thermometer, Clock, X } from "lucide-react"

interface Outage {
  id: string
  source: string
  area: string
  type: string
  category: string
  description: string
  start: string
  end: string
  timestamp: string
  serviceType: "water" | "electricity" | "heating"
  district: string
  severity: "low" | "medium" | "high"
}

// Update the interface to include subscription info
interface NotificationCenterProps {
  notifications: Outage[]
  hasSubscription: boolean
  onSubscribe: () => void
}

export default function NotificationCenter({ notifications, hasSubscription, onSubscribe }: NotificationCenterProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "water":
        return <Droplets className="h-4 w-4 text-blue-600" />
      case "electricity":
        return <Zap className="h-4 w-4 text-yellow-600" />
      case "heating":
        return <Thermometer className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getServiceName = (serviceType: string) => {
    switch (serviceType) {
      case "water":
        return "Вода"
      case "electricity":
        return "Ток"
      case "heating":
        return "Топлофикация"
      default:
        return "Неизвестно"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeNotifications = notifications.filter((n) => !dismissedNotifications.includes(n.id))

  const dismissNotification = (id: string) => {
    setDismissedNotifications((prev) => [...prev, id])
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative rounded-full hover:bg-gray-200/50 transition-colors">
            <Bell className="h-4 w-4" />
            {activeNotifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {activeNotifications.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        {/* Update the dropdown content to show subscription requirement */}
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <div className="p-2">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Известия за вашия район
            </h4>
            {!hasSubscription ? (
              <div className="text-center py-6 space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-800 mb-1">Активирайте известията</p>
                  <p className="text-xs text-blue-600 mb-3">
                    Получавайте мигновени известия за аварии във вашия квартал
                  </p>
                  <Button onClick={onSubscribe} size="sm" className="w-full">
                    Активирай за 1 лв/месец
                  </Button>
                </div>
              </div>
            ) : activeNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Няма нови известия</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeNotifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getServiceIcon(notification.serviceType)}
                          <span className="text-sm font-medium">{getServiceName(notification.serviceType)}</span>
                          <Badge className={`text-xs ${getSeverityColor(notification.severity)}`}>
                            {notification.severity === "high"
                              ? "Висок"
                              : notification.severity === "medium"
                                ? "Среден"
                                : "Нисък"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{notification.area}</p>
                        <p className="text-xs text-gray-500">{notification.description}</p>
                        {notification.start && notification.end && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {notification.start} - {notification.end}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {activeNotifications.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(true)}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    Виж всички ({activeNotifications.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Всички известия за вашия район
            </DialogTitle>
          </DialogHeader>

          {/* Update the main dialog content as well */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {!hasSubscription ? (
              <div className="text-center py-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <Bell className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-blue-800 mb-2">Активирайте известията</p>
                  <p className="text-sm text-blue-600 mb-4">
                    Получавайте мигновени известия за аварии във вашия квартал за само 1 лев месечно
                  </p>
                  <Button onClick={onSubscribe} size="lg" className="w-full">
                    Активирай за 1 лв/месец
                  </Button>
                </div>
              </div>
            ) : activeNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Няма нови известия</p>
                <p className="text-sm text-gray-500">Ще получите известие, когато има аварии във вашия квартал</p>
              </div>
            ) : (
              activeNotifications.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getServiceIcon(notification.serviceType)}
                          <span className="font-medium">{getServiceName(notification.serviceType)}</span>
                          <Badge className={getSeverityColor(notification.severity)}>
                            {notification.severity === "high"
                              ? "Висок приоритет"
                              : notification.severity === "medium"
                                ? "Среден приоритет"
                                : "Нисък приоритет"}
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{notification.area}</h4>
                        <p className="text-gray-700 mb-2">{notification.description}</p>
                        {notification.start && notification.end && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {notification.start} - {notification.end}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Източник: {notification.source}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
