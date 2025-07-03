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

// Função para analisar o histórico de tentativas e identificar atributos que ainda não tiveram feedback positivo (verde/amarelo)
function analisarHistoricoTentativas(historico: any[], segredo: any) {
  if (!historico || historico.length === 0) {
    return {
      vermelhos: ['sexo', 'posicoes', 'altura_cm', 'papeis', 'idade', 'nacionalidade', 'trofeus', 'ano_entrada'],
      amarelos: []
    };
  }

  // Mapeamento dos índices de feedback para os atributos do jogador
  const mapeamentoColunas = [
    'sexo',         // Jogos (campo "sexo" contém agora "X jogos")
    'posicoes',     // Posições
    'altura_cm',    // Altura
    'papeis',       // Papéis
    'idade',        // Idade
    'nacionalidade',// Nacionalidade
    'trofeus',      // Contribuições
    'ano_entrada'   // Período → ano_entrada
  ];

  const statusAtributos: { [key: string]: string } = {};

  // Inicializar todos como desconhecido
  mapeamentoColunas.forEach(attr => {
    statusAtributos[attr] = 'desconhecido';
  });

  // Percorrer tentativas
  historico.forEach(tentativa => {
    if (tentativa.feedback) {
      tentativa.feedback.forEach((feedback: any, index: number) => {
        const atributo = mapeamentoColunas[index];
        if (!atributo) return;

        if (feedback.icone === 'verde') {
          statusAtributos[atributo] = 'verde';
        } else if (statusAtributos[atributo] !== 'verde' && feedback.icone === 'amarelo') {
          statusAtributos[atributo] = 'amarelo';
        } else if (statusAtributos[atributo] === 'desconhecido' && feedback.icone === 'vermelho') {
          statusAtributos[atributo] = 'vermelho';
        }
      });
    }
  });

  const vermelhos: string[] = [];
  const amarelos: string[] = [];

  Object.entries(statusAtributos).forEach(([atributo, status]) => {
    if (status === 'vermelho') vermelhos.push(atributo);
    else if (status === 'amarelo') amarelos.push(atributo);
  });

  return { vermelhos, amarelos };
}

// Função para gerar uma dica com base num atributo específico
function gerarDicaPorAtributo(atributo: string, segredo: any, status: 'vermelho' | 'amarelo') {
  const prefixo = status === 'vermelho' ? '🔴' : '🟡';

  switch (atributo) {
    case 'sexo': // Jogos
      return `${prefixo} O número de jogos do jogador secreto no Marítimo é: ${segredo.sexo}`;
    case 'posicoes':
      return `${prefixo} O jogador secreto atua na(s) posição(ões): ${Array.isArray(segredo.posicoes) ? segredo.posicoes.join(', ') : segredo.posicoes}`;
    case 'altura_cm':
      return `${prefixo} A altura do jogador secreto é: ${segredo.altura_cm}cm`;
    case 'papeis':
      return `${prefixo} O papel do jogador secreto no clube é: ${Array.isArray(segredo.papeis) ? segredo.papeis.join(', ') : segredo.papeis}`;
    case 'idade':
      return `${prefixo} A idade do jogador secreto é: ${segredo.idade} anos`;
    case 'nacionalidade':
      return `${prefixo} A nacionalidade do jogador secreto é: ${segredo.nacionalidade}`;
    case 'trofeus':
      if (!segredo.trofeus || segredo.trofeus.length === 0) {
        return `${prefixo} O jogador secreto não tem contribuições registadas.`;
      } else {
        return `${prefixo} Contribuições do jogador secreto: ${segredo.trofeus.join(', ')}`;
      }
    case 'ano_entrada':
      const saida = segredo.ano_saida === 9999 ? 'presente' : segredo.ano_saida;
      return `${prefixo} O período do jogador secreto no Marítimo foi: ${segredo.ano_entrada}-${saida}`;
    default:
      return gerarClue1Generica(segredo);
  }
}

// Funções genéricas de fallback
function gerarClue1Generica(segredo: any) {
  const anoAtual = new Date().getFullYear();
  const anoNascimento = anoAtual - segredo.idade;
  const decada = Math.floor(anoNascimento / 10) * 10;
  return `💡 Nasceu entre ${decada} e ${decada + 9}`;
}

function gerarClue2Generica(segredo: any) {
  return `💡 Entrou no Marítimo no ano de ${segredo.ano_entrada}`;
}

// Função inteligente para escolher a melhor dica
function gerarDicaInteligente(segredo: any, historico: any[], tentativasRealizadas: number, atributoExcluido: string | null = null) {
  const { vermelhos, amarelos } = analisarHistoricoTentativas(historico, segredo);

  const vermelhosDisponiveis = atributoExcluido ? vermelhos.filter(a => a !== atributoExcluido) : vermelhos;
  const amarelosDisponiveis = atributoExcluido ? amarelos.filter(a => a !== atributoExcluido) : amarelos;

  if (vermelhosDisponiveis.length > 0) {
    const atributoEscolhido = vermelhosDisponiveis[Math.floor(Math.random() * vermelhosDisponiveis.length)];
    return { dica: gerarDicaPorAtributo(atributoEscolhido, segredo, 'vermelho'), atributo: atributoEscolhido };
  }

  if (amarelosDisponiveis.length > 0) {
    const atributoEscolhido = amarelosDisponiveis[Math.floor(Math.random() * amarelosDisponiveis.length)];
    return { dica: gerarDicaPorAtributo(atributoEscolhido, segredo, 'amarelo'), atributo: atributoEscolhido };
  }

  // Se tudo já foi descoberto, usar genéricas
  if (tentativasRealizadas >= 9) {
    return { dica: gerarClue2Generica(segredo), atributo: 'generica_2' };
  }

  return { dica: gerarClue1Generica(segredo), atributo: 'generica_1' };
}

function gerarClue1(segredo: any, historico: any[] = []) {
  return gerarDicaInteligente(segredo, historico, 6);
}

function gerarClue2(segredo: any, historico: any[] = [], atributoClue1: string | null = null) {
  return gerarDicaInteligente(segredo, historico, 9, atributoClue1);
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
    
    // Após preparar a resposta base
    // Gerar pistas se o utilizador ainda não venceu
    if (!venceu) {
      const historicoParaAnalise = attemptsData; // já contém a tentativa atual

      // Pista 1 após 6 tentativas
      if (response.attempts === 6) {
        const clue1 = gerarClue1(secretPlayer, historicoParaAnalise);
        response.mostrar_clue1 = true;
        response.clue1 = clue1.dica;
        // Guardar no próprio response o atributo escolhido para evitar repetição mais tarde
        response.atributo_clue1 = clue1.atributo;
      }

      // Pista 2 após 9 tentativas
      if (response.attempts === 9) {
        // Se já foi gerada a pista1 no mesmo request, usar o atributo indicado; caso contrário, não excluir nada
        const atributoExcluido = (response as any).atributo_clue1 || null;
        const clue2 = gerarClue2(secretPlayer, historicoParaAnalise, atributoExcluido);
        response.mostrar_clue2 = true;
        response.clue2 = clue2.dica;
      }
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