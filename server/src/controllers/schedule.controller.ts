import { Request, Response } from 'express';
import pool from '../config/db';
import footballCacheService from '../services/footballCache.service';

const LEAGUE_ID = 92; // Liga Portugal 2

export const getSeasonSchedule = async (req: Request, res: Response) => {
  const season = parseInt(req.params.season, 10);
  if (isNaN(season)) {
    return res.status(400).json({ error: 'Parâmetro season inválido' });
  }

  try {
    // Buscar jogos do cache
    const client = await pool.connect();
    let { rows: matches } = await client.query(
      `SELECT fixture_id, home_team, away_team, match_date, status, home_score, away_score 
       FROM football_matches_cache 
       WHERE season = $1
       ORDER BY match_date ASC`,
      [season]
    );
    client.release();

    // Se não houver dados, sincronizar e buscar de novo
    if (matches.length === 0) {
      await footballCacheService.syncSeasonFixtures(season, LEAGUE_ID);
      const client2 = await pool.connect();
      ({ rows: matches } = await client2.query(
        `SELECT fixture_id, home_team, away_team, match_date, status, home_score, away_score 
         FROM football_matches_cache 
         WHERE season = $1
         ORDER BY match_date ASC`,
        [season]
      ));
      client2.release();
    }

    return res.json({ matches });
  } catch (error) {
    console.error('Error fetching season schedule:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 