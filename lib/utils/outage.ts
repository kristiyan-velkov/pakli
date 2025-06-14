import { Outage, ServiceType, Severity } from "../store/types";

export function transformApiToOutage(apiData: any): Outage {
  const rawServiceType =
    apiData.serviceType || apiData.service_type || apiData.type || ServiceType.Water;

  const serviceType = Object.values(ServiceType).includes(rawServiceType)
    ? rawServiceType
    : ServiceType.Water;

  const severity = Object.values(Severity).includes(apiData.severity)
    ? apiData.severity
    : apiData.priority ?? Severity.Medium;

  return {
    id: apiData.id,
    source: apiData.source,
    area: apiData.affectedArea ?? apiData.location?.address ?? apiData.area ?? "Неизвестна зона",
    type: apiData.category === "emergency" ? "Аварийно спиране" : "Планирано спиране",
    category: apiData.category,
    description: apiData.description,
    start: apiData.startTime,
    end: apiData.endTime,
    timestamp: apiData.startTime,
    serviceType: serviceType as ServiceType,
    district: apiData.location?.district ?? apiData.district ?? "Неизвестен",
    severity: severity as Severity,
  };
}

export function filterOutages(
  outages: Outage[],
  user: User | null,
  filters: FilterState,
  subscription: Subscription | null
): { filtered: Outage[]; notifications: Outage[] } {
  const { selectedService, selectedCategory, selectedType, searchQuery, showOnlyUserDistrict } = filters;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = outages.filter((outage) => {
    if (
      user &&
      showOnlyUserDistrict &&
      outage.district.toLowerCase() !== user.district.toLowerCase()
    )
      return false;
    if (
      normalizedQuery &&
      !outage.area.toLowerCase().includes(normalizedQuery) &&
      !outage.description.toLowerCase().includes(normalizedQuery) &&
      !outage.district.toLowerCase().includes(normalizedQuery)
    )
      return false;
    if (selectedService !== "all" && outage.serviceType !== selectedService) return false;
    if (selectedCategory !== "all" && outage.category !== selectedCategory) return false;
    const isEmergency = outage.type.toLowerCase().includes("аварийно");
    if (selectedType === "emergency" && !isEmergency) return false;
    if (selectedType === "scheduled" && isEmergency) return false;
    return true;
  });

  const notifications =
    user && subscription?.active
      ? filtered.filter(
          (o) =>
            o.district.toLowerCase() === user.district.toLowerCase() &&
            o.severity === Severity.High
        )
      : [];

  return { filtered, notifications };
}

/**
 * Get service icon name based on service type
 */
export function getServiceIconName(serviceType: string): string {
  switch (serviceType) {
    case "water":
      return "droplets";
    case "electricity":
      return "zap";
    case "heating":
      return "thermometer";
    default:
      return "activity";
  }
}

/**
 * Get service name in Bulgarian
 */
export function getServiceName(serviceType: string): string {
  switch (serviceType) {
    case "water":
      return "Вода";
    case "electricity":
      return "Ток";
    case "heating":
      return "Топлофикация";
    default:
      return "Неизвестно";
  }
}

/**
 * Get color for service type
 */
export function getServiceColor(serviceType: string): string {
  switch (serviceType) {
    case "water":
      return "blue";
    case "electricity":
      return "yellow";
    case "heating":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Get severity name in Bulgarian
 */
export function getSeverityName(severity: string): string {
  switch (severity) {
    case "high":
      return "Висок";
    case "medium":
      return "Среден";
    case "low":
      return "Нисък";
    default:
      return "Неизвестен";
  }
}

/**
 * Get outage type name in Bulgarian
 */
export function getOutageTypeName(type: string): string {
  if (type.toLowerCase().includes("аварийно")) {
    return "Авария";
  } else if (type.toLowerCase().includes("планирано")) {
    return "Планирано";
  } else {
    return "В ход";
  }
}

/**
 * Get outage statistics by type and service
 */
export function getOutageStatistics(outages: Outage[]) {
  return {
    emergency: outages.filter((outage) =>
      outage.type?.toLowerCase().includes("аварийно")
    ).length,

    scheduled: outages.filter((outage) =>
      outage.type?.toLowerCase().includes("планирано")
    ).length,

    water: outages.filter((outage) => outage.serviceType === "water").length,
    electricity: outages.filter(
      (outage) => outage.serviceType === "electricity"
    ).length,
    heating: outages.filter((outage) => outage.serviceType === "heating")
      .length,
  };
}



/**
 * Get coordinates for an outage based on area text
 */
export function getOutageCoordinates(outage: Outage) {
  const area = outage.area.toLowerCase();
  const district = outage.district.toLowerCase();

  // Try to match district names
  for (const [districtName, coords] of Object.entries(sofiaDistricts)) {
    if (
      district.includes(districtName.toLowerCase()) ||
      area.includes(districtName.toLowerCase())
    ) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
        lng: coords.lng + (Math.random() - 0.5) * 0.01,
        district: districtName,
      };
    }
  }

  // Default to Sofia center if no match found
  return {
    lat: 42.6977 + (Math.random() - 0.5) * 0.02,
    lng: 23.3219 + (Math.random() - 0.5) * 0.02,
    district: "София",
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
}
