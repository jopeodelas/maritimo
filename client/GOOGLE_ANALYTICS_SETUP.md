# 📊 Configuração do Google Analytics 4

## 🚀 Como Configurar

### 1. **Criar Conta Google Analytics**
1. Vá para [Google Analytics](https://analytics.google.com/)
2. Clique em "Começar" e crie uma nova conta
3. Configure a propriedade para o seu site CS Marítimo

### 2. **Obter Measurement ID**
1. No painel do GA4, vá para **Admin** (engrenagem)
2. Na coluna **Property**, clique em **Data Streams**
3. Clique na sua stream (web)
4. Copie o **Measurement ID** (formato: `G-XXXXXXXXXX`)

### 3. **Configurar no Projeto**
Crie um arquivo `.env.local` na pasta `client/` com:
```bash
# Google Analytics 4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Substitua `G-XXXXXXXXXX` pelo seu Measurement ID real!**

### 4. **Para Desenvolvimento**
- Em desenvolvimento, o GA4 está **desabilitado** automaticamente
- Só funciona em produção (`npm run build`)

### 5. **Para Produção (Vercel/Netlify)**
Adicione a variável de ambiente na plataforma:
- **Nome**: `VITE_GA4_MEASUREMENT_ID`
- **Valor**: `G-XXXXXXXXXX` (seu ID real)

## 🎯 O que está sendo Tracked

### **Eventos Automáticos:**
- ✅ **Page Views** - Todas as páginas visitadas
- ✅ **Sessões** - Duração e bounce rate
- ✅ **Device Info** - Mobile vs Desktop

### **Eventos Personalizados CS Marítimo:**
- ⚽ **Votações** - `player_vote`
- 📊 **Polls** - `poll_vote`
- 🎮 **Maritodle** - `maritodle_play`
- 👤 **Visualizações** - `player_view`, `news_view`, `transfer_view`
- 🔍 **Pesquisas** - `search`
- 🔐 **Autenticação** - `auth` (login/logout/register)
- 🖱️ **Interações** - `button_click`, `form_submit`
- ❌ **Erros** - `error`

## 📈 Dashboards Disponíveis

No Google Analytics 4 terás acesso a:
- **Real-time** - Visitantes em tempo real
- **Acquisition** - Como chegam ao site
- **Engagement** - Tempo na página, bounce rate
- **Monetization** - Conversões (pode configurar goals)
- **Retention** - Utilizadores que voltam
- **Demographics** - Idade, localização, interesses

## 🎛️ Eventos Customizados

Podes criar goals e conversões baseados nos nossos eventos:
- **Goal**: Utilizador votou num jogador → `player_vote`
- **Goal**: Utilizador completou Maritodle → `maritodle_play` com `success: true`
- **Goal**: Utilizador registou-se → `auth` com `action: register`

## 🔧 Troubleshooting

### GA4 não aparece dados?
1. ✅ Verificar se o Measurement ID está correto
2. ✅ Confirmar que está em produção (não development)
3. ✅ Aguardar até 24-48h para os primeiros dados aparecerem
4. ✅ Usar o "Real-time" para testar imediatamente

### Como testar em desenvolvimento?
Muda temporariamente no `main.tsx`:
```typescript
// Para testar em desenvolvimento (NÃO fazer commit!)
if (GA4_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
```

## 🎉 Vantagens vs Vercel Analytics

| Funcionalidade | Vercel Analytics | Google Analytics 4 |
|---------------|------------------|-------------------|
| **Gratuito** | ❌ 30 dias | ✅ Para sempre |
| **Real-time** | ❌ | ✅ |
| **Eventos Custom** | ❌ | ✅ |
| **Demographics** | ❌ | ✅ |
| **Funnels** | ❌ | ✅ |
| **Goals/Conversions** | ❌ | ✅ |
| **Export Data** | ❌ | ✅ |
| **API Access** | ❌ | ✅ |
| **Integration** | ❌ | ✅ Google Ads, Search Console |

## 📊 + PostgreSQL = Sistema Completo

- **Google Analytics** → Dashboards visuais e análises
- **PostgreSQL** → Dados raw para queries personalizadas
- **Combinação** → O melhor dos dois mundos! 🚀 