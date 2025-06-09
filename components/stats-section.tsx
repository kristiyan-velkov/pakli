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

export function StatsSection() {
  const {
    filteredOutages,
    filters,
    setSelectedType,
    setSelectedService,
    applyFilters,
  } = useAppStore();

  const stats = getOutageStatistics(filteredOutages);

  const statsCards = [
    {
      title: "Аварии",
      value: stats.emergency,
      icon: XCircle,
      color: "red",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      isActive: filters.selectedType === "emergency",
      onClick: () => {
        setSelectedType(
          filters.selectedType === "emergency" ? "all" : "emergency"
        );
        applyFilters();
      },
    },
    {
      title: "Планирани",
      value: stats.scheduled,
      icon: AlertTriangle,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      isActive: filters.selectedType === "scheduled",
      onClick: () => {
        setSelectedType(
          filters.selectedType === "scheduled" ? "all" : "scheduled"
        );
        applyFilters();
      },
    },
    {
      title: "Вода",
      value: stats.water,
      icon: Droplets,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      isActive: filters.selectedService === "water",
      onClick: () => {
        setSelectedService(
          filters.selectedService === "water" ? "all" : "water"
        );
        applyFilters();
      },
    },
    {
      title: "Ток",
      value: stats.electricity,
      icon: Zap,
      color: "yellow",
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      isActive: filters.selectedService === "electricity",
      onClick: () => {
        setSelectedService(
          filters.selectedService === "electricity" ? "all" : "electricity"
        );
        applyFilters();
      },
    },
    {
      title: "Топла вода",
      value: stats.heating,
      icon: Thermometer,
      color: "red",
      gradient: "from-red-500 to-pink-600",
      bgGradient: "from-red-50 to-pink-100",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      isActive: filters.selectedService === "heating",
      onClick: () => {
        setSelectedService(
          filters.selectedService === "heating" ? "all" : "heating"
        );
        applyFilters();
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={card.onClick}
          >
            <div
              className={`
              relative overflow-hidden rounded-2xl border-2 transition-all duration-300
              ${
                card.isActive
                  ? `${card.borderColor} bg-gradient-to-br ${card.bgGradient} shadow-lg shadow-${card.color}-200/50`
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }
            `}
            >
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent"></div>
              </div>

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`
                    p-3 rounded-xl transition-all duration-300
                    ${
                      card.isActive
                        ? `bg-gradient-to-br ${card.gradient} text-white shadow-lg`
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    }
                  `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {card.isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <p
                    className={`
                    text-sm font-medium transition-colors duration-300
                    ${card.isActive ? card.textColor : "text-gray-600"}
                  `}
                  >
                    {card.title}
                  </p>
                  <p
                    className={`
                    text-3xl font-bold transition-colors duration-300
                    ${card.isActive ? card.textColor : "text-gray-900"}
                  `}
                  >
                    {card.value}
                  </p>
                </div>

                <div
                  className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  bg-gradient-to-br ${card.gradient} mix-blend-overlay
                `}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
