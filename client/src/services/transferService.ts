import api from './api';

export interface TransferRumor {
  id: string;
  player_name: string;
  type: "compra" | "venda";
  club: string;
  value: string;
  status: "rumor" | "negociação" | "confirmado";
  date: string;
  source: string;
  reliability: number;
  description?: string;
}

export interface TransferStats {
  total: number;
  compras: number;
  vendas: number;
  rumores: number;
  negociacoes: number;
  confirmados: number;
  averageReliability: string;
  sources: string[];
  recentRumors: number;
}

class TransferService {
  async getRumors(): Promise<TransferRumor[]> {
    try {
      const response = await api.get('/transfers/rumors');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching transfer rumors:', error);
      return [];
    }
  }

  async getStats(): Promise<TransferStats | null> {
    try {
      const response = await api.get('/transfers/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transfer stats:', error);
      return null;
    }
  }

  async refreshRumors(): Promise<TransferRumor[]> {
    try {
      const response = await api.post('/transfers/refresh');
      return response.data.data || [];
    } catch (error) {
      console.error('Error refreshing transfer rumors:', error);
      throw error;
    }
  }

  async addManualRumor(rumor: Omit<TransferRumor, 'id' | 'date'>): Promise<TransferRumor> {
    try {
      const response = await api.post('/transfers/rumors', rumor);
      return response.data.data;
    } catch (error) {
      console.error('Error adding manual rumor:', error);
      throw error;
    }
  }
}

export const transferService = new TransferService(); 