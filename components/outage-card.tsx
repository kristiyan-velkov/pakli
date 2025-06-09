"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { Outage } from "@/lib/store";
import { getServiceIconName, getServiceName } from "@/lib/utils";
import clsx from "clsx";

interface OutageCardProps {
  outage: Outage;
  onClick: (outage: Outage) => void;
  onMapIconClick: (outage: Outage) => void;
  selected?: boolean;
  index?: number;
}

function generateRealisticTime(outage: Outage): {
  start: string;
  end: string;
  duration: string;
} {
  const now = new Date();
  const isEmergency = outage.type.toLowerCase().includes("аварийно");

  let startDate: Date;
  let endDate: Date;

  if (isEmergency) {
    startDate = new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000);
    endDate = new Date(
      startDate.getTime() + (2 + Math.random() * 8) * 60 * 60 * 1000
    );
  } else {
    const daysOffset = Math.floor(Math.random() * 7);
    startDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    startDate.setHours(8 + Math.floor(Math.random() * 4), 0, 0, 0);
    const duration = outage.serviceType === "heating" ? 6 : 4;
    endDate = new Date(
      startDate.getTime() + (duration + Math.random() * 4) * 60 * 60 * 1000
    );
  }

  const formatTime = (date: Date) => {
    return (
      date.toLocaleDateString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("bg-BG", {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " ч."
    );
  };

  const durationHours = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  );
  const durationText = durationHours === 1 ? "1 час" : `${durationHours} часа`;

  return {
    start: formatTime(startDate),
    end: formatTime(endDate),
    duration: durationText,
  };
}

export function OutageCard({
  outage,
  onMapIconClick,
  index = 0,
}: OutageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEmergency = outage.type.toLowerCase().includes("аварийно");
  const serviceIcon = getServiceIconName(outage.serviceType);
  const timeData = generateRealisticTime(outage);

  const getServiceTheme = (serviceType: string, isEmergency: boolean) => {
    if (isEmergency) {
      switch (serviceType) {
        case "electricity":
          return {
            border: "border-red-300",
            statusBg: "bg-gradient-to-r from-red-500 to-red-600",
            iconBg: "bg-yellow-500",
            iconColor: "text-white",
            accent: "text-red-600",
          };
        case "water":
          return {
            bg: "bg-gradient-to-br from-red-50 via-blue-50 to-cyan-50",
            border: "border-red-300",
            statusBg: "bg-gradient-to-r from-red-500 to-red-600",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-700",
            accent: "text-blue-600",
          };
        case "heating":
          return {
            border: "border-red-300",
            statusBg: "bg-gradient-to-r from-red-500 to-red-600",
            iconBg: "bg-orange-100",
            iconColor: "text-orange-700",
            accent: "text-red-600",
          };
        default:
          return {
            bg: "bg-gradient-to-br from-red-50 via-gray-50 to-slate-50",
            border: "border-red-300",
            statusBg: "bg-gradient-to-r from-red-500 to-red-600",
            iconBg: "bg-gray-100",
            iconColor: "text-gray-700",
            accent: "text-blue-600",
          };
      }
    } else {
      switch (serviceType) {
        case "electricity":
          return {
            border: "border-grey-300",
            statusBg: "bg-gradient-to-r from-blue-500 to-cyan-500",
            iconBg: "bg-yellow-500",
            iconColor: "text-white",
          };
        case "water":
          return {
            border: "border-blue-300",
            statusBg: "bg-gradient-to-r from-blue-500 to-cyan-500",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-700",
            accent: "text-blue-600",
          };
        case "heating":
          return {
            border: "border-orange-300",
            statusBg: "bg-gradient-to-r from-red-500 to-red-600",
            iconBg: "bg-red-500",
            iconColor: "text-white",
            accent: "text-orange-600",
          };
        default:
          return {
            border: "border-gray-300",
            statusBg: "bg-gradient-to-r from-gray-500 to-slate-500",
            iconBg: "bg-gray-100",
            iconColor: "text-gray-700",
            accent: "text-gray-600",
          };
      }
    }
  };

  const theme = getServiceTheme(outage.serviceType, isEmergency);

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMapIconClick(outage);
  };

  const handleToggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      layout
    >
      <Card
        className={`${theme.border} bg-gray-100 border-2 cursor-pointer transition-all duration-500 overflow-hidden backdrop-blur-sm`}
      >
        <CardContent className="p-0">
          <motion.div
            className="flex items-center justify-between p-5 pb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className={`${theme.iconBg} p-3 rounded-xl shadow-sm`}
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Icon
                  name={serviceIcon}
                  className={`h-6 w-6 ${theme.iconColor}`}
                />
              </motion.div>
              <span className="text-lg font-semibold text-gray-700">
                {getServiceName(outage.serviceType)}
              </span>
              <div className="flex items-center space-x-3">
                <Badge
                  className={clsx(
                    "text-white font-bold shadow-lg flex items-center space-x-2",
                    isEmergency
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  {isEmergency ? "Авария" : "Планирано"}
                </Badge>

                {/* <motion.span
                  className={`${theme.statusBg} text-white px-2 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2`}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    stiffness: 500,
                  }}
                >
                  <Icon
                    name={isEmergency ? "clock-alert" : "calendar"}
                    className="h-4 w-4"
                  />
                  <span>{isEmergency ? "Авария" : "Планирано"}</span>
                </motion.span> */}

                {outage.severity === "high" && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg flex items-center  space-x-2">
                    <span>Висок приоритет</span>
                  </Badge>
                )}
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMapClick}
                className="bg-white/80 border-gray-300 hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                <Icon name="map-pin" className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="px-5 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/40">
              <div className="flex items-start space-x-3">
                <Icon
                  name="map-pin"
                  className={`h-5 w-5 ${theme.accent} mt-1 flex-shrink-0`}
                />
                <h3 className="font-bold text-gray-900 mb-1">{outage.area}</h3>
              </div>
              <div className="flex items-start space-x-3">
                <Icon
                  name="info"
                  className={`h-5 w-5 ${theme.accent} mt-1 flex-shrink-0`}
                />
                <div className="flex items-start space-x-3">
                  <p className=" text-gray-700">{outage.description}</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-xl  shadow-sm border border-white/40">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="clock" className={`h-5 w-5 ${theme.accent}`} />
                  <span className=" text-gray-900">Времеви период:</span>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    Продължителност: {timeData.duration}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon name="clock" className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        Начало
                      </span>
                    </div>
                    <div className="text-sm font-bold text-green-800">
                      {timeData.start}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon name="clock" className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">
                        Край
                      </span>
                    </div>
                    <div className="text-sm font-bold text-red-800">
                      {timeData.end}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="px-5 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.6 }}
          >
            <motion.button
              onClick={handleToggleDetails}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Icon name="chevron-right" className="h-4 w-4" />
              </motion.div>
              <span>Покажи повече детайли</span>
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking inside expanded content
              >
                <div className="px-5 pb-5 space-y-4">
                  {outage.description && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/40"
                    >
                      <div className="flex items-start space-x-3">
                        <Icon
                          name="file-text"
                          className={`h-5 w-5 ${theme.accent} mt-1 flex-shrink-0`}
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">
                            Подробно описание
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {outage.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/40"
                  >
                    <div className="flex items-start space-x-3">
                      <Icon
                        name="info"
                        className={`h-5 w-5 ${theme.accent} mt-1 flex-shrink-0`}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">
                          Информация
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-flex-start">
                            <span className="text-sm text-gray-600">
                              Източник:
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {outage.source}
                            </span>
                          </div>
                          <div className="flex items-flex-start">
                            <span className="text-sm text-gray-600">
                              Последно обновяване:
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {new Date().toLocaleDateString("bg-BG")} г.
                            </span>
                          </div>
                          <div className="flex items-flex-start">
                            <span className="text-sm text-gray-600">
                              Статус:
                            </span>
                            <span
                              className={`text-sm font-semibold pl-1 ${
                                isEmergency ? "text-red-600" : "text-orange-600"
                              }`}
                            >
                              {isEmergency
                                ? "Активна авария"
                                : "Планирана дейност"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
