"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Lock, MapPinCheck } from "lucide-react";
import { cities, sofiaDistrictNames } from "@/constants/sofiaDistricts";
import { registerUserAction } from "@/app/actions/user/registerUserAction";
import { FormField } from "../ui/form-field";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  email: z.string().min(1, "Имейлът е задължителен").email("Невалиден имейл"),
  password: z.string().min(6, "Паролата трябва да е поне 6 символа"),
  city: z.string().min(1, "Въведете град"),
  district: z.string().min(1, "Изберете квартал"),
  address: z.string().min(1, "Въведете улица"),
});
type RegisterFormData = z.infer<typeof registerSchema>;

const defaultValues: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  city: "София",
  district: "",
  address: "",
};

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues,
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const user = await registerUserAction(data);
      if (user) {
        toast.success("Регистрацията е успешна!", {
          description: "Моля, проверете имейла си и валидирайте профила.",
        });

        reset({ ...defaultValues });
      } else {
        toast.error("Регистрацията неуспешна. Моля, опитайте отново.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("already taken")) {
        toast.error("Този имейл вече е регистриран. Моля, използвайте друг.");
      } else {
        toast.error(`Регистрацията неуспешна. Моля, опитайте отново.`);
      }
    } finally {
      setLoading(false);
      router.replace("/");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField id="name" label="Име" icon={User} error={errors.name}>
        <Input
          id="name"
          placeholder="Вашето име"
          {...register("name")}
          className={"pl-10 " + (errors.name ? "border-red-500" : "")}
        />
      </FormField>

      <FormField id="email" label="Имейл" icon={Mail} error={errors.email}>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          className={"pl-10 " + (errors.email ? "border-red-500" : "")}
        />
      </FormField>

      <FormField
        id="password"
        label="Парола"
        icon={Lock}
        error={errors.password}
      >
        <Input
          id="password"
          type="password"
          placeholder="парола минимум 6 символа"
          {...register("password")}
          className={"pl-10 " + (errors.password ? "border-red-500" : "")}
        />
      </FormField>

      <div className="space-y-2 hidden">
        <Label htmlFor="city" className="text-sm text-gray-600">
          Град
        </Label>
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <Select disabled value={field.value} onValueChange={field.onChange}>
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

      <FormField
        id="district"
        label="Квартал"
        icon={MapPinCheck}
        error={errors.district}
      >
        <Controller
          control={control}
          name="district"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className={`pl-10 ${
                  field.value ? "text-black" : "text-gray-400"
                } ${errors.district ? "border-red-500" : ""}`}
              >
                <SelectValue
                  placeholder="Изберете квартал"
                  className={field.value ? "text-black" : "text-gray-400"}
                />
              </SelectTrigger>
              <SelectContent>
                {sofiaDistrictNames.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField
        id="address"
        label="Улица"
        icon={MapPinCheck}
        error={errors.address}
      >
        <Input
          id="address"
          placeholder="Примерна 1"
          {...register("address")}
          className={"pl-10 " + (errors.address ? "border-red-500" : "")}
        />
      </FormField>

      <Button
        type="submit"
        disabled={loading || Object.keys(errors).length > 0}
        loading={loading}
        variant="default"
        className="w-full mt-10"
      >
        {loading ? "Регистриране..." : "Регистрирай се"}
        <Lock className="ml-2 h-4 w-4 inline-block" />
      </Button>
    </form>
  );
}
