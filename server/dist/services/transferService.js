"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferService = void 0;
const realNewsService_1 = require("./realNewsService");
class TransferService {
    constructor() {
        this.rumors = [];
        this.lastUpdate = null;
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
        this.isUpdating = false;
        // Initialize with real data scraping
        this.updateRumors();
        // Set up automatic updates every 2 hours
        setInterval(() => {
            this.updateRumors();
        }, 2 * 60 * 60 * 1000);
    }
    getRumors() {
        return __awaiter(this, void 0, void 0, function* () {
            // If cache is expired and not currently updating, trigger update
            if (this.shouldUpdate() && !this.isUpdating) {
                this.updateRumors();
            }
            return this.rumors;
        });
    }
    refreshRumors() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateRumors();
            return this.rumors;
        });
    }
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const rumors = yield this.getRumors();
            const stats = {
                total: rumors.length,
                compras: rumors.filter(r => r.type === 'compra').length,
                vendas: rumors.filter(r => r.type === 'venda').length,
                rumores: rumors.filter(r => r.status === 'rumor').length,
                negociacoes: rumors.filter(r => r.status === 'negociação').length,
                confirmados: rumors.filter(r => r.status === 'confirmado').length,
                recentRumors: this.getRecentRumorsCount(rumors),
                averageReliability: this.calculateAverageReliability(rumors)
            };
            return stats;
        });
    }
    addManualRumor(rumor, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const newRumor = Object.assign(Object.assign({}, rumor), { id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, date: new Date().toISOString().split('T')[0], source: 'Manual' });
            this.rumors.unshift(newRumor);
            // Keep only the most recent 50 rumors
            if (this.rumors.length > 50) {
                this.rumors = this.rumors.slice(0, 50);
            }
            return newRumor;
        });
    }
    updateRumors() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isUpdating)
                return;
            this.isUpdating = true;
            console.log('Starting transfer rumors update from real news sources...');
            try {
                // Scrape real news from Portuguese sports websites
                const scrapedRumors = yield realNewsService_1.realNewsService.fetchRealTransferNews();
                if (scrapedRumors.length > 0) {
                    console.log(`Successfully scraped ${scrapedRumors.length} real transfer rumors`);
                    // Create a more sophisticated duplicate detection
                    const existingRumorsMap = new Map();
                    // Map existing rumors by content signature
                    this.rumors.forEach(rumor => {
                        const signature = this.createRumorSignature(rumor);
                        existingRumorsMap.set(signature, rumor);
                    });
                    // Filter out duplicates from scraped rumors
                    const newRumors = scrapedRumors.filter(rumor => {
                        const signature = this.createRumorSignature(rumor);
                        const idExists = this.rumors.some(existing => existing.id === rumor.id);
                        const contentExists = existingRumorsMap.has(signature);
                        return !idExists && !contentExists;
                    });
                    console.log(`Found ${newRumors.length} new rumors after duplicate filtering`);
                    // Add new rumors to the beginning
                    this.rumors = [...newRumors, ...this.rumors];
                    // Sort by date (newest first) and limit to 50
                    this.rumors.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    this.rumors = this.rumors.slice(0, 50);
                    this.lastUpdate = new Date();
                    console.log(`Transfer rumors updated successfully. Total: ${this.rumors.length}`);
                }
                else {
                    console.log('No new rumors found from scraping, using fallback data if needed');
                    // If we have no rumors at all, generate minimal fallback data
                    if (this.rumors.length === 0) {
                        this.rumors = this.generateFallbackRumors();
                        this.lastUpdate = new Date();
                        console.log('Generated fallback rumors as no real data was available');
                    }
                }
            }
            catch (error) {
                console.error('Error updating transfer rumors:', error);
                // If we have no rumors at all, generate fallback data
                if (this.rumors.length === 0) {
                    this.rumors = this.generateFallbackRumors();
                    this.lastUpdate = new Date();
                    console.log('Generated fallback rumors due to scraping error');
                }
            }
            finally {
                this.isUpdating = false;
            }
        });
    }
    generateFallbackRumors() {
        // Minimal fallback data - only when scraping completely fails
        return [
            {
                id: `fallback_${Date.now()}_1`,
                player_name: "Informação não disponível",
                type: "venda",
                club: "A confirmar",
                value: "Valor não revelado",
                status: "rumor",
                date: new Date().toISOString().split('T')[0],
                source: "Sistema",
                reliability: 2,
                description: "Dados de transferências temporariamente indisponíveis. A tentar obter informações atualizadas..."
            }
        ];
    }
    shouldUpdate() {
        if (!this.lastUpdate)
            return true;
        return Date.now() - this.lastUpdate.getTime() > this.CACHE_DURATION;
    }
    getRecentRumorsCount(rumors) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return rumors.filter(rumor => {
            const rumorDate = new Date(rumor.date);
            return rumorDate >= threeDaysAgo;
        }).length;
    }
    calculateAverageReliability(rumors) {
        if (rumors.length === 0)
            return "0.0";
        const totalReliability = rumors.reduce((sum, rumor) => sum + rumor.reliability, 0);
        const average = totalReliability / rumors.length;
        return average.toFixed(1);
    }
    createRumorSignature(rumor) {
        // Create a signature based on player name, club, and type to detect content duplicates
        const playerName = rumor.player_name.toLowerCase().trim();
        const club = rumor.club.toLowerCase().trim();
        const type = rumor.type;
        return `${playerName}_${club}_${type}`;
    }
}
exports.transferService = new TransferService();
