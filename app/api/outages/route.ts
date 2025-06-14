import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const area = searchParams.get("area");
  const type = searchParams.get("type");
  const service = searchParams.get("serviceType");

  let query = supabaseClient
    .from("outages")
    .select("*")
    .eq("active", true)
    .order("timestamp", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (service && service !== "all") {
    query = query.eq("serviceType", service);
  }

  if (type && type !== "all") {
    const typePattern = type === "emergency" ? "%аварийно%" : "%планирано%";
    query = query.ilike("type", typePattern);
  }

  if (area && area.trim() !== "") {
    query = query.ilike("area", `%${area}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return NextResponse.json({
      success: false,
      data: [],
      total: 0,
      message: error.message,
    });
  }

  return NextResponse.json({
    success: true,
    data,
    total: data.length,
    timestamp: new Date().toISOString(),
  });
}
