import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-foreground text-background",
                primary: "bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20",
                secondary: "bg-secondary text-secondary-foreground",
                success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
                warning: "bg-amber-50 text-amber-700 border border-amber-200/60",
                destructive: "bg-red-50 text-red-700 border border-red-200/60",
                info: "bg-blue-50 text-blue-700 border border-blue-200/60",
                outline: "border border-border text-foreground",
                ghost: "text-muted-foreground",
            },
            size: {
                default: "text-xs",
                sm: "text-[10px] px-2 py-0",
                lg: "text-sm px-3 py-1",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
    dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
    const dotColor = {
        default: "bg-foreground",
        primary: "bg-[#007AFF]",
        secondary: "bg-foreground/60",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        destructive: "bg-red-500",
        info: "bg-blue-500",
        outline: "bg-foreground/60",
        ghost: "bg-muted-foreground",
    } as const

    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {dot && (
                <span
                    className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        dotColor[variant || "default"]
                    )}
                />
            )}
            {children}
        </div>
    )
}

export { Badge, badgeVariants }
