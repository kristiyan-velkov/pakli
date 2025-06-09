"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  color,
  onClick,
  isActive = false,
}: StatsCardProps) {
  const borderColor = `border-l-4 border-${color}-500`;
  const ringColor = isActive ? `ring-2 ring-${color}-500` : "";
  const bgColor = `bg-${color}-100`;

  return (
    <Card
      className={cn(
        "bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        borderColor,
        ringColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-full", bgColor)}>
            <Icon name={icon} className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
