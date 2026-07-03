import React from 'react'
import { ShieldOff, AlertTriangle, Sparkles } from 'lucide-react'

interface FunnelBlockedScreenProps {
    variant: 'warning' | 'danger'
    title: string
    message: string
    reason?: string
    footer?: string
}

export function FunnelBlockedScreen({ variant, title, message, reason, footer }: FunnelBlockedScreenProps) {
    const isDanger = variant === 'danger'
    const Icon = isDanger ? ShieldOff : AlertTriangle

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F5F5F7] via-white to-[#F5F5F7] p-4 sm:p-6 font-sans antialiased">
            <div className="max-w-md w-full relative">
                {/* Glow background */}
                <div className={cn(
                    'absolute -inset-4 rounded-3xl blur-2xl opacity-30 -z-10',
                    isDanger ? 'bg-red-500/20' : 'bg-amber-500/20'
                )} />

                <div className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-border/60">
                    <div className={cn(
                        'mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg',
                        isDanger ? 'bg-red-100 text-red-600 shadow-red-500/10' : 'bg-amber-100 text-amber-600 shadow-amber-500/10'
                    )}>
                        <Icon className="w-8 h-8" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                        {title}
                    </h1>
                    <p className="mt-3 text-muted-foreground text-balance">
                        {message}
                    </p>

                    {reason && (
                        <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200/60 text-left">
                            <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-1.5">
                                Motivo
                            </p>
                            <p className="text-sm text-red-900 font-medium leading-relaxed">
                                {reason}
                            </p>
                        </div>
                    )}

                    {footer && (
                        <div className="mt-6 pt-6 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Re-importing cn to keep this component standalone
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
