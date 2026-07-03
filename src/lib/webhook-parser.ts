/**
 * Parser de webhooks de múltiplos provedores de pagamento.
 *
 * Retorna SEMPRE os mesmos campos normalizados, mesmo quando o
 * provedor envia estrutura diferente. Se não conseguir identificar
 * um campo, retorna `null` (e marca `confidence: 'low'`).
 */

export interface ParsedWebhook {
    provider: 'cakto' | 'stripe' | 'hotmart' | 'kiwify' | 'eduzz' | 'braip' | 'unknown'
    eventType: string | null
    externalId: string | null
    customer: {
        email: string | null
        name: string | null
        phone: string | null
        document: string | null
    }
    product: {
        id: string | null
        name: string | null
    }
    payment: {
        amount: number | null
        currency: string
        status: 'paid' | 'pending' | 'refunded' | 'failed' | 'unknown'
        method: string | null
    }
    /** Nível de confiança na identificação. Baixa = revisar manualmente. */
    confidence: 'high' | 'medium' | 'low'
    /** Notas para debug / revisão manual */
    notes: string[]
}

interface ParseResult extends ParsedWebhook {
    /** Estratégia de parse que matchou */
    matchedStrategy: 'cakto' | 'stripe' | 'hotmart' | 'kiwify' | 'eduzz' | 'braip' | 'generic'
}

export function parseWebhook(provider: string, payload: any): ParseResult {
    const lower = (provider || '').toLowerCase()

    if (lower.includes('cakto')) return parseCakto(payload)
    if (lower.includes('stripe')) return parseStripe(payload)
    if (lower.includes('hotmart')) return parseHotmart(payload)
    if (lower.includes('kiwify')) return parseKiwify(payload)
    if (lower.includes('eduzz')) return parseEduzz(payload)
    if (lower.includes('braip')) return parseBraip(payload)

    // Estratégia genérica: tentar detectar formato
    return parseGeneric(payload)
}

function emptyResult(): Omit<ParseResult, 'matchedStrategy'> {
    return {
        provider: 'unknown',
        eventType: null,
        externalId: null,
        customer: { email: null, name: null, phone: null, document: null },
        product: { id: null, name: null },
        payment: { amount: null, currency: 'BRL', status: 'unknown', method: null },
        confidence: 'low',
        notes: [],
    }
}

function normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null
    const digits = String(phone).replace(/\D/g, '')
    if (digits.length < 8) return null
    return digits
}

function normalizeEmail(email: string | null | undefined): string | null {
    if (!email) return null
    const s = String(email).trim().toLowerCase()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null
}

function centsToReais(cents: number | string): number {
    const n = Number(cents)
    if (isNaN(n)) return 0
    return n / 100
}

// =====================
// CAKTO
// =====================
function parseCakto(payload: any): ParseResult {
    const r = emptyResult()
    r.provider = 'cakto'

    // Cakto envia eventos como:
    // { event: "purchase.approved", id: "...", data: { customer: {...}, product: {...} } }
    r.eventType = payload.event || payload.type || null
    r.externalId = payload.id || payload.event_id || null

    const data = payload.data || payload
    const customer = data.customer || data.buyer || {}
    const product = data.product || data.offer || data.checkout || {}
    const payment = data.payment || data.transaction || {}

    r.customer.email = normalizeEmail(customer.email || customer.customer_email)
    r.customer.name = customer.name || customer.full_name || customer.customer_name || null
    r.customer.phone = normalizePhone(customer.phone || customer.cellphone || customer.phone_number)
    r.customer.document = customer.document || customer.cpf || customer.cnpj || null

    r.product.id = product.id || product.product_id || null
    r.product.name = product.name || product.product_name || null

    // Cakto envia amount em centavos
    const amountCents = payment.amount || data.amount || product.amount
    r.payment.amount = amountCents ? centsToReais(amountCents) : null
    r.payment.currency = payment.currency || data.currency || 'BRL'

    const status = String(payment.status || r.eventType || '').toLowerCase()
    if (status.includes('approved') || status.includes('paid') || status.includes('compra')) {
        r.payment.status = 'paid'
    } else if (status.includes('refund')) {
        r.payment.status = 'refunded'
    } else if (status.includes('fail') || status.includes('cancel')) {
        r.payment.status = 'failed'
    }
    r.payment.method = payment.method || payment.payment_method || null

    r.confidence = r.customer.email && r.payment.amount ? 'high' : 'medium'
    if (!r.customer.email) r.notes.push('Email não encontrado no payload — confira o mapeamento')

    return { ...r, matchedStrategy: 'cakto' }
}

// =====================
// STRIPE
// =====================
function parseStripe(payload: any): ParseResult {
    const r = emptyResult()
    r.provider = 'stripe'

    r.eventType = payload.type || null
    r.externalId = payload.id || null

    const obj = payload.data?.object || payload
    const customer = obj.customer || obj.customer_details || {}
    const lines = obj.lines?.data?.[0] || {}
    const price = lines.price || obj.plan || {}

    r.customer.email = normalizeEmail(customer.email || customer?.details?.email)
    r.customer.name = customer.name || customer?.details?.name || null
    r.customer.phone = normalizePhone(customer.phone || customer?.details?.phone)

    r.product.id = price.id || price.product || null
    r.product.name = price.nickname || price.product?.name || null

    // Stripe envia amount_total em centavos
    r.payment.amount = obj.amount_total ? centsToReais(obj.amount_total) : null
    r.payment.currency = (obj.currency || 'brl').toUpperCase()
    r.payment.method = obj.payment_method_types?.[0] || null

    const status = String(r.eventType || '').toLowerCase()
    if (status.includes('succeeded') || status.includes('paid')) r.payment.status = 'paid'
    else if (status.includes('refund')) r.payment.status = 'refunded'
    else if (status.includes('failed')) r.payment.status = 'failed'

    r.confidence = r.customer.email ? 'high' : 'medium'
    if (!r.customer.email) r.notes.push('Email ausente — pode ser checkout guest')

    return { ...r, matchedStrategy: 'stripe' }
}

// =====================
// HOTMART
// =====================
function parseHotmart(payload: any): ParseResult {
    const r = emptyResult()
    r.provider = 'hotmart'

    r.eventType = payload.event || payload.id || null
    r.externalId = payload.id || payload.transaction || null

    const buyer = payload.buyer || {}
    const product = payload.product || {}
    const purchase = payload.purchase || {}

    r.customer.email = normalizeEmail(buyer.email)
    r.customer.name = buyer.name || null
    r.customer.phone = normalizePhone(buyer.phone || buyer.checkout_phone)
    r.customer.document = buyer.document || buyer.cpf || null

    r.product.id = String(product.id || product.ucode || '')
    r.product.name = product.name || null

    r.payment.amount = purchase.price?.value
        ? Number(purchase.price.value) / 100
        : (purchase.price ? Number(purchase.price) : null)
    r.payment.currency = (purchase.currency || 'BRL').toString().toUpperCase()

    const status = String(purchase.status || r.eventType || '').toLowerCase()
    if (status.includes('approved') || status.includes('completed') || status.includes('paid')) {
        r.payment.status = 'paid'
    } else if (status.includes('refund')) r.payment.status = 'refunded'
    else if (status.includes('cancel') || status.includes('chargeback')) r.payment.status = 'failed'

    r.confidence = r.customer.email && r.payment.amount ? 'high' : 'medium'
    return { ...r, matchedStrategy: 'hotmart' }
}

// =====================
// KIWIFY
// =====================
function parseKiwify(payload: any): ParseResult {
    const r = emptyResult()
    r.provider = 'kiwify'

    r.eventType = payload.webhook_event_type || payload.event || null
    r.externalId = payload.id || payload.order_id || null

    const customer = payload.Customer || payload.customer || {}
    const product = payload.Product || payload.product || {}

    r.customer.email = normalizeEmail(customer.email)
    r.customer.name = customer.full_name || customer.name || null
    r.customer.phone = normalizePhone(customer.mobile || customer.phone)
    r.customer.document = customer.document || customer.cpf || null

    r.product.id = product.id ? String(product.id) : null
    r.product.name = product.name || null

    r.payment.amount = payload.amount ? Number(payload.amount) / 100 : null
    r.payment.currency = (payload.currency || 'BRL').toString().toUpperCase()

    const status = String(payload.status || r.eventType || '').toLowerCase()
    if (status.includes('paid') || status.includes('approved')) r.payment.status = 'paid'
    else if (status.includes('refund')) r.payment.status = 'refunded'
    else if (status.includes('cancel') || status.includes('chargedback')) r.payment.status = 'failed'

    r.confidence = r.customer.email ? 'high' : 'medium'
    return { ...r, matchedStrategy: 'kiwify' }
}

// =====================
// EDUZZ
// =====================
function parseEduzz(payload: any): ParseResult {
    const r = emptyResult()
    r.provider = 'eduzz'

    r.eventType = payload.event || null
    r.externalId = payload.transID || payload.sale_id || null

    const customer = payload.client || {}
    const product = payload.product || {}

    r.customer.email = normalizeEmail(customer.email)
    r.customer.name = customer.name || customer.fullName || null
    r.customer.phone = normalizePhone(customer.phone || customer.cellphone)
    r.customer.document = customer.document || customer.cpf || customer.cnpj || null

    r.product.id = product.id ? String(product.id) : null
    r.product.name = product.name || null

    r.payment.amount = payload.cash_value ? Number(payload.cash_value) : null
    r.payment.currency = 'BRL'

    const status = String(payload.status || '').toLowerCase()
    if (status.includes('paid') || status.includes('aprovada')) r.payment.status = 'paid'
    else if (status.includes('refund')) r.payment.status = 'refunded'

    r.confidence = r.customer.email ? 'high' : 'medium'
    return { ...r, matchedStrategy: 'eduzz' }
}

// =====================
// BRAIP
// =====================
function parseBraip(payload: any): ParseResult {
    const r = emptyResult()
    r.provider = 'braip'

    r.eventType = payload.event || null
    r.externalId = payload.transaction_id || payload.id || null

    const customer = payload.customer || {}
    r.customer.email = normalizeEmail(customer.email)
    r.customer.name = customer.name || null
    r.customer.phone = normalizePhone(customer.phone)
    r.customer.document = customer.document || null

    const product = payload.product || {}
    r.product.id = product.code || product.id || null
    r.product.name = product.name || null

    r.payment.amount = payload.amount ? Number(payload.amount) / 100 : null
    r.payment.currency = (payload.currency || 'BRL').toString().toUpperCase()
    if (String(r.eventType).includes('paid')) r.payment.status = 'paid'

    r.confidence = r.customer.email ? 'high' : 'medium'
    return { ...r, matchedStrategy: 'braip' }
}

// =====================
// GENERIC (best-effort)
// Tenta detectar o formato em qualquer payload
// =====================
function parseGeneric(payload: any): ParseResult {
    const r = emptyResult()
    r.provider = 'unknown'

    // Detecta event type
    r.eventType = payload.event || payload.type || payload.event_type || payload.webhook_event_type || null

    // Detecta ID
    r.externalId = payload.id || payload.event_id || payload.transaction_id || payload.order_id || payload.transID || null

    // Tenta achar customer em vários locais
    const customerCandidates = [
        payload.customer, payload.Customer, payload.buyer, payload.Buyer,
        payload.client, payload.data?.customer, payload.data?.buyer, payload.data?.client,
    ].filter(Boolean)
    const customer = customerCandidates[0] || {}

    r.customer.email = normalizeEmail(
        customer.email || customer.customer_email || customer.buyer_email
    )
    r.customer.name = customer.name || customer.full_name || customer.customer_name || null
    r.customer.phone = normalizePhone(
        customer.phone || customer.cellphone || customer.mobile
    )
    r.customer.document = customer.document || customer.cpf || customer.cnpj || null

    // Tenta achar product
    const productCandidates = [
        payload.product, payload.Product, payload.offer,
        payload.data?.product, payload.data?.offer, payload.data?.checkout,
    ].filter(Boolean)
    const product = productCandidates[0] || {}

    r.product.id = product.id ? String(product.id) : product.code || product.ucode || null
    r.product.name = product.name || product.product_name || product.title || null

    // Tenta achar amount
    const amountCandidates = [
        payload.amount, payload.value, payload.price, payload.total,
        payload.payment?.amount, payload.transaction?.amount,
        payload.data?.amount, payload.data?.payment?.amount, payload.data?.transaction?.amount,
    ].filter((v) => v !== undefined && v !== null)

    if (amountCandidates.length > 0) {
        const raw = amountCandidates[0]
        const num = Number(raw)
        if (!isNaN(num) && num > 0) {
            // Heurística: se for um número grande, provavelmente centavos
            r.payment.amount = num > 1000 ? centsToReais(num) : num
            r.notes.push(`Valor ${num} detectado; ${num > 1000 ? 'convertido de centavos' : 'tratado como reais'}`)
        }
    }

    r.payment.currency = payload.currency || payload.data?.currency || 'BRL'

    // Status
    const statusStr = String(
        payload.status || payload.payment?.status || payload.data?.status || ''
    ).toLowerCase()
    if (statusStr.includes('paid') || statusStr.includes('approved') || statusStr.includes('succeeded')) {
        r.payment.status = 'paid'
    } else if (statusStr.includes('refund')) r.payment.status = 'refunded'
    else if (statusStr.includes('fail') || statusStr.includes('cancel')) r.payment.status = 'failed'

    r.confidence = r.customer.email ? 'medium' : 'low'
    r.notes.push('Provedor não identificado — revise manualmente')

    return { ...r, matchedStrategy: 'generic' }
}
