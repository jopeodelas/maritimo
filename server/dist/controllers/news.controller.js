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
exports.refreshNews = exports.getNews = void 0;
const newsService_1 = require("../services/newsService");
const getNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield newsService_1.newsService.getNews();
        res.json({
            success: true,
            count: news.length,
            data: news
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            error: 'Failed to fetch news',
            message: 'Unable to retrieve news at this time'
        });
    }
});
exports.getNews = getNews;
const refreshNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield newsService_1.newsService.refreshNews();
        res.json({
            success: true,
            message: 'News refreshed successfully',
            count: news.length,
            data: news
        });
    }
    catch (error) {
        console.error('Error refreshing news:', error);
        res.status(500).json({
            error: 'Failed to refresh news',
            message: 'Unable to update news at this time'
        });
    }
});
exports.refreshNews = refreshNews;
