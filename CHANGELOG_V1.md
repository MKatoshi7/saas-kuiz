# 📘 Kuiz — Changelog v1.1.0

> Documento vivo com tudo o que foi entregue nas Fases 1, 2, 3, 4, 5, 6, 7 e 8 + roadmap das próximas fases.
> **Stack**: Next.js 16.1 · React 19 · TypeScript · PostgreSQL (Prisma 7) · Tailwind 3 · Radix UI.

---

## 🎯 Visão Geral

O Kuiz é um **SaaS de Quiz Funnel Builder** com sistema multi-tenant, multi-domínio, analytics, admin power, gestão de assinaturas via webhooks, e landing page otimizada. Este changelog consolida **8 grandes ondas de trabalho** que modernizaram a base visual, a segurança, a experiência de uso administrativo, a experiência de edição no builder, o sistema de leads, o analytics, o processamento de webhooks de pagamento e a landing page.

**Commits/versão base**: `0.1.0` → `1.0.0` → `1.1.0`

> 📌 **Como usar este changelog**: cada fase tem o que foi entregue + arquivos modificados/criados. As fases 4-8 são as mais recentes (acima da linha `---` das Fases 1-3).

---

## ✅ Fase 1 — Quick Wins + Segurança + Design System

### 🔒 Segurança
- **XSS fix em `customHeadScript`** — todo script injetado em funis públicos agora passa por `isomorphic-dompurify` (allowlist de tags, bloqueio de event handlers e `javascript:` URIs). Arquivo: `src/lib/sanitize.ts`. Aplicado em `app/f/[funnelId]/page.tsx`.
- **Auto-save com debounce real + diff JSON** — `src/hooks/useAutoSave.ts` reescrito. Só salva se `JSON.stringify(payload) !== lastSaved`, com status `dirty` para feedback visual.
- **Lock de save duplicado** — botão Salvar fica em estado `loading` durante o request, e o hook tem `isSavingRef.current` para evitar cliques duplos.
- **Helper de auditoria** — `src/lib/audit.ts` com `logAdminAction({ adminId, action, targetUserId, targetFunnelId, details, ip, userAgent })`.

### 🎨 Design System (estilo Apple-like)
- **`app/globals.css`** — nova paleta HSL, classes `glass` / `glass-strong`, `text-balance`, `text-gradient`, animações `fade-in-up` / `pulse-soft` / `shimmer`, scrollbars custom (10px, arredondadas).
- **Componentes UI base refeitos** em `src/components/ui/`:
  - `button.tsx` — 5 variantes (default, primary azul Apple, destructive, outline, secondary, ghost, link, glass) × 6 tamanhos, com `loading`, `leftIcon`, `rightIcon`.
  - `card.tsx` — variants `glass` e `hover` (lift + shadow).
  - `dialog.tsx` — overlay com blur, animações suaves.
  - `badge.tsx` — 9 variantes (`default`, `primary`, `success`, `warning`, `destructive`, `info`, `outline`, `ghost`, `secondary`) com `dot` opcional.
  - `input.tsx`, `textarea.tsx`, `label.tsx` — estilo Apple (rounded-xl, focus ring leve).
  - `table.tsx` — nova, padrão Apple com header uppercase tracking.
  - `tabs.tsx`, `popover.tsx`, `select.tsx`, `dropdown-menu.tsx`, `separator.tsx` — todos refeitos.
- **Componentes novos**:
  - `StatCard.tsx` — card de métrica com trend + ícone + variants (default/primary/dark).
  - `Avatar.tsx` — iniciais coloridas geradas via hash do nome + 5 tamanhos.
  - `Skeleton.tsx` — com animação shimmer.
  - `EmptyState.tsx` — reusado em vários pontos.

### 🛡️ Audit Log (modelo completo)
- **Prisma** — novo modelo `AdminAction` (`adminId`, `targetUserId?`, `targetFunnelId?`, `action`, `details Json?`, `ipAddress?`, `userAgent?`, `createdAt`) + 3 índices.
- **API** `GET /api/admin/audit` com filtros (`adminId`, `action`, paginação).
- **UI** `/admin/audit` com filtros rápidos (Todas / Banimentos / Impersonate / Edições) e busca textual.
- **Integrações**: `ban_funnel`, `unban_funnel`, `impersonate_user`, `edit_user` (com diff `from→to`).

### 📊 Admin redesign
- `/admin/layout.tsx` — shell novo com sidebar fixa `glass-strong`, drawer mobile funcional, indicador de rota ativa, **badge "Admin"** no header.
- `/admin/page.tsx` (Visão Geral):
  - Gráfico de 12 meses **real** (SQL `date_trunc('month', "createdAt")`).
  - 4 `StatCard` (Receita, Usuários, Assinaturas, Funis) com trend.
  - Atividade recente puxando do `AdminAction` com avatares e badges.
  - 3 mini-cards (Leads do Mês, Leads Totais, Funis Banidos).
- `/admin/funnels/page.tsx` — filtros por status (Todos/Publicados/Rascunhos/Banidos), busca expandida, **botão "Ver detalhes"** com link para `/admin/funnels/[id]`.
- `/admin/logs/page.tsx`, `/admin/finance/page.tsx`, `/admin/users/page.tsx` — todos atualizados para usar `Table` + `Avatar` + `Badge` Apple-like.

### ⌨️ UX do Builder
- **`src/components/builder/CommandPalette.tsx`** — `⌘K` (ou `Ctrl+K`) abre paleta de comandos com busca fuzzy, agrupada em **Navegação / Ações / Edição / Componentes**, com atalhos exibidos (`⌘S`, `⌘Z`, `⌘D`, `⌫`).
- **Header do builder** novo: logo, save status (5 estados), toggle mobile/desktop, undo/redo, preview, **botão "Link" para copiar URL pública**, save com loading.
- **Botão flutuante `⌘K`** no canto inferior direito (apenas desktop).

### 🏠 Dashboard do cliente
- `DashboardHeader.tsx` — sticky `glass-strong`, menu do usuário com **DropdownMenu** (Perfil / Configurações / Assinatura / Painel Admin / Sair).
- `FunnelCard.tsx` — redesign com badge de status, **DropdownMenu de ações** (Abrir / Visualizar / Analytics / Duplicar / Configurações / Deletar), stats com separador, hover lift.
- `DashboardClient.tsx` — empty state com `EmptyState` + botão "Criar Primeiro Projeto".

---

## ✅ Fase 2 — Admin Power (52 → entregues os prioritários)

### 🗃️ Banco de dados
Novos modelos no `prisma/schema.prisma`:
- **`AdminNote`** — notas internas do admin em usuários (visíveis entre admins).
- **`FunnelNote`** — notas internas em funis.
- **`Coupon`** + **`CouponRedemption`** — cupons de desconto (`percent`/`fixed`, `maxUses`, `validUntil`, `applicablePlans`).
- **`Broadcast`** — mensagens em massa (assunto, mensagem, segmentação, contadores, status).
- **Índices adicionados**: `funnels(status, createdAt)`, `funnels(isBanned)`, `visitor_sessions(startedAt DESC)`, `events(createdAt DESC)`, `subscription_transactions(createdAt DESC)`, `webhook_logs(createdAt DESC)`.
- **Migration**: `prisma/migrations/20260612000000_phase2_admin_power/migration.sql` — idempotente (usa `IF NOT EXISTS`).

### 🔍 Analytics de qualquer funil (sem impersonar)
- **`/admin/funnels/[id]`** — página completa:
  - Header com badges, copy-slug, ações (Preview/Builder/Banir/Deletar/Impersonar).
  - Card do dono (avatar, plano, role, link para `/admin/users/[id]`, "Acessar conta").
  - 4 `StatCard` (visitantes, leads, conversão, conclusão).
  - Tabs: **Analytics** (gráfico 30 dias + Top UTMs + retenção por etapa com barras coloridas), **Sessões** (50 mais recentes), **Anotações** (thread com autor/horário).
- **API** `GET /api/admin/funnels/[funnelId]` — métricas + chart diário via SQL.

### ⚡ Ações em massa (`/admin/funnels`)
- **Bulk action bar flutuante** (estilo macOS) aparece quando há seleção.
- Checkbox na 1ª coluna + select-all na página.
- Ações: **Banir** (com motivo) e **Deletar permanentemente** (com confirmação).
- Limite de 100 funis/operação + log de auditoria por funil.
- **API** `POST /api/admin/funnels/bulk` (`ban` | `unban` | `delete`).

### 📝 Anotações internas
- Em funis: tab "Anotações" do detalhe.
- Em usuários: tab "Anotações" da página `/admin/users/[id]`.
- Thread com avatar, autor, timestamp, hover-delete.
- APIs: `GET/POST /api/admin/funnels/[funnelId]/notes`, `GET/POST /api/admin/users/[userId]/notes`, `DELETE /api/admin/funnels/notes/[noteId]`, `DELETE /api/admin/users/notes/[noteId]`.

### 🎟️ Cupons
- **`/admin/coupons`** — tabela com badges %/R$, contador de uso, planos aplicáveis, validade, status (ativo/expirado).
- Modal de criação: código (uppercase), tipo (%/fixo), valor, limite de usos, expiração, multi-seleção de planos.
- Ações: ativar/desativar, deletar.
- Validações: código único, percent 1-100.
- APIs: `GET/POST /api/admin/coupons`, `PATCH/DELETE /api/admin/coupons/[id]`.

### 📣 Broadcast
- **`/admin/broadcasts`** — editor com assunto + mensagem + segmentação (plano × status).
- **Botão "Calcular público"** — quantos serão atingidos sem enviar.
- **Preview do e-mail** ao vivo (template Apple Mail).
- Confirmação antes de enviar.
- Histórico com tabela (data, assunto, segmento, enviados/total, status).
- Modal de detalhes.
- E-mail renderizado com `escapeHtml` no assunto/nome.
- API `GET/POST /api/admin/broadcasts` (suporta `action: 'preview'`).

### 🛡️ LGPD/GDPR Export
- Botão "Exportar LGPD" no header da página do usuário.
- Gera `.json` com: dados pessoais + funis + transações + leads identificados + ações do admin.
- Header `Content-Disposition: attachment`.
- API: `GET /api/admin/users/[userId]/export`.

### 👤 Página `/admin/users/[id]`
- Card do usuário + 4 StatCards.
- Tabs: **Funis** (com status/sessões/link) e **Anotações**.
- Botões: Exportar LGPD, Acessar conta (impersonate).

### 🧭 Nav lateral atualizada
- Novos itens: **Cupons** (Tag) e **Broadcast** (Send).

---

## ✅ Fase 3 — UX do Builder

### 🎨 Templates (5 prontos + blank)
- **`src/lib/templates.ts`** com 5 templates completos:
  1. **💸 Low Ticket Clássico** (5 etapas)
  2. **🧲 Lead Magnético Quiz** (4 etapas)
  3. **🎬 VSL + Oferta** (3 etapas)
  4. **⭐ Pesquisa NPS** (3 etapas)
  5. **✨ Começar do zero** (2 etapas)
- **API** `GET /api/funnels/templates` e `POST /api/funnels/create` (com `templateId`).
- **NewProjectDialog** redesign em 2 steps:
  - **Step 1**: galeria visual de templates (emoji + badge de conversão estimada).
  - **Step 2**: nome + descrição.
- Cada template injeta seu próprio **tema** (cor primária + fundo).

### 🗺 Mini-mapa do funil
- **StepsPanel** com **toggle Lista ↔ Mapa**.
- **Modo Mapa** (estilo Notion outline): bolinhas + linha conectora + barra de mini-bars por tipo de componente.

### 🎯 Drop zones visuais
- Linhas azuis brilhantes (acima/abaixo) durante drag.
- `EndDropZone` dashed no fim da lista.

### 🪄 Empty state do Canvas
- `EmptyCanvasState.tsx` — 3 cards grandes clicáveis (Texto/Pergunta/Botão) que adicionam componente direto.

### ⏪ Undo/Redo com tooltip
- Histórico agora carrega `action` por entrada ("Adicionar quiz-option", etc.).
- Botões mostram `title="Desfazer: Adicionar quiz-option"`.

### 🕓 Versões nomeadas (snapshots)
- Botão **History** no header.
- Dropdown com lista de versões, botões **Restaurar** e **Deletar**.
- Modal para criar nova versão (nome).
- Persistência em memória (até 20).

### 🔗 Copiar link público
- Botão "Link" no header com feedback "Copiado!".

### 🐛 Bug fix
- **`@radix-ui/react-dropdown-menu` faltando** — instalado (`2.1.17`) e login voltou a funcionar.

### ✅ Type-check
- `npx tsc --noEmit` → 0 erros.

---

## 🛠️ Fase 4 — UI Polish + Renderer Fidelity + Performance (em andamento)

### 📄 Página do funil publicado
- **Refatorar `/f/[funnelId]/page.tsx`** para visual moderno, com:
  - Skeleton inicial mais leve
  - Container centralizado com breathing room
  - Imagens com `next/image` lazy + blur placeholder
  - Fonts com `next/font` (Inter)
  - `prefers-reduced-motion` respeitado
  - `loading="lazy"` em iframes e vídeos
  - Acessibilidade (aria-labels, foco visível, contraste AA)

### 🎛️ PropertiesPanel (refinamento visual, sem refactor estrutural)
- Agrupar em **Accordion** por categoria (Conteúdo / Estilo / Avançado).
- Indicador de alterações não salvas.
- Botão "Resetar" para o padrão.
- Tooltips em campos avançados.
- Sliders e color picker consistentes.

### 🪞 Renderer fidelity (preview = página final)
- **Refatorar `FunnelEngine.tsx` e `Canvas.tsx`** para compartilharem o mesmo componente `<ComponentRenderer />` com modo `preview` vs `editing`.
- Adotar a estratégia **iframe com `?preview=true`** como opção no builder.
- Remover duplicação entre renderers e `ThemedCanvasPreview`.

### 🚀 Performance
- **Estudo de viabilidade: Astro para `/f/[funnelId]`** — ver `docs/ASTRO_VIABILITY.md`.
- `unstable_cache` + `revalidateTag` em queries de funis públicos.
- ISR (Incremental Static Regeneration) com `revalidate: 60` no renderer público.
- Edge runtime para o middleware de rewrite.
- `next/image` em todos os assets, com placeholders blur.
- Code splitting no renderer (carregar QuizOptionsRenderer só quando o step atual o tem).
- `dynamic import` para componentes pesados (VSL, WhatsAppAudio, Confetti).
- Compressão Brotli no servidor.
- Resource Hints (`<link rel="preconnect">` para Cloudinary e FB Pixel).

---

## 🆕 Novas Ideias de Funcionalidades (Brainstorm)

> Estas são ideias para roadmap futuro, **não implementadas ainda**. Selecionamos juntos.

### 🎯 Builder / UX
1. **A/B Testing nativo de steps** — variantes de um step, tracking automático, vencedor com base em conversão.
2. **AI Copy Helper** — botão "Gerar copy" com OpenAI para headlines, descrições, perguntas.
3. **AI Image Generator** — integrado a DALL-E/Replicate para criar imagens sem sair do builder.
4. **Biblioteca de blocos salvos** — salvar componentes custom como templates reutilizáveis.
5. **Pastas/Tags para organizar funis**.
6. **Multi-idioma por step** (i18n) — criar versão EN/ES de cada step com 1 clique.
7. **Comentários em etapas** (colaboração) — admin e dono podem deixar notas por step.
8. **Lógica condicional avançada** — `if user.email contains @gmail → step A, else step B`.
9. **Pixel próprio + webhooks de saída** (Zapier, n8n, Make) por funil.
10. **Embed JS** — script para colar funil em site externo (`<script src="..."></script>`).
11. **White-label total** — admin escolhe logo, cores, domínio do cliente final.
12. **Live preview mobile** dentro do builder (split view lado a lado).

### 📊 Analytics
13. **Heatmap de cliques** dentro do funil.
14. **Funil de retenção visual** (Sankey diagram).
15. **Cohort analysis** (leads por semana/mês de aquisição).
16. **Atribuição multi-touch** — qual campanha/conjunto/anúncio gerou cada lead.
17. **Exportação para BigQuery / Google Sheets** automática.
18. **Alertas inteligentes** — "esse funil perdeu 30% de conversão essa semana".

### 🏪 Monetização
19. **Programa de afiliados** com comissão recorrente (10% por exemplo).
20. **Marketplace de templates** (criadores vendem templates).
21. **Plano "Pay-per-Lead"** (alternativo a assinatura fixa).
22. **Upsell no checkout** (anual com desconto).
23. **Cupom via link de indicação** (ex: `/r/CODIGO` → aplica cupom + tracking).

### 🔌 Integrações
24. **WhatsApp Business API** — botão "enviar lead no Zap" + notificação no WhatsApp do dono.
25. **Telegram bot** — recebe leads em tempo real.
26. **n8n / Make / Zapier** nativo com OAuth.
27. **Mailchimp / ConvertKit / ActiveCampaign** sync.
28. **Google Calendar / Calendly** — agendar reunião para leads qualificados.
29. **Hotmart / Kiwify / Eduzz** — webhook de venda (atribuição final).
30. **Google Ads / Meta Ads** offline conversions sync.

### 🛡️ Admin
31. **Maintenance mode** com página de aviso customizável.
32. **Gestão de domínios pendentes** (CNAMEs apontando mas sem SSL).
33. **Aprovação de novos signups** (KYC leve para enterprise).
34. **IP allowlist para admin** (whitelist de IPs).
35. **2FA obrigatório para admin**.
36. **Detecção de abuso** (muitos funis de uma vez, mesmo template, leads fake).
37. **Broadcast por canal** (in-app + email + push).
38. **Agendamento de broadcast** (enviar em data/hora futura).
39. **Templates de email** para onboarding, renovação, win-back.

### ⚡ DevOps / Performance
40. **Migrar para Astro** (página do funil público) — 100% SSG com islands.
41. **Redis (Upstash) para rate limit** + cache de queries.
42. **CDN edge para assets do renderer**.
43. **Lazy hydration** de componentes pesados.
44. **PWA** do dashboard (instalável).

---

## 📂 Arquivos Criados/Modificados (resumo)

### Banco de dados
- `prisma/schema.prisma` — AdminAction, AdminNote, FunnelNote, Coupon, CouponRedemption, Broadcast + índices.
- `prisma/migrations/20260612000000_phase2_admin_power/migration.sql` — migration idempotente.

### Bibliotecas / Libs
- `src/lib/sanitize.ts` — DOMPurify wrapper.
- `src/lib/audit.ts` — logAdminAction.
- `src/lib/broadcast.ts` — segmentação de usuários.
- `src/lib/lgpd.ts` — export LGPD/GDPR.
- `src/lib/templates.ts` — 5 templates + getter.
- `src/hooks/useAutoSave.ts` — reescrito com debounce + diff.
- `src/store/builderStore.ts` — snapshots, action descriptions, lastActionDescription.

### UI Base
- `src/components/ui/button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `tabs.tsx`, `popover.tsx`, `select.tsx`, `dropdown-menu.tsx`, `separator.tsx`, `table.tsx`, `badge.tsx`, `Avatar.tsx`, `Skeleton.tsx`, `EmptyState.tsx`, `StatCard.tsx`.
- `app/globals.css` — design system.

### Builder
- `app/builder/[funnelId]/BuilderPageClient.tsx` — refeito com ⌘K, ⌘S, History, Copiar link, save indicator.
- `src/components/builder/CommandPalette.tsx` — novo.
- `src/components/builder/SortableComponent.tsx` — drop zones visuais.
- `src/components/builder/EmptyCanvasState.tsx` — novo.
- `src/components/builder/StepsPanel.tsx` — redesign com toggle Lista/Mapa.
- `src/components/builder/SaveStatusIndicator.tsx` — 5 estados.

### Dashboard
- `app/dashboard/DashboardClient.tsx` — redesign.
- `app/dashboard/[funnelId]/page.tsx` — (analytics preservado).
- `src/components/dashboard/DashboardHeader.tsx` — async com menu.
- `src/components/dashboard/FunnelCard.tsx` — DropdownMenu.
- `src/components/dashboard/NewProjectDialog.tsx` — 2 steps com galeria.

### Admin
- `app/admin/layout.tsx` — sidebar + drawer mobile.
- `app/admin/page.tsx` — Visão Geral com gráfico real.
- `app/admin/funnels/page.tsx` — bulk actions.
- `app/admin/funnels/[id]/page.tsx` — novo (analytics do funil).
- `app/admin/users/page.tsx` — link para detalhes.
- `app/admin/users/[id]/page.tsx` — novo.
- `app/admin/audit/page.tsx` — novo.
- `app/admin/coupons/page.tsx` — novo.
- `app/admin/broadcasts/page.tsx` — novo.
- `app/admin/finance/page.tsx` — atualizado.
- `app/admin/logs/page.tsx` — atualizado.

### APIs
- `app/api/admin/stats/route.ts` — métricas + chart real.
- `app/api/admin/funnels/route.ts` — busca + filtro status.
- `app/api/admin/funnels/[funnelId]/route.ts` — analytics do funil.
- `app/api/admin/funnels/[funnelId]/ban/route.ts` — com log.
- `app/api/admin/funnels/[funnelId]/notes/route.ts` — anotações.
- `app/api/admin/funnels/notes/[noteId]/route.ts` — delete nota.
- `app/api/admin/funnels/bulk/route.ts` — ações em massa.
- `app/api/admin/users/route.ts` — com log + diff.
- `app/api/admin/users/[id]/route.ts` — detalhe.
- `app/api/admin/users/[userId]/notes/route.ts` — anotações.
- `app/api/admin/users/notes/[noteId]/route.ts` — delete.
- `app/api/admin/users/[userId]/export/route.ts` — LGPD.
- `app/api/admin/coupons/route.ts` — CRUD.
- `app/api/admin/coupons/[id]/route.ts` — PATCH/DELETE.
- `app/api/admin/broadcasts/route.ts` — GET/POST + preview.
- `app/api/admin/audit/route.ts` — listagem.
- `app/api/admin/impersonate/route.ts` — com log.
- `app/api/funnels/templates/route.ts` — listar templates.
- `app/api/funnels/create/route.ts` — criar com template.

### Segurança
- `app/f/[funnelId]/page.tsx` — sanitização com DOMPurify.

---

## 📅 Roadmap

| Fase | Foco | Status |
|------|------|--------|
| **1** | Quick Wins + Segurança + Design System | ✅ |
| **2** | Admin Power (gerenciar funis, audit, cupons, broadcast, LGPD) | ✅ |
| **3** | UX Builder (templates, mini-mapa, AI helper) | ✅ |
| **4** | UI Polish + Renderer Fidelity + Performance | ✅ |
| **5** | Leads & UTM (caixa de entrada, popover, export por inputs) | ✅ |
| **6** | Dashboard Analytics responsivo + UTM cell | ✅ |
| **7** | Webhook system (Cakto/Stripe/Hotmart/Kiwify/Eduzz/Braip) | ✅ |
| **8** | Landing page redesign + `/webhook-info` | ✅ |
| **9** | AI Features (copy, imagens, lógica condicional) | 🔜 Próxima |
| **10** | A/B Testing + Heatmap | 🔜 |
| **11** | Integrações (WhatsApp, Mailchimp, Calendly) | 🔜 |
| **12** | Migração para Astro (página pública) | 🔜 |
| **13** | White-label + Marketplace de templates | 🔜 |
| **14** | Mobile app (PWA) | 🔜 |

---

## ✅ Fase 4 — UI Polish + Renderer Fidelity + Performance

**Objetivo**: garantir que o **preview do canvas seja pixel-perfect idêntico** à página publicada, otimizar a página pública e refinar UI dos painéis.

### 📄 Landing pública `/f/[id]` (refatoração)
- **`src/components/renderer/FunnelShell.tsx`** — novo wrapper com preconnect idempotente para Google Fonts, smooth scroll global, `prefers-reduced-motion`. É o único entry point da página pública.
- **`src/components/renderer/FunnelBlockedScreen.tsx`** — telas de "Serviço Suspenso" (warning) e "Acesso Indisponível" (danger) com visual premium: glow background, ícone gradient, botão "Motivo" expansível, footer com Sparkles. Fim do `bg-gray-50` genérico.
- **Tela de "Obrigado"** — ícone gradient emerald (40x40) com glow + "Powered by Kuiz" no rodapé.
- **CSS sanitizado** — o `customHeadScript` é parseado: se tem `<script>`, extrai o conteúdo e executa via `next/script`; se tem só tags meta/link, renderiza direto. Bloqueia event handlers e `javascript:` URIs.
- **Performance**:
  - `unstable_cache` em `getFunnelMetadata` e `getFunnelFull` com tag `funnels` (revalidate: 60s).
  - **ISR** com `export const revalidate = 60` + `dynamicParams = true`.
  - **Open Graph + Twitter Card** + canonical para custom domain.
  - **Preconnect/dns-prefetch** para Cloudinary, Facebook, Google Fonts.
  - `robots: noindex` se funil banido.

### 🎨 Dashboard do cliente `/dashboard` (Apple-like premium)
- **Hero** com saudação personalizada ("Bom dia, João 👋") + contador de projetos.
- **4 StatCards** (Total, Publicados, Sessões, Rascunhos) no topo.
- **Toolbar** com busca, filtros de status (Todos/Publicados/Rascunhos), sort, **toggle Grid/List**.
- **Empty state ilustrado** com hero card dark gradient + 3 templates populares clicáveis.
- **`FunnelCard.tsx`** com **layout dual** (grid/list), top border colorida por status, menu de ações no DropdownMenu (Abrir / Visualizar / Analytics / Duplicar / Configurações / Deletar).

### ⚙️ Configurações do funil `/dashboard/[id]/settings` (split layout)
- **`SettingsClient.tsx`** novo com layout split (sidebar 220px + conteúdo).
- **6 seções**: Geral / Domínio & URL / Rastreamento / SEO & Meta / Integrações / Zona de Perigo.
- **Sticky header** com título, badge "Alterações não salvas" (dirty state), botão Salvar inteligente.
- **Slug ao vivo** com input customizado (prefixo `kuiz.digital/`) + botão copiar.
- **Integrações** com cards de Mailchimp/ConvertKit/ActiveCampaign/Hotmart/Kiwify/Zapier.
- **Zona de Perigo** com `DangerAction` component.
- **Bug fix**: scroll da página (de `min-h-screen` → `h-full overflow-y-auto` para respeitar o `<main overflow-hidden>` do layout).

### 🎛️ PropertiesPanel (refinamento visual)
- **Estado vazio** modernizado: ícone gradient blue→purple com glow, atalhos rápidos (⌘K, ⌘D, ⌫).
- **Cabeçalho** com ícone settings + label "PROPRIEDADES" + nome do tipo + botão delete inline.

### 🪞 Renderer refactor (preview = página final)
- **`src/components/renderer/FunnelLivePreview.tsx`** — renderer canônico único, usado por:
  1. Página publicada (`/f/[id]`)
  2. Preview "live" do Canvas (toggle Edit ↔ Preview)
  3. Modo editor (com contornos de seleção)
- **`src/components/renderer/ComponentRenderers.tsx`** — 16 wrappers finos mapeando cada `ComponentType` para o renderer existente (lazy load via `require()`).
- **Toggle Edit/Preview** no topo do Canvas — quando em Preview, oculta DnD e mostra **exatamente** o que vai para o ar.

### 🐛 Bug fix crítico
- **Conflito `metadata` + `generateMetadata`**: o Next 16 proíbe ter ambos no mesmo arquivo. Removido o `export const metadata` static, mantendo apenas o `generateMetadata` dinâmico (que já cobre title, description, og, twitter, canonical, robots).

### 📁 Arquivos modificados/criados (Fase 4)
- `src/components/renderer/FunnelShell.tsx` — novo
- `src/components/renderer/FunnelBlockedScreen.tsx` — novo
- `src/components/renderer/FunnelLivePreview.tsx` — novo
- `src/components/renderer/ComponentRenderers.tsx` — novo
- `app/f/[funnelId]/page.tsx` — ISR + cache + metadata dinâmica
- `app/dashboard/DashboardClient.tsx` — redesign
- `app/dashboard/[funnelId]/DashboardAnalyticsClient.tsx` — novo (substituiu o `page.tsx` direto)
- `app/dashboard/[funnelId]/settings/SettingsClient.tsx` — novo
- `src/components/builder/PropertiesPanel.tsx` — header + empty state
- `src/components/builder/Canvas.tsx` — toggle Edit/Preview

---

## ✅ Fase 5 — Leads & UTM (caixa de entrada + popover)

**Objetivo**: resolver problemas de UX do "Respostas & Leads" (não rolava, UTMs em 3 colunas, respostas sem label).

### 🐛 Bugs corrigidos
1. **Popup "Tem certeza que deseja excluir"** ao deletar componente no builder — **removido** em 3 locais (Canvas.tsx, PropertiesPanel.tsx × 2).
2. **Settings não rolava para baixo** — fix com `h-full overflow-y-auto`.

### 📊 Página `/dashboard/[id]/leads` (reescrita)
- **`app/dashboard/[id]/leads/page.tsx`** — server-side com tabs (server-driven via `?tab=`).
- **KPIs** (4 cards): Total de Visitantes, Leads Adquiridos, Taxa de Conversão, Tempo Médio.
- **Tabs** com badge de count: Visitantes / Leads.
- **Toolbar**: busca + filtros de status (Todos/Leads/Convertidos/Visitas).
- **`VisitorsTable.tsx`** (novo) — tabela compacta com UTM cell única:
  - Coluna **UTM** (1 única, não 3): badge clicável com `utm_source` + contador `+N` de UTMs adicionais. Popover com todos os 5 UTMs (source/medium/campaign/content/term) + referrer.
  - Cada step tem **número + label + % + barra vertical fininha colorida**.
  - Modal de detalhes (botão olho) com lead identificado + respostas por etapa (com label) + UTM completa.
- **`LeadsInbox.tsx`** (novo) — caixa de entrada dedicada de leads:
  - Lista compacta à esquerda (avatar + nome + "há X min") + busca.
  - Painel de detalhes à direita com: lead identificado (dados clicáveis para copiar), respostas por etapa com label, UTMs em pills (Source/Medium/Campaign/Ad/AdSet).
  - **Botão "Exportar"** que gera CSV só com leads identificados (nome/email/telefone + respostas por etapa + UTMs).
- **`LeadsActions.tsx`** — botão "Exportar todos" + "Limpar tudo" (sem `confirm()`).

### 🎯 Input registrando corretamente no quiz
- **Antes**: `onChange` em cada tecla disparava `trackLead` (múltiplas requisições, lead falso).
- **Agora**: `onBlur` no `input` (renderer) → 1 chamada por campo preenchido.
- **Detecção de nome** melhorada no `FunnelPageClient`: além de procurar "nome" na label, também olha o `name` do input.

### 🔍 Verificação do sistema de UTM
- ✅ `useFunnelTracker.ts` captura `utm_source/medium/campaign/term/content` da URL.
- ✅ `/api/track/init/route.ts` persiste em `VisitorSession`.
- ✅ Scripts customizados (UTMify, Hotjar, Clarity) entram via `customHeadScript` e são sanitizados com DOMPurify.
- ✅ UTM aparece em **Respostas & Leads** e na **página do admin de detalhes do funil**.

### 📁 Arquivos modificados/criados (Fase 5)
- `app/dashboard/[funnelId]/leads/page.tsx` — reescrito
- `app/dashboard/[funnelId]/leads/VisitorsTable.tsx` — novo
- `app/dashboard/[funnelId]/leads/LeadsInbox.tsx` — novo
- `app/dashboard/[funnelId]/leads/LeadsActions.tsx` — reescrito (sem `confirm()`)
- `src/components/ui/tabs.tsx` — adicionado `TabBar` (depois movido para `TabBar.tsx` por bug do "use client")
- `src/components/ui/TabBar.tsx` — novo (server component, URL-driven)
- `src/components/renderer/FunnelEngine.tsx` — `onBlur` no input
- `app/f/[funnelId]/FunnelPageClient.tsx` — heurística de nome
- `app/dashboard/[funnelId]/settings/SettingsClient.tsx` — `h-full overflow-y-auto`

---

## ✅ Fase 6 — Dashboard Analytics (responsivo + UTM cell)

**Objetivo**: refazer `/dashboard/[id]/page.tsx` (Dashboard Analytics) para desktop + mobile, com barras verticais pequenas e UTM cell única com popover.

### 🖥️ Layout responsivo
- **Desktop** (`hidden md:block`): tabela com colunas dinâmicas.
- **Mobile** (`md:hidden`): cards empilhados com avatar + nome + timestamp + badges UTM + respostas inline.
- **Container com scroll**: `h-full overflow-y-auto` no client (funciona dentro do `<main overflow-hidden>` do layout).

### 📊 KPIs (4 em vez de 5)
- **Visitantes** · **Leads** · **Conversão %** · **Conclusão %**
- Removido o duplicado "Leads Qualificados" e o "Funis Completos" que tinha cálculo fake (`Math.floor(totalLeads * 0.6)`).

### 📏 Barra de retenção vertical pequena
- Cabeçalho da etapa: **número da etapa** + **label completo** (`Etapa 1 · Título`) + **`X%`** (bold) + **`N respostas`** + **barra vertical fininha** (1px) colorida (`emerald ≥70`, `amber ≥40`, `red` senão).
- Compacta, sem inflar a altura da linha.

### 🔗 Coluna UTM única (com popover)
- **Badge clicável** com `utm_source` + contador `+N` (campaign/content/term/medium).
- **Popover** ao clicar com **todos os 5 UTMs** + Referrer (com ícone pra cada um: Tag, Megaphone, Target, Layers, Hash).
- Substitui as 3 colunas `Campanha/Anúncio/Conjunto`.

### 📁 Arquivos modificados/criados (Fase 6)
- `app/dashboard/[funnelId]/page.tsx` — server-side simplificado
- `app/dashboard/[funnelId]/DashboardAnalyticsClient.tsx` — novo (client-side, responsivo)

---

## ✅ Fase 7 — Webhook System (Cakto / Stripe / Hotmart / Kiwify / Eduzz / Braip)

**Objetivo**: receber webhooks de pagamento de qualquer provedor, identificar customer, criar/estender assinatura automaticamente, e dar ao admin visibilidade completa + config fácil.

### 🗄️ Banco de dados (migration idempotente: `prisma/migrations/20260612010000_webhooks/migration.sql`)
- **`WebhookEvent`** — todo evento recebido (raw + parsed + status + IP/UA + affected user + idempotência por `externalId`).
- **`PlanMapping`** — mapeia `provider + product_id` → `kuizPlan + periodDays`. Unique constraint em `(provider, externalProductId)`.
- **`WebhookConfig`** — secret HMAC por provedor (com `isActive` e `acceptedEvents`).

### 🧠 Lib
- **`src/lib/webhook-parser.ts`** — parsers para **Cakto, Stripe, Hotmart, Kiwify, Eduzz, Braip** + genérico (best-effort). Retorna `{customer, product, payment, confidence, notes}` normalizado. Detecta automaticamente pelo payload/headers.
- **`src/lib/webhook-signature.ts`** — validação **HMAC SHA-256** timing-safe (compat com Cakto/Stripe). Sem secret = modo dev (aceita tudo).
- **`src/lib/webhook-processor.ts`** — fluxo completo:
  1. Persiste evento bruto (status `pending`)
  2. Faz parse
  3. **Idempotência** por `externalId` (marca como `duplicate` se já processado)
  4. **Ignora** se status ≠ `paid`
  5. **Falha** se email ausente
  6. Procura `PlanMapping` (provider + product_id) para descobrir plano Kuiz
  7. **Cria usuário** se não existir (com senha temporária)
  8. **Estende `subscriptionEndsAt`** em +periodDays (acumulativo se já ativo)
  9. **Cria `SubscriptionTransaction`**
  10. Marca evento como `processed`

### 🔌 Endpoints
- **`POST /api/webhooks/cakto`** — público, aceita qualquer provedor via `?provider=` (compat com Cakto/Stripe/etc). Valida HMAC se houver config. Retorna sempre 200 (evita retry loop).
- **`GET /api/admin/webhooks`** — lista eventos (com filtros: status, provider, busca).
- **`POST /api/admin/webhooks`** — cola payload manual OU reprocessa evento.
- **`PUT /api/admin/webhooks`** — só parsear (preview sem persistir).
- **`GET/POST /api/admin/plan-mappings`** + **`PATCH/DELETE /api/admin/plan-mappings/[id]`**.
- **`GET/POST /api/admin/webhook-configs`** — secret HMAC por provedor.

### 🎨 Admin UI `/admin/webhooks` (4 abas)
1. **Eventos** — tabela com filtros (status/provedor/busca), modal de detalhes (com payload cru + botão "Reprocessar" + copiar JSON).
2. **Colar payload** — admin cola JSON do provedor, vê o parse em tempo real, e clica "Processar e creditar" para criar/estender assinatura.
3. **Mapeamento de planos** — CRUD para `PlanMapping` (provedor + product_id + plano Kuiz + periodicidade).
4. **Configurações** — secret HMAC por provedor (campo password, URL do webhook visível, botão "Copiar URL" em cada provedor).

### 🔐 Segurança
- **HMAC SHA-256** com timing-safe compare.
- Sem secret = aceita (modo dev) mas loga warning.
- Retorna sempre 200 (mesmo em duplicate/ignored/failed) para evitar loop de retry.
- Log de auditoria quando admin reprocessa manualmente.

### 💰 Dashboard Financeiro (refatorado)
- 4 StatCards: Receita total, Este mês, Assinaturas ativas, Webhooks count (clicável).
- Tabela de transações com badges coloridos.
- Empty state orienta: "Configure webhooks em /admin/webhooks".
- API `GET /api/admin/finance` agora retorna `totalRevenue`, `thisMonth`, `activeSubs`, `webhookCount`.

### 📁 Arquivos modificados/criados (Fase 7)
- `prisma/schema.prisma` — `WebhookEvent`, `PlanMapping`, `WebhookConfig`
- `prisma/migrations/20260612010000_webhooks/migration.sql` — novo
- `src/lib/webhook-parser.ts` — novo
- `src/lib/webhook-signature.ts` — novo
- `src/lib/webhook-processor.ts` — novo
- `app/api/webhooks/cakto/route.ts` — refeito (genérico)
- `app/api/admin/webhooks/route.ts` — novo (GET/POST/PUT)
- `app/api/admin/plan-mappings/route.ts` — novo
- `app/api/admin/plan-mappings/[id]/route.ts` — novo
- `app/api/admin/webhook-configs/route.ts` — novo
- `app/admin/webhooks/page.tsx` — novo
- `app/admin/layout.tsx` — adicionado item "Webhooks" no nav
- `app/admin/finance/page.tsx` — refeito
- `app/api/admin/finance/route.ts` — refeito

---

## ✅ Fase 8 — Landing Page Redesign + `/webhook-info`

**Objetivo**: modernizar a landing page (página raiz) com conteúdo mais rico (Como funciona, FAQ, depoimentos, integrações visuais) e criar página pública de instruções de webhook com URL copy-paste.

### 🏠 Landing page `/` (reescrita completa)
**Estrutura (8 seções)**:
1. **Nav fixa** com 5 links (Recursos / Como funciona / Integrações / Preços / FAQ) + Entrar / **Começar Grátis** (gradient on hover). Mobile: drawer funcional.
2. **Hero** — badge "Novo · Templates com IA" pulsante + título com gradient `bg-clip-text` ("Crie quizzes que vendem por você") + 2 CTAs + prova social (5 avatars gradient + 5 stars + 4.9 rating).
3. **Mockup 3D** do builder (efeito mouse follow tilt) com sidebar + canvas + floating badges ("98% Conclusão" / "Pixel Ativo").
4. **Trust bar** — logos de Cakto/Hotmart/Stripe/Kiwify/Eduzz/Braip.
5. **Bento Recursos** (5 cards): Editor Visual (2 col), Analytics Tempo Real (preto), Webhook+UTMs (novo), Performance, LGPD.
6. **Como funciona** (4 steps): número grande + ícone + título + descrição + setas conectoras entre steps.
7. **Depoimentos** (3 cards) com quote icon, stars, avatar gradient, cargo.
8. **Integrações** (12 grid): Cakto, Stripe, Hotmart, Kiwify, Eduzz, Facebook, Google Ads, TikTok, Webhook, Mailchimp, Zapier, WhatsApp — cada um com emoji e cor.
9. **Preços** (3 cards com toggle Mensal/Anual e badge "POPULAR" no Pro). Pro: R$ 97/mês ou R$ 77/mês anual (20% off).
10. **FAQ** (accordion com 6 perguntas) — código, pagamentos, LGPD, domínios, concorrentes.
11. **CTA final** com gradient blob + 3 trust badges.
12. **Footer** rico: 4 colunas (Produto / Empresa / Legal) + logo + © ano dinâmico + "Feito com ♥ no Brasil".

### 🔗 `/webhook-info` (página pública)
- **Box destacado** com URL `https://kuiz.digital/api/webhooks/cakto` + botão **Copy**.
- Dica: "funciona com qualquer provedor".
- Bloco sobre colar payload manual.
- **6 cards** com passo a passo por provedor (Cakto, Stripe, Hotmart, Kiwify, Eduzz, Braip) — gradient top accent, emoji, lista numerada.
- CTA final pra `/admin/webhooks`.

### 🔗 Integração admin ↔ webhook-info
- Botão **"Como configurar o webhook"** no header do `/admin/webhooks` (com ícone ExternalLink).
- Botão **"Copiar URL"** em cada provedor na aba Configurações.
- Link **"Ver passo a passo"** na aba Configurações.

### 📁 Arquivos modificados/criados (Fase 8)
- `app/page.tsx` — reescrito
- `app/webhook-info/page.tsx` — novo
- `app/webhook-info/CopyButton.tsx` — novo
- `app/admin/webhooks/page.tsx` — link + botão "Copiar URL" adicionados

---

## 💡 Sugestões de novas funcionalidades (brainstorm registrado)

> Estas são ideias para roadmap futuro, **não implementadas ainda**. Selecionamos juntos.

### 🎯 Builder / UX
1. **A/B Testing nativo** de steps com variantes, tracking automático, vencedor com base em conversão.
2. **AI Copy Helper** com OpenAI para gerar headlines/descrições/perguntas baseado no tema.
3. **AI Image Generator** integrado a DALL-E/Replicate para criar imagens sem sair do builder.
4. **Biblioteca de blocos salvos** — salvar componentes custom como templates reutilizáveis.
5. **Pastas/Tags para organizar funis**.
6. **Multi-idioma por step** (i18n) — criar versão EN/ES de cada step com 1 clique.
7. **Comentários em etapas** (colaboração) — admin e dono podem deixar notas por step.
8. **Lógica condicional avançada** — `if user.email contains @gmail → step A, else step B`.
9. **Pixel próprio + webhooks de saída** (Zapier, n8n, Make) por funil.
10. **Embed JS** — script para colar funil em site externo (`<script src="..."></script>`).
11. **White-label total** (logo, cores, domínio).
12. **Live preview mobile** dentro do builder (split view lado a lado).

### 📊 Analytics
13. **Heatmap de cliques** dentro do funil.
14. **Funil de retenção visual** (Sankey diagram).
15. **Cohort analysis** (leads por semana/mês de aquisição).
16. **Atribuição multi-touch** — qual campanha/conjunto/anúncio gerou cada lead.
17. **Exportação para BigQuery / Google Sheets** automática.
18. **Alertas inteligentes** — "esse funil perdeu 30% de conversão essa semana".

### 🏪 Monetização
19. **Programa de afiliados** com comissão recorrente (10% por exemplo).
20. **Marketplace de templates** (criadores vendem templates).
21. **Plano "Pay-per-Lead"** (alternativo a assinatura fixa).
22. **Upsell no checkout** (anual com desconto).
23. **Cupom via link de indicação** (ex: `/r/CODIGO` → aplica cupom + tracking).

### 🔌 Integrações
24. **WhatsApp Business API** — botão "enviar lead no Zap" + notificação no WhatsApp do dono.
25. **Telegram bot** — recebe leads em tempo real.
26. **n8n / Make / Zapier** nativo com OAuth.
27. **Mailchimp / ConvertKit / ActiveCampaign** sync.
28. **Google Calendar / Calendly** — agendar reunião para leads qualificados.
29. **Hotmart / Kiwify / Eduzz** — webhook de venda (atribuição final).
30. **Google Ads / Meta Ads** offline conversions sync.

### 🛡️ Admin
31. **Maintenance mode** com página de aviso customizável.
32. **Gestão de domínios pendentes** (CNAMEs apontando mas sem SSL).
33. **Aprovação de novos signups** (KYC leve para enterprise).
34. **IP allowlist para admin** (whitelist de IPs).
35. **2FA obrigatório para admin**.
36. **Detecção de abuso** (muitos funis de uma vez, mesmo template, leads fake).
37. **Broadcast por canal** (in-app + email + push).
38. **Agendamento de broadcast** (enviar em data/hora futura).
39. **Templates de email** para onboarding, renovação, win-back.

### ⚡ DevOps / Performance
40. **Migrar para Astro** (página do funil público) — 100% SSG com islands. **Estudo de viabilidade pronto** em `docs/ASTRO_VIABILITY.md`.
41. **Redis (Upstash) para rate limit** + cache de queries.
42. **CDN edge para assets do renderer**.
43. **Lazy hydration** de componentes pesados.
44. **PWA** do dashboard (instalável).

### 🆕 Próximas fases (Fase 9+)
- **Fase 9 (próxima)**: AI Features (copy helper, image generator, lógica condicional).
- **Fase 10**: A/B Testing + Heatmap.
- **Fase 11**: Integrações (WhatsApp, Mailchimp, Calendly).
- **Fase 12**: Migração para Astro.
- **Fase 13**: White-label + Marketplace.
- **Fase 14**: Mobile PWA.

---

## 📂 Histórico de arquivos (resumo consolidado)

### Banco de dados
- `prisma/schema.prisma` — todos os modelos (User, Funnel, FunnelStep, FunnelComponent, VisitorSession, Event, Integration, SubscriptionTransaction, WebhookLog, SystemLog, AdminAction, AdminNote, FunnelNote, Coupon, CouponRedemption, Broadcast, WebhookEvent, PlanMapping, WebhookConfig).
- `prisma/migrations/20260612000000_phase2_admin_power/migration.sql` — AdminNote, FunnelNote, Coupon, Broadcast.
- `prisma/migrations/20260612010000_webhooks/migration.sql` — WebhookEvent, PlanMapping, WebhookConfig.

### Bibliotecas / Libs
- `src/lib/sanitize.ts` — DOMPurify wrapper.
- `src/lib/audit.ts` — logAdminAction.
- `src/lib/broadcast.ts` — segmentação de usuários.
- `src/lib/lgpd.ts` — export LGPD/GDPR.
- `src/lib/templates.ts` — 5 templates + getter.
- `src/lib/webhook-parser.ts` — parsers multi-provedor.
- `src/lib/webhook-signature.ts` — HMAC SHA-256.
- `src/lib/webhook-processor.ts` — fluxo de processamento.
- `src/hooks/useAutoSave.ts` — reescrito com debounce + diff.
- `src/store/builderStore.ts` — snapshots, action descriptions, lastActionDescription.

### UI Base
- `src/components/ui/button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `tabs.tsx`, `popover.tsx`, `select.tsx`, `dropdown-menu.tsx`, `separator.tsx`, `table.tsx`, `badge.tsx`, `Avatar.tsx`, `Skeleton.tsx`, `EmptyState.tsx`, `StatCard.tsx`.
- `src/components/ui/TabBar.tsx` — novo (server, URL-driven).
- `app/globals.css` — design system.

### Builder
- `app/builder/[funnelId]/BuilderPageClient.tsx` — ⌘K, ⌘S, History, Copiar link, save indicator.
- `src/components/builder/CommandPalette.tsx` — novo.
- `src/components/builder/SortableComponent.tsx` — drop zones visuais.
- `src/components/builder/EmptyCanvasState.tsx` — novo.
- `src/components/builder/StepsPanel.tsx` — redesign com toggle Lista/Mapa.
- `src/components/builder/SaveStatusIndicator.tsx` — 5 estados.
- `src/components/renderer/FunnelShell.tsx`, `FunnelBlockedScreen.tsx`, `FunnelLivePreview.tsx`, `ComponentRenderers.tsx`.

### Dashboard
- `app/dashboard/DashboardClient.tsx` — redesign.
- `app/dashboard/[funnelId]/DashboardAnalyticsClient.tsx` — novo.
- `app/dashboard/[funnelId]/leads/VisitorsTable.tsx` — novo.
- `app/dashboard/[funnelId]/leads/LeadsInbox.tsx` — novo.
- `app/dashboard/[funnelId]/leads/LeadsActions.tsx` — refeito.
- `app/dashboard/[funnelId]/settings/SettingsClient.tsx` — novo.
- `src/components/dashboard/DashboardHeader.tsx` — async com menu.
- `src/components/dashboard/FunnelCard.tsx` — DropdownMenu.
- `src/components/dashboard/NewProjectDialog.tsx` — 2 steps com galeria.

### Admin
- `app/admin/layout.tsx` — sidebar + drawer mobile.
- `app/admin/page.tsx` — Visão Geral com gráfico real.
- `app/admin/funnels/page.tsx` — bulk actions.
- `app/admin/funnels/[id]/page.tsx` — analytics do funil.
- `app/admin/users/page.tsx` — link para detalhes.
- `app/admin/users/[id]/page.tsx` — novo.
- `app/admin/audit/page.tsx` — novo.
- `app/admin/coupons/page.tsx` — novo.
- `app/admin/broadcasts/page.tsx` — novo.
- `app/admin/webhooks/page.tsx` — novo (4 abas).
- `app/admin/finance/page.tsx` — refeito.

### Landing + Webhook Info
- `app/page.tsx` — landing page redesenhada.
- `app/webhook-info/page.tsx` — novo.
- `app/webhook-info/CopyButton.tsx` — novo.

### APIs
- `app/api/admin/stats/route.ts` — métricas + chart real.
- `app/api/admin/funnels/route.ts` — busca + filtro status.
- `app/api/admin/funnels/[funnelId]/route.ts` — analytics.
- `app/api/admin/funnels/[funnelId]/ban/route.ts` — com log.
- `app/api/admin/funnels/[funnelId]/notes/route.ts` — anotações.
- `app/api/admin/funnels/notes/[noteId]/route.ts` — delete.
- `app/api/admin/funnels/bulk/route.ts` — ações em massa.
- `app/api/admin/users/route.ts` — log + diff.
- `app/api/admin/users/[id]/route.ts` — detalhe.
- `app/api/admin/users/[userId]/notes/route.ts` — anotações.
- `app/api/admin/users/notes/[noteId]/route.ts` — delete.
- `app/api/admin/users/[userId]/export/route.ts` — LGPD.
- `app/api/admin/coupons/route.ts` + `[id]` — CRUD.
- `app/api/admin/broadcasts/route.ts` — GET/POST + preview.
- `app/api/admin/audit/route.ts` — listagem.
- `app/api/admin/impersonate/route.ts` — com log.
- `app/api/admin/webhooks/route.ts` — GET/POST/PUT.
- `app/api/admin/plan-mappings/route.ts` + `[id]` — CRUD.
- `app/api/admin/webhook-configs/route.ts` — GET/POST.
- `app/api/funnels/templates/route.ts` — listar templates.
- `app/api/funnels/create/route.ts` — criar com template.
- `app/api/webhooks/cakto/route.ts` — público genérico.

---

**Versão**: 1.1.0
**Data**: 12/06/2026 (atualizado)
**Próxima revisão**: início da Fase 9 (AI Features)

> 💡 **Dica para amanhã**: leia primeiro a seção "Visão Geral" para contexto, depois a "Fase mais recente" (Fase 8) para entender o estado atual. As Fases 1-3 são fundação, podem ser consultadas sob demanda. O Roadmap mostra o que vem a seguir.
