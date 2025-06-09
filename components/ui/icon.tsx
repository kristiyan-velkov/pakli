import type React from "react"
import type { LightbulbIcon as LucideProps } from "lucide-react"
import dynamicIconImports from "lucide-react/dynamicIconImports"
import dynamic from "next/dynamic"

interface IconProps extends LucideProps {
  name: keyof typeof dynamicIconImports
  fallback?: React.ReactNode
}

/**
 * Dynamic icon component that loads Lucide icons on demand
 */
export const Icon = ({ name, fallback, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name], {
    loading: () => fallback || <div className="w-6 h-6 bg-gray-100 rounded animate-pulse" />,
  })

  return <LucideIcon {...props} />
}
