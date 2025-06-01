import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errorTypes';
import pool from '../config/db';

// Interface para definir o tipo de jogador/treinador
interface MaritodlePlayer {
  nome: string;
  sexo: string;
  posicoes: string[];
  papeis: string[];
  altura_cm: number;
  idade: number;
  nacionalidade: string;
  trofeus: string[];
  ano_entrada: number;
  ano_saida: number;
}

// Cache para os jogadores (será atualizado quando necessário)
let jogadoresCache: MaritodlePlayer[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

// Estado do jogo armazenado em memória (em produção seria numa base de dados)
const jogosAtivos: { [userId: number]: any } = {};

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
  
  // 1. Sexo
  feedback.push({
    coluna: 'sexo',
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
  
  // 7. Troféus
  let trofeusItem: any = {
    coluna: 'trofeus'
  };
  
  if (segredo.trofeus.length === 0) {
    trofeusItem.icone = 'x-branco';
    trofeusItem.correto = true;
  } else {
    const intersecao = palpite.trofeus.filter((t: string) => segredo.trofeus.includes(t));
    if (intersecao.length > 0) {
      trofeusItem.icone = 'verde';
      trofeusItem.trofeus_match = intersecao;
    } else {
      trofeusItem.icone = 'x-vermelho';
    }
  }
  feedback.push(trofeusItem);
  
  // 8. Período (combinando ano_entrada e ano_saida)
  let periodoIcone;
  // Comparar períodos: se o ano de entrada é igual, é verde
  if (palpite.ano_entrada === segredo.ano_entrada && palpite.ano_saida === segredo.ano_saida) {
    periodoIcone = 'verde';
  } else if (palpite.ano_entrada === segredo.ano_entrada || palpite.ano_saida === segredo.ano_saida) {
    // Se apenas um dos anos coincide, é amarelo
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
  return feedback.every(f => 
    f.icone === 'verde' || 
    (f.coluna === 'trofeus' && f.icone === 'x-branco' && f.correto)
  );
}

function gerarClue1(segredo: any) {
  // Opção A: Década de nascimento
  const anoAtual = new Date().getFullYear();
  const anoNascimento = anoAtual - segredo.idade;
  const decada = Math.floor(anoNascimento / 10) * 10;
  return `Nasceu entre ${decada} e ${decada + 9}.`;
}

function gerarClue2(segredo: any) {
  // Opção A: Ano de entrada exato
  return `Entrou no Marítimo no ano de ${segredo.ano_entrada}.`;
}

// Função para buscar jogadores da nova tabela maritodle_players
async function buscarJogadoresMaritimo(): Promise<MaritodlePlayer[]> {
  try {
    const result = await pool.query(`
      SELECT 
        nome, 
        sexo, 
        posicao_principal, 
        altura_cm, 
        papel, 
        idade, 
        nacionalidade, 
        trofeus, 
        ano_entrada, 
        ano_saida 
      FROM maritodle_players 
      ORDER BY nome
    `);
    
    // Converter os dados da base para o formato esperado
    const jogadores: MaritodlePlayer[] = result.rows.map(row => ({
      nome: row.nome,
      sexo: row.sexo,
      posicoes: [row.posicao_principal], // Por enquanto apenas a posição principal
      papeis: [row.papel],
      altura_cm: row.altura_cm,
      idade: row.idade,
      nacionalidade: row.nacionalidade,
      trofeus: Array.isArray(row.trofeus) ? row.trofeus : [],
      ano_entrada: row.ano_entrada,
      ano_saida: row.ano_saida
    }));

    console.log(`✅ Carregados ${jogadores.length} jogadores da base de dados maritodle_players`);
    return jogadores;
  } catch (error) {
    console.error('❌ Erro ao buscar jogadores da base de dados:', error);
    throw error;
  }
}

// Função para buscar ou atualizar cache de jogadores
async function obterJogadores(): Promise<MaritodlePlayer[]> {
  const agora = Date.now();
  
  // Verificar se o cache ainda é válido
  if (jogadoresCache.length > 0 && (agora - lastCacheUpdate) < CACHE_DURATION) {
    return jogadoresCache;
  }

  // Atualizar cache
  jogadoresCache = await buscarJogadoresMaritimo();
  lastCacheUpdate = agora;
  
  return jogadoresCache;
}

export const getNomes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jogadores = await obterJogadores();
    const nomes = jogadores.map(j => j.nome);
    res.json({ nomes });
  } catch (error) {
    next(error);
  }
};

export const novoJogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    
    // Obter jogadores atualizados
    const jogadores = await obterJogadores();
    
    // Escolher segredo aleatório
    const segredo = jogadores[Math.floor(Math.random() * jogadores.length)];
    
    // Inicializar estado do jogo
    jogosAtivos[userId] = {
      segredo,
      tentativas: 0,
      clue1_mostrada: false,
      clue2_mostrada: false,
      finalizado: false
    };
    
    res.json({ 
      message: 'Novo jogo iniciado',
      jogo_id: userId
    });
  } catch (error) {
    next(error);
  }
};

export const submeterPalpite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { nome, tentativa_atual } = req.body;
    
    if (!nome) {
      throw new BadRequestError('Nome é obrigatório');
    }
    
    // Verificar se há jogo ativo
    if (!jogosAtivos[userId]) {
      throw new BadRequestError('Nenhum jogo ativo. Inicie um novo jogo.');
    }
    
    const jogo = jogosAtivos[userId];
    
    if (jogo.finalizado) {
      throw new BadRequestError('Jogo já finalizado');
    }
    
    // Obter jogadores atualizados
    const jogadores = await obterJogadores();
    
    // Normalizar e procurar o nome
    const nomeNormalizado = normalizarNome(nome);
    const palpite = jogadores.find(j => 
      normalizarNome(j.nome) === nomeNormalizado
    );
    
    if (!palpite) {
      throw new BadRequestError('Jogador/Treinador não encontrado.');
    }
    
    // Incrementar tentativas
    jogo.tentativas++;
    
    // Gerar feedback
    const feedback = gerarFeedback(palpite, jogo.segredo);
    
    // Verificar vitória
    const venceu = verificarVitoria(feedback);
    
    let response: any = {
      feedback,
      venceu,
      perdeu: false,
      mostrar_clue1: false,
      mostrar_clue2: false,
      palpite_dados: palpite
    };
    
    if (venceu) {
      response.estatisticas = { tentativas: jogo.tentativas };
      jogo.finalizado = true;
    } else {
      // Verificar clues
      if (jogo.tentativas === 6 && !jogo.clue1_mostrada) {
        response.mostrar_clue1 = true;
        response.clue1 = gerarClue1(jogo.segredo);
        jogo.clue1_mostrada = true;
      }
      
      if (jogo.tentativas === 9 && !jogo.clue2_mostrada) {
        response.mostrar_clue2 = true;
        response.clue2 = gerarClue2(jogo.segredo);
        jogo.clue2_mostrada = true;
      }
    }
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const desistir = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    
    if (!jogosAtivos[userId]) {
      throw new BadRequestError('Nenhum jogo ativo');
    }
    
    const jogo = jogosAtivos[userId];
    jogo.finalizado = true;
    
    res.json({
      feedback: null,
      venceu: false,
      perdeu: true,
      segredo_completo: jogo.segredo
    });
  } catch (error) {
    next(error);
  }
}; 