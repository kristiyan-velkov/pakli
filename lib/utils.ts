import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Outage } from "./store"

/**
 * Combines class names with Tailwind's merge utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get service icon name based on service type
 */
export function getServiceIconName(serviceType: string): string {
  switch (serviceType) {
    case "water":
      return "droplets"
    case "electricity":
      return "zap"
    case "heating":
      return "thermometer"
    default:
      return "activity"
  }
}

/**
 * Get service name in Bulgarian
 */
export function getServiceName(serviceType: string): string {
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

/**
 * Get color for service type
 */
export function getServiceColor(serviceType: string): string {
  switch (serviceType) {
    case "water":
      return "blue"
    case "electricity":
      return "yellow"
    case "heating":
      return "red"
    default:
      return "gray"
  }
}

/**
 * Get severity name in Bulgarian
 */
export function getSeverityName(severity: string): string {
  switch (severity) {
    case "high":
      return "Висок"
    case "medium":
      return "Среден"
    case "low":
      return "Нисък"
    default:
      return "Неизвестен"
  }
}

/**
 * Get outage type name in Bulgarian
 */
export function getOutageTypeName(type: string): string {
  if (type.toLowerCase().includes("аварийно")) {
    return "Авария"
  } else if (type.toLowerCase().includes("планирано")) {
    return "Планирано"
  } else {
    return "В ход"
  }
}

/**
 * Get outage statistics by type and service
 */
export function getOutageStatistics(outages: Outage[]) {
  return {
    emergency: outages.filter((outage) => outage.type.toLowerCase().includes("аварийно")).length,
    scheduled: outages.filter((outage) => outage.type.toLowerCase().includes("планирано")).length,
    water: outages.filter((outage) => outage.serviceType === "water").length,
    electricity: outages.filter((outage) => outage.serviceType === "electricity").length,
    heating: outages.filter((outage) => outage.serviceType === "heating").length,
  }
}

/**
 * Sofia districts with approximate coordinates
 */
export const sofiaDistricts = {
  Център: { lat: 42.6977, lng: 23.3219, zoom: 15 },
  Младост: { lat: 42.6506, lng: 23.375, zoom: 14 },
  Люлин: { lat: 42.7089, lng: 23.2419, zoom: 14 },
  "Студентски град": { lat: 42.6536, lng: 23.3547, zoom: 15 },
  Лозенец: { lat: 42.6833, lng: 23.3333, zoom: 15 },
  Оборище: { lat: 42.7, lng: 23.33, zoom: 15 },
  Дружба: { lat: 42.6444, lng: 23.3889, zoom: 14 },
  "Овча купел": { lat: 42.6667, lng: 23.2333, zoom: 14 },
  "Красно село": { lat: 42.6867, lng: 23.2867, zoom: 14 },
  "Красна поляна": { lat: 42.7033, lng: 23.2767, zoom: 14 },
  Витоша: { lat: 42.6333, lng: 23.3, zoom: 14 },
  Сердика: { lat: 42.7, lng: 23.32, zoom: 15 },
  Възраждане: { lat: 42.7, lng: 23.31, zoom: 15 },
  Подуяне: { lat: 42.72, lng: 23.35, zoom: 14 },
  Слатина: { lat: 42.7, lng: 23.37, zoom: 14 },
  Илинден: { lat: 42.7167, lng: 23.3, zoom: 14 },
  Надежда: { lat: 42.73, lng: 23.29, zoom: 14 },
  Искър: { lat: 42.65, lng: 23.4, zoom: 14 },
  Панчарево: { lat: 42.5833, lng: 23.4167, zoom: 14 },
  Банкя: { lat: 42.7167, lng: 23.15, zoom: 14 },
}

/**
 * Get coordinates for an outage based on area text
 */
export function getOutageCoordinates(outage: Outage) {
  const area = outage.area.toLowerCase()
  const district = outage.district.toLowerCase()

  // Try to match district names
  for (const [districtName, coords] of Object.entries(sofiaDistricts)) {
    if (district.includes(districtName.toLowerCase()) || area.includes(districtName.toLowerCase())) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
        lng: coords.lng + (Math.random() - 0.5) * 0.01,
        district: districtName,
      }
    }
  }

  // Default to Sofia center if no match found
  return {
    lat: 42.6977 + (Math.random() - 0.5) * 0.02,
    lng: 23.3219 + (Math.random() - 0.5) * 0.02,
    district: "София",
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (e) {
    return dateString
  }
}
