import api from './api';
import type { Player } from '../types';

// Interface para representar um jogo e seus participantes
export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  date: string;
  playerIds: number[];
}

// Simulação de dados de jogos recentes (em produção viria de uma API ou base de dados)
const recentMatches: MatchInfo[] = [
  {
    homeTeam: 'CS Marítimo',
    awayTeam: 'FC Tondela',
    date: '2024-01-20',
    playerIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] // IDs dos jogadores que participaram
  },
  {
    homeTeam: 'SL Benfica',
    awayTeam: 'CS Marítimo',
    date: '2024-01-15',
    playerIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 17, 18, 19, 20]
  }
];

// Função para obter o último jogo do Marítimo
export const getLastMatch = (): MatchInfo | null => {
  // Ordena os jogos por data (mais recente primeiro)
  const sortedMatches = recentMatches.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sortedMatches.length > 0 ? sortedMatches[0] : null;
};

// Função para obter jogadores de um jogo específico
export const getMatchPlayers = async (playerIds: number[]): Promise<Player[]> => {
  try {
    const response = await api.get('/players');
    const allPlayers: Player[] = response.data.players || response.data;
    
    // Filtra apenas os jogadores que participaram no jogo
    return allPlayers.filter(player => playerIds.includes(player.id));
  } catch (error) {
    console.error('Error fetching match players:', error);
    return [];
  }
};

// Função para criar automaticamente uma votação baseada no último jogo
export const createAutoVotingFromLastMatch = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const lastMatch = getLastMatch();
    
    if (!lastMatch) {
      return { success: false, message: 'Nenhum jogo recente encontrado' };
    }

    // Verifica se os jogadores existem na base de dados
    const matchPlayers = await getMatchPlayers(lastMatch.playerIds);
    
    if (matchPlayers.length === 0) {
      return { success: false, message: 'Nenhum jogador encontrado para o último jogo' };
    }

    // Cria a votação com os dados do último jogo
    const response = await api.post('/player-ratings/admin/create-voting', {
      home_team: lastMatch.homeTeam,
      away_team: lastMatch.awayTeam,
      match_date: lastMatch.date,
      player_ids: matchPlayers.map(p => p.id)
    });

    if (response.data.success) {
      return { 
        success: true, 
        message: `Votação criada automaticamente para ${lastMatch.homeTeam} vs ${lastMatch.awayTeam} com ${matchPlayers.length} jogadores`
      };
    } else {
      return { success: false, message: 'Erro ao criar a votação automática' };
    }
  } catch (error: any) {
    console.error('Error creating auto voting:', error);
    return { 
      success: false, 
      message: error.response?.data?.error || 'Erro ao criar votação automática'
    };
  }
};

// Função para obter estatísticas do último jogo
export const getLastMatchStats = async (): Promise<{
  match: MatchInfo | null;
  playersCount: number;
  players: Player[];
}> => {
  const lastMatch = getLastMatch();
  
  if (!lastMatch) {
    return { match: null, playersCount: 0, players: [] };
  }

  const players = await getMatchPlayers(lastMatch.playerIds);
  
  return {
    match: lastMatch,
    playersCount: players.length,
    players: players
  };
};

// Em produção, esta função conectaria com APIs de futebol ou bases de dados de estatísticas
export const fetchMatchDataFromExternalAPI = async (teamName: string): Promise<MatchInfo[]> => {
  // Placeholder para integração futura com APIs como:
  // - API-Football (rapidapi.com)
  // - SportRadar
  // - FotMob API
  // etc.
  
  console.log(`Fetching match data for ${teamName} from external API...`);
  
  // Por agora retorna dados simulados
  return recentMatches.filter(match => 
    match.homeTeam.includes(teamName) || match.awayTeam.includes(teamName)
  );
};

// Função para atualizar dados dos jogos (para uso futuro)
export const updateMatchData = (newMatches: MatchInfo[]): void => {
  recentMatches.push(...newMatches);
  
  // Remove duplicatas baseado na data e equipas
  const uniqueMatches = recentMatches.filter((match, index, self) =>
    index === self.findIndex(m => 
      m.date === match.date && 
      m.homeTeam === match.homeTeam && 
      m.awayTeam === match.awayTeam
    )
  );
  
  recentMatches.splice(0, recentMatches.length, ...uniqueMatches);
}; 