import api from './api';

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

class NewsService {
  async getNews(): Promise<NewsItem[]> {
    try {
      const response = await api.get('/news');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  async refreshNews(): Promise<NewsItem[]> {
    try {
      const response = await api.post('/news/refresh');
      return response.data.data || [];
    } catch (error) {
      console.error('Error refreshing news:', error);
      throw error;
    }
  }
}

export const newsService = new NewsService(); 