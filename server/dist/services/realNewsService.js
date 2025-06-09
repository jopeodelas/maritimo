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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realNewsService = void 0;
const axios_1 = __importDefault(require("axios"));
class RealNewsService {
    constructor() {
        this.NEWS_API_KEY = process.env.NEWS_API_KEY;
        this.GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search';
    }
    fetchRealTransferNews() {
        return __awaiter(this, void 0, void 0, function* () {
            const allRumors = [];
            try {
                // Get all Marítimo news first
                const allNews = yield this.fetchAllMaritimoNews();
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
            }
            catch (error) {
                console.error('Error fetching real transfer news:', error);
                return [];
            }
        });
    }
    fetchAllMaritimoNews() {
        return __awaiter(this, void 0, void 0, function* () {
            const allNews = [];
            try {
                // Get news directly from RSS sources
                const directNews = yield this.fetchDirectMaritimoNews();
                allNews.push(...directNews);
                // Remove duplicates and sort by date
                const uniqueNews = this.removeDuplicateNews(allNews);
                return uniqueNews
                    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                    .slice(0, 50); // Limit to 50 most recent
            }
            catch (error) {
                console.error('Error fetching all Marítimo news:', error);
                return [];
            }
        });
    }
    fetchDirectMaritimoNews() {
        return __awaiter(this, void 0, void 0, function* () {
            const allNews = [];
            try {
                // Fetch from Google News RSS directly for news items
                const searchQueries = [
                    'CS Marítimo',
                    'Marítimo futebol',
                    'CS Marítimo jogos',
                    'Marítimo resultados',
                    'CS Marítimo notícias'
                ];
                for (const query of searchQueries) {
                    const url = `${this.GOOGLE_NEWS_RSS}?q=${encodeURIComponent(query)}&hl=pt-PT&gl=PT&ceid=PT:pt`;
                    try {
                        const response = yield axios_1.default.get(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            timeout: 8000
                        });
                        const newsItems = this.parseGoogleNewsRSS(response.data);
                        allNews.push(...newsItems);
                        yield this.delay(1000);
                    }
                    catch (error) {
                        console.log(`Failed to fetch direct news for query: ${query}`);
                    }
                }
                // Fetch from Portuguese sports RSS
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
                for (const source of rssSources) {
                    try {
                        const response = yield axios_1.default.get(source.url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            timeout: 8000
                        });
                        const newsItems = this.parseRSSFeed(response.data, source.name);
                        const maritimoNews = newsItems.filter(item => this.isMaritimoRelated(item.title + ' ' + item.description));
                        allNews.push(...maritimoNews);
                        yield this.delay(1000);
                    }
                    catch (error) {
                        console.log(`Failed to fetch RSS from ${source.name}`);
                    }
                }
            }
            catch (error) {
                console.error('Error fetching direct Marítimo news:', error);
            }
            return allNews;
        });
    }
    fetchFromGoogleNewsRSS() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchQueries = [
                    'CS Marítimo transferências',
                    'Marítimo futebol contratações',
                    'Marítimo jogadores saída',
                    'CS Marítimo mercado'
                ];
                const allNews = [];
                for (const query of searchQueries) {
                    const url = `${this.GOOGLE_NEWS_RSS}?q=${encodeURIComponent(query)}&hl=pt-PT&gl=PT&ceid=PT:pt`;
                    try {
                        const response = yield axios_1.default.get(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            timeout: 8000
                        });
                        const newsItems = this.parseGoogleNewsRSS(response.data);
                        allNews.push(...newsItems);
                        // Delay between requests
                        yield this.delay(1000);
                    }
                    catch (error) {
                        console.log(`Failed to fetch from Google News for query: ${query}`);
                    }
                }
                return this.convertNewsToRumors(allNews, 'Google News');
            }
            catch (error) {
                console.error('Error fetching from Google News RSS:', error);
                return [];
            }
        });
    }
    fetchFromNewsAPI() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.NEWS_API_KEY) {
                console.log('News API key not available');
                return [];
            }
            try {
                const queries = [
                    'CS Marítimo transferências',
                    'Marítimo futebol',
                    'Marítimo contratações'
                ];
                const allNews = [];
                for (const query of queries) {
                    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&sortBy=publishedAt&pageSize=10`;
                    try {
                        const response = yield axios_1.default.get(url, {
                            headers: {
                                'X-API-Key': this.NEWS_API_KEY
                            },
                            timeout: 8000
                        });
                        if (response.data.articles) {
                            const newsItems = response.data.articles.map((article) => {
                                var _a;
                                return ({
                                    title: article.title,
                                    description: article.description || '',
                                    url: article.url,
                                    publishedAt: article.publishedAt,
                                    source: ((_a = article.source) === null || _a === void 0 ? void 0 : _a.name) || 'News API'
                                });
                            });
                            allNews.push(...newsItems);
                        }
                        yield this.delay(1000);
                    }
                    catch (error) {
                        console.log(`Failed to fetch from News API for query: ${query}`);
                    }
                }
                return this.convertNewsToRumors(allNews, 'News API');
            }
            catch (error) {
                console.error('Error fetching from News API:', error);
                return [];
            }
        });
    }
    fetchFromPortugueseSportsRSS() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const allNews = [];
            for (const source of rssSources) {
                try {
                    const response = yield axios_1.default.get(source.url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        },
                        timeout: 8000
                    });
                    const newsItems = this.parseRSSFeed(response.data, source.name);
                    const maritimoNews = newsItems.filter(item => this.isMaritimoRelated(item.title + ' ' + item.description));
                    allNews.push(...maritimoNews);
                    yield this.delay(1000);
                }
                catch (error) {
                    console.log(`Failed to fetch RSS from ${source.name}`);
                }
            }
            return this.convertNewsToRumors(allNews, 'RSS Feed');
        });
    }
    parseGoogleNewsRSS(xmlData) {
        const items = [];
        try {
            // Simple XML parsing for RSS items
            const itemMatches = xmlData.match(/<item[^>]*>[\s\S]*?<\/item>/g);
            if (itemMatches) {
                itemMatches.forEach(itemXml => {
                    const title = this.extractXMLContent(itemXml, 'title');
                    const description = this.extractXMLContent(itemXml, 'description');
                    const link = this.extractXMLContent(itemXml, 'link');
                    const pubDate = this.extractXMLContent(itemXml, 'pubDate');
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
        }
        catch (error) {
            console.error('Error parsing Google News RSS:', error);
        }
        return items;
    }
    parseRSSFeed(xmlData, sourceName) {
        const items = [];
        try {
            const itemMatches = xmlData.match(/<item[^>]*>[\s\S]*?<\/item>/g);
            if (itemMatches) {
                itemMatches.forEach(itemXml => {
                    const title = this.extractXMLContent(itemXml, 'title');
                    const description = this.extractXMLContent(itemXml, 'description');
                    const link = this.extractXMLContent(itemXml, 'link');
                    const pubDate = this.extractXMLContent(itemXml, 'pubDate');
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
        }
        catch (error) {
            console.error(`Error parsing RSS feed from ${sourceName}:`, error);
        }
        return items;
    }
    extractXMLContent(xml, tag) {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
    }
    cleanText(text) {
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
    isValidDescription(description) {
        var _a;
        // Check if description is meaningful
        if (!description || description.length < 20) {
            return false;
        }
        // Check if it contains actual words (not just symbols/numbers)
        const wordCount = ((_a = description.match(/[a-zA-ZÀ-ÿ]{3,}/g)) === null || _a === void 0 ? void 0 : _a.length) || 0;
        if (wordCount < 3) {
            return false;
        }
        // Check if it's not mostly HTML remnants or code
        const codePatterns = [
            /^\s*[\/\-\.\,\;\:\#\=\[\]]+\s*$/,
            /^[a-z_]+$/i,
            /^\d+$/, // Just numbers
        ];
        if (codePatterns.some(pattern => pattern.test(description))) {
            return false;
        }
        return true;
    }
    isMaritimoRelated(text) {
        const maritimoKeywords = [
            'marítimo', 'maritimo', 'cs marítimo', 'cs maritimo',
            'clube sport marítimo', 'verde-rubro', 'verde rubro'
        ];
        const lowerText = text.toLowerCase();
        const hasMaritimoKeyword = maritimoKeywords.some(keyword => lowerText.includes(keyword));
        return hasMaritimoKeyword;
    }
    isTransferRelated(text) {
        const transferKeywords = [
            'transferência', 'transferencias', 'contratação', 'contratacao',
            'saída', 'saida', 'chegada', 'reforço', 'reforco',
            'negociação', 'negociacao', 'acordo', 'proposta',
            'interessado', 'interesse', 'sondagem', 'mercado',
            'empréstimo', 'emprestimo', 'cedido', 'cedência', 'cedencia',
            'renovação', 'renovacao', 'contrato', 'assinou', 'assinatura',
            'rescisão', 'rescisao', 'rescinde', 'deixa o clube',
            'treinador', 'técnico', 'staff', 'equipa técnica', 'diretor'
        ];
        const lowerText = text.toLowerCase();
        // Para ser considerado rumor de transferência, deve:
        // 1. Mencionar o Marítimo diretamente
        // 2. Ter palavras-chave de transferência/contratação
        const hasMaritimoKeyword = this.isMaritimoRelated(text);
        const hasTransferKeyword = transferKeywords.some(keyword => lowerText.includes(keyword));
        return hasMaritimoKeyword && hasTransferKeyword;
    }
    convertNewsToRumors(newsItems, sourceType) {
        const rumors = [];
        newsItems.forEach((item, index) => {
            const transferInfo = this.extractTransferInfoFromNews(item);
            if (transferInfo) {
                // Create a more unique ID based on content hash
                const contentHash = this.createContentHash(item.title + item.description + item.url);
                rumors.push({
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
        return rumors;
    }
    extractTransferInfoFromNews(item) {
        const fullText = item.title + ' ' + item.description;
        // Extract player name
        const playerName = this.extractPlayerNameFromText(fullText);
        // Se não conseguir identificar um jogador específico, mas for claramente sobre transferência do Marítimo, aceitar
        if (!playerName || playerName === 'Jogador não identificado') {
            // Verificar se é sobre treinador/staff (agora aceitar também)
            const staffKeywords = ['treinador', 'técnico', 'diretor', 'presidente', 'staff', 'equipa técnica'];
            if (staffKeywords.some(keyword => fullText.toLowerCase().includes(keyword))) {
                // Se for sobre staff, extrair nome do staff
                const staffName = this.extractStaffNameFromText(fullText);
                return {
                    playerName: staffName || 'Novo elemento técnico',
                    type: 'compra',
                    club: 'CS Marítimo',
                    value: 'Valor não revelado',
                    status: this.determineStatusFromText(fullText)
                };
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
    extractPlayerNameFromText(text) {
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
    extractStaffNameFromText(text) {
        // Patterns for extracting staff names
        const staffPatterns = [
            /(?:treinador|técnico|diretor)\s+([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)+)/gi,
            /"([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]+)+)"/g
        ];
        for (const pattern of staffPatterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                const name = matches[0].replace(/^(treinador|técnico|diretor)\s+/i, '').replace(/"/g, '').trim();
                if (name && name.length > 3) {
                    return name;
                }
            }
        }
        return null;
    }
    determineTransferType(text) {
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
        if (hasRenewalKeyword)
            return 'renovação';
        const hasBuyKeyword = buyKeywords.some(keyword => lowerText.includes(keyword));
        const hasSellKeyword = sellKeywords.some(keyword => lowerText.includes(keyword));
        if (hasBuyKeyword && !hasSellKeyword)
            return 'compra';
        if (hasSellKeyword && !hasBuyKeyword)
            return 'venda';
        // Context-based detection
        if (lowerText.includes('para o marítimo') || lowerText.includes('ao marítimo')) {
            return 'compra';
        }
        if (lowerText.includes('do marítimo') || lowerText.includes('deixa o marítimo')) {
            return 'venda';
        }
        return 'compra'; // Default - assume it's a new arrival
    }
    extractClubFromText(text, transferType) {
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
    extractValueFromText(text) {
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
    determineStatusFromText(text) {
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
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        }
        catch (_a) {
            return new Date().toISOString().split('T')[0];
        }
    }
    calculateReliability(source, title) {
        let baseReliability = 3;
        switch (source.toLowerCase()) {
            case 'record':
            case 'a bola':
                baseReliability = 4;
                break;
            case 'o jogo':
                baseReliability = 3;
                break;
            default:
                baseReliability = 3;
        }
        if (title.toLowerCase().includes('confirmado') || title.toLowerCase().includes('oficial')) {
            baseReliability = Math.min(5, baseReliability + 1);
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
    createContentHash(content) {
        // Simple hash function to create unique IDs
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    removeDuplicateNews(news) {
        const seen = new Set();
        const titleSimilarity = new Map();
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
                const existingItem = titleSimilarity.get(titleKey);
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
    normalizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }
    createTitleSignature(normalizedTitle) {
        // Create a signature based on key words, ignoring common words
        const commonWords = ['o', 'a', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem', 'que', 'e', 'ou', 'mas', 'se', 'quando', 'onde', 'como', 'porque', 'já', 'ainda', 'mais', 'menos', 'muito', 'pouco', 'todo', 'toda', 'todos', 'todas', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas'];
        const words = normalizedTitle.split(' ')
            .filter(word => word.length > 2 && !commonWords.includes(word))
            .sort()
            .slice(0, 5); // Take first 5 significant words
        return words.join('_');
    }
    getSourceReliability(source) {
        switch (source.toLowerCase()) {
            case 'record': return 5;
            case 'a bola': return 4;
            case 'o jogo': return 4;
            case 'google news': return 3;
            default: return 2;
        }
    }
}
exports.realNewsService = new RealNewsService();
