'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
    const ctx = React.useContext(TabsContext)
    if (!ctx) throw new Error("Tabs components must be used within <Tabs>")
    return ctx
}

interface TabsProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    className?: string
    children: React.ReactNode
}

function Tabs({ value, defaultValue, onValueChange, className, children }: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const isControlled = value !== undefined
    const current = isControlled ? value : internalValue

    const handleChange = React.useCallback(
        (newValue: string) => {
            if (!isControlled) setInternalValue(newValue)
            onValueChange?.(newValue)
        },
        [isControlled, onValueChange]
    )

    return (
        <TabsContext.Provider value={{ value: current, onValueChange: handleChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        role="tablist"
        className={cn(
            "inline-flex h-10 items-center justify-center gap-1 rounded-full border border-border/60 bg-secondary/50 p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ value, className, children, ...props }, ref) => {
        const { value: active, onValueChange } = useTabs()
        const isActive = active === value
        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onValueChange(value)}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ value, className, children, ...props }, ref) => {
        const { value: active } = useTabs()
        if (active !== value) return null
        return (
            <div
                ref={ref}
                role="tabpanel"
                className={cn("mt-4 animate-fade-in-up", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
