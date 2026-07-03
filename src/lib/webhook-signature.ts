import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Valida assinatura HMAC SHA-256 de um webhook.
 *
 * Formato do header `x-webhook-signature`: `sha256=<hex_digest>`
 * (padrão GitHub/Stripe)
 *
 * Retorna `true` se a assinatura bater, `false` caso contrário.
 *
 * Se `secret` for vazio/nulo, a verificação passa (modo dev).
 */
export function verifyHmacSignature(
    rawBody: string,
    signatureHeader: string | null,
    secret: string | null | undefined
): boolean {
    if (!secret) {
        // Modo dev: sem secret = sem validação (mas logamos warning)
        return true
    }
    if (!signatureHeader) return false

    const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')

    // Comparação timing-safe
    try {
        const a = Buffer.from(signatureHeader)
        const b = Buffer.from(expected)
        if (a.length !== b.length) return false
        return timingSafeEqual(a, b)
    } catch {
        return false
    }
}

/**
 * Helper para gerar uma assinatura de teste (útil em testes locais).
 */
export function signWebhook(rawBody: string, secret: string): string {
    return 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')
}
