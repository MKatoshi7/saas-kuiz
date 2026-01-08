# 📋 Lista de Pendências - SaaS Quiz Builder

**Última Atualização:** 2026-01-07

---

## 🔴 ALTA PRIORIDADE

### 1. ✅ **Implementar UI para Estilos de Texto Avançados** 
**Status:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Contexto:** 
Baseado na conversa "Enhancing Text Styling Tools" (ID: 5c3c5e7c-69d7-4f1b-831f-41339b378f80), as propriedades de estilo de texto foram adicionadas ao backend/tipos, mas faltam os controles de UI no `TextToolbar`.

**O que já foi feito:**
- ✅ Propriedades adicionadas aos tipos (`letterSpacing`, `lineHeight`, `textTransform`, `dropShadow`, `textStroke`)
- ✅ Renderização implementada no `UnifiedTextRenderer.tsx`
- ✅ Controles básicos adicionados ao `TextToolbar.tsx` (linhas 279-345)

**O que ainda falta:**
- ⚠️ **Controle de Text Stroke (Contorno de Texto)** - Não há UI para configurar:
  - `textStroke.width` (largura do contorno)
  - `textStroke.color` (cor do contorno)
- ⚠️ Validar se os controles existentes estão funcionando corretamente
- ⚠️ Testar a renderização de todos os estilos no preview

**Arquivos envolvidos:**
- `src/components/builder/TextToolbar.tsx` - Adicionar controles de Text Stroke
- `src/types/funnel.ts` - Tipos já definidos
- `src/components/renderer/UnifiedTextRenderer.tsx` - Renderização já implementada

**Estimativa:** 2-3 horas

---

### 2. ⚠️ **Resolver Erros de Hydration e Build**
**Status:** 🔴 **CRÍTICO**

**Contexto:**
Baseado na conversa "Fixing Hydration and Build Errors" (ID: 877a54d9-86e6-4b40-a4bb-37903e0fdc51).

**Problemas conhecidos:**
- Erros de hydration em componentes client-side
- Problemas com `dynamic` imports e `ssr: false`
- Dependências não resolvidas corretamente

**O que precisa ser feito:**
- [ ] Verificar todos os componentes que usam `'use client'`
- [ ] Garantir que componentes com `dynamic(..., { ssr: false })` estão corretos
- [ ] Executar `npm run build` e corrigir todos os erros
- [ ] Testar a aplicação em modo de produção

**Arquivos potencialmente afetados:**
- `app/dashboard/[funnelId]/builder/BuilderPageClient.tsx`
- Componentes de renderer em `src/components/renderer/`
- Componentes de builder em `src/components/builder/`

**Estimativa:** 4-6 horas

---

### 3. 🔐 **Sistema de Autenticação e Licenças**
**Status:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Contexto:**
Baseado na conversa "Admin Client Creation" (ID: 843c2000-95c9-4e87-a9ee-eed9472cbdc3).

**O que já foi feito:**
- ✅ Estrutura de licenças no banco de dados
- ✅ Função `signup-with-license` no Supabase
- ✅ Interface de admin para criar clientes

**O que ainda falta:**
- [ ] Página de login funcional (há erro "Credenciais inválidas" mencionado)
- [ ] Página de registro com código de licença
- [ ] Validação de licença no middleware
- [ ] Página de recuperação de senha (`app/reset-password/page.tsx` existe mas precisa validação)
- [ ] Proteção de rotas baseada em autenticação

**Arquivos envolvidos:**
- `app/reset-password/page.tsx`
- `middleware.ts`
- Componentes de autenticação em `src/components/ui/`

**Estimativa:** 6-8 horas

---

## 🟡 MÉDIA PRIORIDADE

### 4. 📊 **Melhorias no Dashboard de Analytics**
**Status:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Contexto:**
Baseado na conversa "Refining Builder UI and Analytics" (ID: 4c644154-9275-4d94-9838-9f3fad467b5c).

**Funcionalidades solicitadas:**
- [ ] **Coluna "LEAD ID"** no dashboard de analytics
  - Mostrar informações completas do lead (nome, email, telefone, cidade, estado, IP, etc.)
- [ ] **Botão "Clear Leads List"** - Limpar todos os leads
- [ ] **Botão "Export Leads"** - Exportar em CSV/XML
- [ ] Melhorar visualização da jornada do visitante

**Arquivos envolvidos:**
- `app/dashboard/[funnelId]/leads/` - Página de leads
- `app/dashboard/[funnelId]/leads/LeadsActions.tsx` - Ações já existem (linha 37)
- `app/api/funnels/[funnelId]/leads/route.ts` - API já tem rota de clear (linha 29)

**Estimativa:** 4-5 horas

---

### 5. 🖼️ **Corrigir Upload de Imagens por Drag-and-Drop**
**Status:** 🔴 **BUG REPORTADO**

**Contexto:**
Baseado na conversa "Refining Builder UI and Analytics" (ID: 4c644154-9275-4d94-9838-9f3fad467b5c).

**Problema:**
Arrastar ou colar uma URL de imagem não substitui a imagem existente no componente de upload de imagem.

**O que precisa ser feito:**
- [ ] Investigar componente de upload de imagem
- [ ] Implementar substituição de imagem ao arrastar URL
- [ ] Implementar substituição de imagem ao colar URL
- [ ] Testar com diferentes formatos de URL

**Arquivos envolvidos:**
- Componente de upload de imagem (localização a ser determinada)
- Possivelmente em `src/components/builder/`

**Estimativa:** 2-3 horas

---

### 6. 🎨 **Configuração de Domínio Personalizado**
**Status:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Contexto:**
Baseado na conversa "Custom Domain Setup" (ID: 55bd9c9b-f143-40e0-906f-c83c920ebbe0).

**O que já foi feito:**
- ✅ UI na página de Settings para configurar domínio
- ✅ Documentação de DNS (`docs/dns-registro-br.md`, `docs/dns-hostinger.md`)

**O que ainda falta:**
- [ ] Implementar verificação de DNS
- [ ] Implementar provisionamento automático de SSL
- [ ] Backend para associar domínio ao funil
- [ ] Roteamento para domínios personalizados
- [ ] Validação de domínio antes de ativar

**Arquivos envolvidos:**
- `app/dashboard/[funnelId]/settings/page.tsx`
- `docs/dns-registro-br.md`
- `docs/dns-hostinger.md`
- Backend API (a ser criado)

**Estimativa:** 8-10 horas

---

### 7. 👤 **Página de Configurações de Conta**
**Status:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Contexto:**
Baseado na conversa "Account Management and Project Creation" (ID: e1e6ef16-dbe0-413a-b36d-549185827353).

**Funcionalidades solicitadas:**
- [ ] Editar informações do perfil (nome, email)
- [ ] Alterar senha
- [ ] Visualizar status de assinatura
- [ ] Visualizar plano atual
- [ ] Visualizar tempo restante de assinatura
- [ ] Opções para renovar/upgrade de plano

**Arquivos envolvidos:**
- `app/dashboard/settings/page.tsx` (existe, precisa validação)
- `app/dashboard/account/page.tsx` (existe, linha 391 menciona renovação)

**Estimativa:** 4-6 horas

---

### 8. 🆕 **Modal de Criação de Projeto**
**Status:** 🔴 **NÃO IMPLEMENTADO**

**Contexto:**
Baseado na conversa "Account Management and Project Creation" (ID: e1e6ef16-dbe0-413a-b36d-549185827353).

**Objetivo:**
Substituir o fluxo de criação de projeto baseado em página por um modal/dialog interativo.

**Funcionalidades:**
- [ ] Modal com formulário de criação
- [ ] Campos: nome do projeto, descrição (opcional)
- [ ] Criação rápida direto do dashboard
- [ ] Feedback visual de sucesso/erro

**Arquivos envolvidos:**
- Dashboard principal
- Componente de modal (a ser criado)
- API de criação de funil

**Estimativa:** 3-4 horas

---

## 🟢 BAIXA PRIORIDADE

### 9. 🎬 **Animações de Opções de Quiz**
**Status:** ✅ **IMPLEMENTADO** (verificar)

**Contexto:**
Baseado na conversa "Refining Builder UI and Analytics" (ID: 4c644154-9275-4d94-9838-9f3fad467b5c).

**O que foi feito:**
- ✅ Animação de check icon nas opções de quiz

**Validação necessária:**
- [ ] Testar animações no preview
- [ ] Verificar se não há erros de sintaxe em `QuizOptionsRenderer.tsx`

**Arquivos envolvidos:**
- `src/components/renderer/QuizOptionsRenderer.tsx`

**Estimativa:** 1 hora (validação)

---

### 10. 🎨 **Melhorias no Color Picker**
**Status:** ✅ **IMPLEMENTADO**

**Contexto:**
Baseado em `.docs/color-picker-implementation.md`.

**O que foi implementado:**
- ✅ Componente `ColorPicker` reutilizável
- ✅ Paleta com cor do tema, cores recentes e paleta padrão
- ✅ Sincronização de cores recentes via localStorage
- ✅ Integração com `QuizOptionProperties`

**Validação:**
- [ ] Testar funcionamento em todos os componentes
- [ ] Verificar sincronização entre múltiplos seletores

**Estimativa:** 1 hora (validação)

---

### 11. 🔄 **Sistema de Auto-Save**
**Status:** ✅ **IMPLEMENTADO E PROTEGIDO**

**Contexto:**
Baseado em `.docs/auto-save-protection.md`.

**O que foi implementado:**
- ✅ Auto-save com proteção contra perda de dados
- ✅ Validações múltiplas antes de salvar
- ✅ Rastreamento de estado de carregamento
- ✅ Logs de debug

**Validação:**
- [ ] Testar cenários de atualização rápida da página
- [ ] Verificar logs no console
- [ ] Confirmar que não há perda de dados

**Estimativa:** 1 hora (validação)

---

### 12. 🎵 **Gravação e Upload de Áudio**
**Status:** ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Contexto:**
Baseado na conversa "Fixing Upload and Recording" (ID: af39cc72-76d9-4ddf-a25e-748307b4cb42).

**O que foi feito:**
- ✅ API de upload (`app/api/upload/`)
- ✅ Substituição de `uuid` por `crypto.randomUUID`

**O que ainda falta:**
- [ ] Integração completa do `MediaRecorder` API
- [ ] UI de feedback durante gravação
- [ ] Upload de arquivos de áudio
- [ ] Aplicação do tema ao `AudioDropzone`

**Arquivos envolvidos:**
- `AudioDropzone` component (localização a ser determinada)
- `app/api/upload/`

**Estimativa:** 4-5 horas

---

### 13. 🚀 **Deploy e Configuração de Produção**
**Status:** ⚠️ **PARCIALMENTE DOCUMENTADO**

**Contexto:**
Baseado na conversa "Deploying Site to Netlify" (ID: fff6388a-669e-417c-a01e-e178e0a15a75).

**O que precisa ser feito:**
- [ ] Configurar variáveis de ambiente para produção
- [ ] Configurar DATABASE_URL para PostgreSQL em nuvem
- [ ] Testar build de produção (`npm run build`)
- [ ] Configurar deploy (Vercel/Netlify)
- [ ] Documentar processo de deploy

**Estimativa:** 3-4 horas

---

## 📝 MELHORIAS E REFATORAÇÕES

### 14. 🧹 **Limpeza de Código e Otimizações**
**Status:** 🔄 **CONTÍNUO**

**Tarefas:**
- [ ] Remover código comentado não utilizado
- [ ] Consolidar componentes duplicados
- [ ] Otimizar imports
- [ ] Adicionar comentários em código complexo
- [ ] Melhorar tratamento de erros

**Estimativa:** 4-6 horas

---

### 15. 📚 **Documentação**
**Status:** ⚠️ **PARCIALMENTE COMPLETO**

**O que existe:**
- ✅ `README.md` (básico)
- ✅ `QUICK_START.md`
- ✅ `DATABASE_SETUP.md`
- ✅ `prompt.md` (instruções Prisma)
- ✅ `.docs/auto-save-protection.md`
- ✅ `.docs/color-picker-implementation.md`

**O que falta:**
- [ ] Documentação de componentes principais
- [ ] Guia de contribuição
- [ ] Documentação de API
- [ ] Guia de troubleshooting
- [ ] Exemplos de uso

**Estimativa:** 6-8 horas

---

## 🎯 RESUMO DE PRIORIDADES

### Crítico (Fazer Primeiro)
1. ✅ Resolver erros de Hydration e Build
2. ✅ Implementar UI para Text Stroke
3. ✅ Corrigir sistema de autenticação

### Importante (Fazer em Seguida)
4. ✅ Melhorias no Dashboard de Analytics
5. ✅ Corrigir upload de imagens por drag-and-drop
6. ✅ Página de configurações de conta
7. ✅ Modal de criação de projeto

### Pode Esperar
8. ✅ Configuração de domínio personalizado
9. ✅ Gravação e upload de áudio
10. ✅ Deploy e configuração de produção

### Validação e Testes
11. ✅ Validar animações de quiz
12. ✅ Validar color picker
13. ✅ Validar auto-save

---

## 📊 ESTATÍSTICAS

- **Total de Tarefas:** 15
- **Críticas:** 3
- **Importantes:** 4
- **Baixa Prioridade:** 5
- **Validação:** 3

**Estimativa Total:** 55-75 horas de desenvolvimento

---

**Notas:**
- Esta lista foi gerada baseada no histórico de conversas e análise do código
- Algumas tarefas podem estar parcialmente implementadas e precisam apenas de validação
- Prioridades podem ser ajustadas conforme necessidade do negócio
- Recomenda-se começar pelas tarefas críticas antes de avançar para as demais
