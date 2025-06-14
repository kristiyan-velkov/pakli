import { Outage } from "../store/store.ts2";

export async function getOutages(): Promise<Outage[]> {
    try {
        const response = await fetch("/api/outages");

        if (!response.ok) {
            throw new Error(`Failed to fetch outages: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error("Invalid API response format");
        }

        return result.data as Outage[];
    } catch (error) {
        console.error("[getOutages] Failed:", error);
        return [];
    }
}
