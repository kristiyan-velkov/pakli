export interface Outage {
  id: string;
  source: string;
  area: string;
  type: "Аварийно спиране" | "Планирано спиране";
  category: "emergency" | "scheduled";
  description: string;
  start: string;
  end: string;
  timestamp: string;
  serviceType: "water" | "electricity" | "heating";
  district: string;
  severity: "low" | "medium" | "high";
  active: boolean;
}
