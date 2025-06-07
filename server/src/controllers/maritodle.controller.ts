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
  
  // 7. Contribuições (anteriormente "Troféus")
  let contribuicoesItem: any = {
    coluna: 'contribuicoes'
  };
  
  // Extrair número de contribuições dos arrays
  const extrairNumeroContribuicoes = (trofeus: string[]): number => {
    if (!trofeus || trofeus.length === 0) return 0;
    const match = trofeus[0]?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };
  
  const contribuicoesPalpite = extrairNumeroContribuicoes(palpite.trofeus);
  const contribuicoesSegredo = extrairNumeroContribuicoes(segredo.trofeus);
  
  if (contribuicoesPalpite === contribuicoesSegredo) {
    contribuicoesItem.icone = 'verde';
    contribuicoesItem.trofeus_match = palpite.trofeus;
  } else {
    contribuicoesItem.icone = 'vermelho';
  }
  
  feedback.push(contribuicoesItem);
  
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
  return feedback.every(f => f.icone === 'verde');
}

// Função para analisar o histórico e identificar atributos não descobertos
function analisarHistoricoTentativas(historico: any[], segredo: any) {
  if (!historico || historico.length === 0) {
    return {
      vermelhos: ['sexo', 'posicoes', 'altura_cm', 'papeis', 'idade', 'nacionalidade', 'trofeus', 'ano_entrada'],
      amarelos: []
    };
  }

  // Mapear as colunas de feedback para os atributos correspondentes
  const mapeamentoColunas = [
    'sexo',        // Jogos
    'posicoes',    // Posições  
    'altura_cm',   // Altura
    'papeis',      // Papéis
    'idade',       // Idade
    'nacionalidade', // Nacionalidade
    'trofeus',     // Contribuições
    'ano_entrada'  // Período (ano_entrada)
  ];

  const statusAtributos: { [key: string]: string } = {};
  
  // Inicializar todos os atributos como desconhecidos
  mapeamentoColunas.forEach(attr => {
    statusAtributos[attr] = 'desconhecido';
  });

  // Analisar cada tentativa
  historico.forEach(tentativa => {
    if (tentativa.feedback) {
      tentativa.feedback.forEach((feedback: any, index: number) => {
        const atributo = mapeamentoColunas[index];
        if (!atributo) return;

        // Se já foi verde, marcar como conhecido
        if (feedback.icone === 'verde') {
          statusAtributos[atributo] = 'verde';
        }
        // Se nunca foi verde e agora é amarelo, marcar como amarelo
        else if (statusAtributos[atributo] !== 'verde' && feedback.icone === 'amarelo') {
          statusAtributos[atributo] = 'amarelo';
        }
        // Se nunca foi verde nem amarelo, marcar como vermelho
        else if (statusAtributos[atributo] === 'desconhecido' && feedback.icone === 'vermelho') {
          statusAtributos[atributo] = 'vermelho';
        }
      });
    }
  });

  // Separar atributos por status
  const vermelhos: string[] = [];
  const amarelos: string[] = [];
  
  Object.entries(statusAtributos).forEach(([atributo, status]) => {
    if (status === 'vermelho') {
      vermelhos.push(atributo);
    } else if (status === 'amarelo') {
      amarelos.push(atributo);
    }
  });

  return { vermelhos, amarelos };
}

// Função para gerar dica inteligente baseada no histórico
function gerarDicaInteligente(segredo: any, historico: any[], tentativasRealizadas: number, atributoExcluido: string | null = null) {
  const { vermelhos, amarelos } = analisarHistoricoTentativas(historico, segredo);
  
  // Filtrar o atributo já usado (se houver)
  const vermelhosDisponiveis = atributoExcluido ? vermelhos.filter(attr => attr !== atributoExcluido) : vermelhos;
  const amarelosDisponiveis = atributoExcluido ? amarelos.filter(attr => attr !== atributoExcluido) : amarelos;
  
  // Priorizar atributos sempre vermelhos (excluindo o já usado)
  if (vermelhosDisponiveis.length > 0) {
    const atributoEscolhido = vermelhosDisponiveis[Math.floor(Math.random() * vermelhosDisponiveis.length)];
    return {
      dica: gerarDicaPorAtributo(atributoEscolhido, segredo, 'vermelho'),
      atributo: atributoEscolhido
    };
  }
  
  // Se não há vermelhos disponíveis, usar amarelos (excluindo o já usado)
  if (amarelosDisponiveis.length > 0) {
    const atributoEscolhido = amarelosDisponiveis[Math.floor(Math.random() * amarelosDisponiveis.length)];
    return {
      dica: gerarDicaPorAtributo(atributoEscolhido, segredo, 'amarelo'),
      atributo: atributoEscolhido
    };
  }
  
  // Fallback para dicas genéricas se tudo foi descoberto ou usado
  if (tentativasRealizadas >= 9) {
    return {
      dica: gerarClue2Generica(segredo),
      atributo: 'generica_2'
    };
  } else {
    return {
      dica: gerarClue1Generica(segredo),
      atributo: 'generica_1'
    };
  }
}

// Função para gerar dica específica por atributo
function gerarDicaPorAtributo(atributo: string, segredo: any, status: 'vermelho' | 'amarelo') {
  const prefixo = status === 'vermelho' ? '🔴' : '🟡';
  
  switch (atributo) {
    case 'sexo':
      return `${prefixo} O número de jogos do jogador secreto no Marítimo é: ${segredo.sexo}`;
    
    case 'posicoes':
      const posicoes = Array.isArray(segredo.posicoes) ? segredo.posicoes.join(', ') : segredo.posicoes;
      return `${prefixo} O jogador secreto joga na(s) posição(ões): ${posicoes}`;
    
    case 'altura_cm':
      return `${prefixo} A altura do jogador secreto é: ${segredo.altura_cm}cm`;
    
    case 'papeis':
      const papeis = Array.isArray(segredo.papeis) ? segredo.papeis.join(', ') : segredo.papeis;
      return `${prefixo} O papel do jogador secreto no clube: ${papeis}`;
    
    case 'idade':
      return `${prefixo} A idade do jogador secreto é: ${segredo.idade} anos`;
    
    case 'nacionalidade':
      return `${prefixo} A nacionalidade do jogador secreto é: ${segredo.nacionalidade}`;
    
    case 'trofeus':
      if (!segredo.trofeus || segredo.trofeus.length === 0) {
        return `${prefixo} O jogador secreto não tem contribuições registadas`;
      } else {
        const contribuicoes = Array.isArray(segredo.trofeus) ? segredo.trofeus.join(', ') : segredo.trofeus;
        return `${prefixo} As contribuições do jogador secreto: ${contribuicoes}`;
      }
    
    case 'ano_entrada':
      const saida = segredo.ano_saida === 9999 ? 'presente' : segredo.ano_saida;
      return `${prefixo} O período do jogador secreto no Marítimo: ${segredo.ano_entrada}-${saida}`;
    
    default:
      return gerarClue1Generica(segredo);
  }
}

// Funções de fallback (antigas dicas genéricas)
function gerarClue1Generica(segredo: any) {
  const anoAtual = new Date().getFullYear();
  const anoNascimento = anoAtual - segredo.idade;
  const decada = Math.floor(anoNascimento / 10) * 10;
  return `💡 Nasceu entre ${decada} e ${decada + 9}`;
}

function gerarClue2Generica(segredo: any) {
  return `💡 Entrou no Marítimo no ano de ${segredo.ano_entrada}`;
}

// Função pública para gerar a primeira dica
function gerarClue1(segredo: any, historico: any[] = []) {
  const resultado = gerarDicaInteligente(segredo, historico, 6);
  return resultado;
}

// Função pública para gerar a segunda dica  
function gerarClue2(segredo: any, historico: any[] = [], atributoClue1: string | null = null) {
  const resultado = gerarDicaInteligente(segredo, historico, 9, atributoClue1);
  return resultado;
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

    // Verificar se treinadores também foram jogadores
    const verificarSeJogador = async (nomeTrainador: string): Promise<boolean> => {
      // Lista de treinadores que também foram jogadores no Marítimo
      const treinadoresQueForamJogadores = [
        'Petit', 'Pedro Martins', 'José Gomes', 'Lito Vidigal', 'Silas'
      ];
      
      return treinadoresQueForamJogadores.includes(nomeTrainador);
    };
    
    // Converter os dados da base para o formato esperado
    const jogadores: MaritodlePlayer[] = await Promise.all(result.rows.map(async row => {
      // Determinar posições baseada no papel
      let posicoes: string[];
      if (row.papel === 'Treinador') {
        posicoes = ['X']; // Treinadores têm posição X
      } else {
        // Dividir posições múltiplas separadas por "/"
        posicoes = row.posicao_principal ? row.posicao_principal.split('/').map((pos: string) => pos.trim()) : ['N/A'];
      }
      
      // Determinar papel baseado no histórico
      let papeis = [row.papel];
      if (row.papel === 'Treinador') {
        const foiJogador = await verificarSeJogador(row.nome);
        if (foiJogador) {
          papeis = ['Treinador/Jogador'];
        }
      }
      
      // Usar o campo "sexo" diretamente da base de dados (que agora contém o número correto de jogos)
      let jogosInfo = row.sexo; // Campo "sexo" contém agora "X jogos" ou "N/A jogos" para treinadores
      
      if (row.papel === 'Treinador' && (row.sexo === 'Masculino' || row.sexo === 'Feminino')) {
        // Se for treinador e ainda tiver valores antigos de sexo, usar "N/A jogos"
        jogosInfo = 'N/A jogos';
      }
      
      return {
        nome: row.nome,
        sexo: jogosInfo, // Usar diretamente o valor da base de dados
        posicoes: posicoes,
        papeis: papeis,
        altura_cm: row.altura_cm,
        idade: row.idade,
        nacionalidade: row.nacionalidade,
        trofeus: Array.isArray(row.trofeus) ? row.trofeus : [], // Usar contribuições reais da BD
        ano_entrada: row.ano_entrada,
        ano_saida: row.ano_saida
      };
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
      finalizado: false,
      historico: [],
      atributo_clue1: null  // Para garantir que clue2 seja diferente
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
    
    // Armazenar tentativa no histórico antes de verificar dicas
    jogo.historico.push({
      nome: nome,
      palpite: palpite,
      feedback: feedback
    });
    
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
      // Verificar clues (agora com o histórico atualizado)
      if (jogo.tentativas === 6 && !jogo.clue1_mostrada) {
        response.mostrar_clue1 = true;
        const clue1 = gerarClue1(jogo.segredo, jogo.historico);
        response.clue1 = clue1.dica;
        jogo.atributo_clue1 = clue1.atributo; // Armazenar no estado do jogo
        jogo.clue1_mostrada = true;
      }
      
      if (jogo.tentativas === 9 && !jogo.clue2_mostrada) {
        response.mostrar_clue2 = true;
        const clue2 = gerarClue2(jogo.segredo, jogo.historico, jogo.atributo_clue1);
        response.clue2 = clue2.dica;
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
      return res.status(400).json({ erro: 'Nenhum jogo ativo encontrado' });
    }

    const jogo = jogosAtivos[userId];
    jogo.finalizado = true;

    res.json({
      feedback: [],
      venceu: false,
      perdeu: true,
      segredo_completo: jogo.segredo,
      estatisticas: { tentativas: jogo.tentativas }
    });
  } catch (error) {
    next(error);
  }
};

export const insertTrainers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainers = [
      ['Manuel Ventura', 'Masculino', 'Treinador', 180, 'Treinador', 73, 'Portugal', '{}', 2003, 2004],
      ['Mariano Barreto', 'Masculino', 'Treinador', null, 'Treinador', 68, 'Portugal', '{}', 2004, 2005],
      ['Juca', 'Masculino', 'Treinador', null, 'Treinador', null, 'Portugal', '{}', 2005, 2005],
      ['João Abel', 'Masculino', 'Treinador', null, 'Treinador', null, 'Portugal', '{}', 2005, 2005],
      ['Paulo Bonamigo', 'Masculino', 'Treinador', null, 'Treinador', null, 'Brasil', '{}', 2005, 2006],
      ['Ulisses Morais', 'Masculino', 'Treinador', null, 'Treinador', null, 'Portugal', '{}', 2006, 2007],
      ['Alberto Pazos', 'Masculino', 'Treinador', null, 'Treinador', null, 'Portugal', '{}', 2007, 2007],
      ['Sebastião Lazaroni', 'Masculino', 'Treinador', null, 'Treinador', null, 'Brasil', '{}', 2007, 2008],
      ['Lori Sandri', 'Masculino', 'Treinador', null, 'Treinador', null, 'Brasil', '{}', 2008, 2009],
      ['Carlos Carvalhal', 'Masculino', 'Treinador', 178, 'Treinador', 59, 'Portugal', '{}', 2009, 2009],
      ['Mitchell van der Gaag', 'Masculino', 'Treinador', 183, 'Treinador', 54, 'Países Baixos', '{}', 2009, 2010],
      ['Pedro Martins', 'Masculino', 'Treinador', 180, 'Treinador', 47, 'Portugal', '{}', 2010, 2014],
      ['Leonel Pontes', 'Masculino', 'Treinador', null, 'Treinador', 48, 'Portugal', '{}', 2014, 2015],
      ['Ivo Vieira', 'Masculino', 'Treinador', null, 'Treinador', 49, 'Portugal', '{}', 2015, 2016],
      ['Nelo Vingada', 'Masculino', 'Treinador', null, 'Treinador', 64, 'Portugal', '{}', 2016, 2016],
      ['Paulo César', 'Masculino', 'Treinador', null, 'Treinador', 57, 'Brasil', '{}', 2016, 2016],
      ['Daniel Ramos', 'Masculino', 'Treinador', null, 'Treinador', 51, 'Portugal', '{}', 2016, 2018],
      ['Cláudio Braga', 'Masculino', 'Treinador', null, 'Treinador', 57, 'Portugal', '{}', 2018, 2018],
      ['Petit', 'Masculino', 'MDC', 180, 'Treinador', 47, 'Portugal', '{}', 2018, 2019],
      ['Nuno Manta Santos', 'Masculino', 'Treinador', null, 'Treinador', 53, 'Portugal', '{}', 2019, 2019],
      ['José Manuel Gomes', 'Masculino', 'Treinador', null, 'Treinador', 47, 'Portugal', '{}', 2019, 2020],
      ['Lito Vidigal', 'Masculino', 'DC', 178, 'Treinador', 55, 'Portugal', '{}', 2020, 2020],
      ['Milton Mendes', 'Masculino', 'Treinador', null, 'Treinador', 61, 'Brasil', '{}', 2020, 2021],
      ['Julio Velázquez', 'Masculino', 'Treinador', null, 'Treinador', 39, 'Espanha', '{}', 2021, 2021],
      ['Vasco Seabra', 'Masculino', 'Treinador', null, 'Treinador', 36, 'Portugal', '{}', 2021, 2022],
      ['João Henriques', 'Masculino', 'Treinador', null, 'Treinador', 44, 'Portugal', '{}', 2022, 2022],
      ['Tulipa', 'Masculino', 'Treinador', 172, 'Treinador', 52, 'Portugal', '{}', 2023, 2023],
      ['Fábio Pereira', 'Masculino', 'Treinador', null, 'Treinador', 39, 'Portugal', '{}', 2023, 2024],
      ['Silas', 'Masculino', 'MDC', 176, 'Treinador', 48, 'Portugal', '{}', 2024, 2024],
      ['Rui Duarte', 'Masculino', 'Treinador', 182, 'Treinador', 46, 'Portugal', '{}', 2024, 2025]
    ];

    let insertedCount = 0;
    
    for (const trainer of trainers) {
      try {
        await pool.query(`
          INSERT INTO maritodle_players (nome, sexo, posicao_principal, altura_cm, papel, idade, nacionalidade, trofeus, ano_entrada, ano_saida) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (nome) DO NOTHING
        `, trainer);
        insertedCount++;
      } catch (error) {
        console.log(`Erro ao inserir ${trainer[0]}:`, (error as Error).message);
      }
    }

    res.json({ 
      message: `${insertedCount} treinadores inseridos com sucesso!`,
      total: trainers.length 
    });
  } catch (error) {
    next(error);
  }
}; 