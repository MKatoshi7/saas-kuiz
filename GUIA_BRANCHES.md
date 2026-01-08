# 🔄 Guia Rápido - Trocar de Branch

## ✅ **Você está na branch:** `main` (Produção)

---

## 📋 **Comandos Principais**

### **Ver em qual branch você está:**
```bash
git branch
```
**O que aparece:**
```
  dev
* main    ← O asterisco (*) mostra a branch atual
```

---

### **Trocar para DEV (Desenvolvimento):**
```bash
git checkout dev
```

### **Trocar para MAIN (Produção):**
```bash
git checkout main
```

---

## 🎯 **Fluxo Completo de Trabalho**

### **1. Começar a desenvolver:**
```bash
# Ir para dev
git checkout dev

# Atualizar com últimas mudanças
git pull origin dev

# Desenvolver...
# Editar arquivos, criar features, etc.
```

### **2. Salvar mudanças:**
```bash
# Ainda na dev
git add .
git commit -m "Descrição do que fez"
git push origin dev
```

### **3. Subir para produção:**
```bash
# Ir para main
git checkout main

# Atualizar main
git pull origin main

# Trazer mudanças da dev
git merge dev

# Enviar para produção
git push origin main
```

**🚀 Deploy automático em kuiz.digital!**

---

## ⚡ **Atalhos Úteis**

### **Status atual:**
```bash
git status
```

### **Ver diferenças:**
```bash
# Ver o que mudou
git diff

# Ver diferenças entre branches
git diff main dev
```

### **Histórico:**
```bash
git log --oneline -5
```

---

## ⚠️ **Importante**

### **Antes de trocar de branch:**
```bash
# Sempre salve suas mudanças primeiro!
git add .
git commit -m "Salvando trabalho"

# Agora pode trocar
git checkout outra-branch
```

### **Se tiver mudanças não salvas:**
```
error: Your local changes to the following files would be overwritten
```

**Solução:**
```bash
# Opção 1: Salvar mudanças
git add .
git commit -m "Salvando"

# Opção 2: Descartar mudanças (cuidado!)
git reset --hard HEAD
```

---

## 📊 **Resumo Visual**

```
Você está aqui → * main (Produção)
                  dev (Desenvolvimento)

Para ir para dev:
git checkout dev

Para voltar para main:
git checkout main
```

---

## 🎨 **Exemplo Prático**

```bash
# 1. Ver onde estou
git branch
# * main

# 2. Ir para dev
git checkout dev
# Switched to branch 'dev'

# 3. Fazer alterações...
# ... editar arquivos ...

# 4. Salvar
git add .
git commit -m "Nova feature"
git push origin dev

# 5. Voltar para main
git checkout main

# 6. Trazer mudanças da dev
git merge dev

# 7. Subir para produção
git push origin main
```

---

## 🆘 **Problemas Comuns**

### **"Cannot switch branch, you have uncommitted changes"**
```bash
# Salve suas mudanças primeiro
git add .
git commit -m "Salvando trabalho"
git checkout outra-branch
```

### **"Branch not found"**
```bash
# Ver todas as branches
git branch -a

# Criar branch se não existir
git checkout -b nome-da-branch
```

---

## ✅ **Status Atual**

```
Branch Atual: main
Última Atualização: 08/01/2026 01:16

Branches Disponíveis:
✅ main - Produção (você está aqui)
✅ dev - Desenvolvimento
```

---

**Dica:** Use `git branch` sempre que quiser saber onde está! 💡
