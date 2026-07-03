import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null
    alt?: string
    name?: string | null
    email?: string | null
    size?: "xs" | "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
}

function getInitials(name?: string | null, email?: string | null) {
    const source = name || email || "?"
    return source
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

function getColorFromName(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 60%, 88%)`
}

export function Avatar({
    src,
    alt,
    name,
    className,
    size = "md",
    ...props
}: AvatarProps) {
    const initials = getInitials(name, alt)
    const bg = getColorFromName(initials)

    if (src) {
        return (
            <div
                className={cn(
                    "relative shrink-0 overflow-hidden rounded-full ring-1 ring-border/40",
                    sizeMap[size],
                    className
                )}
                {...props}
            >
                <img
                    src={src}
                    alt={alt || name || ""}
                    className="h-full w-full object-cover"
                />
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center rounded-full font-semibold text-foreground/70 ring-1 ring-border/40",
                sizeMap[size],
                className
            )}
            style={{ background: bg }}
            {...props}
        >
            {initials}
        </div>
    )
}
