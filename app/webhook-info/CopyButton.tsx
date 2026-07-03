'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success('Copiado!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Erro ao copiar')
        }
    }

    return (
        <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-background text-foreground text-sm font-medium flex items-center gap-2 hover:bg-background/90 transition-all shrink-0"
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    Copiado!
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" />
                    {label}
                </>
            )}
        </button>
    )
}
