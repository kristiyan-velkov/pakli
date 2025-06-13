"use server";

import { supabaseClient } from "@/lib/supabaseClient";

export async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw new Error(error.message);
  return { success: true, message: "Successfully logged out" };
}
