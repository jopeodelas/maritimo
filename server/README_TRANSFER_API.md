# Sistema de Rumores de Transferências

Este sistema busca rumores de transferências de múltiplas fontes para manter os dados atualizados automaticamente.

## Configuração das APIs

### 1. Football-Data.org (Recomendado)
- **Gratuito**: Até 10 requisições por minuto
- **Registo**: https://www.football-data.org/client/register
- **Documentação**: https://www.football-data.org/documentation/quickstart

Adicione ao seu arquivo `.env`:
```
FOOTBALL_API_KEY=your_api_key_here
```

### 2. APIs Alternativas (Futuras implementações)

#### RapidAPI Football
- **Plano gratuito**: 100 requisições por dia
- **URL**: https://rapidapi.com/api-sports/api/api-football/

#### Transfermarkt (Web Scraping)
- Implementação futura via web scraping
- Não requer API key

## Funcionalidades

### Endpoints Disponíveis

#### GET `/api/transfers/rumors`
Retorna todos os rumores de transferências disponíveis.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "player_name": "string",
      "type": "compra" | "venda",
      "club": "string",
      "value": "string",
      "status": "rumor" | "negociação" | "confirmado",
      "date": "YYYY-MM-DD",
      "source": "string",
      "reliability": 1-5,
      "description": "string"
    }
  ],
  "lastUpdate": "ISO_DATE",
  "count": number
}
```

#### GET `/api/transfers/stats`
Retorna estatísticas dos rumores de transferências.

#### POST `/api/transfers/refresh` (Autenticado)
Força uma atualização dos rumores de transferências.

#### POST `/api/transfers/rumors` (Autenticado)
Adiciona um rumor manual.

## Sistema de Cache

- **Duração**: 30 minutos
- **Atualização automática**: A cada 30 minutos via cron job
- **Fallback**: Dados mock realistas quando APIs não estão disponíveis

## Fontes de Dados

1. **Football-Data.org**: Dados oficiais de transferências
2. **Mock Data**: Rumores realistas gerados automaticamente
3. **Futuro**: Web scraping de sites portugueses (Record, A Bola, etc.)

## Confiabilidade dos Rumores

- **5**: Confirmado oficialmente
- **4**: Fonte muito confiável (APIs oficiais)
- **3**: Fonte confiável (media estabelecida)
- **2**: Fonte moderada
- **1**: Rumor não confirmado

## Desenvolvimento

Para testar sem API key, o sistema usa dados mock realistas que simulam rumores de transferências do CS Marítimo.

### Estrutura dos Dados Mock

Os dados mock incluem:
- Jogadores reais do plantel do Marítimo
- Clubes da Liga Portuguesa
- Valores realistas de transferência
- Fontes de media portuguesas
- Diferentes status de negociação 