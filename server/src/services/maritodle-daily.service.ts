import pool from '../config/db';

interface MaritodleDailyGame {
  id: number;
  date: string;
  secret_player_id: number;
  secret_player_name: string;
  total_winners: number;
}

interface UserAttempt {
  id: number;
  user_id: number;
  game_date: string;
  attempts: number;
  won: boolean;
  completed: boolean;
  attempts_data: any[];
  won_at?: Date;
}

class MaritodleDailyService {
  
  // Obter ou criar o jogo do dia
  async getTodaysGame(): Promise<MaritodleDailyGame> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Verificar se já existe jogo para hoje
    const existingGame = await pool.query(
      'SELECT * FROM maritodle_daily_games WHERE date = $1',
      [today]
    );
    
    if (existingGame.rows.length > 0) {
      return existingGame.rows[0];
    }
    
    // Se não existe, criar novo jogo
    return await this.createTodaysGame(today);
  }
  
  // Criar o jogo do dia
  private async createTodaysGame(date: string): Promise<MaritodleDailyGame> {
    // Obter um jogador aleatório (excluindo treinadores)
    const playersResult = await pool.query(
      'SELECT * FROM maritodle_players WHERE papel != $1 ORDER BY RANDOM() LIMIT 1',
      ['Treinador']
    );
    
    if (playersResult.rows.length === 0) {
      throw new Error('Nenhum jogador encontrado para o jogo diário');
    }
    
    const secretPlayer = playersResult.rows[0];
    
    // Inserir novo jogo
    const newGame = await pool.query(
      `INSERT INTO maritodle_daily_games (date, secret_player_id, secret_player_name, total_winners)
       VALUES ($1, $2, $3, 0)
       RETURNING *`,
      [date, secretPlayer.id, secretPlayer.nome]
    );
    
    console.log(`🎮 Novo jogo diário criado para ${date}: ${secretPlayer.nome}`);
    
    return newGame.rows[0];
  }
  
  // Obter tentativa do usuário para hoje
  async getUserTodaysAttempt(userId: number): Promise<UserAttempt | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      'SELECT * FROM maritodle_daily_attempts WHERE user_id = $1 AND game_date = $2',
      [userId, today]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  // Obter posição do jogador no ranking do dia
  async getUserPositionToday(userId: number): Promise<number | null> {
    const today = new Date().toISOString().split('T')[0];
    
    // Obter todos os jogadores que ganharam hoje, ordenados por hora de vitória
    const result = await pool.query(`
      SELECT user_id, won_at 
      FROM maritodle_daily_attempts 
      WHERE game_date = $1 AND won = true 
      ORDER BY won_at ASC
    `, [today]);
    
    // Encontrar a posição do usuário
    const position = result.rows.findIndex(row => row.user_id === userId);
    return position >= 0 ? position + 1 : null;
  }
  
  // Criar ou atualizar tentativa do usuário
  async updateUserAttempt(userId: number, attemptData: {
    attempts: number;
    won: boolean;
    completed: boolean;
    attempts_data: any[];
  }): Promise<UserAttempt> {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar se já existe
    const existing = await this.getUserTodaysAttempt(userId);
    
    if (existing) {
      // Atualizar existente
      const updated = await pool.query(
        `UPDATE maritodle_daily_attempts 
         SET attempts = $1, won = $2, completed = $3, attempts_data = $4, won_at = $5
         WHERE user_id = $6 AND game_date = $7
         RETURNING *`,
        [
          attemptData.attempts,
          attemptData.won,
          attemptData.completed,
          JSON.stringify(attemptData.attempts_data),
          attemptData.won ? new Date() : null,
          userId,
          today
        ]
      );
      
      // Se o usuário ganhou pela primeira vez hoje, incrementar contador
      if (attemptData.won && !existing.won) {
        await this.incrementWinnerCount(today);
      }
      
      return updated.rows[0];
    } else {
      // Criar novo
      const newAttempt = await pool.query(
        `INSERT INTO maritodle_daily_attempts (user_id, game_date, attempts, won, completed, attempts_data, won_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          today,
          attemptData.attempts,
          attemptData.won,
          attemptData.completed,
          JSON.stringify(attemptData.attempts_data),
          attemptData.won ? new Date() : null
        ]
      );
      
      // Se o usuário ganhou, incrementar contador
      if (attemptData.won) {
        await this.incrementWinnerCount(today);
      }
      
      return newAttempt.rows[0];
    }
  }
  
  // Incrementar contador de vencedores
  private async incrementWinnerCount(date: string): Promise<void> {
    await pool.query(
      'UPDATE maritodle_daily_games SET total_winners = total_winners + 1 WHERE date = $1',
      [date]
    );
  }
  
  // Obter jogo de ontem
  async getYesterdaysGame(): Promise<MaritodleDailyGame | null> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const result = await pool.query(
      'SELECT * FROM maritodle_daily_games WHERE date = $1',
      [yesterdayStr]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  // Obter jogadores (apenas jogadores, sem treinadores)
  async getPlayers(): Promise<any[]> {
    const result = await pool.query(
      'SELECT * FROM maritodle_players WHERE papel != $1 ORDER BY nome',
      ['Treinador']
    );
    
    // Transformar dados para formato compatível
    return result.rows.map(player => ({
      ...player,
      posicoes: [player.posicao_principal],
      papeis: [player.papel]
    }));
  }
  
  // Obter jogador por ID
  async getPlayerById(id: number): Promise<any | null> {
    const result = await pool.query(
      'SELECT * FROM maritodle_players WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const player = result.rows[0];
    // Transformar dados para formato compatível
    return {
      ...player,
      posicoes: [player.posicao_principal],
      papeis: [player.papel]
    };
  }
  
  // Verificar se usuário já jogou hoje
  async hasUserPlayedToday(userId: number): Promise<boolean> {
    const attempt = await this.getUserTodaysAttempt(userId);
    return attempt !== null && attempt.completed;
  }
  
  // Obter estatísticas do dia
  async getTodaysStats(): Promise<{ totalWinners: number; totalPlayers: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const gameResult = await pool.query(
      'SELECT total_winners FROM maritodle_daily_games WHERE date = $1',
      [today]
    );
    
    const playersResult = await pool.query(
      'SELECT COUNT(*) as total FROM maritodle_daily_attempts WHERE game_date = $1',
      [today]
    );
    
    return {
      totalWinners: gameResult.rows[0]?.total_winners || 0,
      totalPlayers: parseInt(playersResult.rows[0]?.total || '0')
    };
  }
  
  // Gerar novo jogo para o próximo dia (executado às 23:00)
  async generateNextDayGame(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Verificar se já existe jogo para amanhã
    const existingGame = await pool.query(
      'SELECT * FROM maritodle_daily_games WHERE date = $1',
      [tomorrowStr]
    );
    
    if (existingGame.rows.length === 0) {
      await this.createTodaysGame(tomorrowStr);
      console.log(`🌅 Jogo de amanhã gerado: ${tomorrowStr}`);
    }
  }
}

export default new MaritodleDailyService(); 