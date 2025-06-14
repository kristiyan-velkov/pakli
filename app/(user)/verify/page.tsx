"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/supabaseClient";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useAppStore } from "@/lib/store";
import { getUserProfile } from "@/lib/getters/getUserProfile";

export default function VerifyPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [message, setMessage] = useState("Проверка...");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      setMessage("Невалиден линк за потвърждение на имейл адреса.");
      return;
    }

    supabaseClient.auth
      .setSession({ access_token, refresh_token })
      .then(async ({ error }) => {
        if (error) {
          setMessage("Верификацията на имейл адреса не бе успешна.");
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
          setMessage("Грешка при зареждане на потребителските данни.");
          return;
        }

        const displayName =
          user.user_metadata?.full_name || user.user_metadata?.name || "";

        // Update user in store with basic info first
        setUser({
          id: user.id,
          email: user.email ?? "",
          name: displayName,
          address: "",
          city: "",
          district: "",
          notifications: false,
          emailNotifications: false,
        });

        try {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setUser((current) => ({
              ...current!,
              name: profile.name || displayName,
              address: profile.address || "",
              city: profile.city || "",
              district: profile.district || "",
              notifications: profile.notifications ?? false,
              emailNotifications: profile.email_notifications ?? false,
            }));
          }
        } catch (e) {
          console.error("Failed to fetch full user profile", e);
        }

        setMessage("Валиден емайл адрес! Пренасочване...");
        setTimeout(() => router.push("/"), 2000);
      });
  }, [router, setUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-purple-700 via-pink-600 to-orange-500 px-6 py-16">
        <div className="w-full max-w-3xl rounded-3xl bg-white p-12 shadow-2xl backdrop-blur-lg text-black space-y-8">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight max-w-lg">
            Потвърждение на имейл адреса!
          </h1>
          <p>{message}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
