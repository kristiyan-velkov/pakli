"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { Outage } from "@/lib/store";
import {
  getOutageTypeName,
  getServiceColor,
  getServiceIconName,
  getServiceName,
} from "@/lib/utils";

interface OutageCardProps {
  outage: Outage;
  onClick: (outage: Outage) => void;
  onMapIconClick: (outage: Outage) => void;
  selected?: boolean;
}

export function OutageCard({
  outage,
  onClick,
  onMapIconClick,
  selected,
}: OutageCardProps) {
  const isEmergency = outage.type.toLowerCase().includes("аварийно");
  const serviceColor = getServiceColor(outage.serviceType);
  const serviceIcon = getServiceIconName(outage.serviceType);
  const bgColor = isEmergency
    ? "bg-red-50 border-red-200"
    : "bg-orange-50 border-orange-200";
  const ringColor = selected ? `ring-2 ring-${serviceColor}-500` : "";

  return (
    <Card
      className={`${bgColor} ${ringColor} border cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onClick(outage)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Service Icon */}
            <div className="flex items-center space-x-2">
              <Icon
                name={serviceIcon}
                className={`h-5 w-5 text-${serviceColor}-600`}
              />
              <Icon
                name={isEmergency ? "x-circle" : "alert-triangle"}
                className={`h-4 w-4 text-${isEmergency ? "red" : "orange"}-600`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`font-semibold ${
                    isEmergency ? "text-red-700" : "text-orange-700"
                  }`}
                >
                  {getOutageTypeName(outage.type)} -{" "}
                  {getServiceName(outage.serviceType)}
                </span>
                {outage.severity === "high" && (
                  <Badge className="bg-red-600 text-white">
                    Висок приоритет
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {outage.area}
              </h3>
              {outage.description && (
                <p className="text-gray-700 text-sm mb-2">
                  {outage.description}
                </p>
              )}
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                <Icon name="clock" className="h-4 w-4" />
                <span>
                  {outage.start} - {outage.end}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Източник: {outage.source} | Квартал: {outage.district}
              </p>
            </div>
          </div>

          {/* Map Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMapIconClick(outage);
            }}
            className="rounded-full bg-white/50 hover:bg-white/70 transition-colors cursor-pointer"
          >
            <Icon name="map-pin" className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
