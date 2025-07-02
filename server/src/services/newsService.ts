import { realNewsService } from './realNewsService';

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

class NewsService {
  private news: NewsItem[] = [];
  private lastUpdate: Date | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private isUpdating = false;

  constructor() {
    // Initialize with news fetching
    this.updateNews();
    
    // Set up automatic updates every hour
    setInterval(() => {
      this.updateNews();
    }, 60 * 60 * 1000);
  }

  async getNews(): Promise<NewsItem[]> {
    // If cache is expired and not currently updating, trigger update
    if (this.shouldUpdate() && !this.isUpdating) {
      this.updateNews();
    }
    
    return this.news;
  }

  async refreshNews(): Promise<NewsItem[]> {
    await this.updateNews();
    return this.news;
  }

  private async updateNews(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      // Fetch all Marítimo-related news (not just transfers)
      const allNews = await realNewsService.fetchAllMaritimoNews();
      
      if (allNews.length > 0) {
        // Remove any existing fallback news (source: "Sistema") when we get real news
        this.news = this.news.filter(item => item.source !== "Sistema");
        
        // Remove duplicates based on URL, title, and content similarity
        const existingUrls = new Set(this.news.map(item => item.url));
        const existingTitleSignatures = new Set(this.news.map(item => this.createTitleSignature(item.title)));
        
        const newNews = allNews.filter((item: NewsItem) => {
          const titleSignature = this.createTitleSignature(item.title);
          return !existingUrls.has(item.url) && 
                 !existingTitleSignatures.has(titleSignature);
        });
        
        // Add new news to the beginning
        this.news = [...newNews, ...this.news];
        
        // Sort by date (newest first) and limit to 100
        this.news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        this.news = this.news.slice(0, 100);
        
        this.lastUpdate = new Date();
        
        console.log(`📰 NEWS SERVICE: Successfully updated with ${newNews.length} new articles, total: ${this.news.length}`);
      } else {
        // If we have no news at all, generate minimal fallback data
        if (this.news.length === 0) {
          this.news = this.generateFallbackNews();
          this.lastUpdate = new Date();
          console.log('📰 NEWS SERVICE: No news found, using fallback');
        }
      }
    } catch (error) {
      console.error('Error updating news:', error);
      
      // If we have no news at all, generate fallback data
      if (this.news.length === 0) {
        this.news = this.generateFallbackNews();
        this.lastUpdate = new Date();
        console.log('📰 NEWS SERVICE: Error occurred, using fallback');
      }
    } finally {
      this.isUpdating = false;
    }
  }

  private generateFallbackNews(): NewsItem[] {
    return [
      {
        title: "Informação não disponível",
        description: "Dados de notícias temporariamente indisponíveis. A tentar obter informações atualizadas...",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: "Sistema"
      }
    ];
  }

  private shouldUpdate(): boolean {
    if (!this.lastUpdate) return true;
    return Date.now() - this.lastUpdate.getTime() > this.CACHE_DURATION;
  }

  private createTitleSignature(title: string): string {
    // Create a signature based on key words, ignoring common words
    const commonWords = ['o', 'a', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem', 'que', 'e', 'ou', 'mas', 'se', 'quando', 'onde', 'como', 'porque', 'já', 'ainda', 'mais', 'menos', 'muito', 'pouco', 'todo', 'toda', 'todos', 'todas', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas'];
    
    const normalizedTitle = title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    const words = normalizedTitle.split(' ')
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .sort()
      .slice(0, 5); // Take first 5 significant words
    
    return words.join('_');
  }
}

export const newsService = new NewsService(); 