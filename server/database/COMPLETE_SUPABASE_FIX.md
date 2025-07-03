# 🔧 Guia Completo de Correção - Supabase

## 📋 **Problemas Identificados:**
1. **Schema incorreto** - Aplicação não encontrava tabelas
2. **Colunas em falta** - `image_data` e `image_mime` na tabela `players`
3. **Permissões** - Possíveis problemas de RLS

## 🚀 **Solução Completa (Execute nesta ordem):**

### **PASSO 1: Diagnóstico**
Execute no **Supabase SQL Editor**:
```sql
-- Conteúdo de: server/database/diagnose_supabase_schema.sql
```

### **PASSO 2: Correção do Schema**
Execute no **Supabase SQL Editor**:
```sql
-- Conteúdo de: server/database/fix_supabase_schema.sql
```

### **PASSO 3: Adicionar Colunas em Falta**
Execute no **Supabase SQL Editor**:
```sql
-- Conteúdo de: server/database/add_missing_player_columns.sql
```

### **PASSO 4: Criar Tabelas de Analytics**
Execute no **Supabase SQL Editor**:
```sql
-- Conteúdo de: server/database/create_missing_analytics_tables.sql
```

### **PASSO 5: Corrigir Permissões**
Execute no **Supabase SQL Editor**:
```sql
-- Conteúdo de: server/database/fix_supabase_permissions.sql
```

### **PASSO 6: Verificação Final**
Execute no **Supabase SQL Editor**:
```sql
-- Conteúdo de: server/database/test_supabase_connection.sql
```

## ✅ **Verificações de Sucesso:**

Após executar todos os scripts, deve ver:
- **26+ tabelas** no schema `public`
- **Colunas `image_data` e `image_mime`** na tabela `players`
- **Tabelas de analytics** criadas
- **Search path** configurado para `public`

## 🔄 **Próximos Passos:**

1. **Fazer deploy** da aplicação corrigida
2. **Testar** o endpoint `/api/players`
3. **Verificar** se não há mais erros nos logs

## 📊 **Resultados Esperados:**

```bash
# Antes (ERRO):
error: relation "users" does not exist
error: column p.image_data does not exist

# Depois (SUCESSO):
✅ Players API funcionando
✅ Analytics funcionando  
✅ Login com Google funcionando
```

## 🆘 **Se Ainda Houver Problemas:**

1. Verificar se **todas as variáveis de ambiente** estão corretas
2. Confirmar que o **backup foi restaurado** completamente
3. Verificar **logs do Vercel** para novos erros

---
**Status:** ✅ **Aplicação deve funcionar após estes passos** 