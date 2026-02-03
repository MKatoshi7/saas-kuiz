# GUIA COMPLETO: Resetando Domains do Zero (Cloudflare + Vercel)

Se você sente que "zuou" a configuração, a melhor coisa é **limpar** e fazer o básico que funciona sempre. Siga estes passos na ordem exata.

---

## PASSO 1: Limpar o Cloudflare (Zerando o DNS)

Acesse sua conta no Cloudflare > Selecione o domínio `kuiz.digital` > Vá em **DNS**.

**1. Apague TUDO que for relacionado ao site:**
(Sim, pode apagar sem medo para refazer certo)
- ❌ Apague qualquer registro **A** com nome `kuiz.digital`
- ❌ Apague qualquer registro **CNAME** com nome `www`
- ❌ Apague qualquer registro **CNAME** com nome `*`
- ❌ Apague qualquer registro **NS** que aponte para `vercel`

*(Nota: Não apague registros MX (Email) ou TXT (Verificações do Google/Facebook), esses podem ficar)*

---

## PASSO 2: Configurar o Cloudflare (Do Jeito Certo)

Adicione APENAS estes 3 registros. 
**IMPORTANTE:** Em "Proxy Status", deixe **Desativado (DNS Only)** ou ícone de nuvem cinza/transparente. Não use a nuvem laranja agora.

| Tipo | Nome (Name) | Conteúdo (Target/Content) | Proxy Status |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | **DNS Only (Cinza)** ☁️ |
| **CNAME** | `www` | `cname.vercel-dns.com` | **DNS Only (Cinza)** ☁️ |
| **CNAME** | `*` | `cname.vercel-dns.com` | **DNS Only (Cinza)** ☁️ |

*O registro `*` é o segredo para os subdomínios funcionarem.*

---

## PASSO 3: Limpar a Vercel

1. Acesse seu projeto na Vercel
2. Vá em **Settings** > **Domains**
3. **Remova** todos os domínios da lista (clique em Edit > Remove). Vamos adicionar limpo.

---

## PASSO 4: Adicionar na Vercel

Ainda em **Settings** > **Domains**, adicione um por um:

1. **Adicione:** `kuiz.digital`
   - A Vercel vai sugerir adicionar `www.kuiz.digital` automaticamente. **Aceite**.
   - Se perguntar a forma de configuração, escolha **"Recommended"** ou verifique se os dois checks (Configuration e SSL) ficam verdes.

2. **Adicione:** `*.kuiz.digital`
   - Digite `*.kuiz.digital` e clique em Add.
   - Isso habilita os subdomínios (wildcard).

---

## Como saber se (agora sim) funcionou?

1. **Acesse:** `https://kuiz.digital` (Deve abrir seu site)
2. **Acesse:** `https://www.kuiz.digital` (Deve abrir seu site)
3. **Acesse:** `https://teste123.kuiz.digital` (Deve abrir seu site, provavelmente redirecionando ou mostrando erro 404 estilizadado, MAS **com cadeado de segurança**).

Se o cadeado (SSL) aparecer nos 3, parabéns! Você consertou. 🎉
