# Configuração de Subdomínios para Quizzes

## ✅ Status Atual
O middleware já está configurado para suportar subdomínios no formato:
- `http://desafiolowticket.kuiz.digital` → redireciona para `/f/desafiolowticket`
- `https://kuiz.digital/desafiolowticket` → funciona normalmente

## 🔧 Como Configurar os Subdomínios no DNS

### Opção 1: Vercel (Recomendado)

#### 1. Adicionar Wildcard Domain no Vercel
1. Acesse o dashboard do Vercel
2. Entre no projeto `saas-kuiz`
3. Vá em **Settings** → **Domains**
4. Clique em **Add Domain**
5. Digite: `*.kuiz.digital`
6. Clique em **Add**

#### 2. Configurar DNS

A Vercel oferece **duas opções** para configurar o wildcard domain:

##### **Opção A: Nameservers da Vercel** (Mais Simples - Recomendado se você NÃO usa o domínio para email)

Se você pode apontar todo o domínio `kuiz.digital` para a Vercel:

1. Vá no seu provedor de DNS (Cloudflare, GoDaddy, Registro.br, etc.)
2. Encontre a seção de **Nameservers**
3. Substitua os atuais por:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. Aguarde propagação (5-30 minutos)

**Vantagens:**
- ✅ Configuração automática
- ✅ SSL automático para todos os subdomínios
- ✅ Mais simples

**Desvantagens:**
- ❌ Move TODO o DNS para Vercel (emails podem parar de funcionar se não reconfigurar)
- ❌ Você precisa recriar TODOS os registros DNS na Vercel

##### **Opção B: Apenas CNAME** (Se você usa o domínio para outras coisas)

Se você precisa manter outros serviços (email, etc.) no domínio:

1. **NÃO mude os nameservers**
2. No seu provedor de DNS, adicione um registro **CNAME**:
   - **Nome**: `*` (asterisco para todos os subdomínios)
   - **Tipo**: CNAME
   - **Valor**: `cname.vercel-dns.com`
   - **TTL**: Auto ou 300 segundos

Exemplo no Cloudflare:
```
Type: CNAME
Name: *
Content: cname.vercel-dns.com
Proxy: DNS only (desligado - ícone cinza ☁️)
TTL: Auto
```

**Vantagens:**
- ✅ Mantém seus emails funcionando
- ✅ Mantém outros registros DNS intactos

**Desvantagens:**
- ⚠️ Alguns provedores de DNS não permitem CNAME wildcard (`*`)
- ⚠️ Se não funcionar, use a Opção A

#### 3. Aguardar Propagação
- A propagação do DNS pode levar de 5 minutos a 48 horas
- Normalmente leva entre 5-30 minutos

### Opção 2: Outro Provedor (VPS, Netlify, etc.)

Se estiver usando outro provedor, a configuração é similar:

1. Adicione um registro CNAME wildcard (`*`) apontando para o IP do servidor ou CNAME fornecido
2. Configure o servidor para aceitar qualquer subdomínio de `kuiz.digital`
3. O middleware do Next.js já está pronto para lidar com isso

## 📝 Como os Clientes Vão Escolher o Subdomínio

### No Painel de Configurações do Funil

Você precisa adicionar um campo no `SettingsForm.tsx` para o cliente escolher o slug/subdomínio:

```tsx
// Adicione este campo no SettingsForm
<div className="space-y-2">
    <Label htmlFor="slug">Subdomínio</Label>
    <div className="flex items-center gap-2">
        <Input
            id="slug"
            value={formData.slug || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="meu-quiz"
            className="flex-1"
        />
        <span className="text-sm text-gray-500">.kuiz.digital</span>
    </div>
    <p className="text-xs text-gray-500">
        Seu quiz ficará disponível em: https://{formData.slug || 'seu-quiz'}.kuiz.digital
    </p>
</div>
```

### Salvar no Banco de Dados

O campo `slug` já existe na tabela `Funnel`, então basta salvar:

```tsx
const handleSave = async () => {
    await fetch(`/api/funnels/${funnel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: formData.slug }),
    });
};
```

## ✅ Verificar se Está Funcionando

Para testar se os subdomínios estão funcionando:

1. Crie um quiz com slug `teste123`
2. Acesse `https://teste123.kuiz.digital`
3. Deve carregar o quiz normalmente

## 🔐 Certificado SSL Automático

- O Vercel emite certificados SSL automaticamente para todos os subdomínios wildcard
- Não é necessário configuração adicional

## 🚀 Próximos Passos

1. **Adicionar campo de slug** no painel de configurações
2. **Validar slug único**: Garantir que dois clientes não usem o mesmo slug
3. **Preview em tempo real**: Mostrar como ficará o URL enquanto o cliente digita
4. **Validação de caracteres**: Apenas letras, números e hífens

## 📧 Sobre o Facebook Pixel (CAPI)

### Status Atual ✅
O código está **100% correto** para 2026. A configuração atual já inclui:

1. **Facebook Pixel no `<head>`**:
   - Injeta automaticamente o script do pixel
   - Envia evento `PageView` no carregamento

2. **API de Conversões (CAPI) via servidor**:
   - Envia eventos `PageView` e `Lead` via servidor
   - Usa IP e User-Agent do visitante
   - Garante rastreamento mesmo com bloqueadores de ads
   - API Graph v19.0 (atual em 2026)

### O que você precisa configurar:

1. **No Painel de Configurações do Funil**:
   - Facebook Pixel ID: Seu ID do pixel (ex: `1234567890`)
   - Facebook Access Token: Token de acesso (ex: `EAAB...`)

### Como obter o Access Token:

#### **Passo 1: Acessar o Gerenciador de Eventos do Facebook**

1. Acesse: https://business.facebook.com/events_manager2
2. Selecione sua fonte de dados (Pixel)
3. Vá em **Configurações** (ícone de engrenagem)

#### **Passo 2: Gerar Token via API de Conversões**

1. Na aba **Configurações**, role até **API de Conversões**
2. Clique em **Gerar token de acesso**
3. OU acesse diretamente: https://business.facebook.com/events_manager2/list/pixel/YOUR_PIXEL_ID/settings

#### **Passo 3: Token Permanente (Recomendado)**

**IMPORTANTE**: O token padrão expira. Para obter um token de **longa duração** (não expira):

1. Vá para: https://developers.facebook.com/tools/accesstoken/
2. Copie o **User Access Token** da sua conta Business
3. Acesse: https://developers.facebook.com/tools/debug/accesstoken/
4. Cole o token e clique em **Debug**
5. Clique em **Extend Access Token** (parte inferior)
6. Copie o **novo token** gerado (este não expira)
7. **Guarde este token em local seguro!**

#### **Passo 4: Verificar Permissões**

Certifique-se de que o token tem as permissões:
- ✅ `ads_management`
- ✅ `business_management`

#### **Alternativa: Token de Sistema (Mais Seguro)**

Para produção, é recomendado usar um **System User Token**:

1. Acesse: https://business.facebook.com/settings/system-users
2. Crie um System User
3. Atribua acesso ao Pixel
4. Gere o token com permissões de `ads_management`
5. Este token **nunca expira** e é mais seguro

**Exemplo de Token:**
```
EAAB... (string longa de ~200+ caracteres)
```

### Eventos Rastreados:

- ✅ `PageView`: Quando alguém acessa o quiz
- ✅ `Lead`: Quando alguém completa o quiz
- 📧 Inclui: email e telefone (se capturados) - hasheados conforme melhores práticas

**Tudo está correto e pronto para uso em 2026!** 🎉
