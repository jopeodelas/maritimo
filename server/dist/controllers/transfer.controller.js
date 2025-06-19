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
exports.cleanDuplicates = exports.getQualityReport = exports.addManualTransferRumor = exports.refreshTransferRumors = exports.getTransferStats = exports.getTransferRumors = void 0;
const transferService_1 = require("../services/transferService");
const getTransferRumors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { includeYouth = 'false', includeStaff = 'false', includeCoaches = 'true', minReliability = '0', category } = req.query;
        // Obter rumores usando a lógica unificada (BD com fallback)
        let rumors = yield transferService_1.transferService.getRumors();
        // Apply additional filters based on query parameters
        if (includeYouth === 'false') {
            rumors = rumors.filter(rumor => rumor.category !== 'youth');
        }
        if (includeStaff === 'false') {
            rumors = rumors.filter(rumor => rumor.category !== 'staff');
        }
        if (includeCoaches === 'false') {
            rumors = rumors.filter(rumor => rumor.category !== 'coach');
        }
        if (minReliability) {
            const minRel = parseInt(minReliability);
            rumors = rumors.filter(rumor => rumor.reliability >= minRel);
        }
        if (category) {
            rumors = rumors.filter(rumor => rumor.category === category);
        }
        res.json({
            success: true,
            data: rumors,
            filters: {
                includeYouth: includeYouth === 'true',
                includeStaff: includeStaff === 'true',
                includeCoaches: includeCoaches === 'true',
                minReliability: parseInt(minReliability),
                category: category || 'all'
            }
        });
    }
    catch (error) {
        console.error('Error fetching transfer rumors:', error);
        res.status(500).json({
            error: 'Failed to fetch transfer rumors',
            message: 'Unable to retrieve transfer information at this time'
        });
    }
});
exports.getTransferRumors = getTransferRumors;
const getTransferStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield transferService_1.transferService.getStats();
        const detailedStats = yield transferService_1.transferService.getDetailedStats();
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, stats), { detailed: detailedStats })
        });
    }
    catch (error) {
        console.error('Error fetching transfer stats:', error);
        res.status(500).json({
            error: 'Failed to fetch transfer statistics',
            message: 'Unable to retrieve statistics at this time'
        });
    }
});
exports.getTransferStats = getTransferStats;
const refreshTransferRumors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rumors = yield transferService_1.transferService.refreshRumors();
        res.json({
            success: true,
            message: 'Transfer rumors refreshed successfully',
            count: rumors.length,
            data: rumors
        });
    }
    catch (error) {
        console.error('Error refreshing transfer rumors:', error);
        res.status(500).json({
            error: 'Failed to refresh transfer rumors',
            message: 'Unable to update transfer information at this time'
        });
    }
});
exports.refreshTransferRumors = refreshTransferRumors;
const addManualTransferRumor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { player_name, type, club, value, status, source, reliability, description } = req.body;
        // Validate required fields
        if (!player_name || !type || !club) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'player_name, type, and club are required'
            });
        }
        // Validate type
        if (!['compra', 'venda', 'renovação'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid transfer type',
                message: 'type must be either "compra", "venda", or "renovação"'
            });
        }
        // Validate status
        if (status && !['rumor', 'negociação', 'confirmado'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                message: 'status must be one of: rumor, negociação, confirmado'
            });
        }
        // Validate reliability
        if (reliability && (reliability < 1 || reliability > 5)) {
            return res.status(400).json({
                error: 'Invalid reliability',
                message: 'reliability must be between 1 and 5'
            });
        }
        const newRumor = yield transferService_1.transferService.addManualRumor({
            player_name,
            type,
            club,
            value: value || 'Valor não revelado',
            status: status || 'rumor',
            source: source || 'Manual',
            reliability: reliability || 3,
            description
        }, req);
        res.status(201).json({
            success: true,
            message: 'Transfer rumor added successfully',
            data: newRumor
        });
    }
    catch (error) {
        console.error('Error adding manual transfer rumor:', error);
        res.status(500).json({
            error: 'Failed to add transfer rumor',
            message: 'Unable to add rumor at this time'
        });
    }
});
exports.addManualTransferRumor = addManualTransferRumor;
// NEW: Get rumor quality report
const getQualityReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield transferService_1.transferService.getQualityReport();
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        console.error('Error fetching quality report:', error);
        res.status(500).json({
            error: 'Failed to fetch quality report',
            message: 'Unable to retrieve quality information at this time'
        });
    }
});
exports.getQualityReport = getQualityReport;
// NEW: Clean duplicate rumors
const cleanDuplicates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield transferService_1.transferService.cleanDuplicateRumors();
        res.json({
            success: true,
            message: `Removed ${result.removedCount} duplicate rumors`,
            data: {
                removedCount: result.removedCount,
                remainingCount: result.remainingCount
            }
        });
    }
    catch (error) {
        console.error('Error cleaning duplicates:', error);
        res.status(500).json({
            error: 'Failed to clean duplicates',
            message: 'Unable to clean duplicates at this time'
        });
    }
});
exports.cleanDuplicates = cleanDuplicates;
