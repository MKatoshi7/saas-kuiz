import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "flex min-h-[80px] w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                "focus-visible:outline-none focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10",
                "hover:border-foreground/20",
                className
            )}
            {...props}
        />
    )
}

export { Textarea }
