"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

import { motion } from "framer-motion";
import { useState } from "react";
import { Outage } from "@/lib/store/types";
import {
  getServiceColor,
  getServiceIconName,
  getServiceName,
} from "@/lib/utils/outage";

interface OutageDetailsProps {
  outage: Outage;
  onClose: () => void;
  onShowOnMap: (outage: Outage) => void;
}

// Helper function to calculate duration
function calculateDuration(start: string, end: string): string {
  if (!start || !end) return "Неизвестна";

  try {
    // Parse Bulgarian date format
    const parseDate = (dateStr: string) => {
      const [datePart, timePart] = dateStr.split(", ");
      const [day, month, year] = datePart.split(" ");
      const [hours, minutes] = timePart.replace(" ч.", "").split(":");

      const monthMap: { [key: string]: number } = {
        Януари: 0,
        Февруари: 1,
        Март: 2,
        Април: 3,
        Май: 4,
        Юни: 5,
        Юли: 6,
        Август: 7,
        Септември: 8,
        Октомври: 9,
        Ноември: 10,
        Декември: 11,
      };

      return new Date(
        Number.parseInt(year),
        monthMap[month] || 0,
        Number.parseInt(day),
        Number.parseInt(hours),
        Number.parseInt(minutes)
      );
    };

    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours} ч. ${diffMinutes > 0 ? `${diffMinutes} мин.` : ""}`;
    } else {
      return `${diffMinutes} мин.`;
    }
  } catch (error) {
    return "Неизвестна";
  }
}

export function OutageDetails({
  outage,
  onClose,
  onShowOnMap,
}: OutageDetailsProps) {
  const isEmergency = outage.type.toLowerCase().includes("аварийно");
  const serviceColor = getServiceColor(outage.serviceType);
  const serviceIcon = getServiceIconName(outage.serviceType);
  const [expanded, setExpanded] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: "auto", opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      layout
    >
      <Card className="bg-white shadow-lg border border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          {/* Header Section */}
          <motion.div
            className={`p-4 ${
              isEmergency ? "bg-red-50" : "bg-blue-50"
            } border-b border-gray-200`}
            variants={itemVariants}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className={`p-2 rounded-full bg-white shadow-sm border border-${serviceColor}-200`}
                  variants={iconVariants}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon
                    name={serviceIcon}
                    className={`h-5 w-5 text-${serviceColor}-600`}
                  />
                </motion.div>

                <div>
                  <motion.div
                    className="flex items-center space-x-2"
                    variants={itemVariants}
                  >
                    <span
                      className={`font-semibold ${
                        isEmergency ? "text-red-700" : "text-blue-700"
                      }`}
                    >
                      {outage.type}
                    </span>
                    {outage.severity === "high" && (
                      <motion.span
                        className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                          delay: 0.3,
                        }}
                      >
                        Висок приоритет
                      </motion.span>
                    )}
                  </motion.div>
                  <motion.h3
                    className="text-lg font-bold text-gray-900"
                    variants={itemVariants}
                  >
                    {outage.area}
                  </motion.h3>
                </div>
              </div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full h-8 w-8 p-0"
                >
                  <Icon name="x" className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Time Period - Enhanced */}
          <motion.div
            className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="clock" className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Времеви период</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <motion.div
                className="bg-white rounded-lg p-3 border border-green-200 shadow-sm"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="play-circle" className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Начало
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-gray-900">
                    {outage.start?.split(",")[0] || "Неизвестна дата"}
                  </div>
                  <div className="text-base font-semibold text-green-600">
                    {outage.start?.split(",")[1]?.trim() || "Неизвестен час"}
                  </div>
                </div>
              </motion.div>

              {/* End Time */}
              <motion.div
                className="bg-white rounded-lg p-3 border border-red-200 shadow-sm"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="stop-circle" className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Край</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-gray-900">
                    {outage.end?.split(",")[0] || "Неизвестна дата"}
                  </div>
                  <div className="text-base font-semibold text-red-600">
                    {outage.end?.split(",")[1]?.trim() || "Неизвестен час"}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Duration Indicator */}
            <motion.div
              className="mt-3 p-2 bg-white rounded-lg border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Icon name="timer" className="h-4 w-4" />
                <span>
                  Продължителност: {calculateDuration(outage.start, outage.end)}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <div className="p-4">
            <motion.div className="space-y-4" variants={itemVariants}>
              {/* Location */}
              <motion.div
                className="flex items-start space-x-3"
                variants={itemVariants}
              >
                <div className="mt-1">
                  <Icon name="map-pin" className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Засегната зона</h4>
                  <p className="text-gray-700 mt-1">{outage.area}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Квартал: {outage.district}
                  </p>
                </div>
              </motion.div>

              {/* Description */}
              {outage.description && (
                <motion.div
                  className="flex items-start space-x-3"
                  variants={itemVariants}
                >
                  <div className="mt-1">
                    <Icon name="info" className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Описание</h4>
                    <p className="text-gray-700 mt-1">{outage.description}</p>
                  </div>
                </motion.div>
              )}

              {/* Source */}
              <motion.div
                className="flex items-start space-x-3"
                variants={itemVariants}
              >
                <div className="mt-1">
                  <Icon name="database" className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Информация</h4>
                  <p className="text-gray-700 mt-1">
                    <span className="font-medium">Източник:</span>{" "}
                    {outage.source}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <span className="font-medium">Последно обновяване:</span>{" "}
                    {new Date(outage.timestamp).toLocaleString("bg-BG")}
                  </p>
                </div>
              </motion.div>

              {/* Additional Details (Expandable) */}
              <motion.div className="mt-2">
                <motion.button
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => setExpanded(!expanded)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ rotate: expanded ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon name="chevron-right" className="h-4 w-4 mr-1" />
                  </motion.div>
                  {expanded ? "Скрий детайли" : "Покажи повече детайли"}
                </motion.button>

                <motion.div
                  variants={expandVariants}
                  initial="collapsed"
                  animate={expanded ? "expanded" : "collapsed"}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Тип услуга:</span>{" "}
                      {getServiceName(outage.serviceType)}
                    </p>
                    <p>
                      <span className="font-medium">ID на аварията:</span>{" "}
                      {outage.id}
                    </p>
                    {outage.affectedPopulation && (
                      <p>
                        <span className="font-medium">Засегнати жители:</span>{" "}
                        {outage.affectedPopulation}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            className="p-4 border-t border-gray-200 bg-gray-50"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <motion.p
                className="text-sm text-gray-500"
                variants={itemVariants}
              >
                💡 Кликнете на друг маркер на картата за повече информация
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onShowOnMap(outage)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Icon name="map-pin" className="h-4 w-4 mr-1" />
                  Покажи на картата
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
