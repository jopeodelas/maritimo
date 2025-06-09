import type { Request } from 'express';
import { realNewsService } from './realNewsService';

export interface TransferRumor {
  id: string;
  player_name: string;
  type: "compra" | "venda" | "renovação";
  club: string;
  value: string;
  status: "rumor" | "negociação" | "confirmado";
  date: string;
  source: string;
  reliability: number; // 1-5 scale
  description?: string;
}

export interface TransferStats {
  total: number;
  compras: number;
  vendas: number;
  renovacoes: number;
  rumores: number;
  negociacoes: number;
  confirmados: number;
  recentRumors: number;
  averageReliability: number;
}

class TransferService {
  private rumors: TransferRumor[] = [];
  private lastUpdate: Date | null = null;
  private isUpdating = false;

  constructor() {
    this.initializeDefaultRumors();
    this.updateRumors();
  }

  private initializeDefaultRumors(): void {
    // Initialize with some realistic rumors
    this.rumors = [];
  }

  async getRumors(): Promise<TransferRumor[]> {
    if (!this.lastUpdate || Date.now() - this.lastUpdate.getTime() > 60 * 60 * 1000) {
      await this.updateRumors();
    }
    return this.rumors;
  }

  async refreshRumors(): Promise<TransferRumor[]> {
    await this.updateRumors();
    return this.rumors;
  }

  async getStats(): Promise<TransferStats> {
    const rumors = await this.getRumors();
    
    const stats = {
      total: rumors.length,
      compras: rumors.filter(r => r.type === 'compra').length,
      vendas: rumors.filter(r => r.type === 'venda').length,
      renovacoes: rumors.filter(r => r.type === 'renovação').length,
      rumores: rumors.filter(r => r.status === 'rumor').length,
      negociacoes: rumors.filter(r => r.status === 'negociação').length,
      confirmados: rumors.filter(r => r.status === 'confirmado').length,
      recentRumors: this.getRecentRumorsCount(rumors),
      averageReliability: this.calculateAverageReliability(rumors)
    };

    return stats;
  }

  async addManualRumor(rumor: Omit<TransferRumor, 'id' | 'date'>, req: Request): Promise<TransferRumor> {
    const newRumor: TransferRumor = {
      ...rumor,
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      source: 'Manual'
    };

    this.rumors.unshift(newRumor);
    
    // Keep only the most recent 50 rumors
    if (this.rumors.length > 50) {
      this.rumors = this.rumors.slice(0, 50);
    }

    return newRumor;
  }

  private async updateRumors(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    console.log('Starting enhanced transfer rumors update from real news sources...');
    
    try {
      // Scrape real news from Portuguese sports websites
      const scrapedRumors = await realNewsService.fetchRealTransferNews();
      
      if (scrapedRumors.length > 0) {
        console.log(`Successfully scraped ${scrapedRumors.length} real transfer rumors`);
        
        // Enhanced processing of scraped rumors
        const processedRumors = this.enhanceRumorAnalysis(scrapedRumors);
        
        // Create a more sophisticated duplicate detection
        const existingRumorsMap = new Map<string, TransferRumor>();
        
        // Map existing rumors by content signature
        this.rumors.forEach(rumor => {
          const signature = this.createRumorSignature(rumor);
          existingRumorsMap.set(signature, rumor);
        });
        
        // Filter out duplicates from scraped rumors
        const newRumors = processedRumors.filter(rumor => {
          const signature = this.createRumorSignature(rumor);
          const idExists = this.rumors.some(existing => existing.id === rumor.id);
          const contentExists = existingRumorsMap.has(signature);
          
          return !idExists && !contentExists;
        });
        
        console.log(`Found ${newRumors.length} new rumors after duplicate filtering and enhancement`);
        
        // Add new rumors to the beginning
        this.rumors = [...newRumors, ...this.rumors];
        
        // Sort by date (newest first) and limit to 50
        this.rumors.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.rumors = this.rumors.slice(0, 50);
        
        this.lastUpdate = new Date();
        console.log(`Transfer rumors updated successfully. Total: ${this.rumors.length}`);
      }
    } catch (error) {
      console.error('Error updating transfer rumors:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  private enhanceRumorAnalysis(rumors: TransferRumor[]): TransferRumor[] {
    return rumors.map(rumor => {
      const enhancedRumor = { ...rumor };
      
      // Enhanced transfer type detection
      enhancedRumor.type = this.detectTransferType(rumor.description || '', rumor.player_name);
      
      // Enhanced club detection for current Marítimo players
      enhancedRumor.club = this.enhanceClubDetection(rumor.description || '', rumor.club, rumor.type);
      
      // Enhanced reliability calculation
      enhancedRumor.reliability = this.calculateEnhancedReliability(
        rumor.source, 
        rumor.description || '', 
        rumor.status
      );
      
      // Enhanced status detection
      enhancedRumor.status = this.detectTransferStatus(rumor.description || '', rumor.source);
      
      return enhancedRumor;
    });
  }

  private detectTransferType(description: string, playerName: string): "compra" | "venda" | "renovação" {
    const lowerDesc = description.toLowerCase();
    
    // Known current Marítimo players (this should ideally come from a database)
    const currentPlayers = [
      'romain correia', 'rodrigo borges', 'afonso freitas', 'igor julião', 
      'noah madsen', 'tomas domingos', 'fábio china', 'carlos daniel',
      'pedro silva', 'michel costa', 'rodrigo andrade', 'vladan danilovic',
      'ibrahima guirassy', 'fabio blanco', 'preslav borukov', 'alexandre guedes'
    ];
    
    const isCurrentPlayer = currentPlayers.some(player => 
      lowerDesc.includes(player.toLowerCase()) || 
      playerName.toLowerCase().includes(player.toLowerCase())
    );
    
    // Contract renewal indicators
    const renewalKeywords = [
      'renovação', 'renovacao', 'renova', 'prolonga', 'contrato', 
      'até 202', 'extensão', 'extensao', 'acordo', 'permanece',
      'fica no', 'continua no', 'renegociou'
    ];
    
    if (renewalKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'renovação';
    }
    
    // If it's a current player and not renewal, it's likely a sale
    if (isCurrentPlayer) {
      const sellKeywords = ['saída', 'saida', 'deixa', 'sai', 'venda', 'transfere-se'];
      if (sellKeywords.some(keyword => lowerDesc.includes(keyword))) {
        return 'venda';
      }
      // If current player but no clear sale indicators, might be renewal
      return 'renovação';
    }
    
    // For non-current players, likely a purchase
    const buyKeywords = ['chegada', 'reforço', 'reforco', 'contratação', 'contratacao', 'assina'];
    if (buyKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'compra';
    }
    
    return 'compra'; // Default for external players
  }

  private enhanceClubDetection(description: string, originalClub: string, type: "compra" | "venda" | "renovação"): string {
    const lowerDesc = description.toLowerCase();
    
    // If it's a renewal or current player situation
    if (type === 'renovação') {
      return 'CS Marítimo'; // Player is staying with Marítimo
    }
    
    // Enhanced club detection with common Portuguese/international clubs
    const clubPatterns = [
      { pattern: /sporting/i, name: 'Sporting CP' },
      { pattern: /benfica/i, name: 'SL Benfica' },
      { pattern: /porto/i, name: 'FC Porto' },
      { pattern: /braga/i, name: 'SC Braga' },
      { pattern: /vitória.*guimarães/i, name: 'Vitória SC' },
      { pattern: /vitória.*setúbal/i, name: 'Vitória FC' },
      { pattern: /boavista/i, name: 'Boavista FC' },
      { pattern: /famalicão/i, name: 'FC Famalicão' },
      { pattern: /gil.*vicente/i, name: 'Gil Vicente FC' },
      { pattern: /paços.*ferreira/i, name: 'FC Paços de Ferreira' },
      { pattern: /moreirense/i, name: 'Moreirense FC' },
      { pattern: /arouca/i, name: 'FC Arouca' },
      { pattern: /chaves/i, name: 'GD Chaves' },
      { pattern: /portimonense/i, name: 'Portimonense SC' }
    ];
    
    for (const club of clubPatterns) {
      if (club.pattern.test(description)) {
        return club.name;
      }
    }
    
    // If no specific club found but it's a sale, indicate unknown destination
    if (type === 'venda' && originalClub === 'Clube não especificado') {
      return 'Destino a confirmar';
    }
    
    return originalClub;
  }

  private calculateEnhancedReliability(source: string, description: string, status: string): number {
    let reliability = 3; // Base reliability
    
    // Official sources get maximum reliability
    const officialKeywords = ['oficial', 'comunicado', 'clube anuncia', 'confirmado pelo clube'];
    if (officialKeywords.some(keyword => description.toLowerCase().includes(keyword))) {
      return 5;
    }
    
    // Status-based reliability
    if (status === 'confirmado') {
      reliability = Math.min(5, reliability + 1.5);
    } else if (status === 'negociação') {
      reliability = Math.min(5, reliability + 0.5);
    }
    
    // Source-based reliability
    const highReliabilitySources = ['record', 'abola', 'ojogo', 'maisfutebol', 'zerozero'];
    const mediumReliabilitySources = ['sapo', 'rtp', 'tvi', 'cmjornal'];
    
    if (highReliabilitySources.some(src => source.toLowerCase().includes(src))) {
      reliability += 1;
    } else if (mediumReliabilitySources.some(src => source.toLowerCase().includes(src))) {
      reliability += 0.5;
    }
    
    // Confirmation words boost reliability
    const confirmationWords = ['confirma', 'anuncia', 'assinou', 'fechado', 'acordo'];
    if (confirmationWords.some(word => description.toLowerCase().includes(word))) {
      reliability += 1;
    }
    
    return Math.min(5, Math.max(1, Math.round(reliability)));
  }

  private detectTransferStatus(description: string, source: string): "rumor" | "negociação" | "confirmado" {
    const lowerDesc = description.toLowerCase();
    
    // Confirmed indicators
    const confirmedKeywords = [
      'confirmado', 'oficial', 'assinou', 'fechado', 'comunicado',
      'anuncia', 'apresentado', 'acordo fechado'
    ];
    
    if (confirmedKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'confirmado';
    }
    
    // Negotiation indicators
    const negotiationKeywords = [
      'negociação', 'negociacao', 'acordo', 'proposta', 'interessado',
      'sondagem', 'conversa', 'perto de', 'próximo de'
    ];
    
    if (negotiationKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'negociação';
    }
    
    return 'rumor';
  }

  private getRecentRumorsCount(rumors: TransferRumor[]): number {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return rumors.filter(rumor => 
      new Date(rumor.date) >= threeDaysAgo
    ).length;
  }

  private calculateAverageReliability(rumors: TransferRumor[]): number {
    if (rumors.length === 0) return 0;
    
    const totalReliability = rumors.reduce((sum, rumor) => sum + rumor.reliability, 0);
    return Math.round((totalReliability / rumors.length) * 10) / 10;
  }

  private createRumorSignature(rumor: TransferRumor): string {
    // Create a signature based on player name, club, and type to detect content duplicates
    const playerName = rumor.player_name.toLowerCase().trim();
    const club = rumor.club.toLowerCase().trim();
    const type = rumor.type;
    return `${playerName}_${club}_${type}`;
  }
}

export const transferService = new TransferService(); 