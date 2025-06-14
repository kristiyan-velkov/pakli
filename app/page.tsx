"use client";

import { useEffect, Suspense } from "react";
import { useAppStore } from "@/lib/store";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { UserNotificationsAlert } from "@/components/user-notifications-alert";
import { UserDistrictAlert } from "@/components/user-district-alert";
import { StatsSection } from "@/components/stats-section";
import { ViewToggle } from "@/components/view-toggle";
import { Filters } from "@/components/filters";
import { ActiveFilters } from "@/components/active-filters";
import { OutageCard } from "@/components/outage-card";
import { OutageDetails } from "@/components/outage-details";
import InteractiveMap from "@/components/interactive-map";
import { useState, useRef } from "react";
import GoogleMaps3D from "@/components/google-maps-3d";
import { motion } from "framer-motion";

interface Outage {
  id: string;
  source: string;
  area: string;
  type: string;
  category: string;
  description: string;
  start: string;
  end: string;
  timestamp: string;
  serviceType: "water" | "electricity" | "heating";
  district: string;
  severity: "low" | "medium" | "high";
}

interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  address: string;
  district: string;
  notifications?: boolean;
}

export default function SofiaUtilityMonitor() {
  const {
    fetchOutages,
    filteredOutages,
    selectedOutage,
    setSelectedOutage,
    viewMode,
    mapType,
    loading,
    setViewMode,
    user,
    filters,
    applyFilters,
  } = useAppStore();

  useEffect(() => {
    fetchOutages();
  }, []);

  // Apply filters when user or filters change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters.showOnlyUserDistrict]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [mapTypeLocal, setMapTypeLocal] = useState<"leaflet" | "mapbox">(
    "leaflet"
  ); // Default to 2D map
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [userNotifications, setUserNotifications] = useState<Outage[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userSubscription, setUserSubscription] = useState<{
    active: boolean;
    expiresAt: string | null;
    paymentMethod: string | null;
  } | null>(null);
  const [showOnlyUserDistrict, setShowOnlyUserDistrict] = useState(true);
  const mapInstanceRef = useRef<any>(null);
  const interactiveMapRef = useRef<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sofia-utility-user");
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }

    const savedSubscription = localStorage.getItem(
      "sofia-utility-subscription"
    );
    if (savedSubscription) {
      setUserSubscription(JSON.parse(savedSubscription));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUserData(userData);
    localStorage.setItem("sofia-utility-user", JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem("sofia-utility-user");
    setUserNotifications([]);
  };

  const handleSubscriptionSuccess = (subscription: any) => {
    setUserSubscription(subscription);
    localStorage.setItem(
      "sofia-utility-subscription",
      JSON.stringify(subscription)
    );
    setShowPaymentModal(false);
    fetchOutages();
  };

  const handleMapIconClick = (outage: any) => {
    setViewMode("map");
    setSelectedOutage(outage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <Hero />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <UserDistrictAlert />
        <UserNotificationsAlert />

        {/* Stats and Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8"
        >
          <StatsSection />

          <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-end">
            <div className="flex-1 w-full">
              <Filters />
            </div>
            <ViewToggle />
          </div>

          <div className="mt-6">
            <ActiveFilters />
          </div>
        </motion.div>

        {/* Main Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden"
        >
          {viewMode === "map" ? (
            /* Map View */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <Suspense fallback={<MapLoadingFallback />}>
                  {mapType === "google" ? (
                    <GoogleMaps3D
                      key={`google-${filters.selectedService}-${filters.selectedType}-${filters.selectedCategory}-${filteredOutages.length}`}
                      outages={filteredOutages}
                      onOutageSelect={setSelectedOutage}
                      selectedOutage={selectedOutage}
                      userDistrict={user?.district}
                      showOnlyUserDistrict={filters.showOnlyUserDistrict}
                      viewMode={viewMode}
                    />
                  ) : (
                    <InteractiveMap
                      key={`leaflet-${filters.selectedService}-${filters.selectedType}-${filters.selectedCategory}-${filteredOutages.length}`}
                      outages={filteredOutages}
                      onOutageSelect={setSelectedOutage}
                      selectedOutage={selectedOutage}
                      userDistrict={user?.district}
                      showOnlyUserDistrict={filters.showOnlyUserDistrict}
                      viewMode={viewMode}
                    />
                  )}
                </Suspense>
              </div>

              {/* Outage Details Panel */}
              {selectedOutage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <OutageDetails
                    outage={selectedOutage}
                    onClose={() => setSelectedOutage(null)}
                    onShowOnMap={(outage) => {
                      console.log("Show on map:", outage);
                    }}
                  />
                </motion.div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="p-8">
              {loading ? (
                <div className="text-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600 font-medium">Зареждане...</p>
                </div>
              ) : filteredOutages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      ✅
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Няма намерени прекъсвания
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Всички услуги работят нормално
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredOutages.map((outage, index) => (
                    <motion.div
                      key={outage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <OutageCard
                        outage={outage}
                        onClick={setSelectedOutage}
                        onMapIconClick={handleMapIconClick}
                        selected={selectedOutage?.id === outage.id}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function MapLoadingFallback() {
  return (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Зареждане на картата...</p>
      </div>
    </div>
  );
}
