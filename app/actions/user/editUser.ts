"use server";

import { useAppStore, User } from "@/lib/store";
import { supabaseClient } from "@/lib/supabaseClient";

export async function editUser(user: Partial<User> & { id: string }): Promise<Partial<User>> {
    if (!user.id) throw new Error("User ID is required");

    const toSnakeCase = (str: string) =>
        str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

    const updateData = Object.entries(user).reduce<Record<string, any>>((acc, [key, value]) => {
        if (key === "id" || value === undefined) return acc;
        const dbKey = key === "emailNotifications" ? "email_notifications" : toSnakeCase(key);
        acc[dbKey] = value;
        return acc;
    }, {});

    if (Object.keys(updateData).length === 0) throw new Error("No fields to update");

    const { error, data } = await supabaseClient
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    useAppStore.getState().setUser(data as User);

    return data as Partial<User>;
}
