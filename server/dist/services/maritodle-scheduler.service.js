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
const maritodle_daily_service_1 = __importDefault(require("./maritodle-daily.service"));
class MaritodleSchedulerService {
    constructor() {
        this.intervalId = null;
        this.PORTUGAL_TIMEZONE = 'Europe/Lisbon';
        this.RESET_HOUR = 23; // 23:00
    }
    // Iniciar scheduler para gerar jogos diários
    startDailyScheduler() {
        console.log('🕐 Starting Maritodle daily scheduler (23:00 Portugal time)...');
        // Configurar verificação a cada minuto para verificar se é hora de resetar
        this.intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.checkAndResetDaily();
        }), 60000); // Verificar a cada minuto
        // Executar uma verificação imediata na inicialização
        this.checkAndResetDaily();
    }
    // Parar scheduler
    stopDailyScheduler() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Stopped Maritodle daily scheduler');
        }
    }
    // Verificar se é hora de resetar (23:00 Portugal)
    checkAndResetDaily() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                // Converter para hora de Portugal
                const portugalTime = new Date(now.toLocaleString("en-US", { timeZone: this.PORTUGAL_TIMEZONE }));
                // Verificar se é 23:00 (com tolerância de 1 minuto)
                if (portugalTime.getHours() === this.RESET_HOUR && portugalTime.getMinutes() === 0) {
                    console.log('🌙 Hora de resetar Maritodle! (23:00 Portugal)');
                    yield this.performDailyReset();
                }
            }
            catch (error) {
                console.error('❌ Error in daily reset check:', error);
            }
        });
    }
    // Executar reset diário
    performDailyReset() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔄 Performing daily Maritodle reset...');
                // Gerar jogo para o próximo dia
                yield maritodle_daily_service_1.default.generateNextDayGame();
                console.log('✅ Daily Maritodle reset completed successfully!');
            }
            catch (error) {
                console.error('❌ Error during daily reset:', error);
            }
        });
    }
    // Método para forçar reset (para testes)
    forceReset() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('⚡ Force reset triggered...');
            yield this.performDailyReset();
        });
    }
    // Obter próximo horário de reset
    getNextResetTime() {
        const now = new Date();
        const portugalTime = new Date(now.toLocaleString("en-US", { timeZone: this.PORTUGAL_TIMEZONE }));
        const nextReset = new Date(portugalTime);
        nextReset.setHours(this.RESET_HOUR, 0, 0, 0);
        // Se já passou das 23:00 hoje, agendar para amanhã
        if (portugalTime.getHours() >= this.RESET_HOUR) {
            nextReset.setDate(nextReset.getDate() + 1);
        }
        return nextReset;
    }
}
exports.default = new MaritodleSchedulerService();
