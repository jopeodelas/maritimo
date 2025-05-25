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
exports.addManualTransferRumor = exports.refreshTransferRumors = exports.getTransferStats = exports.getTransferRumors = void 0;
const transferService_1 = require("../services/transferService");
const getTransferRumors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rumors = yield transferService_1.transferService.getRumors();
        res.json({
            success: true,
            data: rumors
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
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching transfer stats:', error);
        res.status(500).json({
            error: 'Failed to fetch transfer statistics',
            message: 'Unable to retrieve transfer statistics at this time'
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
        if (!['compra', 'venda'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid transfer type',
                message: 'type must be either "compra" or "venda"'
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
            message: 'Unable to add transfer rumor at this time'
        });
    }
});
exports.addManualTransferRumor = addManualTransferRumor;
