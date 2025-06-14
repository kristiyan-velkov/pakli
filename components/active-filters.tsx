"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useAppStore } from "@/lib/store";
import { getServiceName } from "@/lib/utils/outage";

export function ActiveFilters() {
  const {
    filters,
    setSelectedService,
    setSelectedType,
    setSelectedCategory,
    applyFilters,
  } = useAppStore();

  if (
    filters.selectedService === "all" &&
    filters.selectedType === "all" &&
    filters.selectedCategory === "all"
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Активни филтри:</span>

      {filters.selectedService !== "all" && (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          {getServiceName(filters.selectedService)}
          <Icon
            name="x-circle"
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={() => {
              setSelectedService("all");
              applyFilters();
            }}
          />
        </Badge>
      )}

      {filters.selectedType !== "all" && (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
          {filters.selectedType === "emergency"
            ? "Аварийни"
            : filters.selectedType === "scheduled"
            ? "Планирани"
            : ""}
          <Icon
            name="x-circle"
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={() => {
              setSelectedType("all");
              applyFilters();
            }}
          />
        </Badge>
      )}

      {filters.selectedCategory !== "all" && (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          {filters.selectedCategory === "emergency"
            ? "Аварийни"
            : filters.selectedCategory === "maintenance"
            ? "Планирани"
            : ""}
          <Icon
            name="x-circle"
            className="h-3 w-3 ml-1 cursor-pointer"
            onClick={() => {
              setSelectedCategory("all");
              applyFilters();
            }}
          />
        </Badge>
      )}
    </div>
  );
}
