import axios from 'axios';
import { TransferRumor } from './transferService';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

class RealNewsService {
  private readonly NEWS_API_KEY = process.env.NEWS_API_KEY;
  private readonly GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search';

  async fetchRealTransferNews(): Promise<TransferRumor[]> {
    const allRumors: TransferRumor[] = [];

    try {
      // Get all Marítimo news first
      const allNews = await this.fetchAllMaritimoNews();
      
              // Filter only transfer-related news
        const transferNews = allNews.filter(item => this.isTransferRelated(item.title + ' ' + item.description));
      
      // Convert transfer news to rumors
      transferNews.forEach((item, index) => {
        const transferInfo = this.extractTransferInfoFromNews(item);
        
        if (transferInfo) {
          const contentHash = this.createContentHash(item.title + item.description + item.url);
          allRumors.push({
            id: `real_${contentHash}_${index}`,
            player_name: transferInfo.playerName,
            type: transferInfo.type,
            club: transferInfo.club,
            value: transferInfo.value,
            status: transferInfo.status,
            date: this.formatDate(item.publishedAt),
            source: item.source,
            reliability: this.calculateReliability(item.source, item.title),
            description: item.title.substring(0, 150) + (item.title.length > 150 ? '...' : '')
          });
        }
      });

      // Remove duplicates and sort by date
      const uniqueRumors = this.removeDuplicates(allRumors);
      return uniqueRumors
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20); // Limit to 20 most recent

    } catch (error) {
      console.error('Error fetching real transfer news:', error);
      return [];
    }
  }

  async fetchAllMaritimoNews(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    try {
      // Get news directly from RSS sources
      const directNews = await this.fetchDirectMaritimoNews();
      allNews.push(...directNews);

      // Remove duplicates and sort by date
      const uniqueNews = this.removeDuplicateNews(allNews);
      return uniqueNews
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 50); // Limit to 50 most recent

    } catch (error) {
      console.error('Error fetching all Marítimo news:', error);
      return [];
    }
  }

  private async fetchDirectMaritimoNews(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    try {
      // OPTIMIZATION: Parallelize Google News RSS searches instead of sequential
      const searchQueries = [
        'CS Marítimo',
        'Marítimo futebol',
        'CS Marítimo jogos',
        'Marítimo resultados',
        'CS Marítimo notícias'
      ];

      // Parallel Google News fetches
      console.log('🚀 PERFORMANCE: Starting parallel Google News fetches...');
      const googleNewsPromises = searchQueries.map(async (query) => {
        const url = `${this.GOOGLE_NEWS_RSS}?q=${encodeURIComponent(query)}&hl=pt-PT&gl=PT&ceid=PT:pt`;
        
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 8000
          });

          return this.parseGoogleNewsRSS(response.data);
        } catch (error) {
          console.log(`⚠️ Google News query failed: ${query}`);
          return [];
        }
      });

      // Wait for all Google News searches to complete
      const googleResults = await Promise.allSettled(googleNewsPromises);
      googleResults.forEach(result => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
        }
      });

      console.log(`📰 PERFORMANCE: Google News parallel fetch completed - ${allNews.length} items`);

      // OPTIMIZATION: Parallelize Portuguese sports RSS sources
      const rssSources = [
        {
          name: 'Record',
          url: 'https://www.record.pt/rss'
        },
        {
          name: 'A Bola',
          url: 'https://www.abola.pt/rss/noticias.xml'
        },
        {
          name: 'O Jogo',
          url: 'https://www.ojogo.pt/rss'
        }
      ];

      console.log('🚀 PERFORMANCE: Starting parallel RSS fetches...');
      const rssPromises = rssSources.map(async (source) => {
        try {
          const response = await axios.get(source.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 8000
          });

          const newsItems = this.parseRSSFeed(response.data, source.name);
          const maritimoNews = newsItems.filter(item => 
            this.isMaritimoRelated(item.title + ' ' + item.description)
          );

          return maritimoNews;
        } catch (error) {
          console.log(`⚠️ RSS source failed: ${source.name}`);
          return [];
        }
      });

      // Wait for all RSS fetches to complete
      const rssResults = await Promise.allSettled(rssPromises);
      rssResults.forEach(result => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
        }
      });

      console.log(`📰 PERFORMANCE: RSS parallel fetch completed - total ${allNews.length} items`);

    } catch (error) {
      console.error('Error fetching direct Marítimo news:', error);
    }

    return allNews;
  }

  private async fetchFromGoogleNewsRSS(): Promise<TransferRumor[]> {
    try {
      const searchQueries = [
        'CS Marítimo transferências',
        'Marítimo futebol contratações',
        'Marítimo jogadores saída',
        'CS Marítimo mercado'
      ];

      const allNews: NewsItem[] = [];

      for (const query of searchQueries) {
        const url = `${this.GOOGLE_NEWS_RSS}?q=${encodeURIComponent(query)}&hl=pt-PT&gl=PT&ceid=PT:pt`;
        
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 8000
          });

          const newsItems = this.parseGoogleNewsRSS(response.data);
          allNews.push(...newsItems);
          
          // Delay between requests
          await this.delay(1000);
        } catch (error) {
          // Silently continue to next query
        }
      }

      return this.convertNewsToRumors(allNews, 'Google News');
    } catch (error) {
      console.error('Error fetching from Google News RSS:', error);
      return [];
    }
  }

  private async fetchFromNewsAPI(): Promise<TransferRumor[]> {
    if (!this.NEWS_API_KEY) {
      return [];
    }

    try {
      const queries = [
        'CS Marítimo transferências',
        'Marítimo futebol',
        'Marítimo contratações'
      ];

      const allNews: NewsItem[] = [];

      for (const query of queries) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&sortBy=publishedAt&pageSize=10`;
        
        try {
          const response = await axios.get(url, {
            headers: {
              'X-API-Key': this.NEWS_API_KEY
            },
            timeout: 8000
          });

          if (response.data.articles) {
            const newsItems = response.data.articles.map((article: any) => ({
              title: article.title,
              description: article.description || '',
              url: article.url,
              publishedAt: article.publishedAt,
              source: article.source?.name || 'News API'
            }));

            allNews.push(...newsItems);
          }
          
          await this.delay(1000);
        } catch (error) {
          // Silently continue to next query
        }
      }

      return this.convertNewsToRumors(allNews, 'News API');
    } catch (error) {
      console.error('Error fetching from News API:', error);
      return [];
    }
  }

  private async fetchFromPortugueseSportsRSS(): Promise<TransferRumor[]> {
    const rssSources = [
      {
        name: 'Record',
        url: 'https://www.record.pt/rss',
        reliability: 4
      },
      {
        name: 'A Bola',
        url: 'https://www.abola.pt/rss/noticias.xml',
        reliability: 4
      },
      {
        name: 'O Jogo',
        url: 'https://www.ojogo.pt/rss',
        reliability: 3
      }
    ];

    const allNews: NewsItem[] = [];

    for (const source of rssSources) {
      try {
        const response = await axios.get(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 8000
        });

        const newsItems = this.parseRSSFeed(response.data, source.name);
        const maritimoNews = newsItems.filter(item => 
          this.isMaritimoRelated(item.title + ' ' + item.description)
        );

        allNews.push(...maritimoNews);
        await this.delay(1000);
      } catch (error) {
        // Silently continue to next source
      }
    }

    return this.convertNewsToRumors(allNews, 'RSS Feed');
  }

  private parseGoogleNewsRSS(xmlData: string): NewsItem[] {
    const items: NewsItem[] = [];
    
    try {
      // Simple XML parsing for RSS items
      const itemMatches = xmlData.match(/<item[^>]*>[\s\S]*?<\/item>/g);
      
      if (itemMatches) {
        itemMatches.forEach(itemXml => {
          const title = this.extractXMLContent(itemXml, 'title');
          const description = this.extractXMLContent(itemXml, 'description');
          const link = this.extractXMLContent(itemXml, 'link');
          const pubDate = this.extractXMLContent(itemXml, 'pubDate');
          
          // Processing Google News item
          
          if (title && this.isMaritimoRelated(title + ' ' + description)) {
            const cleanedDescription = this.cleanText(description);
            // Only include description if it's meaningful (more than 20 chars and contains actual words)
            const finalDescription = this.isValidDescription(cleanedDescription) ? cleanedDescription : '';
            
            items.push({
              title: this.cleanText(title),
              description: finalDescription,
              url: link || '',
              publishedAt: pubDate || new Date().toISOString(),
              source: 'Google News'
            });
          }
        });
      }
    } catch (error) {
      console.error('Error parsing Google News RSS:', error);
    }

    return items;
  }

  private parseRSSFeed(xmlData: string, sourceName: string): NewsItem[] {
    const items: NewsItem[] = [];
    
    try {
      const itemMatches = xmlData.match(/<item[^>]*>[\s\S]*?<\/item>/g);
      
      if (itemMatches) {
        itemMatches.forEach(itemXml => {
          const title = this.extractXMLContent(itemXml, 'title');
          const description = this.extractXMLContent(itemXml, 'description');
          const link = this.extractXMLContent(itemXml, 'link');
          const pubDate = this.extractXMLContent(itemXml, 'pubDate');
          
          // Processing RSS item
          
          if (title) {
            const cleanedDescription = this.cleanText(description);
            const finalDescription = this.isValidDescription(cleanedDescription) ? cleanedDescription : '';
            
            items.push({
              title: this.cleanText(title),
              description: finalDescription,
              url: link || '',
              publishedAt: pubDate || new Date().toISOString(),
              source: sourceName
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    }

    return items;
  }

  private extractXMLContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities like &nbsp;
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/href\s*=\s*["'][^"']*["']/gi, '') // Remove href attributes
      .replace(/\bhref\b/gi, '') // Remove remaining 'href' text
      .replace(/\ba_blank\b/gi, '') // Remove a_blank
      .replace(/\bnbsp\b/gi, ' ') // Replace nbsp with space
      .replace(/font\s*color\s*=\s*["'][^"']*["']/gi, '') // Remove font color attributes
      .replace(/\/font/gi, '') // Remove /font
      .replace(/\/a/gi, '') // Remove /a
      .replace(/target\s*=\s*["'][^"']*["']/gi, '') // Remove target attributes
      .replace(/rel\s*=\s*["'][^"']*["']/gi, '') // Remove rel attributes
      .replace(/style\s*=\s*["'][^"']*["']/gi, '') // Remove style attributes
      .replace(/class\s*=\s*["'][^"']*["']/gi, '') // Remove class attributes
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .replace(/^\s*[\/\-\.\,\;\:]+\s*/g, '') // Remove leading punctuation
      .trim();
  }

  private isValidDescription(description: string): boolean {
    // Check if description is meaningful
    if (!description || description.length < 20) {
      return false;
    }
    
    // Check if it contains actual words (not just symbols/numbers)
    const wordCount = description.match(/[a-zA-ZÀ-ÿ]{3,}/g)?.length || 0;
    if (wordCount < 3) {
      return false;
    }
    
    // Check if it's not mostly HTML remnants or code
    const codePatterns = [
      /^\s*[\/\-\.\,\;\:\#\=\[\]]+\s*$/,
      /^[a-z_]+$/i, // Single words that look like variable names
      /^\d+$/,      // Just numbers
    ];
    
    if (codePatterns.some(pattern => pattern.test(description))) {
      return false;
    }
    
    return true;
  }

  private isMaritimoRelated(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Main Marítimo keywords
    const maritimoKeywords = [
      'cs marítimo', 'maritimo', 'marítimo', 'clube sport marítimo',
      'cs maritimo'
    ];
    
    // Check if it mentions Marítimo
    const hasMaritimoKeyword = maritimoKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    if (!hasMaritimoKeyword) {
      return false;
    }

    // RELAXED: For coach/staff news, be more permissive
    const coachKeywords = ['treinador', 'técnico', 'comandante', 'staff técnico'];
    const hasCoachKeyword = coachKeywords.some(keyword => lowerText.includes(keyword));

    if (hasCoachKeyword) {
      // For coach news, just check if it's not clearly about leaving
      const clearlyLeavingIndicators = [
        'deixa o marítimo', 'sai do marítimo', 'rescinde com o marítimo',
        'despedido do marítimo', 'ex-treinador', 'antigo técnico'
      ];

      const isClearlyLeaving = clearlyLeavingIndicators.some(indicator => 
        lowerText.includes(indicator)
      );

      // If it's clearly about leaving, reject it
      if (isClearlyLeaving) {
        return false;
      }

      // For other coach news, be permissive - let it through for further processing
      return true;
    }

    // ENHANCED: Filter out non-main team content
    const nonMainTeamKeywords = [
      'sub-15', 'sub-17', 'sub-19', 'sub-21', 'sub-23', 
      'juvenis', 'juniores', 'academia', 'formação',
      'escalões jovens', 'youth', 'academy',
      // Staff keywords that we want to filter out unless high relevance
      'massagista', 'kitman', 'segurança', 'jardineiro',
      'administrativa', 'secretária', 'rececionista'
    ];

    // If it's about youth/academy, require it to be transfer-related and high quality
    const hasNonMainTeamKeywords = nonMainTeamKeywords.some(keyword => 
      lowerText.includes(keyword)
    );

    if (hasNonMainTeamKeywords) {
      // Only allow if it's clearly about transfers and high quality source
      const transferKeywords = ['transfere', 'contrata', 'assina', 'sai', 'renova'];
      const hasTransferKeyword = transferKeywords.some(keyword => 
        lowerText.includes(keyword)
      );
      
      // Require both transfer keywords and quality indicators
      const qualityIndicators = ['oficial', 'confirmado', 'comunicado'];
      const hasQualityIndicator = qualityIndicators.some(indicator => 
        lowerText.includes(indicator)
      );

      return hasTransferKeyword && hasQualityIndicator;
    }

    // Enhanced filtering for irrelevant content
    const irrelevantKeywords = [
      'cinema', 'música', 'festa', 'concerto', 'teatro',
      'política', 'eleições', 'economia', 'covid', 'pandemia',
      'temperatura', 'meteorologia', 'trânsito', 'acidentes',
      'crime', 'polícia', 'tribunal', 'hospital',
      'supermercado', 'loja', 'restaurante', 'hotel'
    ];

    const hasIrrelevantContent = irrelevantKeywords.some(keyword => 
      lowerText.includes(keyword)
    );

    if (hasIrrelevantContent) {
      return false;
    }

    return true;
  }

  private isTransferRelated(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Enhanced transfer keywords
    const transferKeywords = [
      // Portuguese transfer terms
      'transferência', 'transferencia', 'contratação', 'contratacao',
      'renovação', 'renovacao', 'saída', 'saida', 'chegada',
      'reforço', 'reforco', 'mercado', 'acordo', 'negociação',
      'negociacao', 'proposta', 'interessado', 'sondagem',
      
      // Action verbs
      'assina', 'renova', 'contrata', 'sai', 'deixa', 'chega',
      'prolonga', 'estende', 'rescinde', 'termina',
      
      // Status terms
      'confirmado', 'oficial', 'rumor', 'especulação', 'especulacao',
      'próximo', 'proximo', 'perto de', 'em vias de',
      
      // Financial terms
      'valor', 'euros', 'milhões', 'milhoes', 'empréstimo', 'emprestimo',
      'cedência', 'cedencia', 'gratuito', 'livre',

      // NEW: Coach-specific terms (more relaxed)
      'treinador', 'técnico', 'comandante técnico', 'mister',
      'comando técnico', 'staff técnico', 'equipa técnica',
      'assume', 'apresentado', 'nomeado', 'escolhido', 'novo',
      
      // ULTRA-PERMISSIVE for coaches
      'é o novo', 'será o', 'foi nomeado', 'foi escolhido',
      'apresenta', 'apresentação', 'oficializado', 'oficialização',
      'assume funções', 'toma posse', 'inicia funções',
      'chega ao marítimo', 'chega ao cs marítimo'
    ];

    const hasTransferKeyword = transferKeywords.some(keyword => 
      lowerText.includes(keyword)
    );

    if (!hasTransferKeyword) {
      return false;
    }

    // RELAXED: For coach-related news, be more permissive
    const coachIndicators = ['treinador', 'técnico', 'comandante', 'mister', 'coach'];
    const hasCoachIndicator = coachIndicators.some(indicator => 
      lowerText.includes(indicator)
    );

    // If it's about a coach, be more permissive
    if (hasCoachIndicator) {
      return true;
    }

    // For other news, require more specific indicators
    const playerIndicators = [
      'jogador', 'atleta', 'futebolista', 'internacional',
      'avançado', 'medio', 'médio', 'defesa', 'guarda-redes',
      'extremo', 'lateral', 'central', 'capitão', 'capitao'
    ];

    return playerIndicators.some(indicator => lowerText.includes(indicator));
  }

  private convertNewsToRumors(newsItems: NewsItem[], sourceType: string): TransferRumor[] {
    const rumors: TransferRumor[] = [];
    newsItems.forEach((item, index) => {
      const transferInfo = this.extractTransferInfoFromNews(item);
      if (transferInfo) {
        // Create a more unique ID based on content hash
        const contentHash = this.createContentHash(item.title + item.description + item.url);
        // Detect if this is a coach
        const isCoach = this.isCoachNews(item.title + ' ' + item.description);
        let reliability = this.calculateReliability(item.source, item.title);
        let status = transferInfo.status;
        // Normalizar texto para facilitar matching
        function normalize(str: string) {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        }
        const lowerText = normalize(item.title + ' ' + item.description);
        // Check for official indicators
        // Indicadores oficiais
        const officialIndicators = [
          'oficial', 'apresentado', 'confirmado', 'anunciado', 'apresentacao', 'oficializa', 'oficializado',
          'e o novo treinador do maritimo', 'e o novo tecnico do maritimo',
          'assume o comando do maritimo', 'assume o maritimo',
          'nomeado treinador do maritimo', 'escolhido para o maritimo',
          'apresentado como novo treinador', 'apresentado como treinador do maritimo'
        ];
        // Regex para apanhar frases do tipo 'X é o novo treinador do Marítimo'
        const officialRegex = /[a-zçãéíóúâêôàèìòùäëïöüñ\s\-]+e o novo treinador do maritimo/;
        if (officialIndicators.some(ind => lowerText.includes(ind)) || officialRegex.test(lowerText)) {
          status = 'confirmado';
          reliability = 5;
        }
        if (isCoach && reliability < 2) reliability = 2;
        // Forçar para Vítor Matos - sempre confirmado e alta confiabilidade
        if (transferInfo.playerName && ['vítor matos', 'vitor matos'].includes(transferInfo.playerName.toLowerCase())) {
          status = 'confirmado';
          reliability = 5;
          // CORREÇÃO: Garantir informação correta do Vítor Matos
          transferInfo.club = 'CS Marítimo';
          transferInfo.type = 'compra';
          transferInfo.value = 'Valor não revelado';
          // Force Vítor Matos as confirmed with high reliability
        }
        rumors.push({
          id: `real_${contentHash}_${index}`,
          player_name: transferInfo.playerName,
          type: transferInfo.type,
          club: transferInfo.club,
          value: transferInfo.value,
          status,
          date: this.formatDate(item.publishedAt),
          source: item.source,
          reliability,
          description: item.title.substring(0, 150) + (item.title.length > 150 ? '...' : ''),
          category: isCoach ? 'coach' : undefined,
          isMainTeam: isCoach ? true : undefined
        });
      }
    });
    return rumors;
  }

  private extractTransferInfoFromNews(item: NewsItem): {
    playerName: string;
    type: "compra" | "venda" | "renovação";
    club: string;
    value: string;
    status: "rumor" | "negociação" | "confirmado";
  } | null {
    const fullText = item.title + ' ' + item.description;
    const lowerText = fullText.toLowerCase();
    
    // ENHANCED: Check if this is about someone COMING TO Marítimo vs LEAVING Marítimo
    const comingToMaritimoIndicators = [
      'novo treinador do marítimo', 'novo técnico do marítimo',
      'treinador do marítimo', 'técnico do marítimo',
      'assume o comando do marítimo', 'assume o marítimo',
      'contratado pelo marítimo', 'assina pelo marítimo',
      'é o novo treinador', 'será o treinador',
      'nomeado treinador do marítimo', 'escolhido para o marítimo',
      'chega ao marítimo', 'chega ao cs marítimo',
      'apresentado no marítimo', 'oficializado no marítimo',
      'toma posse no marítimo', 'inicia funções no marítimo'
    ];

    const leavingMaritimoIndicators = [
      'ex-treinador do marítimo', 'antigo técnico do marítimo',
      'deixa o marítimo', 'sai do marítimo',
      'rescinde com o marítimo', 'despedido do marítimo',
      'assina por', 'contratado pelo', 'novo clube',
      'treinador assina por', 'técnico assina por',
      'deixa o cargo', 'abandona o cargo'
    ];

    const isComingToMaritimo = comingToMaritimoIndicators.some(indicator => 
      lowerText.includes(indicator)
    );

    const isLeavingMaritimo = leavingMaritimoIndicators.some(indicator => 
      lowerText.includes(indicator)
    );

    // ENHANCED: Try to extract coach/staff name first - but only if coming TO Marítimo
    if (isComingToMaritimo && !isLeavingMaritimo) {
      const coachName = this.extractCoachNameFromText(fullText);
      if (coachName && coachName !== 'Novo elemento técnico' && coachName.toLowerCase() !== 'novo') {
        return {
          playerName: coachName,
          type: 'compra',
          club: 'CS Marítimo',
          value: 'Valor não revelado',
          status: this.determineStatusFromText(fullText)
        };
      } else {
        // Nome genérico, não criar rumor
        return null;
      }
    }

    // If it's about someone leaving Marítimo, don't include in transfers
    if (isLeavingMaritimo) {
      return null;
    }

    // Extract player name
    const playerName = this.extractPlayerNameFromText(fullText);
    
    // Se não conseguir identificar um jogador específico, mas for claramente sobre transferência do Marítimo, aceitar
    if (!playerName || playerName === 'Jogador não identificado') {
      // Only process if it's clearly about someone coming TO Marítimo
      if (!isComingToMaritimo) {
        return null;
      }

      // Verificar se é sobre treinador/staff (agora aceitar também)
      const staffKeywords = ['treinador', 'técnico', 'diretor', 'presidente', 'staff', 'equipa técnica'];
      if (staffKeywords.some(keyword => fullText.toLowerCase().includes(keyword))) {
        // Se for sobre staff, extrair nome do staff
        const staffName = this.extractStaffNameFromText(fullText);
        if (staffName && staffName !== 'Novo elemento técnico') {
          return {
            playerName: staffName,
            type: 'compra', // Staff hires are treated as purchases
            club: 'CS Marítimo',
            value: 'Valor não revelado',
            status: this.determineStatusFromText(fullText)
          };
        }
      }
      
      // Se não mencionar jogador específico mas falar de transferência, pode ser rumor geral
      if (!fullText.toLowerCase().includes('jogador') && !fullText.toLowerCase().includes('futebolista')) {
        return null;
      }
    }

    // Determine transfer type
    const type = this.determineTransferType(fullText);
    
    // Extract club
    const club = this.extractClubFromText(fullText, type);
    
    // Extract value
    const value = this.extractValueFromText(fullText);
    
    // Determine status
    const status = this.determineStatusFromText(fullText);

    return {
      playerName: playerName || 'Jogador não identificado',
      type,
      club,
      value,
      status
    };
  }

  private extractPlayerNameFromText(text: string): string | null {
    // Known Marítimo players (plantel atual 2024/25)
    const knownPlayers = [
      // Equipa Principal
      'Samú Silva', 'Igor Julião', 'Erivaldo Almeida', 'Noah Madsen',
      'Fabio Blanco', 'Pedrinho', 'Preslav Borukov', 'Bernardo Gomes',
      'Pedro Empis', 'Carlos Daniel', 'Vladan Danilović', 'Tomás Domingos',
      'Pedro Teixeira', 'Rodrigo Borges', 'Afonso Freitas', 'Nachon Nsingi',
      'Patrick Fernandes', 'Noah Françoise', 'Romain Correia', 'Fábio China',
      'Michel', 'Enrique Zauner', 'Francisco França', 'Martim Tavares',
      'Rodrigo Andrade', 'Ibrahima Guirassy', 'Gonçalo Tabuaço',
      
      // Outros jogadores sob contrato
      'Nito Gomes',
      
      // Equipa B - Guarda-redes
      'Philipp Sukhikh', 'Tomás Von Hellens', 'Pedro Gomes',
      
      // Equipa B - Defesas
      'Afonso Martins', 'David Freitas', 'Cristiano Gomes', 'Jhonnys Guerrero',
      'João Castro', 'Lucas Von Hellens', 'João Barros', 'Martim Vieira',
      'Nuno Castanha',
      
      // Equipa B - Médios
      'Ricardo Santos', 'José Camacho', 'Tiago Sousa',
      
      // Equipa B - Avançados
      'Francisco Gomes', 'Rúben Marques', 'Rodrigo Vasconcelos',
      
      // Variações sem acentos para melhor detecção
      'Samu Silva', 'Igor Juliao', 'Fabio China', 'Vladan Danilovic',
      'Tomas Domingos', 'Afonso Freitas', 'Noah Francoise', 'Romain Correia',
      'Francisco Franca', 'Goncalo Tabuaco', 'Tomas Von Hellens',
      'Ruben Marques',
      
      // Jogadores históricos que ainda podem aparecer em notícias
      'Cláudio Winck', 'André Vidigal', 'Marco Silva', 'João Afonso',
      'Diogo Mendes', 'Rúben Macedo', 'Edgar Costa', 'Joel Tagueu',
      'Matheus Costa', 'Paulo Victor', 'Zainadine Júnior', 'Stefano Beltrame',
      'Henrique', 'Moisés Mosquera', 'Val', 'Brayan Riascos',
      'Pedro Pelágio', 'Iván Rossi', 'Félix Correia', 'Geny Catamo',
      'Claudio Winck', 'Andre Vidigal', 'Joao Afonso', 'Ruben Macedo',
      'Moises Mosquera', 'Felix Correia', 'Ivan Rossi', 'Pedro Pelagio',
      
      // Possíveis alvos/rumores comuns
      'Ivo Vieira', 'Albano Oliveira'
    ];

    // Check for known players first
    for (const player of knownPlayers) {
      if (text.toLowerCase().includes(player.toLowerCase())) {
        return player;
      }
    }

    // Improved name extraction patterns
    const namePatterns = [
      // Pattern for Portuguese names with accents
      /\b([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)+)\b/g,
      // Pattern for names in quotes
      /"([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)+)"/g,
      // Pattern for names after common keywords
      /(?:jogador|futebolista|avançado|médio|defesa|guarda-redes)\s+([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)+)/gi
    ];

    for (const pattern of namePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Filter out common words that are not names
        const excludeWords = ['marítimo', 'clube', 'equipa', 'futebol', 'jogador', 'transferência', 'contratação', 'treinador', 'técnico'];
        const potentialName = matches[0].replace(/"/g, '').trim();
        
        if (!excludeWords.some(word => potentialName.toLowerCase().includes(word)) && 
            potentialName.length > 3 && 
            potentialName.split(' ').length >= 2) {
          return potentialName;
        }
      }
    }

    // Try to find names mentioned with Marítimo context
    const maritimoContextPattern = /marítimo.*?([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)/gi;
    const contextMatch = text.match(maritimoContextPattern);
    if (contextMatch && contextMatch.length > 0) {
      const nameMatch = contextMatch[0].match(/([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)$/);
      if (nameMatch) {
        return nameMatch[1];
      }
    }

    return null; // Retorna null em vez de string para melhor controle
  }

  private extractStaffNameFromText(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    // Known staff members and coaches
    const knownStaff = [
      'vítor matos', 'vitor matos', 'vasco santos', 'joão henriques', 
      'ricardo sousa', 'carlos daniel', 'nuno faria', 'hugo vieira',
      'ivo vieira', 'albano oliveira'
    ];

    // Check for known staff first
    for (const staff of knownStaff) {
      if (lowerText.includes(staff)) {
        // Return properly capitalized
        return staff.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    // ENHANCED: Use the same patterns as coach extraction for consistency
    const staffPatterns = [
      // Pattern 1: "Vítor Matos é o novo diretor"
      /([A-ZÁÊÇÕÜ][a-záêçõü]+(?:\s+[A-ZÁÊÇÕÜ][a-záêçõü]+)*)\s+(?:é|será|foi|assume)\s+o\s+(?:novo\s+)?(?:diretor|presidente|secretário|administrador|gerente|treinador|técnico)/gi,
      
      // Pattern 2: "novo diretor Vítor Matos"
      /(?:novo|ex-)\s+(?:diretor|presidente|secretário|administrador|gerente|treinador|técnico)\s+([A-ZÁÊÇÕÜ][a-záêçõü]+(?:\s+[A-ZÁÊÇÕÜ][a-záêçõü]+)*)/gi,
      
      // Pattern 3: "diretor Vítor Matos"
      /(?:diretor|presidente|secretário|administrador|gerente|treinador|técnico)\s+([A-ZÁÊÇÕÜ][a-záêçõü]+(?:\s+[A-ZÁÊÇÕÜ][a-záêçõü]+)*)/gi,
      
      // Pattern 4: "Vítor Matos assume/nomeado"
      /([A-ZÁÊÇÕÜ][a-záêçõü]+(?:\s+[A-ZÁÊÇÕÜ][a-záêçõü]+)*)\s+(?:assume|assinou|nomeado|eleito|contratado)/gi,
      
      // Pattern 5: "novo X do Marítimo"
      /novo\s+([A-ZÁÊÇÕÜ][a-záêçõü]+(?:\s+[A-ZÁÊÇÕÜ][a-záêçõü]+)*)\s+(?:do|no|para o)\s+marítimo/gi,

      // Pattern 6: In quotes
      /"([A-ZÁÊÇÕÜ][a-záêçõü]+(?:\s+[A-ZÁÊÇÕÜ][a-záêçõü]+)*)"/g
    ];

    for (const pattern of staffPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        for (const match of matches) {
          const extractedName = match[1]?.trim();
          if (extractedName) {
            // Filter out common non-names and club names
            const excludeWords = [
              'Marítimo', 'Maritimo', 'Clube', 'Sport', 'Técnico', 'Treinador',
              'Diretor', 'Presidente', 'Futebol', 'Desporto', 'Oficial', 
              'Comunicado', 'Notícias', 'Record', 'Bola', 'Jogo', 'Sapo', 
              'Google', 'News', 'Elemento', 'Novo'
            ];
            
            if (!excludeWords.some(word => extractedName.includes(word)) && 
                extractedName.length > 3 && extractedName.length < 30) {
              
              // Check if it looks like a real name (has at least 2 words)
              const nameParts = extractedName.split(' ').filter(part => part.length > 1);
              if (nameParts.length >= 2) {
                return extractedName;
              }
            }
          }
        }
      }
    }

    return null;
  }

  private determineTransferType(text: string): "compra" | "venda" | "renovação" {
    const renewalKeywords = [
      'renovação', 'renovacao', 'renova', 'prolonga', 'estende', 
      'permanece', 'fica', 'continua', 'acordo de renovação',
      'extensão', 'extensao', 'renegociação'
    ];
    
    const buyKeywords = [
      'contratação', 'contratacao', 'chegada', 'reforço', 'reforco', 
      'assinou', 'novo jogador', 'apresentado', 'chega ao'
    ];
    
    const sellKeywords = [
      'saída', 'saida', 'deixa', 'abandona', 'venda', 
      'transfere-se', 'sai do', 'despede-se'
    ];

    const lowerText = text.toLowerCase();
    
    // Check for renewal first
    const hasRenewalKeyword = renewalKeywords.some(keyword => lowerText.includes(keyword));
    if (hasRenewalKeyword) return 'renovação';
    
    const hasBuyKeyword = buyKeywords.some(keyword => lowerText.includes(keyword));
    const hasSellKeyword = sellKeywords.some(keyword => lowerText.includes(keyword));

    if (hasBuyKeyword && !hasSellKeyword) return 'compra';
    if (hasSellKeyword && !hasBuyKeyword) return 'venda';
    
    // Context-based detection
    if (lowerText.includes('para o marítimo') || lowerText.includes('ao marítimo')) {
      return 'compra';
    }
    
    if (lowerText.includes('do marítimo') || lowerText.includes('deixa o marítimo')) {
      return 'venda';
    }
    
    return 'compra'; // Default - assume it's a new arrival
  }

  private extractClubFromText(text: string, transferType?: "compra" | "venda" | "renovação"): string {
    // If it's a renewal, the player stays with Marítimo
    if (transferType === 'renovação') {
      return 'CS Marítimo';
    }
    
    const portugueseClubs = [
      { pattern: /sporting(?:\s+cp|\s+clube\s+de\s+portugal)?/i, name: 'Sporting CP' },
      { pattern: /benfica(?:\s+sl)?/i, name: 'SL Benfica' },
      { pattern: /fc\s+porto|porto\s+fc/i, name: 'FC Porto' },
      { pattern: /sc\s+braga|braga\s+sc/i, name: 'SC Braga' },
      { pattern: /vitória(?:\s+sc|\s+guimarães)/i, name: 'Vitória SC' },
      { pattern: /gil\s+vicente/i, name: 'Gil Vicente FC' },
      { pattern: /boavista\s+fc/i, name: 'Boavista FC' },
      { pattern: /rio\s+ave/i, name: 'Rio Ave FC' },
      { pattern: /cd\s+santa\s+clara/i, name: 'CD Santa Clara' },
      { pattern: /portimonense/i, name: 'Portimonense SC' },
      { pattern: /famalicão/i, name: 'FC Famalicão' },
      { pattern: /paços\s+de\s+ferreira/i, name: 'FC Paços de Ferreira' },
      { pattern: /arouca/i, name: 'FC Arouca' },
      { pattern: /chaves/i, name: 'GD Chaves' },
      { pattern: /vizela/i, name: 'FC Vizela' },
      { pattern: /casa\s+pia/i, name: 'Casa Pia AC' },
      { pattern: /estoril/i, name: 'GD Estoril Praia' }
    ];

    for (const club of portugueseClubs) {
      if (club.pattern.test(text)) {
        return club.name;
      }
    }

    // For sales, if no specific club is mentioned
    if (transferType === 'venda') {
      return 'Destino a confirmar';
    }

    return 'Clube não especificado';
  }

  private extractValueFromText(text: string): string {
    // Primeiro verificar se é sobre treinador/staff - se for, não extrair valores
    const staffKeywords = ['treinador', 'técnico', 'diretor', 'presidente', 'staff', 'equipa técnica'];
    const lowerText = text.toLowerCase();
    const isAboutStaff = staffKeywords.some(keyword => lowerText.includes(keyword));
    
    if (isAboutStaff) {
      return 'Valor não revelado';
    }

    const valuePatterns = [
      // Padrões específicos para transferências de jogadores
      /(?:transferência|contratação|negociação|acordo|proposta)\s*(?:de|por)?\s*€?\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M|mil|K)/gi,
      /(?:custo|valor|preço|preco)\s*de\s*€?\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M|mil|K)/gi,
      
      // Padrões em euros com contexto de jogador
      /jogador.*?€\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M|mil|K)/gi,
      /futebolista.*?€\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M|mil|K)/gi,
      
      // Padrões mais específicos
      /€\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M)\s*(?:de\s*euros?)?/gi,
      /(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M)\s*de\s*euros/gi,
      /(\d+(?:[.,]\d+)?)\s*(mil)\s*euros/gi,
      
      // Padrões com "por"
      /por\s*€?\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M|mil)/gi,
      /por\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M)\s*de\s*euros/gi,
      
      // Padrões mais simples mas com validação de contexto
      /€\s*(\d+(?:[.,]\d+)?)\s*(milhões?|milhao|milhoes|M)/gi,
      /(\d+(?:[.,]\d+)?)\s*euros/gi
    ];

    for (const pattern of valuePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Verificar se o valor está no contexto correto (perto de palavras relacionadas com transferências)
        const match = matches[0];
        const matchIndex = text.toLowerCase().indexOf(match.toLowerCase());
        const contextBefore = text.substring(Math.max(0, matchIndex - 100), matchIndex).toLowerCase();
        const contextAfter = text.substring(matchIndex, Math.min(text.length, matchIndex + match.length + 100)).toLowerCase();
        const fullContext = contextBefore + ' ' + contextAfter;
        
        // Verificar se está no contexto de transferência/jogador
        const transferContext = [
          'transferência', 'transferencia', 'contratação', 'contratacao',
          'jogador', 'futebolista', 'acordo', 'proposta', 'negociação', 'negociacao',
          'custo', 'valor', 'preço', 'preco', 'pagar', 'pago'
        ];
        
        const hasTransferContext = transferContext.some(keyword => fullContext.includes(keyword));
        
        if (hasTransferContext) {
          // Clean up the match and return it
          let value = match.trim();
          
          // Normalize common abbreviations
          value = value.replace(/milhao/gi, 'milhão');
          value = value.replace(/milhoes/gi, 'milhões');
          value = value.replace(/\bM\b/g, 'milhões');
          value = value.replace(/\bK\b/g, 'mil');
          
          // Add euro symbol if not present
          if (!value.includes('€') && !value.toLowerCase().includes('euro')) {
            value = '€' + value;
          }
          
          return value;
        }
      }
    }

    // Check for free transfer indicators
    const freeTransferKeywords = [
      'transferência livre', 'transferencia livre', 'livre', 'gratuito', 
      'sem custos', 'custo zero', 'a custo zero', 'fim de contrato',
      'parâmetro zero', 'parametro zero'
    ];
    
    if (freeTransferKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'Transferência livre';
    }

    // Check for loan indicators
    const loanKeywords = ['empréstimo', 'emprestimo', 'cedido', 'cedência', 'cedencia'];
    if (loanKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'Empréstimo';
    }

    return 'Valor não revelado';
  }

  private determineStatusFromText(text: string): "rumor" | "negociação" | "confirmado" {
    const confirmedKeywords = ['confirmado', 'oficial', 'anunciado', 'assinado'];
    const negotiationKeywords = ['negociação', 'negociacao', 'conversas', 'acordo'];
    
    const lowerText = text.toLowerCase();
    
    if (confirmedKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'confirmado';
    }
    
    if (negotiationKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'negociação';
    }
    
    return 'rumor';
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
  


  private calculateReliability(source: string, title: string): number {
    let baseReliability = 1;
    
    switch (source.toLowerCase()) {
      case 'record':
      case 'a bola':
        baseReliability = 3;
        break;
      case 'o jogo':
        baseReliability = 2;
        break;
      default:
        baseReliability = 1;
    }

    if (title.toLowerCase().includes('confirmado') || title.toLowerCase().includes('oficial')) {
      baseReliability = Math.min(5, baseReliability + 1);
    }

    return baseReliability;
  }

  private removeDuplicates(rumors: TransferRumor[]): TransferRumor[] {
    const seen = new Set<string>();
    let bestVitorMatosRumor: TransferRumor | null = null;
    
    const filteredRumors = rumors.filter(rumor => {
      const key = `${rumor.player_name}_${rumor.club}_${rumor.type}`.toLowerCase();
      
      // ULTRA-AGGRESSIVE: Keep only ONE Vítor Matos rumor globally
      if (['vítor matos', 'vitor matos'].includes(rumor.player_name.toLowerCase())) {
        if (!bestVitorMatosRumor) {
          bestVitorMatosRumor = rumor;
        } else {
          // Keep the best one
          const shouldReplace = 
            rumor.reliability > bestVitorMatosRumor.reliability ||
            (rumor.reliability === bestVitorMatosRumor.reliability && new Date(rumor.date) > new Date(bestVitorMatosRumor.date)) ||
            (rumor.reliability === bestVitorMatosRumor.reliability && rumor.source !== 'Google News' && bestVitorMatosRumor.source === 'Google News');
          
          if (shouldReplace) {
            bestVitorMatosRumor = rumor;
          }
        }
        return false; // Don't add yet, will add the best one at the end
      }
      
      // Regular duplicate check for other players
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    // Add the single best Vítor Matos rumor
    if (bestVitorMatosRumor) {
      filteredRumors.push(bestVitorMatosRumor);
    }

    return filteredRumors;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createContentHash(content: string): string {
    // Simple hash function to create unique IDs
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private removeDuplicateNews(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    const titleSimilarity = new Map<string, NewsItem>();
    
    return news.filter(item => {
      // Check exact duplicates first
      const exactKey = `${item.title}_${item.url}`.toLowerCase();
      if (seen.has(exactKey)) {
        return false;
      }
      seen.add(exactKey);
      
      // Check for similar titles (same story from different sources)
      const normalizedTitle = this.normalizeTitle(item.title);
      const titleKey = this.createTitleSignature(normalizedTitle);
      
      if (titleSimilarity.has(titleKey)) {
        const existingItem = titleSimilarity.get(titleKey)!;
        // Keep the one from more reliable source or more recent
        const existingReliability = this.getSourceReliability(existingItem.source);
        const currentReliability = this.getSourceReliability(item.source);
        
        if (currentReliability > existingReliability || 
            (currentReliability === existingReliability && new Date(item.publishedAt) > new Date(existingItem.publishedAt))) {
          // Replace the existing one
          titleSimilarity.set(titleKey, item);
          return true;
        }
        return false;
      }
      
      titleSimilarity.set(titleKey, item);
      return true;
    });
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  private createTitleSignature(normalizedTitle: string): string {
    // Create a signature based on key words, ignoring common words
    const commonWords = ['o', 'a', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem', 'que', 'e', 'ou', 'mas', 'se', 'quando', 'onde', 'como', 'porque', 'já', 'ainda', 'mais', 'menos', 'muito', 'pouco', 'todo', 'toda', 'todos', 'todas', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas'];
    
    const words = normalizedTitle.split(' ')
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .sort()
      .slice(0, 5); // Take first 5 significant words
    
    return words.join('_');
  }

  private getSourceReliability(source: string): number {
    switch (source.toLowerCase()) {
      case 'record': return 5;
      case 'a bola': return 4;
      case 'o jogo': return 4;
      case 'google news': return 3;
      default: return 2;
    }
  }

  // ENHANCED: Extract coach names specifically
  private extractCoachNameFromText(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    // Known coaches and potential coaches
    const knownCoaches = [
      'vítor matos', 'vitor matos', 'ivo vieira', 'vasco santos',
      'joão henriques', 'joao henriques', 'ricardo sousa', 'albano oliveira',
      'sérgio conceição', 'sergio conceicao', 'rui jorge', 'carlos carvalhal',
      'miguel cardoso', 'pedro martins', 'luis castro', 'luís castro',
      'jorge jesus', 'leonardo jardim', 'bruno lage', 'abel ferreira',
      // Add more common Portuguese coach names
      'josé mourinho', 'fernando santos', 'paulo sousa', 'marco silva',
      'nuno espírito santo', 'pedro caixinha', 'pepa', 'silas',
      // Add more potential names
      'paulo', 'miguel', 'carlos', 'joão', 'pedro', 'josé', 'luis',
      'francisco', 'ricardo', 'fernando', 'manuel', 'bruno', 'andre'
    ];

    // Check for known coaches first
    for (const coach of knownCoaches) {
      if (lowerText.includes(coach)) {
        // Return properly capitalized name
        return this.capitalizeCoachName(coach);
      }
    }

    // ULTRA-RELAXED: Try to extract coach name using very simple patterns
    const coachPatterns = [
      // Pattern 1: Very simple - any name with capital letter
      /\b([A-ZÁÊÇÕÜ][a-záêçõü]+(?:\s+[A-ZÁÊÇÕÜ][a-záêçõü]+)*)\b/g,
    ];

    for (const pattern of coachPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        for (const match of matches) {
          const extractedName = match[1]?.trim();
          if (extractedName) {
            // ULTRA-RELAXED: Filter out only the most obvious non-names
            const excludeWords = [
              'Marítimo', 'Maritimo', 'Clube', 'Sport', 'Futebol', 'Desporto',
              'Record', 'Bola', 'Jogo', 'Sapo', 'Google', 'News', 'Portugal',
              'Oficial', 'Comunicado', 'Nacional', 'Liga', 'Primeira',
              'Transferências', 'Mercado', 'Janeiro', 'Fevereiro', 'Março',
              'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro',
              'Outubro', 'Novembro', 'Dezembro'
            ];
            
            if (!excludeWords.some(word => extractedName.includes(word)) && 
                extractedName.length >= 2 && extractedName.length < 30) {
              
              // ULTRA-RELAXED: Accept even single names
              const nameParts = extractedName.split(' ').filter(part => part.length > 1);
              if (nameParts.length >= 1) {
                // Check if it looks like a reasonable name
                const hasNumbers = /\d/.test(extractedName);
                const hasSpecialChars = /[^a-zA-ZÀ-ÿ\s]/.test(extractedName);
                
                if (!hasNumbers && !hasSpecialChars) {
                  return extractedName;
                }
              }
            }
          }
        }
      }
    }

    return null;
  }

  // Helper method to capitalize coach names properly
  private capitalizeCoachName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private isCoachNews(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Known coach keywords
    const coachKeywords = ['treinador', 'técnico', 'comandante', 'mister', 'coach'];
    
    // Check if any of the coach keywords are present in the text
    return coachKeywords.some(keyword => lowerText.includes(keyword));
  }
}

export const realNewsService = new RealNewsService(); 