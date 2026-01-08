# Sistema de URLs Personalizadas - Kuiz.digital

## ✅ Implementado com Sucesso

O sistema de URLs personalizadas está funcionando! Agora seus usuários podem acessar os quizzes de duas formas:

### 1. **URL com Slug Personalizado** (Recomendado)
```
https://kuiz.digital/nome-do-quiz
```

### 2. **URL Técnica** (Sempre funciona)
```
https://kuiz.digital/f/nome-do-quiz
```

---

## 📋 Como Configurar o Slug Personalizado

### Para o Usuário:

1. **Acesse as Configurações do Funil**
   - Entre no dashboard
   - Selecione o funil desejado
   - Clique em "Configurações" no menu lateral

2. **Configure o Subdomínio Kuiz**
   - Na seção "Subdomínio Kuiz", você verá um campo de texto
   - Digite o nome desejado (ex: `meu-quiz-incrivel`)
   - O sistema mostrará automaticamente: `meu-quiz-incrivel.kuiz.digital`
   - Clique em "Salvar"

3. **Regras para o Slug:**
   - ✅ Apenas letras minúsculas (a-z)
   - ✅ Números (0-9)
   - ✅ Hífens (-)
   - ❌ Sem espaços
   - ❌ Sem caracteres especiais (@, #, $, etc)
   - ❌ Sem letras maiúsculas

4. **Acesse seu Quiz**
   - Após salvar, seu quiz estará disponível em:
   - `https://kuiz.digital/meu-quiz-incrivel`

---

## ⚠️ Importante

### Alteração de Slug
- Quando você altera o slug, o link antigo **para de funcionar imediatamente**
- Certifique-se de atualizar todos os links em:
  - Anúncios do Facebook/Instagram
  - Links compartilhados
  - Bio do Instagram
  - Materiais impressos

### Slug Único
- Cada slug deve ser único no sistema
- Se alguém já estiver usando `meu-quiz`, você precisará escolher outro nome
- O sistema avisará se o slug já estiver em uso

---

## 🎯 Mudanças Implementadas

### 1. **Botões Invertidos no Builder**
- ✅ Agora o botão "Salvar" aparece ANTES do botão "Publicar"
- Ordem atual: **Preview → Salvar → Publicar**

### 2. **Rota de Slug na Raiz**
- ✅ Criada rota `app/[slug]/page.tsx`
- ✅ Aceita qualquer slug e busca no banco de dados
- ✅ Redireciona automaticamente para `/f/[slug]`
- ✅ Retorna 404 se o slug não existir

### 3. **Middleware Atualizado**
- ✅ Reconhece `kuiz.digital` como domínio principal
- ✅ Não interfere com slugs personalizados
- ✅ Suporta domínios customizados de clientes

---

## 🔧 Configurações Externas (Não Necessárias)

**Boa notícia:** Não é necessário configurar nada externamente!

O sistema funciona 100% dentro da aplicação Next.js hospedada na Vercel:

- ✅ **DNS**: Já configurado (kuiz.digital aponta para Vercel)
- ✅ **SSL**: Automático via Vercel
- ✅ **Rotas Dinâmicas**: Gerenciadas pelo Next.js
- ✅ **Banco de Dados**: Prisma + PostgreSQL

---

## 📊 Fluxo Técnico

```
Usuário acessa: kuiz.digital/meu-quiz
         ↓
Middleware verifica se é domínio principal
         ↓
Next.js roteia para app/[slug]/page.tsx
         ↓
Busca no banco: SELECT * FROM funnels WHERE slug = 'meu-quiz'
         ↓
Se encontrado: redirect('/f/meu-quiz')
         ↓
Renderiza o quiz em /f/[funnelId]/page.tsx
```

---

## 🚀 Próximos Passos (Opcional)

Se quiser melhorar ainda mais:

1. **Analytics de Slug**
   - Rastrear quantos acessos cada slug recebe
   - Mostrar no dashboard

2. **Histórico de Slugs**
   - Manter redirecionamentos de slugs antigos
   - Evitar links quebrados

3. **Sugestões de Slug**
   - Gerar automaticamente baseado no título do quiz
   - Verificar disponibilidade em tempo real

4. **Preview do Link**
   - Mostrar como ficará o link antes de salvar
   - Copiar link com um clique

---

## ✅ Status Atual

- ✅ Sistema de slug personalizado funcionando
- ✅ Botões Salvar/Publicar invertidos
- ✅ Rota `kuiz.digital/[slug]` ativa
- ✅ Middleware configurado corretamente
- ✅ Deploy na Vercel atualizado
- ✅ Nenhuma configuração externa necessária

**Tudo pronto para uso!** 🎉
