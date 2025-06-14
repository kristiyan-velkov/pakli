import { User } from "../store/store.ts2";
import { supabaseClient } from "../supabase/supabaseClient";

 export const getUserProfile = async (userId: string): Promise<Partial<User> | undefined> => {
    try {
      const { data, error } = await supabaseClient
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) throw error || new Error("User profile not found");

      return data;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      return undefined;
    }
  };
