# 🛡️ Proteção Contra Perda de Dados - Auto-Save

## ✅ Problema Resolvido

**Problema Original**: Ao atualizar a página (F5 ou Ctrl+R) durante o carregamento do projeto, o auto-save poderia salvar um estado vazio ou parcial, fazendo o projeto "sumir".

**Causa Raiz**: O auto-save no `useEffect` cleanup era executado mesmo quando os dados ainda não tinham sido carregados completamente.

## 🔒 Proteções Implementadas

### 1. **Rastreamento de Estado de Carregamento** (BuilderPageClient.tsx)

```typescript
// Refs para rastrear o estado
const dataLoadedRef = React.useRef(false);  // Dados foram carregados?
const hasChangesRef = React.useRef(false);  // Há alterações não salvas?
```

**Como funciona**:
- `dataLoadedRef` só é marcado como `true` APÓS o `loadFunnel()` completar com sucesso
- Antes disso, qualquer tentativa de auto-save é bloqueada

### 2. **Auto-Save Condicional**

```typescript
// Auto-save APENAS se:
if (dataLoadedRef.current && state.currentFunnelId && !state.isLoading) {
    // Salvar dados
} else {
    console.log('⚠️ Skipping auto-save (data not loaded or still loading)');
}
```

**Condições para permitir auto-save**:
1. ✅ Dados foram carregados com sucesso (`dataLoadedRef.current === true`)
2. ✅ Existe um ID de funil válido (`state.currentFunnelId`)
3. ✅ Não está em processo de carregamento (`!state.isLoading`)

### 3. **Validação na Store** (builderStore.ts)

```typescript
saveFunnel: async () => {
    // Validação 1: Não salvar se estiver carregando
    if (isLoading) {
        console.warn('⚠️ Cannot save: funnel is still loading');
        return;
    }

    // Validação 2: Não salvar se não houver steps
    if (!steps || steps.length === 0) {
        console.warn('⚠️ Cannot save: no steps found');
        return;
    }

    // Validação 3: Não salvar se não houver componentsByStep
    if (!componentsByStep || Object.keys(componentsByStep).length === 0) {
        console.warn('⚠️ Cannot save: no componentsByStep found');
        return;
    }

    // Prosseguir com o save...
}
```

**Validações na camada de store**:
1. ✅ Bloqueia save durante carregamento
2. ✅ Bloqueia save se `steps` estiver vazio
3. ✅ Bloqueia save se `componentsByStep` estiver vazio

## 🎯 Fluxo de Proteção

### Cenário 1: Atualização Normal da Página

```
1. Usuário pressiona F5
2. Componente desmonta → Auto-save tenta executar
3. ✅ dataLoadedRef.current = true (dados já foram carregados antes)
4. ✅ state.isLoading = false
5. ✅ steps.length > 0
6. ✅ Auto-save executa com sucesso
7. Página recarrega
8. loadFunnel() carrega os dados salvos
9. ✅ dataLoadedRef.current = true
10. Projeto aparece normalmente
```

### Cenário 2: Atualização Durante Carregamento

```
1. Usuário abre a página
2. loadFunnel() começa a carregar (isLoading = true)
3. Usuário pressiona F5 rapidamente
4. Componente desmonta → Auto-save tenta executar
5. ❌ dataLoadedRef.current = false (dados ainda não carregaram)
6. ⚠️ Auto-save é BLOQUEADO
7. Console: "⚠️ Skipping auto-save (data not loaded)"
8. Página recarrega
9. loadFunnel() carrega os dados originais do banco
10. ✅ Projeto aparece normalmente (dados preservados)
```

### Cenário 3: Save Manual com Dados Vazios

```
1. Algo dá errado e o estado fica vazio
2. Usuário clica em "Salvar Alterações"
3. saveFunnel() é chamado
4. ❌ steps.length === 0
5. ⚠️ Save é BLOQUEADO
6. Console: "⚠️ Cannot save: no steps found"
7. ✅ Dados no banco permanecem intactos
```

## 📊 Logs de Debug

Agora você verá logs claros no console:

### Durante Carregamento:
```
🔄 Starting to load funnel: cmjg9rtqh0001f8uysxxo7wfc
✅ Funnel loaded from API: { id: '...', steps: 2, hasTheme: true }
📦 Setting store with: { stepsCount: 2, componentsPerStep: [...] }
✅ Funnel loaded and marked as ready
```

### Durante Auto-Save (Sucesso):
```
💾 Auto-saving on unmount...
💾 Saving funnel: { id: '...', stepsCount: 2, componentsCount: 5 }
✅ Funnel saved successfully
```

### Durante Auto-Save (Bloqueado):
```
⚠️ Skipping auto-save on unmount (data not loaded or still loading)
```

### Durante Save Manual (Bloqueado):
```
⚠️ Cannot save: funnel is still loading
// OU
⚠️ Cannot save: no steps found (possible empty state)
// OU
⚠️ Cannot save: no componentsByStep found (possible empty state)
```

## ✅ Benefícios

1. **Segurança Total**: Impossível sobrescrever dados com estado vazio
2. **Transparência**: Logs claros mostram o que está acontecendo
3. **Flexibilidade**: Você pode atualizar a página quando quiser
4. **Confiabilidade**: Múltiplas camadas de proteção
5. **Performance**: Não impacta a velocidade do auto-save legítimo

## 🧪 Como Testar

### Teste 1: Atualização Rápida
1. Abra o builder
2. Pressione F5 imediatamente
3. ✅ Projeto deve aparecer normalmente
4. ✅ Console deve mostrar: "⚠️ Skipping auto-save"

### Teste 2: Atualização Normal
1. Abra o builder
2. Faça uma alteração
3. Espere 2 segundos
4. Pressione F5
5. ✅ Projeto deve aparecer com a alteração
6. ✅ Console deve mostrar: "💾 Auto-saving on unmount..."

### Teste 3: Save Manual
1. Abra o builder
2. Faça alterações
3. Clique em "Salvar Alterações"
4. ✅ Toast de sucesso deve aparecer
5. ✅ Console deve mostrar: "✅ Funnel saved successfully"

## 🔧 Arquivos Modificados

1. **app/dashboard/[funnelId]/builder/BuilderPageClient.tsx**
   - Adicionado `dataLoadedRef` para rastrear carregamento
   - Adicionado `hasChangesRef` para rastrear alterações
   - Auto-save condicional no cleanup do useEffect

2. **src/store/builderStore.ts**
   - Validação de `isLoading` no `saveFunnel()`
   - Validação de `steps` vazios
   - Validação de `componentsByStep` vazios

3. **src/components/renderer/UnifiedTextRenderer.tsx**
   - Corrigido mapeamento de tamanhos de fonte

## 🎉 Resultado Final

Agora você pode:
- ✅ Atualizar a página quando quiser (F5, Ctrl+R)
- ✅ Navegar entre páginas sem perder dados
- ✅ Confiar que o auto-save só salva dados válidos
- ✅ Ver logs claros do que está acontecendo
- ✅ Trabalhar sem medo de perder o projeto

---

**Status**: ✅ Implementado e Testado
**Prioridade**: 🔴 CRÍTICO (Proteção contra perda de dados)
**Impacto**: 🟢 POSITIVO (Segurança sem impacto na UX)
