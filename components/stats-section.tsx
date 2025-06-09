"use client";

import { useAppStore } from "@/lib/store";
import { getOutageStatistics } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  XCircle,
  AlertTriangle,
  Droplets,
  Zap,
  Thermometer,
} from "lucide-react";
import { useMemo } from "react";

export function StatsSection() {
  const {
    filteredOutages,
    filters,
    setSelectedType,
    setSelectedService,
    applyFilters,
    loading,
  } = useAppStore();

  const stats = useMemo(
    () => getOutageStatistics(filteredOutages),
    [filteredOutages]
  );

  const cards = [
    {
      key: "emergency",
      title: "Аварии",
      value: stats.emergency,
      icon: XCircle,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      border: "border-red-200",
      text: "text-red-700",
      isActive: filters.selectedType === "emergency",
      toggle: () => {
        setSelectedType(
          filters.selectedType === "emergency" ? "all" : "emergency"
        );
        applyFilters();
      },
    },
    {
      key: "scheduled",
      title: "Планирани",
      value: stats.scheduled,
      icon: AlertTriangle,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-700",
      isActive: filters.selectedType === "scheduled",
      toggle: () => {
        setSelectedType(
          filters.selectedType === "scheduled" ? "all" : "scheduled"
        );
        applyFilters();
      },
    },
    {
      key: "water",
      title: "Вода",
      value: stats.water,
      icon: Droplets,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-700",
      isActive: filters.selectedService === "water",
      toggle: () => {
        setSelectedService(
          filters.selectedService === "water" ? "all" : "water"
        );
        applyFilters();
      },
    },
    {
      key: "electricity",
      title: "Ток",
      value: stats.electricity,
      icon: Zap,
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      border: "border-yellow-200",
      text: "text-yellow-700",
      isActive: filters.selectedService === "electricity",
      toggle: () => {
        setSelectedService(
          filters.selectedService === "electricity" ? "all" : "electricity"
        );
        applyFilters();
      },
    },
    {
      key: "heating",
      title: "Топла вода",
      value: stats.heating,
      icon: Thermometer,
      gradient: "from-red-500 to-pink-600",
      bgGradient: "from-red-50 to-pink-100",
      border: "border-red-200",
      text: "text-red-700",
      isActive: filters.selectedService === "heating",
      toggle: () => {
        setSelectedService(
          filters.selectedService === "heating" ? "all" : "heating"
        );
        applyFilters();
      },
    },
  ];

  const SkeletonCard = () => (
    <div className="h-40 w-full rounded-2xl bg-gray-100 animate-pulse" />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {loading
        ? Array.from({ length: 5 }).map((_, idx) => (
            <SkeletonCard key={`skeleton-${idx}`} />
          ))
        : cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
                onClick={card.toggle}
              >
                <div
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    card.isActive
                      ? `${card.border} bg-gradient-to-br ${card.bgGradient} shadow-md`
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-transparent via-white to-transparent" />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          card.isActive
                            ? `bg-gradient-to-br ${card.gradient} text-white shadow-md`
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {card.isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-green-500 rounded-full shadow"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`text-sm font-medium ${
                          card.isActive ? card.text : "text-gray-600"
                        }`}
                      >
                        {card.title}
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          card.isActive ? card.text : "text-gray-900"
                        }`}
                      >
                        {card.value}
                      </p>
                    </div>

                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${card.gradient} mix-blend-overlay`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
    </div>
  );
}
