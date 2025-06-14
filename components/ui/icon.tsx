import React from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import dynamic from "next/dynamic";

interface IconProps extends React.ComponentProps<"svg"> {
  name: keyof typeof dynamicIconImports;
  fallback?: React.ReactNode;
  className?: string;
}

export const Icon = ({ name, fallback, className, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name], {
    loading: () =>
      React.isValidElement(fallback) ? (
        fallback
      ) : (
        <div className="w-6 h-6 bg-gray-100 rounded animate-pulse" />
      ),
  });

  return <LucideIcon className={className} {...props} />;
};
