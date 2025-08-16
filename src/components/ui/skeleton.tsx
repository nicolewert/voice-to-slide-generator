import { cn } from "@/lib/utils"
import React from "react"

type SkeletonVariant = "default" | "card" | "text" | "circle"
type SkeletonSize = "sm" | "md" | "lg" | "xl"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  size?: SkeletonSize
}

function Skeleton({
  className,
  variant = "default",
  size = "md",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    default: "rounded-md",
    card: "rounded-xl shadow-md",
    text: "rounded-sm",
    circle: "rounded-full"
  }

  const sizeStyles = {
    sm: "h-4 w-16",
    md: "h-8 w-32",
    lg: "h-12 w-48",
    xl: "h-16 w-64"
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10",
        "dark:from-primary/20 dark:via-primary/30 dark:to-primary/20",
        "transition-all duration-500 ease-in-out",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      aria-hidden="true"
      role="presentation"
      {...props}
    />
  )
}

export { Skeleton }
