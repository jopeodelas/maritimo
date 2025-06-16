# 🔄 Sistema de Rumores de Transferências Melhorado

## 🎯 Objetivo

Este sistema resolve os problemas de inconsistência e não fiabilidade do sistema anterior de rumores, implementando:

1. **Armazenamento persistente** na base de dados
2. **Interface de administração** para gerir rumores
3. **Sistema de aprovação** para rumores descobertos automaticamente
4. **Consistência** entre utilizadores

## 🆕 Funcionalidades Implementadas

### 📊 Base de Dados
- **Nova tabela `transfer_rumors`** com todas as informações necessárias
- **Sistema de aprovação** (rumores precisam de aprovação do admin)
- **Soft delete** (rumores não são eliminados fisicamente)
- **Auditoria completa** (quem criou, quando, etc.)

### 🔧 Backend (API)

#### Novos Endpoints para Admin:
- `GET /api/admin/transfer/rumors` - Obter todos os rumores (incluindo não aprovados)
- `POST /api/admin/transfer/rumors` - Criar novo rumor
- `PUT /api/admin/transfer/rumors/:id` - Atualizar rumor
- `DELETE /api/admin/transfer/rumors/:id` - Remover rumor
- `POST /api/admin/transfer/rumors/:id/approve` - Aprovar rumor
- `POST /api/admin/transfer/rumors/:id/disapprove` - Desaprovar rumor
- `GET /api/admin/transfer/stats` - Estatísticas para admin

#### Melhorias no Sistema Existente:
- **Fallback inteligente**: Tentará base de dados primeiro, depois memória
- **Auto-aprovação**: Rumores de alta confiabilidade (≥4) são aprovados automaticamente
- **Migração automática**: Rumores existentes em memória são migrados para DB

### 🎨 Frontend (Admin)

#### Nova Aba "Rumores de Transferências":
- **Listagem completa** de todos os rumores
- **Filtros visuais** por tipo, status e confiabilidade
- **Modal de criação/edição** com todos os campos
- **Ações rápidas**: Aprovar, Editar, Remover
- **Feedback visual** do status de cada rumor

## 🚀 Como Implementar

### 1. Executar Migração da Base de Dados

```bash
# No diretório server/
node scripts/migrate-transfer-rumors.js
```

### 2. Reiniciar o Servidor

```bash
# No diretório server/
npm run dev
```

### 3. Aceder ao Painel de Admin

1. Fazer login como administrador
2. Ir para "Painel de Administração"
3. Clicar na aba "Rumores de Transferências"

## 🔄 Fluxo de Trabalho

### Para Rumores Descobertos Automaticamente:
1. **Sistema descobre** rumores de notícias
2. **Avalia confiabilidade** automaticamente
3. **Auto-aprova** se confiabilidade ≥ 4
4. **Aguarda aprovação** se confiabilidade < 4
5. **Admin revê e aprova/rejeita** rumores pendentes

### Para Rumores Manuais:
1. **Admin cria** rumor no painel
2. **Sistema marca** como "não aprovado" inicialmente
3. **Admin pode aprovar** imediatamente se desejar
4. **Rumor aparece** para utilizadores após aprovação

## 🛡️ Benefícios

### ✅ Problemas Resolvidos:
- **Consistência**: Todos os utilizadores vêem os mesmos rumores
- **Fiabilidade**: Sistema de aprovação garante qualidade
- **Persistência**: Rumores não se perdem entre reinicializações
- **Controlo**: Admin tem controlo total sobre o que é mostrado

### 🔧 Funcionalidades Adicionais:
- **Auditoria**: Registo de quem criou cada rumor
- **Versioning**: Histórico de alterações (através de updated_at)
- **Categorização**: Sistema de categorias melhorado
- **Estatísticas**: Métricas detalhadas para admin

## 📋 Campos da Base de Dados

```sql
- id: ID único na base de dados
- unique_id: ID original do sistema (compatibilidade)
- player_name: Nome do jogador
- type: compra, venda, renovação
- club: Nome do clube
- value: Valor da transferência
- status: rumor, negociação, confirmado
- date: Data do rumor
- source: Fonte da informação
- reliability: Nível de confiabilidade (1-5)
- description: Descrição detalhada
- is_main_team: Se é da equipa principal
- category: senior, youth, staff, coach, other
- position: Posição do jogador
- is_approved: Se foi aprovado pelo admin
- is_deleted: Soft delete flag
- created_by: ID do utilizador que criou
- created_at: Data de criação
- updated_at: Data da última atualização
- deleted_at: Data de eliminação (se aplicável)
```

## 🔮 Próximos Passos

1. **Monitorizar** o sistema durante alguns dias
2. **Ajustar** critérios de auto-aprovação se necessário
3. **Implementar** notificações para rumores pendentes
4. **Adicionar** mais fontes de notícias se desejado

## 🆘 Resolução de Problemas

### Se a migração falhar:
1. Verificar ligação à base de dados
2. Confirmar que a tabela não existe já
3. Verificar permissões do utilizador PostgreSQL

### Se rumores não aparecem:
1. Verificar se estão aprovados (`is_approved = true`)
2. Confirmar que não estão eliminados (`is_deleted = false`)
3. Verificar logs do servidor para erros

### Para rollback:
```sql
-- APENAS SE NECESSÁRIO - Remove a tabela
DROP TABLE IF EXISTS transfer_rumors;
```

---

**✨ O sistema está agora muito mais robusto, fiável e fácil de gerir!** 