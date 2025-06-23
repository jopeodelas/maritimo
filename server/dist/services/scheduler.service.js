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
const footballAPI_service_1 = __importDefault(require("./footballAPI.service"));
const footballCache_service_1 = __importDefault(require("./footballCache.service"));
class SchedulerService {
    constructor() {
        this.intervalId = null;
        this.CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12 horas (em vez de 30 minutos)
    }
    // Iniciar verificação automática de novos jogos
    startAutoVotingCheck() {
        // Verificar imediatamente
        this.checkForNewVotings();
        // Configurar verificação periódica
        this.intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.checkForNewVotings();
        }), this.CHECK_INTERVAL);
    }
    // Parar verificação automática
    stopAutoVotingCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    // Verificar se há novos jogos para criar votações
    checkForNewVotings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar se precisa de sincronização
                const syncStatus = yield footballCache_service_1.default.needsSync();
                if (syncStatus.needsFullSync) {
                    yield footballCache_service_1.default.fullSync();
                }
                else if (syncStatus.needsCheckSync) {
                    yield footballCache_service_1.default.quickSync();
                }
                // Verificar se há jogos não processados para criar votações
                yield this.createVotingFromLatestMatch();
            }
            catch (error) {
                console.error('❌ Error in scheduled voting check:', error);
            }
        });
    }
    // Criar votação do último jogo não processado
    createVotingFromLatestMatch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const latestMatch = yield footballCache_service_1.default.getLatestUnprocessedMatch();
                if (latestMatch) {
                    // Tentar criar votação usando dados do cache
                    const result = yield footballAPI_service_1.default.createAutoVotingFromRealMatch();
                    if (result.success) {
                        // Marcar como processado
                        yield footballCache_service_1.default.markMatchAsProcessed(latestMatch.fixture_id);
                    }
                }
            }
            catch (error) {
                console.error('❌ Error creating voting from latest match:', error);
            }
        });
    }
    // Criar votação automática imediatamente (para testes)
    createVotingNow() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield footballAPI_service_1.default.createAutoVotingFromRealMatch();
                return result;
            }
            catch (error) {
                console.error('❌ Error in manual voting creation:', error);
                return { success: false, message: 'Erro na criação manual de votação' };
            }
        });
    }
}
exports.default = new SchedulerService();
