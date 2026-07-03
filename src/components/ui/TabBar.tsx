import Link from 'next/link'
import { type ComponentType } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
    value: string
    label: string
    count?: number
    icon?: ComponentType<{ className?: string }>
    href?: string
}

interface TabBarProps {
    tabs: TabItem[]
    activeTab: string
    paramName?: string
    basePath?: string
}

/**
 * Server-side tab bar (URL-driven).
 * Mantém o estado via query string — preservável por URL, melhor UX.
 */
export function TabBar({ tabs, activeTab, paramName = 'tab', basePath }: TabBarProps) {
    return (
        <div className="inline-flex h-10 items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.value
                const href = basePath
                    ? `${basePath}?${paramName}=${tab.value}`
                    : (tab.href || `?${paramName}=${tab.value}`)

                return (
                    <Link
                        key={tab.value}
                        href={href}
                        className={cn(
                            'inline-flex items-center gap-2 h-8 px-4 rounded-full text-xs font-medium transition-all',
                            isActive
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                                isActive ? 'bg-secondary' : 'bg-background/60'
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </Link>
                )
            })}
        </div>
    )
}
