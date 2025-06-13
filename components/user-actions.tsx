"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAppStore } from "@/lib/store";
import UserProfile from "@/components/user-profile";
import NotificationCenter from "@/components/notification-center";
import PaymentModal from "@/components/payment-modal";
import { useRouter } from "next/navigation";

export function UserActions() {
  const { user, subscription, setSubscription, userNotifications } =
    useAppStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();

  const handleSubscriptionSuccess = (subscriptionData: any) => {
    setSubscription(subscriptionData);
    setShowPaymentModal(false);
  };

  return (
    <div className="flex items-center space-x-4">
      {user && (
        <NotificationCenter
          notifications={subscription?.active ? userNotifications : []}
          hasSubscription={subscription?.active || false}
          onSubscribe={() => setShowPaymentModal(true)}
        />
      )}
      {user ? (
        <UserProfile user={user} />
      ) : (
        <>
          <Button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            <Icon name="user" className="h-4 w-4 mr-2" />
            Вход
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowPaymentModal(true)}
          >
            <Icon name="user" className="h-4 w-4 mr-2" />
            Payment
          </Button>
        </>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={user}
        onSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
}
