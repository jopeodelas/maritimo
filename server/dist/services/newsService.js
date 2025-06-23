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
exports.newsService = void 0;
const realNewsService_1 = require("./realNewsService");
class NewsService {
    constructor() {
        this.news = [];
        this.lastUpdate = null;
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
        this.isUpdating = false;
        // Initialize with news fetching
        this.updateNews();
        // Set up automatic updates every hour
        setInterval(() => {
            this.updateNews();
        }, 60 * 60 * 1000);
    }
    getNews() {
        return __awaiter(this, void 0, void 0, function* () {
            // If cache is expired and not currently updating, trigger update
            if (this.shouldUpdate() && !this.isUpdating) {
                this.updateNews();
            }
            return this.news;
        });
    }
    refreshNews() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateNews();
            return this.news;
        });
    }
    updateNews() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isUpdating)
                return;
            this.isUpdating = true;
            try {
                // Fetch all Marítimo-related news (not just transfers)
                const allNews = yield realNewsService_1.realNewsService.fetchAllMaritimoNews();
                if (allNews.length > 0) {
                    // Remove duplicates based on URL, title, and content similarity
                    const existingUrls = new Set(this.news.map(item => item.url));
                    const existingTitleSignatures = new Set(this.news.map(item => this.createTitleSignature(item.title)));
                    const newNews = allNews.filter((item) => {
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
                }
                else {
                    // If we have no news at all, generate minimal fallback data
                    if (this.news.length === 0) {
                        this.news = this.generateFallbackNews();
                        this.lastUpdate = new Date();
                    }
                }
            }
            catch (error) {
                console.error('Error updating news:', error);
                // If we have no news at all, generate fallback data
                if (this.news.length === 0) {
                    this.news = this.generateFallbackNews();
                    this.lastUpdate = new Date();
                }
            }
            finally {
                this.isUpdating = false;
            }
        });
    }
    generateFallbackNews() {
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
    shouldUpdate() {
        if (!this.lastUpdate)
            return true;
        return Date.now() - this.lastUpdate.getTime() > this.CACHE_DURATION;
    }
    createTitleSignature(title) {
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
exports.newsService = new NewsService();
