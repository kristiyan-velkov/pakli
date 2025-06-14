import React, { ReactNode, ElementType, FC } from "react";
import { FieldError } from "react-hook-form";
import { Label } from "./label";

interface FormFieldProps {
  id: string;
  label: string;
  icon?: ElementType;
  error?: FieldError;
  children: ReactNode;
}

export const FormField: FC<FormFieldProps> = ({
  id,
  label,
  icon: Icon,
  error,
  children,
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm text-gray-600">
      {label}
    </Label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      )}
      {children}
    </div>
    {error?.message && typeof error.message === "string" && (
      <p className="text-sm text-red-600">{error.message}</p>
    )}
  </div>
);
