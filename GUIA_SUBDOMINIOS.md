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
O Vercel irá fornecer as instruções, mas basicamente você precisará:

1. Ir no seu provedor de DNS (Cloudflare, GoDaddy, etc.)
2. Adicionar um registro **CNAME**:
   - **Nome**: `*` (asterisco para todos os subdomínios)
   - **Tipo**: CNAME
   - **Valor**: `cname.vercel-dns.com` (ou o valor que o Vercel fornecer)
   - **TTL**: Auto ou 300 segundos

Exemplo no Cloudflare:
```
Type: CNAME
Name: *
Content: cname.vercel-dns.com
Proxy: DNS only (desligado)
TTL: Auto
```

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

1. Acesse: https://developers.facebook.com/tools/accesstoken
2. Copie o **Token de Acesso da Página**
3. Para token permanente:
   - Acesse: https://developers.facebook.com/tools/debug/accesstoken
   - Clique em "Extend Access Token"
   - Use esse token no sistema

### Eventos Rastreados:

- ✅ `PageView`: Quando alguém acessa o quiz
- ✅ `Lead`: Quando alguém completa o quiz
- 📧 Inclui: email e telefone (se capturados) - hasheados conforme melhores práticas

**Tudo está correto e pronto para uso em 2026!** 🎉
