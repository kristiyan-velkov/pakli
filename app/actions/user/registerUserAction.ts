"use server";

import { User } from "@/lib/store";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { supabaseClient } from "@/lib/supabaseClient";

export async function registerUserAction(user: User): Promise<Partial<User>> {
    if (!user.email || !user.password) {
        throw new Error("Email and password are required for registration");
    }

    const { data: authUser, error: signUpError } = await supabaseClient.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
            data: {
                full_name: user.name
            }
        }
    });

    if (signUpError) throw new Error(signUpError.message);
    if (!authUser.user) throw new Error("User registration failed: user object is null.");

    const { data: userProfileData, error: userProfileError } = await supabaseAdminClient
        .from("user_profile")
        .insert({
            id: authUser.user.id,
            address: user.address || "",
            district: user.district || "",
            notifications: user.notifications || false,
            city: user.city ?? "",
            email_notifications: user.emailNotifications || false,
        })
        .select("*")
        .single();

    if (userProfileError) {
        if (userProfileError.message.includes("duplicate key value") && userProfileError.message.includes("users_pkey")) {
            throw new Error("This email is already taken.");
        }
        throw new Error(userProfileError.message);
    }

    if (!userProfileData) throw new Error("User profile creation failed: userProfileData is null.");

    return userProfileData as Partial<User>;
}
