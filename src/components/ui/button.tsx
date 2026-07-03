import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
    {
        variants: {
            variant: {
                default:
                    "bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md",
                primary:
                    "bg-[#007AFF] text-white hover:bg-[#0066D6] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30",
                destructive:
                    "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
                outline:
                    "border border-border bg-background hover:bg-secondary hover:border-foreground/20 shadow-xs",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost:
                    "hover:bg-secondary text-foreground/80 hover:text-foreground",
                link:
                    "text-[#007AFF] underline-offset-4 hover:underline",
                glass:
                    "glass border border-border/50 hover:bg-background/90 backdrop-blur-xl",
            },
            size: {
                default: "h-10 px-4 py-2 text-sm",
                sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
                lg: "h-12 px-6 text-base rounded-2xl",
                xl: "h-14 px-8 text-base rounded-2xl",
                icon: "size-10 rounded-xl",
                "icon-sm": "size-8 rounded-lg",
                "icon-lg": "size-12 rounded-2xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ComponentProps<"button">,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="size-4 animate-spin" />
            ) : (
                leftIcon
            )}
            {children}
            {!loading && rightIcon}
        </Comp>
    )
}

export { Button, buttonVariants }
