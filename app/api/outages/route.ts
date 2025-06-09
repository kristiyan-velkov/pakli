import { NextResponse } from "next/server";

export interface WaterOutage {
  id: string;
  source: string;
  area: string;
  type: string;
  category: string;
  description: string;
  start: string;
  end: string;
  timestamp: string;
  serviceType: "water" | "electricity" | "heating";
  district: string;
  severity: "low" | "medium" | "high";
}

// Load data from JSON file
async function loadOutagesData() {
  try {
    // Import the JSON data directly
    const outagesData = await import("../../../data/water-outages.json");
    return outagesData.default;
  } catch (error) {
    console.error("Error loading JSON data:", error);
    return [];
  }
}

// Transform JSON data to API format
function transformJsonData(jsonData: any[]): WaterOutage[] {
  return jsonData.map((item) => {
    // Format dates
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return (
          date.toLocaleDateString("bg-BG", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " ч."
        );
      } catch {
        return dateString;
      }
    };

    return {
      id: item.id,
      source: item.source,
      area:
        item.affectedArea ||
        item.location?.address ||
        item.area ||
        "Неизвестна зона",
      type:
        item.category === "emergency"
          ? "Аварийно спиране"
          : "Планирано спиране",
      category: item.category,
      description: item.description,
      start: formatDate(item.startTime),
      end: formatDate(item.endTime),
      timestamp: item.startTime,
      serviceType: item.serviceType || item.type,
      district: item.location?.district || item.district || "Неизвестен",
      severity: item.severity || item.priority || "medium",
    };
  });
}

export async function GET(request: Request) {
  try {
    // Load data from JSON file
    const jsonData = await loadOutagesData();

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error("No data found in JSON file");
    }

    // Transform data to API format
    const transformedData = transformJsonData(jsonData);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const area = searchParams.get("area");
    const type = searchParams.get("type");

    let filteredData = [...transformedData];

    // Apply filters
    if (category && category !== "all") {
      filteredData = filteredData.filter(
        (outage) => outage.category === category
      );
    }

    if (area) {
      filteredData = filteredData.filter((outage) =>
        outage.area.toLowerCase().includes(area.toLowerCase())
      );
    }

    if (type && type !== "all") {
      if (type === "emergency") {
        filteredData = filteredData.filter(
          (outage) =>
            outage.type && outage.type.toLowerCase().includes("аварийно")
        );
      } else if (type === "scheduled") {
        filteredData = filteredData.filter(
          (outage) =>
            !outage.type || !outage.type.toLowerCase().includes("аварийно")
        );
      }
    }

    // Remove duplicates
    const uniqueOutages = filteredData.filter(
      (outage, index, self) =>
        index ===
        self.findIndex(
          (o) =>
            o.area === outage.area &&
            o.start === outage.start &&
            o.end === outage.end &&
            o.description === outage.description
        )
    );

    // Sort by timestamp
    uniqueOutages.sort((a, b) => {
      try {
        const timestampA = new Date(a.timestamp).getTime();
        const timestampB = new Date(b.timestamp).getTime();
        return timestampB - timestampA;
      } catch {
        return 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: uniqueOutages,
      total: uniqueOutages.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in outages API:", error);

    // Return fallback data on error
    const fallbackData: WaterOutage[] = [
      {
        id: "fallback-1",
        source: "Софийска вода",
        area: "кв. Център - тестова зона",
        type: "Аварийно спиране",
        category: "emergency",
        description: "Тестово аварийно прекъсване",
        start: "Днес, 10:00 ч.",
        end: "Днес, 16:00 ч.",
        timestamp: new Date().toISOString(),
        serviceType: "water",
        district: "Център",
        severity: "high",
      },
    ];

    return NextResponse.json({
      success: true,
      data: fallbackData,
      total: fallbackData.length,
      timestamp: new Date().toISOString(),
      warning:
        "Using fallback data due to error: " +
        (error instanceof Error ? error.message : "Unknown error"),
    });
  }
}
