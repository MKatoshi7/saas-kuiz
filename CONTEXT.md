# Kuiz — README de Contexto Rápido

> **Antes de mergulhar no código amanhã**, leia este arquivo. Ele é o "GPS" do projeto.

## 🎯 O que é o Kuiz
**SaaS de Quiz Funnel Builder** com multi-tenant, multi-domínio, analytics, admin power, webhooks de pagamento, e landing page otimizada.

- **Stack**: Next.js 16.1 · React 19 · TypeScript · PostgreSQL (Prisma 7) · Tailwind 3 · Radix UI
- **Auth**: JWT em cookie httpOnly + bcryptjs
- **Pago**: webhooks de Cakto/Stripe/Hotmart/Kiwify/Eduzz/Braip
- **Deploy**: Netlify (atual) · migração para Astro é roadmap

## 📂 Onde está a documentação
1. **`CHANGELOG_V1.md`** — **DOCUMENTO PRINCIPAL**. Tudo que foi feito nas 8 fases, com arquivos modificados + roadmap das próximas. **Leia primeiro.**
2. **`docs/ASTRO_VIABILITY.md`** — estudo de viabilidade para migrar a página pública para Astro (LCP -60%, JS -85%).
3. **`DESIGN_BLUEPRINT.md`** — design system original.
4. **`CLOUDINARY_SETUP.md`**, **`DATABASE_SETUP.md`** etc. — guias de setup.
5. **`CHANGELOG.md`**, **`PROGRESSO.md`**, **`PENDENCIAS*.md`** — histórico mais antigo.

## 🗂️ Estrutura de pastas (essencial)
```
app/
├── page.tsx                          # 🏠 Landing page (raiz)
├── webhook-info/                     # 🔗 Instruções públicas de webhook
├── login/  register/  forgot-password/  reset-password/
├── dashboard/                        # 👤 Dashboard do CLIENTE
│   ├── page.tsx                      # Lista de funis (Apple-like premium)
│   ├── [funnelId]/
│   │   ├── page.tsx                  # 📊 Dashboard Analytics (responsivo)
│   │   ├── DashboardAnalyticsClient.tsx  # (componente client)
│   │   ├── builder/                  # 🛠️ Editor de funis
│   │   ├── settings/                 # ⚙️ Configurações (SettingsClient com split layout)
│   │   └── leads/                    # 📥 Respostas & Leads (VisitorsTable + LeadsInbox)
│   └── account/
├── f/                                # 🌐 Página PÚBLICA do funil
│   ├── [funnelId]/page.tsx           # ISR com unstable_cache
│   └── cname/[domain]/               # Custom domain
├── admin/                            # 🛡️ Painel ADMIN
│   ├── page.tsx                      # Visão Geral
│   ├── users/  funnels/  finance/  logs/  audit/
│   ├── coupons/  broadcasts/         # Marketing
│   ├── webhooks/                     # 💳 Webhook system (4 abas)
│   └── layout.tsx                    # Sidebar com drawer mobile
└── api/
    ├── auth/  admin/  funnels/  track/  upload/  webhooks/

src/
├── components/
│   ├── ui/                          # Design system base (Button, Card, etc)
│   ├── builder/                     # Componentes do editor
│   ├── renderer/                    # FunnelShell, FunnelLivePreview, etc
│   ├── dashboard/                   # Componentes do dashboard
│   └── settings/
├── lib/
│   ├── auth.ts  admin-auth.ts
│   ├── prisma.ts
│   ├── sanitize.ts                   # DOMPurify
│   ├── audit.ts                      # logAdminAction
│   ├── limits.ts                     # PLAN_LIMITS
│   ├── templates.ts                  # 5 templates de funis
│   ├── webhook-parser.ts             # ⭐ Parsers multi-provedor
│   ├── webhook-processor.ts          # ⭐ Fluxo de processamento
│   ├── webhook-signature.ts          # ⭐ HMAC SHA-256
│   ├── broadcast.ts  lgpd.ts
│   └── email/  payment/  utils.ts
├── hooks/
│   ├── useAutoSave.ts                # Debounce + diff JSON
│   ├── useFunnelTracker.ts           # UTM + sessão
│   └── ...
└── store/
    └── builderStore.ts               # Zustand com snapshots (versões)
```

## 🧠 Mental model (5min para entender)

### Fluxo do usuário
1. **Landing** (`/`) → CTA **Começar Grátis** → `/register` → JWT em cookie.
2. **Dashboard** (`/dashboard`) → lista de funis + KPIs + filtros.
3. **Criar funil** → escolhe template (5 disponíveis) ou do zero → builder.
4. **Builder** (`/builder/[id]`) → drag & drop de componentes, save com debounce, preview edit↔live.
5. **Publicar** → URL `kuiz.digital/slug` (ou custom domain). Visitantes veem `/f/[id]`.
6. **Leads** → visitante preenche input → trackAnswer salva em `answersSnapshot` + trackLead salva em `VisitorSession`.
7. **Analytics** → admin vê funil de retenção, UTMs, conversão.

### Fluxo de pagamento (webhook)
1. Visitante compra em Cakto/Stripe/etc → provedor chama `POST /api/webhooks/cakto?provider=cakto`.
2. Webhook valida HMAC (se configurado) → chama `processWebhook()`.
3. Parser identifica email/produto/valor → procura `PlanMapping` (provider + product_id) → descobre plano Kuiz.
4. Cria/encontra User pelo email → estende `subscriptionEndsAt` em +periodDays (acumulativo).
5. Cria `SubscriptionTransaction` → atualiza `User.subscriptionStatus = 'active'`.
6. Marca `WebhookEvent` como `processed` (ou `duplicate` se externalId já existe, ou `ignored` se não é paid).

### Multi-tenancy
- Toda query tem `where: { userId: session.userId }` (cliente) ou `requireAdmin()` + `requireAdmin()` no server (admin).
- Domínio custom: middleware em `middleware.ts` faz rewrite `quiz.seusite.com` → `/f/cname/quiz.seusite.com`.

## 🔑 Padrões de design importantes

### Design system
- Todos os componentes em `src/components/ui/` (Apple-like, rounded-2xl, glass, shadows).
- Tailwind 3 com classes customizadas (`glass-strong`, `text-gradient`, `animate-fade-in-up`).
- **Não usar Tailwind diretamente no builder** — usar o design system.

### Componentes server vs client
- **Server components** (sem `"use client"`): páginas que fazem queries Prisma, layouts.
- **Client components**: tudo que tem `useState`, `useEffect`, `onClick` — adicione `"use client"` no topo.
- **Server tabs/badges**: usam `<Link>` direto. **Client tabs**: usam `useState`.

### Banco de dados
- **NUNCA** deletar dados sem `soft delete` consideration — sempre usar `where` filter.
- **Idempotência** em webhooks: `externalId` unique no `WebhookEvent` (evita duplo processamento).
- **Audit log** em ações admin: chamar `logAdminAction()` sempre que modificar dados de outros usuários.

## 🐛 Problemas conhecidos / TODOs
- `app/dashboard/[funnelId]/builder/BuilderPageClient.tsx` é legacy (substituído por `/builder/[funnelId]`).
- `PropertiesPanel.tsx` tem 1700+ linhas — candidato a refactor (mas funciona).
- `FunnelEngine.tsx` tem 800+ linhas — candidato a modularizar.

## 🔧 Comandos úteis
```bash
npm run dev          # Next dev server
npm run build        # Build production
npx tsc --noEmit     # Type-check (sempre rodar antes de commitar)
npx prisma studio    # GUI do banco
npx prisma migrate dev --name X  # Criar migration
npx prisma generate  # Atualizar client após mudança no schema
```

## 📊 Status atual
- **Versão**: 1.1.0
- **Fase atual**: 8 (Landing + Webhook Info) ✅
- **Próxima fase**: 9 (AI Features)
- **Type-check**: 0 erros
- **DB**: precisa rodar `npx prisma migrate deploy` para aplicar migrations de webhook (Fase 7)

## 🎯 Quando recomeçar
1. Ler `CHANGELOG_V1.md` (começar pelo "Visão Geral" e depois a "Fase 8")
2. Ver `docs/ASTRO_VIABILITY.md` se for trabalhar em performance
3. Conferir o roadmap para escolher a próxima feature
4. Se for trabalhar em webhook, começar por `src/lib/webhook-processor.ts` para entender o fluxo
