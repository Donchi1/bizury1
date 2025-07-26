"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  variant?: "spinner" | "dots" | "pulse" | "bars" | "ripple"
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  fullScreen?: boolean
}

export function Loading({
  variant = "spinner",
  size = "md",
  text,
  className,
  fullScreen = false
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  }

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className={cn("text-muted-foreground animate-pulse", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderDots = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary rounded-full animate-bounce",
              size === "sm" && "w-1.5 h-1.5",
              size === "md" && "w-2 h-2",
              size === "lg" && "w-2.5 h-2.5",
              size === "xl" && "w-3 h-3"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.6s"
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn("text-muted-foreground", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderPulse = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={cn(
          "bg-primary rounded-full animate-pulse",
          size === "sm" && "w-8 h-8",
          size === "md" && "w-12 h-12",
          size === "lg" && "w-16 h-16",
          size === "xl" && "w-24 h-24"
        )}
      />
      {text && (
        <p className={cn("text-muted-foreground", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderBars = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary rounded-sm animate-pulse",
              size === "sm" && "w-1 h-3",
              size === "md" && "w-1.5 h-4",
              size === "lg" && "w-2 h-6",
              size === "xl" && "w-3 h-8"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.8s"
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn("text-muted-foreground", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderRipple = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div
          className={cn(
            "absolute border-2 border-primary rounded-full animate-ping",
            size === "sm" && "w-8 h-8",
            size === "md" && "w-12 h-12",
            size === "lg" && "w-16 h-16",
            size === "xl" && "w-24 h-24"
          )}
          style={{ animationDuration: "1s" }}
        />
        <div
          className={cn(
            "absolute border-2 border-primary rounded-full animate-ping",
            size === "sm" && "w-8 h-8",
            size === "md" && "w-12 h-12",
            size === "lg" && "w-16 h-16",
            size === "xl" && "w-24 h-24"
          )}
          style={{ animationDelay: "0.3s", animationDuration: "1s" }}
        />
        <div
          className={cn(
            "bg-primary rounded-full",
            size === "sm" && "w-8 h-8",
            size === "md" && "w-12 h-12",
            size === "lg" && "w-16 h-16",
            size === "xl" && "w-24 h-24"
          )}
        />
      </div>
      {text && (
        <p className={cn("text-muted-foreground", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderContent = () => {
    switch (variant) {
      case "dots":
        return renderDots()
      case "pulse":
        return renderPulse()
      case "bars":
        return renderBars()
      case "ripple":
        return renderRipple()
      default:
        return renderSpinner()
    }
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className={cn("p-8 rounded-lg bg-card shadow-lg border", className)}>
          {renderContent()}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {renderContent()}
    </div>
  )
}

// Specific loading components for common use cases
export function PageLoading({ text = "Loading page..." }: { text?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loading variant="spinner" size="lg" text={text} />
    </div>
  )
}

export function CardLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="p-8 flex items-center justify-center">
      <Loading variant="dots" size="md" text={text} />
    </div>
  )
}

export function ButtonLoading({ text = "Loading...", className }: { text?: string, className?: string }) {
  return (
    <div className={cn(`${className} `, "flex items-center space-x-2")}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
            <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 60 + 40}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-muted rounded", className)} />
  )
}

// Loading overlay for forms and modals
export function LoadingOverlay({
  isLoading,
  children,
  text = "Processing..."
}: {
  isLoading: boolean
  children: React.ReactNode
  text?: string
}) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <Loading variant="spinner" size="md" text={text} />
      </div>
    </div>
  )
} 