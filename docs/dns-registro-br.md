# Guia: Como Configurar DNS Personalizado no Registro.br

## Visão Geral
Este guia mostrará como adicionar um registro CNAME para conectar seu domínio .br personalizado ao QuizK.

## Passo a Passo

### 1. Acesse o Painel do Registro.br
1. Faça login em [registro.br](https://registro.br/)
2. Vá para **Meus Domínios**
3. Clique no domínio que deseja configurar

### 2. Acessar Configurações de DNS
1. No menu do domínio, clique em **Servidores DNS**
2. Selecione **Usar servidores DNS do Registro.br** (se ainda não estiver)
3. Clique em **Editar Zona**

### 3. Adicionar Registro CNAME
1. Na tela de edição da zona, procure por **Adicionar Registro**
2. Selecione **CNAME** como tipo
3. Preencha os campos:
   - **Nome**: `quiz` (ou o subdomínio escolhido)
   - **Dados do CNAME**: `quizk.com.` (note o ponto final)
   - **TTL**: 3600 (1 hora) ou deixe o padrão
4. Clique em **Adicionar**
5. Clique em **Salvar** no topo da página

### 4. Aguardar Propagação
- A propagação DNS no Registro.br normalmente leva de 15 minutos a 24 horas
- Em média, leva cerca de 1-2 horas
- Você pode verificar em: [whatsmydns.net](https://whatsmydns.net)

### Exemplo Visual
```
Tipo: CNAME
Nome: quiz
Dados: quizk.com.
TTL: 3600
```

⚠️ **IMPORTANTE**: Não esqueça o ponto (.) no final de `quizk.com.`

Resultado final: `quiz.seudominio.com.br` → `quizk.com`

## Problemas Comuns

### Erro: "Registro já existe"
**Solução**: Edite o registro existente em vez de criar um novo, ou remova o antigo antes.

### Erro: "Formato inválido"
**Solução**: Certifique-se de adicionar o ponto final após `quizk.com.`

### Domínio usando servidores DNS externos
**Solução**: 
1. Vá em **Servidores DNS**
2. Selecione **Usar servidores do Registro.br**
3. Aguarde 24-48h para a mudança propagar
4. Depois configure o CNAME

### DNS não propaga
**Solução**:
1. Verifique se salvou as alterações
2. Aguarde pelo menos 2 horas
3. Limpe o cache DNS: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

## Alternativa: Registro A
Se você não conseguir usar CNAME (por exemplo, no domínio raiz), use um registro A:

```
Tipo: A
Nome: @ (ou deixe vazio para domínio raiz)
Endereço IPv4: [IP fornecido pelo suporte QuizK]
TTL: 3600
```

## Suporte
Precisa de ajuda? Entre em contato:
- Suporte Registro.br: [https://registro.br/ajuda/](https://registro.br/ajuda/)
- Suporte QuizK: suporte@quizk.com
