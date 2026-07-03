import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: React.ReactNode
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center py-12 px-6",
                className
            )}
            {...props}
        >
            {icon && (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/60 text-muted-foreground">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground max-w-sm text-balance">
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    )
}
