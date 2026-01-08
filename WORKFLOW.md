# 🔄 Workflow de Desenvolvimento - Branches

## 📋 Estrutura de Branches

### 🟢 **main** (Produção - LIVE)
- **Propósito:** Código em produção, sempre estável
- **Deploy:** Automático na Vercel (kuiz.digital)
- **Proteção:** ⚠️ Nunca commitar diretamente aqui
- **Atualização:** Apenas via merge da branch `dev`

### 🔵 **dev** (Desenvolvimento)
- **Propósito:** Desenvolvimento e testes de novas features
- **Deploy:** Pode ter preview na Vercel
- **Proteção:** Pode commitar livremente
- **Atualização:** Merge para `main` quando estável

---

## 🚀 Como Trabalhar

### 1️⃣ **Desenvolvendo Nova Feature**

```bash
# Certifique-se de estar na branch dev
git checkout dev

# Atualize com as últimas mudanças
git pull origin dev

# Faça suas alterações...
# Edite arquivos, adicione features, etc.

# Commit das mudanças
git add .
git commit -m "Descrição da feature"

# Envie para o GitHub
git push origin dev
```

### 2️⃣ **Testando no Preview (Opcional)**

A Vercel pode criar um preview automático da branch `dev`:
- Acesse: Vercel Dashboard → Settings → Git
- Configure preview para branch `dev`
- Cada push criará um preview URL

### 3️⃣ **Subindo para Produção (LIVE)**

**Quando tudo estiver testado e funcionando:**

```bash
# Vá para a branch main
git checkout main

# Atualize a main
git pull origin main

# Faça merge da dev (traz todas as mudanças)
git merge dev

# Envie para produção
git push origin main
```

**A Vercel fará deploy automático em kuiz.digital! 🚀**

---

## 📊 Fluxo Visual

```
┌─────────────────────────────────────────┐
│  💻 Desenvolvimento Local                │
│  (Branch: dev)                          │
│                                         │
│  1. Editar código                       │
│  2. Testar localmente                   │
│  3. git add . && git commit             │
│  4. git push origin dev                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  🔵 GitHub - Branch DEV                  │
│  (Código em desenvolvimento)            │
│                                         │
│  ✅ Testes                               │
│  ✅ Revisão                              │
│  ✅ Validação                            │
└─────────────────┬───────────────────────┘
                  │
                  │ git checkout main
                  │ git merge dev
                  │ git push origin main
                  ▼
┌─────────────────────────────────────────┐
│  🟢 GitHub - Branch MAIN                 │
│  (Código estável - Produção)            │
└─────────────────┬───────────────────────┘
                  │
                  │ Deploy Automático
                  ▼
┌─────────────────────────────────────────┐
│  🌐 Vercel - LIVE                        │
│  https://kuiz.digital                   │
│                                         │
│  ✅ Site em produção                     │
│  ✅ Usuários acessando                   │
└─────────────────────────────────────────┘
```

---

## ⚠️ Regras Importantes

### ✅ **PODE:**
- Commitar direto na `dev`
- Testar features na `dev`
- Fazer experimentos na `dev`
- Quebrar coisas na `dev` (é para isso que existe!)

### ❌ **NÃO PODE:**
- Commitar direto na `main`
- Fazer merge sem testar
- Subir código com bugs para `main`
- Pular a branch `dev`

---

## 🔧 Comandos Úteis

### Ver em qual branch você está:
```bash
git branch
```

### Trocar de branch:
```bash
# Para desenvolvimento
git checkout dev

# Para produção
git checkout main
```

### Ver diferenças entre branches:
```bash
git diff main dev
```

### Desfazer último commit (se errou):
```bash
git reset --soft HEAD~1
```

### Ver histórico de commits:
```bash
git log --oneline -10
```

---

## 🎯 Exemplo Prático

### Cenário: Adicionar nova feature de "Quiz Timer"

```bash
# 1. Ir para dev
git checkout dev

# 2. Desenvolver a feature
# ... editar arquivos ...

# 3. Testar localmente
npm run dev
# Testar no navegador

# 4. Commit
git add .
git commit -m "Add quiz timer feature"
git push origin dev

# 5. Testar no preview (se configurado)
# Acessar URL de preview da Vercel

# 6. Tudo OK? Subir para produção!
git checkout main
git merge dev
git push origin main

# 7. Aguardar deploy automático (~2 min)
# ✅ Feature live em kuiz.digital!
```

---

## 🆘 Problemas Comuns

### "Conflito ao fazer merge"
```bash
# Resolver conflitos manualmente
# Editar arquivos com conflito
# Depois:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### "Esqueci em qual branch estou"
```bash
git branch
# A branch com * é a atual
```

### "Quero descartar todas as mudanças"
```bash
git reset --hard HEAD
git clean -fd
```

---

## 📝 Checklist Antes de Merge

Antes de fazer `git merge dev` na main:

- [ ] ✅ Código testado localmente
- [ ] ✅ Sem erros no console
- [ ] ✅ Build funcionando (`npm run build`)
- [ ] ✅ Features funcionando como esperado
- [ ] ✅ Sem bugs conhecidos
- [ ] ✅ Commit messages descritivos

---

## 🎨 Status Atual

```
Branch Atual: dev
Última Atualização: 08/01/2026 01:10
```

### Branches Disponíveis:
- ✅ `main` - Produção (kuiz.digital)
- ✅ `dev` - Desenvolvimento

---

## 🚀 Próximos Passos

1. **Agora você está na branch `dev`**
2. Desenvolva suas features aqui
3. Teste tudo
4. Quando estiver pronto, faça merge para `main`
5. Deploy automático! 🎉

---

**Dica:** Sempre trabalhe na `dev` e só suba para `main` quando tiver certeza que está tudo funcionando! 💡
