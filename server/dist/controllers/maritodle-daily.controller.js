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
exports.getStats = exports.submeterPalpite = exports.getGameState = exports.getNomes = void 0;
const errorTypes_1 = require("../utils/errorTypes");
const maritodle_daily_service_1 = __importDefault(require("../services/maritodle-daily.service"));
function normalizarNome(nome) {
    return nome.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}
function compararListas(lista1, lista2) {
    const set1 = new Set(lista1);
    const set2 = new Set(lista2);
    // Verificar se são idênticas
    if (set1.size === set2.size && [...set1].every(item => set2.has(item))) {
        return 'verde';
    }
    // Verificar interseção
    const intersecao = [...set1].filter(item => set2.has(item));
    if (intersecao.length > 0) {
        return 'amarelo';
    }
    return 'vermelho';
}
function gerarFeedback(palpite, segredo) {
    const feedback = [];
    // 1. Jogos (anos no Marítimo) - anteriormente "Sexo"
    feedback.push({
        coluna: 'jogos',
        icone: palpite.sexo === segredo.sexo ? 'verde' : 'vermelho'
    });
    // 2. Posições
    feedback.push({
        coluna: 'posicoes',
        icone: compararListas(palpite.posicoes, segredo.posicoes)
    });
    // 3. Altura
    let alturaIcone;
    if (palpite.altura_cm === segredo.altura_cm) {
        alturaIcone = 'verde';
    }
    else if (palpite.altura_cm < segredo.altura_cm) {
        alturaIcone = 'seta-cima';
    }
    else {
        alturaIcone = 'seta-baixo';
    }
    feedback.push({
        coluna: 'altura',
        icone: alturaIcone
    });
    // 4. Papéis
    feedback.push({
        coluna: 'papeis',
        icone: compararListas(palpite.papeis, segredo.papeis)
    });
    // 5. Idade
    let idadeIcone;
    if (palpite.idade === segredo.idade) {
        idadeIcone = 'verde';
    }
    else if (palpite.idade < segredo.idade) {
        idadeIcone = 'seta-cima';
    }
    else {
        idadeIcone = 'seta-baixo';
    }
    feedback.push({
        coluna: 'idade',
        icone: idadeIcone
    });
    // 6. Nacionalidade
    feedback.push({
        coluna: 'nacionalidade',
        icone: palpite.nacionalidade === segredo.nacionalidade ? 'verde' : 'vermelho'
    });
    // 7. Contribuições (troféus)
    let contribuicoesItem = {
        coluna: 'contribuicoes'
    };
    const trofeusPalpite = palpite.trofeus || [];
    const trofeusSegredo = segredo.trofeus || [];
    if (trofeusPalpite.length === 0 && trofeusSegredo.length === 0) {
        contribuicoesItem.icone = 'verde';
    }
    else if (JSON.stringify(trofeusPalpite.sort()) === JSON.stringify(trofeusSegredo.sort())) {
        contribuicoesItem.icone = 'verde';
        contribuicoesItem.trofeus_match = trofeusPalpite;
    }
    else {
        contribuicoesItem.icone = 'vermelho';
    }
    feedback.push(contribuicoesItem);
    // 8. Período
    let periodoIcone;
    if (palpite.ano_entrada === segredo.ano_entrada && palpite.ano_saida === segredo.ano_saida) {
        periodoIcone = 'verde';
    }
    else if (palpite.ano_entrada === segredo.ano_entrada || palpite.ano_saida === segredo.ano_saida) {
        periodoIcone = 'amarelo';
    }
    else {
        periodoIcone = 'vermelho';
    }
    feedback.push({
        coluna: 'periodo',
        icone: periodoIcone
    });
    return feedback;
}
function verificarVitoria(feedback) {
    return feedback.every(f => f.icone === 'verde');
}
// Obter nomes dos jogadores (sem treinadores)
const getNomes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jogadores = yield maritodle_daily_service_1.default.getPlayers();
        const nomes = jogadores.map(j => j.nome);
        res.json(nomes);
    }
    catch (error) {
        next(error);
    }
});
exports.getNomes = getNomes;
// Obter estado do jogo do dia
const getGameState = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        // Obter jogo do dia
        const todaysGame = yield maritodle_daily_service_1.default.getTodaysGame();
        // Obter tentativa do usuário para hoje
        const userAttempt = yield maritodle_daily_service_1.default.getUserTodaysAttempt(userId);
        // Obter estatísticas do dia
        const stats = yield maritodle_daily_service_1.default.getTodaysStats();
        // Obter jogo de ontem
        const yesterdaysGame = yield maritodle_daily_service_1.default.getYesterdaysGame();
        // Se o usuário ganhou, obter sua posição
        let userPosition = null;
        let secretPlayerName = null;
        if (userAttempt === null || userAttempt === void 0 ? void 0 : userAttempt.won) {
            userPosition = yield maritodle_daily_service_1.default.getUserPositionToday(userId);
            secretPlayerName = todaysGame.secret_player_name;
        }
        res.json({
            todaysGame: {
                date: todaysGame.date,
                totalWinners: stats.totalWinners,
                totalPlayers: stats.totalPlayers
            },
            userAttempt: userAttempt ? {
                attempts: userAttempt.attempts,
                won: userAttempt.won,
                completed: userAttempt.completed,
                attempts_data: userAttempt.attempts_data
            } : null,
            yesterdaysGame: yesterdaysGame ? {
                playerName: yesterdaysGame.secret_player_name
            } : null,
            hasPlayedToday: (userAttempt === null || userAttempt === void 0 ? void 0 : userAttempt.completed) || false,
            userPosition: userPosition,
            secretPlayerName: secretPlayerName
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getGameState = getGameState;
// Submeter palpite
const submeterPalpite = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { nome } = req.body;
        if (!nome) {
            throw new errorTypes_1.BadRequestError('Nome é obrigatório');
        }
        // Verificar se já completou o jogo hoje
        const hasPlayed = yield maritodle_daily_service_1.default.hasUserPlayedToday(userId);
        if (hasPlayed) {
            throw new errorTypes_1.BadRequestError('Já completaste o jogo de hoje. Volta amanhã!');
        }
        // Obter jogo do dia
        const todaysGame = yield maritodle_daily_service_1.default.getTodaysGame();
        const secretPlayer = yield maritodle_daily_service_1.default.getPlayerById(todaysGame.secret_player_id);
        if (!secretPlayer) {
            throw new errorTypes_1.BadRequestError('Erro interno: Jogador secreto não encontrado');
        }
        // Obter jogadores e encontrar o palpite
        const jogadores = yield maritodle_daily_service_1.default.getPlayers();
        const nomeNormalizado = normalizarNome(nome);
        const palpite = jogadores.find(j => normalizarNome(j.nome) === nomeNormalizado);
        if (!palpite) {
            throw new errorTypes_1.BadRequestError('Jogador não encontrado.');
        }
        // Obter tentativa atual do usuário
        let userAttempt = yield maritodle_daily_service_1.default.getUserTodaysAttempt(userId);
        const currentAttempts = (userAttempt === null || userAttempt === void 0 ? void 0 : userAttempt.attempts) || 0;
        const attemptsData = (userAttempt === null || userAttempt === void 0 ? void 0 : userAttempt.attempts_data) || [];
        // Verificar limite de tentativas (opcional, pode ser infinito)
        // if (currentAttempts >= 12) {
        //   throw new BadRequestError('Limite de tentativas excedido');
        // }
        // Gerar feedback (dados já vêm transformados do serviço)
        const feedback = gerarFeedback(palpite, secretPlayer);
        const venceu = verificarVitoria(feedback);
        // Adicionar tentativa aos dados
        attemptsData.push({
            nome: nome,
            palpite: palpite,
            feedback: feedback,
            timestamp: new Date().toISOString()
        });
        // Atualizar tentativa do usuário
        yield maritodle_daily_service_1.default.updateUserAttempt(userId, {
            attempts: currentAttempts + 1,
            won: venceu,
            completed: venceu,
            attempts_data: attemptsData
        });
        // Preparar resposta
        const response = {
            feedback,
            venceu,
            perdeu: false,
            palpite_dados: palpite,
            attempts: currentAttempts + 1
        };
        if (venceu) {
            response.estatisticas = { tentativas: currentAttempts + 1 };
            // Obter estatísticas atualizadas
            const updatedStats = yield maritodle_daily_service_1.default.getTodaysStats();
            response.totalWinners = updatedStats.totalWinners;
            response.playerPosition = updatedStats.totalWinners; // Posição do jogador (1º, 2º, etc.)
            response.secretPlayerName = secretPlayer.nome;
        }
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.submeterPalpite = submeterPalpite;
// Obter estatísticas do dia em tempo real
const getStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield maritodle_daily_service_1.default.getTodaysStats();
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
});
exports.getStats = getStats;
