import { NextResponse } from "next/server";

export interface WaterOutage {
  source: string;
  area: string;
  type: string;
  category: string;
  description: string;
  start: string;
  end: string;
  timestamp: string;
}

// Fallback data in case of JSON file issues
const fallbackData: WaterOutage[] = [
  {
    source: "Софийска вода",
    area: "кв. Център - тестова зона",
    type: "Аварийно спиране",
    category: "sanitaryBackup",
    description: "Тестово аварийно прекъсване",
    start: "Днес, 10:00 ч.",
    end: "Днес, 16:00 ч.",
    timestamp: new Date().toISOString(),
  },
  {
    source: "Софийска вода",
    area: "кв. Лозенец - тестова зона",
    type: "",
    category: "capitalProjects",
    description: "Тестово планирано прекъсване",
    start: "Утре, 09:00 ч.",
    end: "Утре, 18:00 ч.",
    timestamp: new Date().toISOString(),
  },
  {
    source: "Софийска вода",
    area: "Зона на спиране: кв. Васил Левски - ул. Летоструй от ул. Бесарабия до ул. Рилска обител и ул. 547",
    type: "Аварийно спиране",
    category: "sanitaryBackup",
    description: "Ремонт на уличен водопровод",
    start: "6 Юни 2025, 09:00 ч.",
    end: "6 Юни 2025, 18:00 ч.",
    timestamp: "2025-06-06T19:16:52.480528",
  },
  {
    source: "Софийска вода",
    area: "Зона на спиране: кв. Младост 4",
    type: "Аварийно спиране",
    category: "sanitaryBackup",
    description: "Ремонт на уличен водопровод",
    start: "6 Юни 2025, 09:00 ч.",
    end: "6 Юни 2025, 18:00 ч.",
    timestamp: "2025-06-06T19:16:52.480528",
  },
];

export async function GET(request: Request) {
  try {
    let data: WaterOutage[] = [];

    // Try to load the JSON file with multiple fallback strategies
    try {
      // Method 1: Try dynamic import
      const outagesModule = await import("../../../data/water-outages.json");
      data = outagesModule.default as WaterOutage[];
    } catch (importError) {
      console.warn("Failed to import JSON file:", importError);

      try {
        // Method 2: Try reading as text and parsing
        const fs = await import("fs");
        const path = await import("path");
        const filePath = path.join(process.cwd(), "data", "water-outages.json");
        const fileContent = fs.readFileSync(filePath, "utf8");
        data = JSON.parse(fileContent) as WaterOutage[];
      } catch (fsError) {
        console.warn("Failed to read file with fs:", fsError);
        // Use fallback data
        data = fallbackData;
      }
    }

    // Validate and clean the data
    const validatedData = data
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        source: String(item.source || "Неизвестен източник"),
        area: String(item.area || "Неизвестна зона"),
        type: String(item.type || ""),
        category: String(item.category || "unknown"),
        description: String(item.description || ""),
        start: String(item.start || ""),
        end: String(item.end || ""),
        timestamp: String(item.timestamp || new Date().toISOString()),
      }));

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const area = searchParams.get("area");
    const type = searchParams.get("type");

    let filteredData = [...validatedData];

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
      source: data === fallbackData ? "fallback" : "file",
    });
  } catch (error) {
    console.error("Error in outages API:", error);

    // Return fallback data even in case of complete failure
    return NextResponse.json({
      success: true,
      data: fallbackData,
      total: fallbackData.length,
      timestamp: new Date().toISOString(),
      source: "fallback",
      warning:
        "Using fallback data due to error: " +
        (error instanceof Error ? error.message : "Unknown error"),
    });
  }
}
