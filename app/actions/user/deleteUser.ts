import { useAppStore } from "@/lib/store";
import { supabaseClient } from "@/lib/supabaseClient";

export async function deleteUser(id: string): Promise<void> {
    if (!id) throw new Error("User ID is required");

    const { error } = await supabaseClient
        .from("users")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);

    const currentUser = useAppStore.getState().user;
    if (currentUser?.id === id) {
        useAppStore.getState().setUser(null);
    }

    console.log(`User with id ${id} deleted`);
}