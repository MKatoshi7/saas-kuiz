# 🚀 Configuração do Cloudinary na Vercel

## ✅ Implementação Concluída

A API de upload com Cloudinary foi implementada com sucesso!

---

## 📋 Próximo Passo: Adicionar Variáveis de Ambiente na Vercel

### 1. **Acesse o Dashboard da Vercel**
- Vá para: https://vercel.com/dashboard
- Selecione seu projeto `saas-kuiz`

### 2. **Navegue até Settings**
- Clique em **Settings** (no menu superior)
- No menu lateral, clique em **Environment Variables**

### 3. **Adicione as 3 Variáveis**

Adicione uma por vez:

#### Variável 1: CLOUDINARY_CLOUD_NAME
```
Name: CLOUDINARY_CLOUD_NAME
Value: dx1yw1vys
Environment: Production, Preview, Development (marque todas)
```

#### Variável 2: CLOUDINARY_API_KEY
```
Name: CLOUDINARY_API_KEY
Value: 625449445349997
Environment: Production, Preview, Development (marque todas)
```

#### Variável 3: CLOUDINARY_API_SECRET
```
Name: CLOUDINARY_API_SECRET
Value: 9012i0EL3yZTpDUShT4Xtz1WMdY
Environment: Production, Preview, Development (marque todas)
```

### 4. **Salvar**
- Clique em **Save** para cada variável

### 5. **Fazer Redeploy**
- Volte para a aba **Deployments**
- Clique nos 3 pontinhos (...) do último deployment
- Clique em **Redeploy**
- Aguarde o deploy terminar (~2 minutos)

---

## 🧪 Testar Upload

Após o redeploy:

1. Acesse seu site: `https://kuiz.digital`
2. Entre no builder de um funil
3. Adicione um componente de **Imagem**
4. Faça upload de uma imagem
5. ✅ A imagem deve ser enviada para o Cloudinary!

---

## 🔍 Como Verificar se Funcionou

### No Cloudinary:
1. Acesse: https://cloudinary.com/console
2. Vá em **Media Library**
3. Você verá a pasta `kuiz-uploads/`
4. Suas imagens estarão lá!

### No Site:
- A URL da imagem será algo como:
  ```
  https://res.cloudinary.com/dx1yw1vys/image/upload/v1234567890/kuiz-uploads/sua-imagem.jpg
  ```

---

## ✨ Benefícios Implementados

✅ **Otimização Automática**
- Imagens convertidas para WebP automaticamente
- Qualidade otimizada (auto:good)
- Redimensionamento automático (max 1920x1080)

✅ **CDN Global**
- Imagens servidas de servidores próximos ao usuário
- Carregamento ultra-rápido

✅ **Armazenamento Persistente**
- Imagens nunca são perdidas
- Sobrevivem a deploys

✅ **Sem Limite de Tamanho**
- 25GB de armazenamento grátis
- 25GB de banda mensal grátis

---

## 🛠️ Funcionalidades da API

### POST /api/upload
Upload de arquivo (drag & drop, file picker)

**Request:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('funnelId', 'optional-funnel-id');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { url } = await response.json();
```

### PUT /api/upload
Upload de URL (colar link de imagem)

**Request:**
```typescript
const response = await fetch('/api/upload', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/image.jpg',
    funnelId: 'optional-funnel-id'
  }),
});

const { url } = await response.json();
```

---

## 📊 Monitoramento

### Ver Uso do Cloudinary:
1. Acesse: https://cloudinary.com/console
2. Dashboard mostra:
   - Armazenamento usado
   - Banda usada
   - Número de imagens
   - Transformações realizadas

---

## ⚠️ Importante

### Variáveis Locais (.env):
Adicione também no seu `.env` local para desenvolvimento:

```env
CLOUDINARY_CLOUD_NAME="dx1yw1vys"
CLOUDINARY_API_KEY="625449445349997"
CLOUDINARY_API_SECRET="9012i0EL3yZTpDUShT4Xtz1WMdY"
```

**Nunca commite o arquivo `.env` no Git!**

---

## 🎯 Checklist

- [ ] Adicionar 3 variáveis de ambiente na Vercel
- [ ] Fazer redeploy do projeto
- [ ] Testar upload de imagem
- [ ] Verificar imagem no Cloudinary
- [ ] Adicionar variáveis no `.env` local

---

## 🆘 Problemas?

### Erro: "Upload failed"
- ✅ Verifique se as variáveis de ambiente estão corretas
- ✅ Verifique se fez redeploy após adicionar as variáveis
- ✅ Veja os logs na Vercel (Functions → Logs)

### Erro: "Invalid credentials"
- ✅ Copie e cole as credenciais exatamente como estão
- ✅ Não adicione espaços ou aspas extras

### Imagem não aparece
- ✅ Verifique a URL retornada pela API
- ✅ Teste a URL diretamente no navegador
- ✅ Verifique o console do navegador

---

## ✅ Tudo Pronto!

Após seguir esses passos, seu sistema de upload de imagens estará 100% funcional! 🎉
