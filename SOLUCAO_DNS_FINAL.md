# CORREÇÃO FOCADA: Cloudflare + Vercel
## O Diagnóstico
A Vercel está reclamando porque ela "quer" controlar o DNS via Nameservers (NS), mas nós estamos usando o Cloudflare (DNS Externo). Quando a Vercel vê que os NS não são dela, ela mostra "Invalid Configuration", mas nós podemos forçar ela a aceitar via registros CNAME/A.

O erro crítico é que o seu domínio raiz (`kuiz.digital`) ainda parece ter resquícios de registros errados ou a Vercel está confusa.

---

## 🚀 A SOLUÇÃO (Passo a Passo)

### 1. No Cloudflare (Garanta isso 100%)
Vá em DNS e confira se está **EXATAMENTE** assim. Se tiver qualquer coisa diferente (tipo IPs antigos `216...`), **DELETE**.

| Tipo | Nome | Conteúdo | Nuvem (Proxy) |
| :--- | :--- | :--- | :--- |
| **CNAME** | `*` | `cname.vercel-dns.com` | **CINZA (DNS Only)** |
| **CNAME** | `www` | `cname.vercel-dns.com` | **CINZA (DNS Only)** |
| **A** | `@` | `76.76.21.21` | **CINZA (DNS Only)** |

> **IMPORTANTE:** O IP `216.198.79.1` que a Vercel sugeriu é para setups antigos. O padrão moderno é `76.76.21.21`. Mantenha o `76...` ou use o `A` apontando para `76.76.21.21`.

### 2. Na Vercel (O Segredo)
O erro "Update your nameservers" aparece porque você adicionou o domínio tentando usar o método "Nameservers", mas nós queremos o método "A Record/CNAME".

**Faça isso agora:**

1.  Vá em **Domains**.
2.  **REMOVA** o `*.kuiz.digital`.
3.  **REMOVA** o `kuiz.digital`.
4.  Adicione novamente o `kuiz.digital`.
    *   Quando ele perguntar ou mostrar as opções, escolha a opção que diz **"Add A record 76.76.21.21"** ou **"CNAME cname.vercel-dns.com"**.
    *   **NÃO** escolha a opção "Vercel Nameservers".
5.  Adicione novamente o `*.kuiz.digital`.
    *   Selecione **"CNAME record"** se ele der opção.

### 3. Verificação Extra (TXT)
Às vezes, para provar que você é dono do domínio sem mudar os Nameservers, a Vercel pede um registro `TXT`.

1.  Olhe na tela da Vercel após adicionar.
2.  Se aparecer "Invalid Config" de novo, clique nele.
3.  Ele vai te dar um código `TXT` (algo como `_vercel-dns-auth...`).
4.  Copie e adicione no Cloudflare como um registro **TXT**.

---

### Resumo
Se você deixar no Cloudflare apenas o CNAME `*` apontando para `cname.vercel-dns.com` (Nuvem Cinza), a Vercel **TEM** que validar. O erro atual é ela esperando que você mude os Nameservers da raiz.
