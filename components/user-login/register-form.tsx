"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Lock } from "lucide-react";
import { cities, sofiaDistrictNames } from "@/constants/sofiaDistricts";
import { registerUser } from "@/app/actions/user/registerUser";

const registerSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  email: z.string().min(1, "Имейлът е задължителен").email("Невалиден имейл"),
  password: z.string().min(6, "Паролата трябва да е поне 6 символа"),
  district: z.string().min(1, "Изберете квартал"),
  city: z.string().optional(),
  address: z.string().min(1, "Въведете улица"),
});

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      city: "София",
      district: "",
      address: "",
    },
  });

  const onSubmit = async (data: any) => {
    setMessage(null);
    setLoading(true);
    try {
      const user = await registerUser(data);

      if (user) {
        setMessage(
          "Регистрацията е успешна! Моля, проверете имейла си и валидирайте профила."
        );
        reset({ password: "", email: data.email });
        onSwitchToLogin();
      } else {
        setMessage("Регистрацията неуспешна. Моля, опитайте отново.");
      }
    } catch (error) {
      setMessage(
        `Грешка: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div className="mb-4 rounded-lg border border-green-600 bg-green-50 px-4 py-3 text-green-900 shadow-md">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Име</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="name"
              placeholder="Вашето име"
              {...register("name")}
              className={"pl-10 " + (errors.name ? "border-red-500" : "")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Имейл</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              className={"pl-10 " + (errors.email ? "border-red-500" : "")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Парола</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              type="password"
              placeholder="парола минимум 6 символа"
              {...register("password")}
              className={"pl-10 " + (errors.password ? "border-red-500" : "")}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2 hidden">
          <Label htmlFor="city">Град</Label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <Select
                disabled
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете град" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">Квартал</Label>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  className={errors.district ? "border-red-500" : ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Изберете квартал" />
                  </SelectTrigger>
                  <SelectContent>
                    {sofiaDistrictNames.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <p className="text-sm text-red-600">
                    {errors.district.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Улица</Label>
          <Input
            id="address"
            placeholder="ул. Примерна 1"
            {...register("address")}
            className="pl-5"
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full mt-5">
          {loading ? "Регистриране..." : "Регистрирай се"}
        </Button>
      </form>
    </>
  );
}
