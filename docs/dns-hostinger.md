# Guia: Como Configurar DNS Personalizado na Hostinger

## Visão Geral
Este guia mostrará como adicionar um registro CNAME para conectar seu domínio personalizado ao QuizK.

## Passo a Passo

### 1. Acesse o Painel da Hostinger
1. Faça login em [hpanel.hostinger.com](https://hpanel.hostinger.com/)
2. Vá para a seção **Domínios**
3. Clique no domínio que deseja configurar

### 2. Acessar Configurações de DNS
1. No painel do domínio, procure por **DNS / Zona DNS**
2. Clique em **Gerenciar DNS**

### 3. Adicionar Registro CNAME
1. Procure pela seção de **Adicionar Registro**
2. Selecione **CNAME** como tipo de registro
3. Preencha os campos:
   - **Nome**: `quiz` (ou o subdomínio que você escolheu)
   - **Aponta para**: `quizk.com`
   - **TTL**: Deixe o padrão (geralmente 14400)
4. Clique em **Adicionar Registro** ou **Salvar**

### 4. Aguardar Propagação
- A propagação DNS pode levar de 5 minutos a 48 horas
- Em média, leva cerca de 15-30 minutos na Hostinger
- Você pode verificar a propagação em: [whatsmydns.net](https://whatsmydns.net)

### Exemplo Visual
```
Tipo: CNAME
Nome: quiz
Aponta para: quizk.com
TTL: 14400
```

Resultado final: `quiz.seudominio.com.br` → `quizk.com`

## Problemas Comuns

### Erro: "CNAME já existe"
**Solução**: Remova qualquer registro CNAME existente para o mesmo subdomínio antes de adicionar o novo.

### Erro: "Não é possível adicionar CNAME no domínio raiz"
**Solução**: Use um subdomínio (ex: quiz.seudominio.com.br) em vez do domínio raiz.

### DNS não propaga
**Solução**: 
1. Verifique se preencheu os campos corretamente
2. Aguarde pelo menos 1 hora
3. Limpe o cache DNS do seu computador: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

## Suporte
Precisa de ajuda? Entre em contato:
- Chat da Hostinger (disponível 24/7)
- Suporte QuizK: suporte@quizk.com
