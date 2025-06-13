"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Building2,
  CheckCircle,
  Bell,
  Mail,
  Shield,
  Clock,
  Star,
  Zap,
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: (subscription: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    "epay" | "stripe" | null
  >(null);
  const [setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "payment" | "success">("select");

  const handlePayment = async (method: "epay" | "stripe") => {
    setLoading(true);
    setSelectedMethod(method);
    setStep("payment");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Create subscription object
      const subscription = {
        active: true,
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days from now
        paymentMethod: method,
        amount: 1,
        currency: "BGN",
        startDate: new Date().toISOString(),
      };

      setStep("success");

      // Wait a bit before calling success
      setTimeout(() => {
        onSuccess(subscription);
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
      setStep("select");
    }
  };

  const resetModal = () => {
    setStep("select");
    setSelectedMethod(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Активиране на известията
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-6">
            {/* Subscription Benefits */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
                  <Star className="h-5 w-5" />
                  Премиум известия за 1 лев месечно
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Мигновени известия в сайта
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Имейл известия за аварии</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Персонализирани за вашия квартал
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Приоритетни известия</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">24/7 мониторинг</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Без реклами</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white/70 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Месечен абонамент:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        1 лв
                      </span>
                      <Badge variant="secondary">месечно</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    За квартал: {user?.district} | Автоматично подновяване
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                Изберете начин на плащане
              </h3>

              {/* ePay.bg */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                onClick={() => handlePayment("epay")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-100 p-3 rounded-full">
                        <Building2 className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">ePay.bg</h4>
                        <p className="text-sm text-gray-600">
                          Всички български банки
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            УниКредит
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ДСК
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Райфайзен
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            +още
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">
                        Препоръчано
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Без такси</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                onClick={() => handlePayment("stripe")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Банкова карта</h4>
                        <p className="text-sm text-gray-600">
                          Visa, Mastercard, Maestro
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Visa
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Mastercard
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Maestro
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Международно</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Сигурно плащане
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Notice */}
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                <strong>Сигурност:</strong> Всички плащания са защитени с SSL
                криптиране. Не съхраняваме данни от вашите карти.
              </AlertDescription>
            </Alert>

            {/* Terms */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>С продължаването приемате нашите Условия за ползване</p>
              <p>Абонаментът се подновява автоматично всеки месец</p>
              <p>Можете да отмените по всяко време от настройките на профила</p>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">
                Обработване на плащането
              </h3>
              <p className="text-gray-600">
                {selectedMethod === "epay"
                  ? "Пренасочване към ePay.bg..."
                  : "Обработване на картовото плащане..."}
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span>Месечен абонамент - {user?.district}</span>
                  <span className="font-bold">1.00 лв</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Моля, не затваряйте този прозорец докато плащането не приключи.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Плащането е успешно!
              </h3>
              <p className="text-gray-600">
                Известията са активирани за вашия квартал
              </p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Абонамент:</span>
                    <Badge className="bg-green-600">Активен</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Квартал:</span>
                    <span className="font-medium">{user?.district}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Валиден до:</span>
                    <span className="font-medium">
                      {new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("bg-BG")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Платен:</span>
                    <span className="font-medium">1.00 лв</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Ще получавате известия в сайта</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Ще получавате известия по имейл</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Мигновени известия за аварии</span>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full" size="lg">
              Продължи към известията
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
