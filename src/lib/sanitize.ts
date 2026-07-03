/**
 * Sanitização de HTML sem dependência de jsdom/DOMPurify no server-side.
 * Usa regex para remover tags perigosas — suficiente para head scripts e textos de alert.
 */

const FORBID_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'];
const FORBID_ATTRS = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onsubmit', 'onchange'];

/**
 * Remove tags perigosas e atributos de evento de um HTML.
 * Não é um sanitizer completo — é para uso controlado interno.
 */
function stripDangerous(html: string): string {
    let result = html;

    // Remove tags perigosas (e conteúdo interno)
    for (const tag of FORBID_TAGS) {
        const regex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
        result = result.replace(regex, '');
        // Self-closing
        const selfClose = new RegExp(`<${tag}\\b[^>]*/>`, 'gi');
        result = result.replace(selfClose, '');
    }

    // Remove atributos de evento
    for (const attr of FORBID_ATTRS) {
        const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
        result = result.replace(regex, '');
        const regex2 = new RegExp(`\\s${attr}\\s*=\\s*\\S+`, 'gi');
        result = result.replace(regex2, '');
    }

    // Remove javascript: URIs
    result = result.replace(/(href|src|action)\s*=\s*["']\s*javascript\s*:/gi, '$1="#"');

    return result;
}

/**
 * Sanitiza o customHeadScript do funil antes de injetar no <head>.
 * Remove <script>, event handlers, javascript: URIs e tags perigosas.
 */
export function sanitizeHeadScript(input: string | null | undefined): string {
    if (!input) return "";
    try {
        return stripDangerous(input);
    } catch {
        return "";
    }
}

/**
 * Extrai apenas o conteúdo de tags <script>...</script> de um HTML.
 * Retorna o JS puro para passar ao <Script> do Next.
 */
export function extractScriptContent(html: string): string {
    if (!html) return "";
    const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return "";
    // Remove event handlers do JS extraído
    return match[1]
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*\S+/gi, '')
        .trim();
}

/**
 * Sanitiza uma URL para uso em href/src — bloqueia javascript: e data: perigosos.
 */
export function sanitizeUrl(url: string | null | undefined): string {
    if (!url) return "";
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    if (
        lower.startsWith("javascript:") ||
        lower.startsWith("data:") ||
        lower.startsWith("vbscript:")
    ) {
        return "";
    }
    return trimmed;
}

/**
 * Sanitiza texto para exibição em alertas/componentes.
 * Permite tags de formatação básicas (b, i, em, strong, a, br, span).
 */
export function sanitizeAlertText(html: string): string {
    if (!html) return "";
    const ALLOWED = ['b', 'i', 'em', 'strong', 'a', 'br', 'span'];
    const ALLOWED_ATTR: Record<string, string[]> = {
        'a': ['href', 'target'],
        'span': ['style', 'class'],
    };

    // Remove todas as tags, depois reconstrói apenas as permitidas
    let result = html;

    // Remove tags não permitidas
    result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
        const lower = tag.toLowerCase();
        if (ALLOWED.includes(lower)) {
            // Remove atributos não permitidos
            return match.replace(/([a-zA-Z-]+)\s*=\s*["'][^"']*["']/gi, (attrMatch: string, attrName: string) => {
                const allowed = ALLOWED_ATTR[lower] || [];
                if (allowed.includes(attrName.toLowerCase())) {
                    return attrMatch;
                }
                return '';
            });
        }
        return '';
    });

    // Remove atributos de evento restantes
    result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    result = result.replace(/\s+on\w+\s*=\s*\S+/gi, '');

    return result;
}
