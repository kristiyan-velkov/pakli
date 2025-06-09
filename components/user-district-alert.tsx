"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAppStore } from "@/lib/store";

export function UserDistrictAlert() {
  const {
    user,
    outages,
    filteredOutages,
    filters,
    setShowOnlyUserDistrict,
    applyFilters,
  } = useAppStore();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 pb-4">
      <Alert className="border-blue-200 bg-blue-50">
        <Icon name="map-pin" className="h-4 w-4" />
        <AlertDescription className="text-blue-800 flex items-center justify-between">
          <span>
            <strong>Показване на данни за квартал {user.district}:</strong>
            {filters.showOnlyUserDistrict
              ? ` Виждате само аварии във вашия квартал (${filteredOutages.length} от ${outages.length})`
              : ` Виждате всички аварии в София (${outages.length})`}
          </span>
          <Button
            onClick={() => {
              setShowOnlyUserDistrict(!filters.showOnlyUserDistrict);
              applyFilters();
            }}
            size="sm"
            variant={filters.showOnlyUserDistrict ? "outline" : "default"}
            className="ml-4"
          >
            {filters.showOnlyUserDistrict
              ? "Покажи всички"
              : "Само моя квартал"}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
