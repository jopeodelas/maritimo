"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsScrapingService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class NewsScrapingService {
    constructor() {
        this.sources = [
            {
                name: 'Record',
                url: 'https://www.record.pt',
                searchUrl: 'https://www.record.pt/pesquisa?q=maritimo+transferencias',
                reliability: 4,
                scrapeFunction: this.scrapeRecord.bind(this)
            },
            {
                name: 'A Bola',
                url: 'https://www.abola.pt',
                searchUrl: 'https://www.abola.pt/pesquisa.aspx?q=maritimo+transferencias',
                reliability: 4,
                scrapeFunction: this.scrapeABola.bind(this)
            },
            {
                name: 'O Jogo',
                url: 'https://www.ojogo.pt',
                searchUrl: 'https://www.ojogo.pt/pesquisa?q=maritimo+transferencias',
                reliability: 3,
                scrapeFunction: this.scrapeOJogo.bind(this)
            },
            {
                name: 'Maisfutebol',
                url: 'https://www.maisfutebol.iol.pt',
                searchUrl: 'https://www.maisfutebol.iol.pt/pesquisa?q=maritimo+transferencias',
                reliability: 3,
                scrapeFunction: this.scrapeMaisFutebol.bind(this)
            }
        ];
    }
    scrapeAllSources() {
        return __awaiter(this, void 0, void 0, function* () {
            const allRumors = [];
            for (const source of this.sources) {
                try {
                    console.log(`Scraping ${source.name}...`);
                    const rumors = yield this.scrapeSource(source);
                    allRumors.push(...rumors);
                    console.log(`Found ${rumors.length} rumors from ${source.name}`);
                    // Delay between requests to be respectful
                    yield this.delay(2000);
                }
                catch (error) {
                    console.error(`Error scraping ${source.name}:`, error);
                }
            }
            return this.removeDuplicates(allRumors);
        });
    }
    scrapeSource(source) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(source.searchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    timeout: 10000
                });
                return source.scrapeFunction(response.data, source.name);
            }
            catch (error) {
                console.error(`Failed to scrape ${source.name}:`, error);
                return [];
            }
        });
    }
    scrapeRecord(html, source) {
        const $ = cheerio.load(html);
        const rumors = [];
        // Procurar por artigos relacionados com transferências do Marítimo
        $('.article, .news-item, .story').each((index, element) => {
            const title = $(element).find('h1, h2, h3, .title, .headline').text().trim();
            const content = $(element).find('p, .content, .summary').text().trim();
            const link = $(element).find('a').attr('href') || '';
            const dateText = $(element).find('.date, .time, time').text().trim();
            if (this.isTransferRelated(title + ' ' + content)) {
                const rumor = this.extractTransferInfo(title, content, source, link, dateText);
                if (rumor) {
                    rumors.push(rumor);
                }
            }
        });
        return rumors.slice(0, 5); // Limitar a 5 rumores por fonte
    }
    scrapeABola(html, source) {
        const $ = cheerio.load(html);
        const rumors = [];
        $('.noticia, .news, .article').each((index, element) => {
            const title = $(element).find('h1, h2, h3, .titulo').text().trim();
            const content = $(element).find('p, .texto, .resumo').text().trim();
            const link = $(element).find('a').attr('href') || '';
            const dateText = $(element).find('.data, .date').text().trim();
            if (this.isTransferRelated(title + ' ' + content)) {
                const rumor = this.extractTransferInfo(title, content, source, link, dateText);
                if (rumor) {
                    rumors.push(rumor);
                }
            }
        });
        return rumors.slice(0, 5);
    }
    scrapeOJogo(html, source) {
        const $ = cheerio.load(html);
        const rumors = [];
        $('.story, .article, .news-item').each((index, element) => {
            const title = $(element).find('h1, h2, h3, .title').text().trim();
            const content = $(element).find('p, .lead, .summary').text().trim();
            const link = $(element).find('a').attr('href') || '';
            const dateText = $(element).find('.date, .timestamp').text().trim();
            if (this.isTransferRelated(title + ' ' + content)) {
                const rumor = this.extractTransferInfo(title, content, source, link, dateText);
                if (rumor) {
                    rumors.push(rumor);
                }
            }
        });
        return rumors.slice(0, 5);
    }
    scrapeMaisFutebol(html, source) {
        const $ = cheerio.load(html);
        const rumors = [];
        $('.article, .news, .story').each((index, element) => {
            const title = $(element).find('h1, h2, h3, .headline').text().trim();
            const content = $(element).find('p, .excerpt, .summary').text().trim();
            const link = $(element).find('a').attr('href') || '';
            const dateText = $(element).find('.date, .published').text().trim();
            if (this.isTransferRelated(title + ' ' + content)) {
                const rumor = this.extractTransferInfo(title, content, source, link, dateText);
                if (rumor) {
                    rumors.push(rumor);
                }
            }
        });
        return rumors.slice(0, 5);
    }
    isTransferRelated(text) {
        const transferKeywords = [
            'transferência', 'transferencias', 'contratação', 'contratacao',
            'saída', 'saida', 'chegada', 'reforço', 'reforco',
            'negociação', 'negociacao', 'acordo', 'proposta',
            'interessado', 'interesse', 'sondagem', 'contacto',
            'mercado', 'janela', 'empréstimo', 'emprestimo',
            'renovação', 'renovacao', 'rescisão', 'rescisao'
        ];
        const maritimoKeywords = [
            'marítimo', 'maritimo', 'cs marítimo', 'cs maritimo',
            'clube sport marítimo', 'verde-rubro', 'verde rubro'
        ];
        const lowerText = text.toLowerCase();
        const hasTransferKeyword = transferKeywords.some(keyword => lowerText.includes(keyword));
        const hasMaritimoKeyword = maritimoKeywords.some(keyword => lowerText.includes(keyword));
        return hasTransferKeyword && hasMaritimoKeyword;
    }
    extractTransferInfo(title, content, source, link, dateText) {
        const fullText = title + ' ' + content;
        // Extrair nome do jogador
        const playerName = this.extractPlayerName(fullText);
        if (!playerName)
            return null;
        // Determinar tipo de transferência
        const type = this.determineTransferType(fullText);
        // Extrair clube
        const club = this.extractClub(fullText, type);
        // Extrair valor
        const value = this.extractValue(fullText);
        // Determinar status
        const status = this.determineStatus(fullText);
        // Processar data
        const date = this.processDate(dateText);
        // Determinar confiabilidade baseada na fonte e conteúdo
        const reliability = this.calculateReliability(source, fullText);
        return {
            id: `scraped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            player_name: playerName,
            type: type,
            club: club,
            value: value,
            status: status,
            date: date,
            source: source,
            reliability: reliability,
            description: title.substring(0, 150) + (title.length > 150 ? '...' : '')
        };
    }
    extractPlayerName(text) {
        // Lista de jogadores conhecidos do Marítimo
        const knownPlayers = [
            'Cláudio Winck', 'André Vidigal', 'Marco Silva', 'João Afonso',
            'Diogo Mendes', 'Rúben Macedo', 'Edgar Costa', 'Joel Tagueu',
            'Matheus Costa', 'Paulo Victor', 'Zainadine Júnior', 'Stefano Beltrame',
            'Henrique', 'Moisés Mosquera', 'Fabio China', 'Val', 'Brayan Riascos',
            'Pedro Pelágio', 'Iván Rossi', 'Félix Correia', 'Geny Catamo'
        ];
        for (const player of knownPlayers) {
            if (text.toLowerCase().includes(player.toLowerCase())) {
                return player;
            }
        }
        // Tentar extrair nomes próprios (padrão: Nome Sobrenome)
        const namePattern = /([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)/g;
        const matches = text.match(namePattern);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return null;
    }
    determineTransferType(text) {
        const buyKeywords = ['contratação', 'contratacao', 'chegada', 'reforço', 'reforco', 'assinou', 'junta-se'];
        const sellKeywords = ['saída', 'saida', 'deixa', 'abandona', 'rescinde', 'venda'];
        const lowerText = text.toLowerCase();
        const hasBuyKeyword = buyKeywords.some(keyword => lowerText.includes(keyword));
        const hasSellKeyword = sellKeywords.some(keyword => lowerText.includes(keyword));
        if (hasBuyKeyword && !hasSellKeyword)
            return 'compra';
        if (hasSellKeyword && !hasBuyKeyword)
            return 'venda';
        // Se ambos ou nenhum, assumir venda (mais comum para o Marítimo)
        return 'venda';
    }
    extractClub(text, type) {
        const portugueseClubs = [
            'FC Porto', 'Sporting CP', 'SL Benfica', 'SC Braga', 'Vitória SC',
            'Gil Vicente', 'Boavista FC', 'Rio Ave FC', 'CD Santa Clara',
            'Portimonense', 'Famalicão', 'Paços de Ferreira', 'Arouca',
            'Chaves', 'Vizela', 'Casa Pia', 'Estoril'
        ];
        for (const club of portugueseClubs) {
            if (text.toLowerCase().includes(club.toLowerCase())) {
                return club;
            }
        }
        // Tentar extrair outros clubes mencionados
        const clubPattern = /(FC|SC|CD|CF)\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+/g;
        const matches = text.match(clubPattern);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return type === 'compra' ? 'Clube não especificado' : 'Destino não especificado';
    }
    extractValue(text) {
        // Procurar por valores monetários
        const valuePatterns = [
            /€\s*(\d+(?:[.,]\d+)?)\s*(milhões?|M|mil|K)/gi,
            /(\d+(?:[.,]\d+)?)\s*(milhões?|M)\s*de\s*euros/gi,
            /(\d+(?:[.,]\d+)?)\s*(mil|K)\s*euros/gi
        ];
        for (const pattern of valuePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0];
            }
        }
        return 'Valor não revelado';
    }
    determineStatus(text) {
        const confirmedKeywords = ['confirmado', 'oficial', 'anunciado', 'assinado', 'fechado'];
        const negotiationKeywords = ['negociação', 'negociacao', 'conversas', 'acordo', 'próximo', 'proximo'];
        const lowerText = text.toLowerCase();
        if (confirmedKeywords.some(keyword => lowerText.includes(keyword))) {
            return 'confirmado';
        }
        if (negotiationKeywords.some(keyword => lowerText.includes(keyword))) {
            return 'negociação';
        }
        return 'rumor';
    }
    processDate(dateText) {
        if (!dateText) {
            return new Date().toISOString().split('T')[0];
        }
        // Tentar diferentes formatos de data portugueses
        const datePatterns = [
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
            /(\d{1,2})-(\d{1,2})-(\d{4})/,
            /(\d{4})-(\d{1,2})-(\d{1,2})/ // YYYY-MM-DD
        ];
        for (const pattern of datePatterns) {
            const match = dateText.match(pattern);
            if (match) {
                const [, day, month, year] = match;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
        return new Date().toISOString().split('T')[0];
    }
    calculateReliability(source, text) {
        let baseReliability = 3;
        // Ajustar baseado na fonte
        switch (source.toLowerCase()) {
            case 'record':
            case 'a bola':
                baseReliability = 4;
                break;
            case 'o jogo':
            case 'maisfutebol':
                baseReliability = 3;
                break;
        }
        // Ajustar baseado no conteúdo
        const lowerText = text.toLowerCase();
        if (lowerText.includes('confirmado') || lowerText.includes('oficial')) {
            baseReliability = Math.min(5, baseReliability + 1);
        }
        if (lowerText.includes('rumor') || lowerText.includes('especulação')) {
            baseReliability = Math.max(1, baseReliability - 1);
        }
        return baseReliability;
    }
    removeDuplicates(rumors) {
        const seen = new Set();
        return rumors.filter(rumor => {
            const key = `${rumor.player_name}_${rumor.club}_${rumor.type}`.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.newsScrapingService = new NewsScrapingService();
