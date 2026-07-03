import * as React from "react"
import { cn } from "@/lib/utils"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: number
        label?: string
    }
    iconClassName?: string
    variant?: "default" | "primary" | "dark"
}

const variantStyles = {
    default: {
        card: "bg-card border-border/60",
        icon: "bg-foreground/5 text-foreground",
        label: "text-muted-foreground",
    },
    primary: {
        card: "bg-[#007AFF]/5 border-[#007AFF]/20",
        icon: "bg-[#007AFF]/10 text-[#007AFF]",
        label: "text-[#007AFF]/80",
    },
    dark: {
        card: "bg-foreground text-background border-foreground",
        icon: "bg-background/10 text-background",
        label: "text-background/70",
    },
} as const

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    iconClassName,
    variant = "default",
    className,
    ...props
}: StatCardProps) {
    const styles = variantStyles[variant]
    const trendIsPositive = trend && trend.value >= 0
    const isDark = variant === "dark"

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border p-6 transition-all duration-200",
                "hover:shadow-pop hover:-translate-y-0.5",
                styles.card,
                className
            )}
            {...props}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                        styles.icon,
                        iconClassName
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
                {trend && (
                    <div
                        className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            trendIsPositive
                                ? isDark
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-emerald-50 text-emerald-700"
                                : isDark
                                ? "bg-red-500/20 text-red-300"
                                : "bg-red-50 text-red-700"
                        )}
                    >
                        {trendIsPositive ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(trend.value).toFixed(1)}%
                    </div>
                )}
            </div>
            <div>
                <p className={cn("text-sm font-medium mb-1", styles.label)}>{label}</p>
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                {trend?.label && (
                    <p className={cn("text-xs mt-1", styles.label)}>{trend.label}</p>
                )}
            </div>
        </div>
    )
}
