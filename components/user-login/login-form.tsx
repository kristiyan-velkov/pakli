"use client";

import { useState } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAppStore } from "@/lib/store";
import { loginUserAction } from "@/app/actions/user/loginUserAction";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().min(1, "Имейлът е задължителен").email("Невалиден имейл"),
  password: z.string().min(1, "Паролата е задължителна"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const setUser = useAppStore((state) => state.setUser);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setMessage(null);
    setLoading(true);

    try {
      const user = await loginUserAction({
        email: data.email,
        password: data.password,
      });

      if (!user) {
        setMessage("Грешка: Потребителят не е намерен.");
        setLoading(false);
        return;
      }

      setMessage("Успешен вход!");
      setUser(user);
      router.replace("/");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.toLowerCase().includes("invalid login credentials")) {
        setMessage("Невалиден емейл или парола.");
      } else {
        setMessage("Грешка при влизане. Опитайте отново.");
        console.error("Login error:", errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 shadow-md ${
            /грешка|неуспешна|невалиден/i.test(message)
              ? "border border-destructive bg-destructive/10 text-destructive"
              : "border border-green-600 bg-green-50 text-green-900"
          }`}
          role="alert"
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="space-y-1">
          <LabelPrimitive.Root
            htmlFor="email"
            className="block font-semibold text-sm text-gray-800"
          >
            Имейл
          </LabelPrimitive.Root>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="email"
              type="email"
              placeholder="Въведи имейл"
              className={
                errors.email ? "border-destructive focus:ring-destructive" : ""
              }
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p
              id="email-error"
              className="text-sm text-destructive mt-1"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <LabelPrimitive.Root
            htmlFor="password"
            className="block font-semibold text-sm text-gray-600"
          >
            Парола
          </LabelPrimitive.Root>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="password"
              type="password"
              placeholder="Въведи парола"
              className={
                errors.password
                  ? "border-destructive focus:ring-destructive"
                  : ""
              }
              {...register("password")}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              autoComplete="current-password"
            />
          </div>
          {errors.password && (
            <p
              id="password-error"
              className="text-sm text-destructive mt-1"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || !!errors?.email || !!errors?.password}
          loading={loading}
          variant="default"
          className="w-full flex justify-center items-center gap-2"
        >
          {loading ? "Влизане..." : "Влез"}
          <Lock className="h-4 w-4" />
        </Button>
      </form>
    </>
  );
}
