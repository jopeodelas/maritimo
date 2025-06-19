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
exports.migrateRumorsFromMemory = exports.getAdminStats = exports.disapproveRumor = exports.approveRumor = exports.deleteRumor = exports.updateRumor = exports.createRumor = exports.getAllRumorsForAdmin = void 0;
const transferService_1 = require("../services/transferService");
const transfer_rumor_model_1 = require("../models/transfer-rumor.model");
// Obter todos os rumores para admin (incluindo não aprovados)
const getAllRumorsForAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rumors = yield transferService_1.transferService.getAllRumorsFromDB();
        res.json({
            success: true,
            data: rumors,
            total: rumors.length
        });
    }
    catch (error) {
        console.error('Erro ao obter rumores para admin:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível obter os rumores'
        });
    }
});
exports.getAllRumorsForAdmin = getAllRumorsForAdmin;
// Criar novo rumor
const createRumor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { player_name, type, club, value, status, source, reliability, description, category, position } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validações básicas
        if (!player_name || !type || !club) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios em falta',
                message: 'Nome do jogador, tipo e clube são obrigatórios'
            });
        }
        if (!['compra', 'venda', 'renovação'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Tipo inválido',
                message: 'Tipo deve ser: compra, venda ou renovação'
            });
        }
        if (status && !['rumor', 'negociação', 'confirmado'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status inválido',
                message: 'Status deve ser: rumor, negociação ou confirmado'
            });
        }
        const newRumor = yield transferService_1.transferService.createRumorInDB({
            player_name,
            type,
            club,
            value: value || 'Valor não revelado',
            status: status || 'rumor',
            source: source || 'Admin',
            reliability: reliability || 5,
            description,
            category: category || 'senior',
            position
        }, userId);
        res.status(201).json({
            success: true,
            message: 'Rumor criado com sucesso',
            data: newRumor
        });
    }
    catch (error) {
        console.error('Erro ao criar rumor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível criar o rumor'
        });
    }
});
exports.createRumor = createRumor;
// Atualizar rumor existente
const updateRumor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Validar ID
        const rumorId = parseInt(id);
        if (isNaN(rumorId)) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
                message: 'O ID do rumor deve ser um número'
            });
        }
        // Verificar se o rumor existe
        const existingRumor = yield transfer_rumor_model_1.TransferRumorModel.getById(rumorId);
        if (!existingRumor) {
            return res.status(404).json({
                success: false,
                error: 'Rumor não encontrado',
                message: 'O rumor especificado não existe'
            });
        }
        const updatedRumor = yield transferService_1.transferService.updateRumorInDB(rumorId, updates);
        if (updatedRumor) {
            res.json({
                success: true,
                message: 'Rumor atualizado com sucesso',
                data: updatedRumor
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Rumor não encontrado',
                message: 'O rumor especificado não existe'
            });
        }
    }
    catch (error) {
        console.error('Erro ao atualizar rumor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível atualizar o rumor'
        });
    }
});
exports.updateRumor = updateRumor;
// Remover rumor (soft delete)
const deleteRumor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validar ID
        const rumorId = parseInt(id);
        if (isNaN(rumorId)) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
                message: 'O ID do rumor deve ser um número'
            });
        }
        const deleted = yield transferService_1.transferService.deleteRumorFromDB(rumorId);
        if (deleted) {
            res.json({
                success: true,
                message: 'Rumor removido com sucesso'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Rumor não encontrado',
                message: 'O rumor especificado não existe'
            });
        }
    }
    catch (error) {
        console.error('Erro ao remover rumor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível remover o rumor'
        });
    }
});
exports.deleteRumor = deleteRumor;
// Aprovar rumor
const approveRumor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validar ID
        const rumorId = parseInt(id);
        if (isNaN(rumorId)) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
                message: 'O ID do rumor deve ser um número'
            });
        }
        const approvedRumor = yield transferService_1.transferService.approveRumor(rumorId);
        if (approvedRumor) {
            res.json({
                success: true,
                message: 'Rumor aprovado com sucesso',
                data: approvedRumor
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Rumor não encontrado',
                message: 'O rumor especificado não existe'
            });
        }
    }
    catch (error) {
        console.error('Erro ao aprovar rumor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível aprovar o rumor'
        });
    }
});
exports.approveRumor = approveRumor;
// Desaprovar rumor
const disapproveRumor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validar ID
        const rumorId = parseInt(id);
        if (isNaN(rumorId)) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
                message: 'O ID do rumor deve ser um número'
            });
        }
        const disapprovedRumor = yield transferService_1.transferService.disapproveRumor(rumorId);
        if (disapprovedRumor) {
            res.json({
                success: true,
                message: 'Rumor desaprovado com sucesso',
                data: disapprovedRumor
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Rumor não encontrado',
                message: 'O rumor especificado não existe'
            });
        }
    }
    catch (error) {
        console.error('Erro ao desaprovar rumor:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível desaprovar o rumor'
        });
    }
});
exports.disapproveRumor = disapproveRumor;
// Obter estatísticas para admin
const getAdminStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield transferService_1.transferService.getStatsFromDB();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível obter as estatísticas'
        });
    }
});
exports.getAdminStats = getAdminStats;
// Migrar rumores da memória para a base de dados
const migrateRumorsFromMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obter rumores atuais da memória
        const memoryRumors = yield transferService_1.transferService.getRumors();
        // Migrar para a base de dados
        yield transfer_rumor_model_1.TransferRumorModel.migrateFromMemory(memoryRumors);
        res.json({
            success: true,
            message: `${memoryRumors.length} rumores migrados da memória para a base de dados`,
            migrated: memoryRumors.length
        });
    }
    catch (error) {
        console.error('Erro na migração:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível migrar os rumores'
        });
    }
});
exports.migrateRumorsFromMemory = migrateRumorsFromMemory;
