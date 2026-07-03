# 🚀 Estudo de Viabilidade — Migrar `/f/[funnelId]` para Astro

> Documento de pesquisa técnica. **Decisão final ainda não tomada.**
> Trade-offs, ganhos esperados, plano de migração incremental.

---

## 🎯 Por que migrar SÓ a página pública (`/f/[funnelId]`)?

A página pública do funil é o que **mais impacto tem em receita** e **mais cara de escalar**:
- 95%+ das requisições do sistema são visitas a `/f/[funnelId]`.
- Cada visita precisa carregar tema, steps, componentes, tracking pixels.
- Conversão cai com cada 100ms de latência (regra empírica: -7% por segundo extra).
- SEO: o Google indexa essas páginas; Core Web Vitals impactam ranking.

**O resto do app (dashboard, builder, admin) NÃO precisa migrar** — são apps internos com muito JS interativo, onde React/Next brilha.

---

## 📊 Ganhos estimados

### Lighthouse Score (estimado)

| Métrica | Atual (Next.js) | Com Astro | Ganho |
|---|---|---|---|
| Performance | 75-85 | **95-100** | +15-20 pts |
| LCP (Largest Contentful Paint) | 2.4s | **0.8-1.2s** | -50% a -60% |
| TBT (Total Blocking Time) | 200-400ms | **0-50ms** | -75% a -90% |
| FCP (First Contentful Paint) | 1.5s | **0.5-0.8s** | -50% a -65% |
| JS Bundle (página) | 250-400KB | **15-30KB** | -85% a -95% |
| Time to Interactive | 3.5s | **1.2-1.8s** | -50% a -65% |

### Por que tanto ganho?

Astro envia **zero JS por padrão**. Componentes interativos (botões, quiz-options, formulários) viram **"islands"** que hidratam sob demanda (`client:load`, `client:visible`, `client:idle`).

Para uma página de quiz estática que precisa de:
- 1 botão "próximo" → **1 island** (~5KB)
- 1 quiz-option → **1 island** (~5KB)
- 1 timer → **1 island** (~3KB)
- 1 VSL video → **1 island** (YouTube/Vimeo embed)

Total: **~20-30KB de JS** vs 250-400KB do Next.js atual.

---

## 🏗️ Arquitetura proposta

### Estrutura de pastas
```
apps/
├── web/                 # Next.js (atual, mantém tudo: dashboard/builder/admin/auth)
│   ├── app/
│   ├── src/
│   └── package.json
└── public-funnel/       # Astro (NOVO, só para /f/*)
    ├── src/
    │   ├── pages/
    │   │   ├── index.astro              # health check
    │   │   ├── f/[funnelId].astro       # página do funil
    │   │   └── f/cname/[domain].astro   # custom domain
    │   ├── components/
    │   │   ├── islands/
    │   │   │   ├── QuizOption.tsx       # client:visible
    │   │   │   ├── ButtonNext.tsx
    │   │   │   ├── FormCapture.tsx
    │   │   │   ├── TimerCountdown.tsx
    │   │   │   ├── Confetti.tsx         # client:load
    │   │   │   ├── VSLPlayer.tsx
    │   │   │   └── ...
    │   │   ├── static/
    │   │   │   ├── Headline.astro
    │   │   │   ├── Paragraph.astro
    │   │   │   ├── Image.astro
    │   │   │   ├── Pricing.astro
    │   │   │   └── ...
    │   │   └── ThemeProvider.astro
    │   ├── lib/
    │   │   ├── api.ts          # client para chamar Next.js API
    │   │   ├── tracking.ts     # FB Pixel, GTM
    │   │   └── sanitize.ts
    │   ├── styles/
    │   └── package.json
├── packages/
│   ├── ui/                    # opcional: componentes compartilhados
│   └── types/                 # tipos do funil (compartilhado)
```

### Comunicação entre apps

**Opção A (recomendada)**: API REST
- Astro busca dados via `GET /api/public/funnel/[id]` (rota nova no Next).
- Tracking via `POST /api/track/event` (rota existente, com rate limit Redis).
- Lead capture via `POST /api/track/lead` (rota existente).

**Opção B**: Banco de dados compartilhado
- Astro lê direto do Postgres (mesma connection string).
- ⚠️ Acopla deploy dos dois apps.

**Opção C**: Edge function (Cloudflare Workers, Vercel Edge)
- Astro SSR no edge (Deno/Bun runtime).
- Cache agressivo com `revalidate`.

→ **Recomendado Opção A** (mais limpo, menor risco, pode cachear no CDN com TTL).

---

## 🚦 Plano de migração INCREMENTAL (zero downtime)

### Etapa 0 — Preparação (1-2 dias)
- [ ] Extrair tipos compartilhados para `packages/types` (FunnelComponent, FunnelTheme, etc).
- [ ] Extrair renderer atual do Next para um pacote `packages/renderer-react` (componentes visuais que rodam no builder também).
- [ ] Criar novo app `apps/public-funnel` com Astro.
- [ ] Setup deploy: Vercel (Astro suporta nativamente) ou Netlify.

### Etapa 1 — Modo "espelho" (1 semana)
- [ ] Implementar `/f/[funnelId]` em Astro lendo do mesmo banco.
- [ ] Adicionar feature flag `USE_ASTRO_FUNNEL` (env var).
- [ ] Middleware do Next: se flag ON → redirect 307 para o subdomínio `pub.kuiz.digital/f/[id]`.
- [ ] **Subdomínio separado** para que possamos voltar atrás instantaneamente.
- [ ] Smoke tests: visual side-by-side Next vs Astro, 5 funis diferentes.

### Etapa 2 — Canary (2 semanas)
- [ ] Ativar para **5% do tráfego** (random ou por hash do sessionId).
- [ ] Monitorar métricas: LCP, TBT, conversão, bounce rate.
- [ ] Comparar conversão entre Next e Astro (deve ser **≥ Next**, qualquer queda volta atrás).
- [ ] Ajustar: islands que precisam hidratar, fallback de imagens, etc.

### Etapa 3 — Rollout (2 semanas)
- [ ] Subir para 25% → 50% → 100% em waves de 1 semana.
- [ ] Acompanhar Core Web Vitals no Search Console.

### Etapa 4 — Decomissionar Next
- [ ] Remover `/f/[funnelId]` e `/f/cname/[domain]` do Next.
- [ ] Atualizar middleware para não fazer rewrite para esses paths.
- [ ] Manter `/api/track/*` no Next (recebe eventos do Astro).

---

## 🧩 Componentes que viram Islands

| Componente | Estratégia Astro | Justificativa |
|---|---|---|
| Headline | `.astro` (estático) | Sem JS |
| Paragraph | `.astro` | Sem JS |
| Image | `.astro` com `<Image>` | Sem JS, otimizado |
| Button (próximo) | Island `client:idle` | Hidrata após idle |
| Quiz-option | Island `client:visible` | Só quando entra na viewport |
| Form capture | Island `client:visible` | Só quando visível |
| Timer | Island `client:load` | Precisa contar tempo |
| VSL Video | Island `client:idle` | Player pesado |
| Confetti | Island `client:load` (com trigger) | Efeito visual |
| Pricing | `.astro` (estático) | Sem JS |
| Carousel | Island `client:visible` | Swipe/dots |
| Notification | `.astro` (banner estático) | Sem JS |
| Social Share | Island `client:idle` | Botões de share |

### Estimativa de JS por island
- `QuizOption` — ~3KB
- `FormCapture` — ~5KB (validação + submit)
- `Timer` — ~2KB
- `VSL` — ~8KB (player wrapper)
- `Confetti` — ~10KB (canvas-confetti)
- `ButtonNext` — ~1KB

**Total worst-case**: ~30KB (só carrega o que é usado no step atual).

---

## 💰 Custos estimados

### Infraestrutura
- Astro gera páginas estáticas no build → **cacheáveis no CDN por horas**.
- Com ISR (revalidate on demand quando funnel é atualizado) → **0 requests ao banco por visita**.
- Estimativa: **-60% a -80% nos custos de compute** da página pública.

### Manutenção
- 2 codebases ao invés de 1 → +~20% de overhead de manutenção.
- **Mitigação**: tipos compartilhados (monorepo) evitam drift.

---

## ⚠️ Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Render diferente Next vs Astro | Conversão cai | Smoke tests pixel-perfect + canary 5% |
| API tracking lenta | Conversão cai | Edge functions + cache de sessão no Redis |
| SEO ranking cair durante migração | Tráfego orgânico | Manter Next em paralelo via subdomínio; mudar DNS só após 100% verde |
| Hidratação de islands quebrar UX | Reclamações | Testes E2E com Playwright em todos os 16 tipos de componente |
| Onboarding de novos devs com 2 stacks | Velocidade | Docs claras + componentes UI compartilhados |

---

## 🤔 Alternativas ao Astro

| Alternativa | Ganho | Trade-off |
|---|---|---|
| **Manter Next.js com otimizações agressivas** | +30-50% | Sem chegar ao nível do Astro |
| **Remix (RARE stack)** | +30-40% | Curva de aprendizado, menos maduro |
| **Qwik (resumability)** | +200% em TTI | Ainda verde, comunidade pequena |
| **SvelteKit** | +80% | Reescrever componentes React em Svelte |

**Conclusão**: **Astro** continua sendo a melhor opção pelo **trade-off de ganho vs esforço** e pela **estabilidade da stack**.

---

## ✅ Recomendação

**Fazer a migração** seguindo o plano incremental de 4 etapas. Estimativa total: **6-8 semanas** com 1 dev full-time.

**Quando começar?**: Após a Fase 4 (UI polish + renderer fidelity) estiver concluída, para garantir que o que vai pra Astro já está visualmente perfeito.

**Quem faz?**: Pode ser eu mesmo em uma rodada futura, ou você pode delegar para um dev com experiência em Astro (sintaxe simples, fácil contratação).

---

## 📚 Referências

- [Astro Docs](https://docs.astro.build)
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Web Vitals Impact on Conversion](https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/)
- [Next.js to Astro migration case study](https://docs.astro.build/en/guides/migrate-to-astro/)
