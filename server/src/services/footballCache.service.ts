import pool from '../config/db';
import footballAPIService from './footballAPI.service';

interface CachedMatch {
  fixture_id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  home_score?: number;
  away_score?: number;
  processed: boolean;
}

interface CachedLineup {
  fixture_id: number;
  team_name: string;
  player_api_id: number;
  player_name: string;
  player_position: string;
  is_starter: boolean;
  shirt_number?: number;
}

interface SyncControl {
  last_full_sync?: string;
  last_check_sync?: string;
  total_matches_cached: number;
  api_requests_today: number;
  api_requests_date: string;
}

class FootballCacheService {
  private readonly MAX_DAILY_REQUESTS = 90; // Deixar margem dos 100 requests diários
  private readonly FULL_SYNC_INTERVAL_DAYS = 7; // Full sync a cada 7 dias
  private readonly CHECK_INTERVAL_HOURS = 12; // Verificar novos jogos a cada 12 horas

  // Verificar se podemos fazer requests hoje
  async canMakeAPIRequest(): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT api_requests_today, api_requests_date 
        FROM football_sync_control 
        ORDER BY id DESC LIMIT 1
      `);

      if (result.rows.length === 0) return true;

      const { api_requests_today, api_requests_date } = result.rows[0];
      const today = new Date().toISOString().split('T')[0];
      
      // Reset contador se é um novo dia
      if (api_requests_date !== today) {
        await client.query(`
          UPDATE football_sync_control 
          SET api_requests_today = 0, api_requests_date = CURRENT_DATE
        `);
        return true;
      }

      return api_requests_today < this.MAX_DAILY_REQUESTS;
    } finally {
      client.release();
    }
  }

  // Incrementar contador de requests
  async incrementAPIRequestCount(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE football_sync_control 
        SET api_requests_today = api_requests_today + 1,
            api_requests_date = CURRENT_DATE
      `);
    } finally {
      client.release();
    }
  }

  // Buscar jogos do cache
  async getCachedMatches(limit: number = 10): Promise<CachedMatch[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT fixture_id, home_team, away_team, match_date, status, 
               home_score, away_score, processed
        FROM football_matches_cache 
        WHERE status = 'FT'
        ORDER BY match_date DESC 
        LIMIT $1
      `, [limit]);

      return result.rows;
    } finally {
      client.release();
    }
  }

  // Buscar lineup do cache
  async getCachedLineup(fixtureId: number): Promise<CachedLineup[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT fixture_id, team_name, player_api_id, player_name, 
               player_position, is_starter, shirt_number
        FROM football_lineups_cache 
        WHERE fixture_id = $1
        ORDER BY is_starter DESC, shirt_number ASC
      `, [fixtureId]);

      return result.rows;
    } finally {
      client.release();
    }
  }

  // Verificar se precisa de sincronização
  async needsSync(): Promise<{ needsFullSync: boolean; needsCheckSync: boolean }> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT last_full_sync, last_check_sync 
        FROM football_sync_control 
        ORDER BY id DESC LIMIT 1
      `);

      if (result.rows.length === 0) {
        return { needsFullSync: true, needsCheckSync: true };
      }

      const { last_full_sync, last_check_sync } = result.rows[0];
      const now = new Date();
      
      // Verificar se precisa de full sync (7 dias)
      const needsFullSync = !last_full_sync || 
        (now.getTime() - new Date(last_full_sync).getTime()) > (this.FULL_SYNC_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

      // Verificar se precisa de check sync (12 horas)
      const needsCheckSync = !last_check_sync || 
        (now.getTime() - new Date(last_check_sync).getTime()) > (this.CHECK_INTERVAL_HOURS * 60 * 60 * 1000);

      return { needsFullSync, needsCheckSync };
    } finally {
      client.release();
    }
  }

  // Sincronização completa (buscar últimos 20 jogos)
  async fullSync(): Promise<{ success: boolean; message: string; matchesAdded: number }> {
    const client = await pool.connect();
    
    try {
      console.log('🔄 Starting full sync of Marítimo matches...');
      
      if (!(await this.canMakeAPIRequest())) {
        return { success: false, message: 'Daily API request limit reached', matchesAdded: 0 };
      }

      await this.incrementAPIRequestCount();
      const matches = await footballAPIService.getRecentMatches(20);
      
      if (matches.length === 0) {
        return { success: false, message: 'No matches found from API', matchesAdded: 0 };
      }

      await client.query('BEGIN');
      let matchesAdded = 0;

      for (const match of matches) {
        // Verificar se já existe
        const existingMatch = await client.query(
          'SELECT fixture_id FROM football_matches_cache WHERE fixture_id = $1',
          [match.fixture.id]
        );

        if (existingMatch.rows.length === 0) {
          // Adicionar novo jogo
          await client.query(`
            INSERT INTO football_matches_cache 
            (fixture_id, home_team, away_team, match_date, status, home_score, away_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            match.fixture.id,
            match.teams.home.name,
            match.teams.away.name,
            match.fixture.date,
            match.fixture.status.short,
            match.score?.fulltime?.home || null,
            match.score?.fulltime?.away || null
          ]);

          // Buscar e cachear lineup se disponível
          if (await this.canMakeAPIRequest()) {
            await this.incrementAPIRequestCount();
            await this.cacheMatchLineup(match.fixture.id, client);
          }

          matchesAdded++;
        }
      }

      // Atualizar controle de sincronização
      await client.query(`
        UPDATE football_sync_control 
        SET last_full_sync = CURRENT_TIMESTAMP,
            total_matches_cached = (SELECT COUNT(*) FROM football_matches_cache)
      `);

      await client.query('COMMIT');
      
      console.log(`✅ Full sync completed: ${matchesAdded} new matches added`);
      return { success: true, message: `Full sync completed: ${matchesAdded} matches added`, matchesAdded };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error in full sync:', error);
      return { success: false, message: 'Error in full sync: ' + (error as any).message, matchesAdded: 0 };
    } finally {
      client.release();
    }
  }

  // Verificação rápida de novos jogos
  async quickSync(): Promise<{ success: boolean; message: string; newMatches: number }> {
    const client = await pool.connect();
    
    try {
      console.log('⚡ Starting quick sync for new matches...');
      
      if (!(await this.canMakeAPIRequest())) {
        return { success: false, message: 'Daily API request limit reached', newMatches: 0 };
      }

      // Buscar último jogo no cache
      const lastCachedResult = await client.query(`
        SELECT MAX(match_date) as last_match_date 
        FROM football_matches_cache
      `);

      const lastCachedDate = lastCachedResult.rows[0]?.last_match_date;
      
      await this.incrementAPIRequestCount();
      const recentMatches = await footballAPIService.getRecentMatches(5);
      
      let newMatches = 0;
      await client.query('BEGIN');

      for (const match of recentMatches) {
        const matchDate = new Date(match.fixture.date);
        
        // Verificar se é mais recente que o último cached
        if (!lastCachedDate || matchDate > new Date(lastCachedDate)) {
          // Verificar se já existe
          const existingMatch = await client.query(
            'SELECT fixture_id FROM football_matches_cache WHERE fixture_id = $1',
            [match.fixture.id]
          );

          if (existingMatch.rows.length === 0) {
            await client.query(`
              INSERT INTO football_matches_cache 
              (fixture_id, home_team, away_team, match_date, status, home_score, away_score)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              match.fixture.id,
              match.teams.home.name,
              match.teams.away.name,
              match.fixture.date,
              match.fixture.status.short,
              match.score?.fulltime?.home || null,
              match.score?.fulltime?.away || null
            ]);

            // Cachear lineup se disponível
            if (await this.canMakeAPIRequest()) {
              await this.incrementAPIRequestCount();
              await this.cacheMatchLineup(match.fixture.id, client);
            }

            newMatches++;
          }
        }
      }

      // Atualizar controle
      await client.query(`
        UPDATE football_sync_control 
        SET last_check_sync = CURRENT_TIMESTAMP,
            total_matches_cached = (SELECT COUNT(*) FROM football_matches_cache)
      `);

      await client.query('COMMIT');
      
      console.log(`⚡ Quick sync completed: ${newMatches} new matches found`);
      return { success: true, message: `Quick sync completed: ${newMatches} new matches`, newMatches };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error in quick sync:', error);
      return { success: false, message: 'Error in quick sync: ' + (error as any).message, newMatches: 0 };
    } finally {
      client.release();
    }
  }

  // Cachear lineup de um jogo específico
  private async cacheMatchLineup(fixtureId: number, client: any): Promise<void> {
    try {
      const lineups = await footballAPIService.getMatchLineup(fixtureId);
      
      for (const teamLineup of lineups) {
        // Titular
        for (const player of teamLineup.startXI) {
          await client.query(`
            INSERT INTO football_lineups_cache 
            (fixture_id, team_id, team_name, player_api_id, player_name, player_position, is_starter, shirt_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING
          `, [
            fixtureId,
            teamLineup.team.id,
            teamLineup.team.name,
            player.player.id,
            player.player.name,
            player.player.pos,
            true,
            player.player.number || null
          ]);
        }

        // Suplentes
        for (const player of teamLineup.substitutes) {
          await client.query(`
            INSERT INTO football_lineups_cache 
            (fixture_id, team_id, team_name, player_api_id, player_name, player_position, is_starter, shirt_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING
          `, [
            fixtureId,
            teamLineup.team.id,
            teamLineup.team.name,
            player.player.id,
            player.player.name,
            player.player.pos,
            false,
            player.player.number || null
          ]);
        }
      }
    } catch (error) {
      console.error('Error caching lineup for fixture', fixtureId, error);
    }
  }

  // Buscar último jogo não processado para criar votação
  async getLatestUnprocessedMatch(): Promise<CachedMatch | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT fixture_id, home_team, away_team, match_date, status, 
               home_score, away_score, processed
        FROM football_matches_cache 
        WHERE status = 'FT' AND processed = FALSE
        ORDER BY match_date DESC 
        LIMIT 1
      `);

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Marcar jogo como processado
  async markMatchAsProcessed(fixtureId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE football_matches_cache SET processed = TRUE WHERE fixture_id = $1',
        [fixtureId]
      );
    } finally {
      client.release();
    }
  }

  // Obter estatísticas do cache
  async getCacheStats(): Promise<{
    totalMatches: number;
    processedMatches: number;
    apiRequestsToday: number;
    lastSync: string | null;
  }> {
    const client = await pool.connect();
    try {
      const statsResult = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM football_matches_cache) as total_matches,
          (SELECT COUNT(*) FROM football_matches_cache WHERE processed = TRUE) as processed_matches
      `);

      const syncResult = await client.query(`
        SELECT api_requests_today, last_check_sync 
        FROM football_sync_control 
        ORDER BY id DESC LIMIT 1
      `);

      const stats = statsResult.rows[0];
      const sync = syncResult.rows[0];

      return {
        totalMatches: parseInt(stats.total_matches) || 0,
        processedMatches: parseInt(stats.processed_matches) || 0,
        apiRequestsToday: sync?.api_requests_today || 0,
        lastSync: sync?.last_check_sync || null
      };
    } finally {
      client.release();
    }
  }
}

export default new FootballCacheService(); 