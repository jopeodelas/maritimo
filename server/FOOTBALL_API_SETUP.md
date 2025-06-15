# Configuração das APIs de Futebol 🏈

Este sistema pode buscar dados reais de jogos do CS Marítimo usando APIs de futebol. Atualmente funciona com dados de demonstração, mas pode ser configurado para usar dados reais.

## 🔧 APIs Suportadas

### 1. API-Football (RapidAPI) - Recomendada
- **Website**: https://rapidapi.com/api-sports/api/api-football
- **Plano Gratuito**: 100 requisições/dia
- **Características**: Dados completos de ligas portuguesas, lineups, estatísticas

### 2. Football-Data.org - Alternativa
- **Website**: https://www.football-data.org/
- **Plano Gratuito**: 10 requisições/minuto
- **Características**: Dados básicos, menos detalhados

## 🚀 Como Configurar

### Passo 1: Obter API Keys

**Para API-Football:**
1. Registar em https://rapidapi.com/
2. Subscrever a API-Football
3. Copiar a `X-RapidAPI-Key`

**Para Football-Data:**
1. Registar em https://www.football-data.org/client/register
2. Copiar o token de autenticação

### Passo 2: Configurar Variáveis de Ambiente

Criar arquivo `.env` na pasta `server/` com:

```env
# APIs de Futebol
RAPIDAPI_KEY=your_rapidapi_key_here
FOOTBALL_DATA_TOKEN=your_football_data_token_here

# ID do CS Marítimo nas APIs
MARITIMO_API_FOOTBALL_ID=4281  # ID correto na API-Football
MARITIMO_FOOTBALL_DATA_ID=5529 # ID na Football-Data (verificar)
```

### Passo 3: Encontrar o ID Correto do CS Marítimo

O ID `4281` é o ID real do CS Marítimo na API-Football. Se necessário verificar:

```bash
# Testar endpoint para encontrar o ID correto
curl -X GET "https://api-football-v1.p.rapidapi.com/v3/teams?name=Maritimo" \
  -H "X-RapidAPI-Key: YOUR_KEY" \
  -H "X-RapidAPI-Host: api-football-v1.p.rapidapi.com"
```

## 🎯 Funcionalidades Implementadas

### Sistema Automático
- ✅ **Detecção Automática**: Busca automaticamente o último jogo do Marítimo
- ✅ **Matching de Jogadores**: Associa jogadores da API com a base de dados local
- ✅ **Criação de Votação**: Cria votação automaticamente com jogadores reais
- ✅ **Scheduler**: Verifica novos jogos a cada 30 minutos
- ✅ **Dados de Demonstração**: Funciona mesmo sem API keys

### Associação de Jogadores
O sistema tenta associar jogadores da API com os existentes na base de dados por:
- Nome completo
- Primeiro nome
- Último nome
- Matching fuzzy (ignora acentos, símbolos)

### Endpoints Disponíveis
- `POST /api/player-ratings/auto-create-voting` - Criar votação automática
- `GET /api/player-ratings/recent-matches` - Buscar jogos recentes
- `POST /api/player-ratings/check-new-votings` - Verificar novos jogos

## 🔄 Como Funciona

1. **Scheduler** verifica novos jogos a cada 30 minutos
2. **Busca** o último jogo terminado do Marítimo
3. **Obtém** a formação (11 iniciais + suplentes)
4. **Associa** jogadores com a base de dados local
5. **Cria** votação automaticamente
6. **Desativa** votações anteriores

## 🧪 Modo Demonstração

Sem API keys, o sistema usa:
- **Jogo**: CS Marítimo vs FC Porto
- **Jogadores**: Lista real de jogadores do Marítimo
- **Data**: Data atual
- **Funcionalidade**: Completa para testes

## 🐛 Troubleshooting

### Problema: "Nenhum jogo encontrado"
- Verificar se a API key está correta
- Verificar se o ID do Marítimo está correto
- Ver logs do servidor para detalhes

### Problema: "Nenhum jogador associado"
- Verificar se os nomes na base de dados coincidem
- Adicionar variações de nomes comuns
- Ver logs de matching de jogadores

### Problema: "Erro na API"
- Verificar limites de requisições
- Verificar se a API está funcionando
- O sistema recorre automaticamente aos dados demo

## 📊 Logs e Monitoring

O sistema produz logs detalhados:
```
🔍 Checking if automatic voting creation is needed...
📅 Last match: CS Marítimo vs FC Porto
👥 Found 16 players in the match
✅ Matched: André Vidigal -> André Vidigal (ID: 9)
🎯 Successfully matched 11/16 players
🎉 Automatic voting created successfully!
```

## 🔮 Melhorias Futuras

- [ ] Suporte para mais APIs
- [ ] Cache de dados para reduzir requisições
- [ ] Interface admin para configurar IDs de equipas
- [ ] Notificações quando nova votação é criada
- [ ] Histórico de jogos processados
- [ ] Melhor matching de jogadores (ML/AI) 