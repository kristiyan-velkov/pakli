"use server";

import { getUserProfile } from "@/lib/getters/getUserProfile";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUserAction({
  email,
  password,
}: LoginInput): Promise<Partial<User> | undefined> {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("User not found after login.");

  try {
    const profileData = await getUserProfile(data.user.id);

    return {
      id: data.user.id,
      email: data.user.email ?? "",
      name: data.user.user_metadata?.full_name ?? "",
      address: profileData?.address ?? "",
      city: profileData?.city ?? "",
      district: profileData?.district ?? "",
      notifications: profileData?.notifications ?? false,
      emailNotifications: profileData?.emailNotifications ?? false,
    };
  } catch {
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      name: data.user.user_metadata?.full_name ?? "",
    };
  }
}
