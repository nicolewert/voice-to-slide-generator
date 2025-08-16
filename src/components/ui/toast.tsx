import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = ToastPrimitives.Viewport

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full max-w-[420px] items-center justify-between space-x-4 overflow-hidden rounded-2xl bg-white p-4 pr-8 shadow-luxurySaaS transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border border-gray-200",
        success: "bg-success/10 border border-success text-success",
        error: "bg-red-50 border border-red-200 text-red-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const ToastRoot = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & 
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
ToastRoot.displayName = "ToastRoot"

const ToastAction = ToastPrimitives.Action
const ToastClose = ToastPrimitives.Close

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-foreground", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

// Simplified Toast API
const toast = {
  success: (title: string, options?: { description?: string; duration?: number; position?: string }) => {
    // In a real implementation, this would use a toast management library
    console.log("Success Toast:", title, options)
  },
  error: (title: string, options?: { description?: string; duration?: number; position?: string }) => {
    // In a real implementation, this would use a toast management library
    console.log("Error Toast:", title, options)
  }
}

export {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  toast
}