import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errorTypes';
import maritodleDailyService from '../services/maritodle-daily.service';

// Interface para definir o tipo de jogador
interface MaritodlePlayer {
  id: number;
  nome: string;
  sexo: string;
  posicao_principal: string;
  altura_cm: number;
  papel: string;
  idade: number;
  nacionalidade: string;
  trofeus: string[];
  ano_entrada: number;
  ano_saida: number;
}

function normalizarNome(nome: string): string {
  return nome.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function compararListas(lista1: string[], lista2: string[]) {
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

function gerarFeedback(palpite: any, segredo: any) {
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
  } else if (palpite.altura_cm < segredo.altura_cm) {
    alturaIcone = 'seta-cima';
  } else {
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
  } else if (palpite.idade < segredo.idade) {
    idadeIcone = 'seta-cima';
  } else {
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
  let contribuicoesItem: any = {
    coluna: 'contribuicoes'
  };
  
  const trofeusPalpite = palpite.trofeus || [];
  const trofeusSegredo = segredo.trofeus || [];
  
  if (trofeusPalpite.length === 0 && trofeusSegredo.length === 0) {
    contribuicoesItem.icone = 'verde';
  } else if (JSON.stringify(trofeusPalpite.sort()) === JSON.stringify(trofeusSegredo.sort())) {
    contribuicoesItem.icone = 'verde';
    contribuicoesItem.trofeus_match = trofeusPalpite;
  } else {
    contribuicoesItem.icone = 'vermelho';
  }
  
  feedback.push(contribuicoesItem);
  
  // 8. Período
  let periodoIcone;
  if (palpite.ano_entrada === segredo.ano_entrada && palpite.ano_saida === segredo.ano_saida) {
    periodoIcone = 'verde';
  } else if (palpite.ano_entrada === segredo.ano_entrada || palpite.ano_saida === segredo.ano_saida) {
    periodoIcone = 'amarelo';
  } else {
    periodoIcone = 'vermelho';
  }
  feedback.push({
    coluna: 'periodo',
    icone: periodoIcone
  });
  
  return feedback;
}

function verificarVitoria(feedback: any[]) {
  return feedback.every(f => f.icone === 'verde');
}

// Obter nomes dos jogadores (sem treinadores)
export const getNomes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jogadores = await maritodleDailyService.getPlayers();
    const nomes = jogadores.map(j => j.nome);
    res.json(nomes);
  } catch (error) {
    next(error);
  }
};

// Obter estado do jogo do dia
export const getGameState = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    
    // Obter jogo do dia
    const todaysGame = await maritodleDailyService.getTodaysGame();
    
    // Obter tentativa do usuário para hoje
    const userAttempt = await maritodleDailyService.getUserTodaysAttempt(userId);
    
    // Obter estatísticas do dia
    const stats = await maritodleDailyService.getTodaysStats();
    
    // Obter jogo de ontem
    const yesterdaysGame = await maritodleDailyService.getYesterdaysGame();
    
    // Se o usuário ganhou, obter sua posição
    let userPosition = null;
    let secretPlayerName = null;
    if (userAttempt?.won) {
      userPosition = await maritodleDailyService.getUserPositionToday(userId);
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
      hasPlayedToday: userAttempt?.completed || false,
      userPosition: userPosition,
      secretPlayerName: secretPlayerName
    });
  } catch (error) {
    next(error);
  }
};

// Submeter palpite
export const submeterPalpite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { nome } = req.body;
    
    if (!nome) {
      throw new BadRequestError('Nome é obrigatório');
    }
    
    // Verificar se já completou o jogo hoje
    const hasPlayed = await maritodleDailyService.hasUserPlayedToday(userId);
    if (hasPlayed) {
      throw new BadRequestError('Já completaste o jogo de hoje. Volta amanhã!');
    }
    
    // Obter jogo do dia
    const todaysGame = await maritodleDailyService.getTodaysGame();
    const secretPlayer = await maritodleDailyService.getPlayerById(todaysGame.secret_player_id);
    
    if (!secretPlayer) {
      throw new BadRequestError('Erro interno: Jogador secreto não encontrado');
    }
    
    // Obter jogadores e encontrar o palpite
    const jogadores = await maritodleDailyService.getPlayers();
    const nomeNormalizado = normalizarNome(nome);
    const palpite = jogadores.find(j => normalizarNome(j.nome) === nomeNormalizado);
    
    if (!palpite) {
      throw new BadRequestError('Jogador não encontrado.');
    }
    
    // Obter tentativa atual do usuário
    let userAttempt = await maritodleDailyService.getUserTodaysAttempt(userId);
    const currentAttempts = userAttempt?.attempts || 0;
    const attemptsData = userAttempt?.attempts_data || [];
    
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
    await maritodleDailyService.updateUserAttempt(userId, {
      attempts: currentAttempts + 1,
      won: venceu,
      completed: venceu, // Completar quando ganhar (ou definir outra condição)
      attempts_data: attemptsData
    });
    
    // Preparar resposta
    const response: any = {
      feedback,
      venceu,
      perdeu: false,
      palpite_dados: palpite,
      attempts: currentAttempts + 1
    };
    
    if (venceu) {
      response.estatisticas = { tentativas: currentAttempts + 1 };
      
      // Obter estatísticas atualizadas
      const updatedStats = await maritodleDailyService.getTodaysStats();
      response.totalWinners = updatedStats.totalWinners;
      response.playerPosition = updatedStats.totalWinners; // Posição do jogador (1º, 2º, etc.)
      response.secretPlayerName = secretPlayer.nome;
    }
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obter estatísticas do dia em tempo real
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await maritodleDailyService.getTodaysStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}; 