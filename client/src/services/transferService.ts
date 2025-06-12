import api from './api';

export interface TransferRumor {
  id: string;
  player_name: string;
  type: "compra" | "venda" | "renovação";
  club: string;
  value: string;
  status: "rumor" | "negociação" | "confirmado";
  date: string;
  source: string;
  reliability: number;
  description?: string;
  isMainTeam?: boolean;
  category?: 'senior' | 'youth' | 'staff' | 'coach' | 'other';
  position?: string;
}

export interface TransferStats {
  totalRumors: number;
  recentRumors: number;
  averageReliability: string;
  lastUpdate: string;
}

class TransferService {
  async getRumors(filters?: {
    includeYouth?: boolean;
    includeStaff?: boolean;
    includeCoaches?: boolean;
    minReliability?: number;
    category?: string;
  }): Promise<TransferRumor[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.includeYouth !== undefined) {
        params.append('includeYouth', filters.includeYouth.toString());
      }
      
      if (filters?.includeStaff !== undefined) {
        params.append('includeStaff', filters.includeStaff.toString());
      }
      
      if (filters?.includeCoaches !== undefined) {
        params.append('includeCoaches', filters.includeCoaches.toString());
      }
      
      if (filters?.minReliability !== undefined) {
        params.append('minReliability', filters.minReliability.toString());
      }
      
      if (filters?.category) {
        params.append('category', filters.category);
      }

      const queryString = params.toString();
      const url = `/transfer/rumors${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching transfer rumors:', error);
      return [];
    }
  }

  async getStats(): Promise<TransferStats | null> {
    try {
      const response = await api.get('/transfer/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transfer stats:', error);
      return null;
    }
  }

  async refreshRumors(): Promise<TransferRumor[]> {
    try {
      const response = await api.post('/transfer/refresh');
      return response.data.data || [];
    } catch (error) {
      console.error('Error refreshing transfer rumors:', error);
      throw error;
    }
  }

  async addManualRumor(rumor: Omit<TransferRumor, 'id' | 'date'>): Promise<TransferRumor> {
    try {
      const response = await api.post('/transfer/rumors', rumor);
      return response.data.data;
    } catch (error) {
      console.error('Error adding manual rumor:', error);
      throw error;
    }
  }

  async getQualityReport(): Promise<any> {
    try {
      const response = await api.get('/transfer/quality-report');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching quality report:', error);
      throw error;
    }
  }

  async cleanDuplicates(): Promise<{ removedCount: number; remainingCount: number }> {
    try {
      const response = await api.post('/transfer/clean-duplicates');
      return response.data.data;
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      throw error;
    }
  }
}

export default new TransferService(); 