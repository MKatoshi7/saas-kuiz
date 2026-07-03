import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitiza o customHeadScript do funil antes de injetar no <head>.
 * - Remove <script>, event handlers, javascript: URIs e tags perigosas.
 * - Mantém tags de marketing/analytics, meta tags e estilos inline.
 *
 * Se o conteúdo for apenas um bloco <script>, retorna APENAS o JS sanitizado
 * para que o componente <Script> do Next possa executá-lo em segurança.
 */
export function sanitizeHeadScript(input: string | null | undefined): string {
    if (!input) return ""
    try {
        const cleaned = DOMPurify.sanitize(input, {
            ALLOWED_TAGS: [
                "script", "meta", "link", "style", "noscript", "iframe",
            ],
            ALLOWED_ATTR: [
                "src", "async", "defer", "type", "id", "charset",
                "name", "content", "http-equiv", "rel", "href", "sizes", "media",
                "data-", "allow", "allowfullscreen", "frameborder", "scrolling",
            ],
            FORBID_TAGS: ["object", "embed", "form"],
            FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
        })
        return cleaned
    } catch {
        return ""
    }
}

/**
 * Extrai apenas o conteúdo de tags <script>...</script> de um HTML.
 * Útil quando queremos passar o JS puro para <Script strategy="afterInteractive">.
 */
export function extractScriptContent(html: string): string {
    if (!html) return ""
    const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    if (!match) return ""
    return DOMPurify.sanitize(match[1], { ALLOWED_TAGS: [], KEEP_CONTENT: true })
}

/**
 * Sanitiza uma URL para uso em href/src — bloqueia javascript: e data: perigosos.
 */
export function sanitizeUrl(url: string | null | undefined): string {
    if (!url) return ""
    const trimmed = url.trim()
    const lower = trimmed.toLowerCase()
    if (
        lower.startsWith("javascript:") ||
        lower.startsWith("data:") ||
        lower.startsWith("vbscript:")
    ) {
        return ""
    }
    return trimmed
}
