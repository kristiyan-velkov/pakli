"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAppStore } from "@/lib/store";
import AuthModal from "@/components/auth-modal";
import UserProfile from "@/components/user-profile";
import NotificationCenter from "@/components/notification-center";
import PaymentModal from "@/components/payment-modal";

export function UserActions() {
  const { user, subscription, setUser, setSubscription, userNotifications } =
    useAppStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

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
        <UserProfile user={user} onLogout={handleLogout} />
      ) : (
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          <Icon name="user" className="h-4 w-4 mr-2" />
          Влез
        </Button>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={user}
        onSuccess={handleSubscriptionSuccess}
      />
      <Button
        size="sm"
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      >
        Известия
      </Button>
    </div>
  );
}
