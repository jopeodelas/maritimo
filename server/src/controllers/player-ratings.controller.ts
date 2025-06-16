import { Request, Response } from 'express';
import pool from '../config/db';
import footballAPIService from '../services/footballAPI.service';

// Get active voting session
export const getActiveVoting = async (req: Request, res: Response) => {
  try {
    const votingQuery = `
      SELECT mv.*, 
             COALESCE(
               json_agg(
                 CASE 
                   WHEN mvp.player_type = 'regular' THEN
                     json_build_object(
                       'id', p.id,
                       'name', p.name,
                       'position', p.position,
                       'image_url', p.image_url,
                       'player_type', 'regular'
                     )
                   WHEN mvp.player_type = 'match' THEN
                     json_build_object(
                       'id', mp.id,
                       'name', mp.name,
                       'position', mp.position,
                       'image_url', mp.image_url,
                       'player_type', 'match'
                     )
                 END
               ) FILTER (WHERE mvp.id IS NOT NULL), '[]'::json
             ) as players
      FROM match_voting mv
      LEFT JOIN match_voting_players mvp ON mv.id = mvp.match_voting_id
      LEFT JOIN players p ON mvp.player_id = p.id AND mvp.player_type = 'regular'
      LEFT JOIN match_players mp ON mvp.match_player_id = mp.id AND mvp.player_type = 'match'
      WHERE mv.is_active = true
      GROUP BY mv.id
      ORDER BY mv.created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(votingQuery);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const voting = result.rows[0];
    
    // Buscar informações detalhadas do jogo se temos match_id
    let matchDetails = null;
    if (voting.match_id) {
      try {
        const recentMatches = await footballAPIService.getRecentMatches(10);
        
        const matchInfo = recentMatches.find((match: any) => match.fixture.id === voting.match_id);
        
        if (matchInfo) {
          matchDetails = {
            homeTeam: matchInfo.teams.home.name,
            awayTeam: matchInfo.teams.away.name,
            homeScore: matchInfo.goals?.home || 0,
            awayScore: matchInfo.goals?.away || 0,
            homeLogo: matchInfo.teams.home.logo,
            awayLogo: matchInfo.teams.away.logo,
            matchDate: matchInfo.fixture.date,
            status: matchInfo.fixture.status.short
          };
          
          console.log(`📊 Match details found: ${matchDetails.homeTeam} ${matchDetails.homeScore}-${matchDetails.awayScore} ${matchDetails.awayTeam}`);
        }
      } catch (error) {
        console.log('⚠️  Could not fetch match details:', error);
      }
    }

    res.json({
      id: voting.id,
      match_id: voting.match_id,
      home_team: voting.home_team,
      away_team: voting.away_team,
      match_date: voting.match_date,
      is_active: voting.is_active,
      players: voting.players,
      created_at: voting.created_at,
      matchDetails
    });
  } catch (error) {
    console.error('Error fetching active voting:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Get player by ID
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerId);
    
    const result = await pool.query(
      'SELECT id, name, position FROM players WHERE id = $1',
      [playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching player by ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Submit player ratings and man of the match vote
export const submitPlayerRatings = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { match_id, ratings, man_of_match_player_id } = req.body;
    const userId = (req as any).user?.id;

    console.log(`🗳️  Submitting votes:`, {
      userId,
      match_id,
      man_of_match_player_id,
      ratingsCount: ratings.length
    });

    // DEBUG: Verificar que jogador corresponde ao ID enviado
    if (man_of_match_player_id) {
      const playerCheck = await client.query(
        'SELECT id, name FROM players WHERE id = $1',
        [man_of_match_player_id]
      );
      console.log(`🔍 CRITICAL: Frontend sent man_of_match_player_id ${man_of_match_player_id}, which corresponds to:`, playerCheck.rows[0]);
      
      // Verificar também todos os jogadores na votação atual
      const votingPlayers = await client.query(`
        SELECT p.id, p.name 
        FROM players p
        INNER JOIN match_voting_players mvp ON p.id = mvp.player_id
        WHERE mvp.match_voting_id = $1
        ORDER BY p.name
      `, [match_id]);
      console.log(`🔍 CRITICAL: All players in current voting:`, votingPlayers.rows);
    }

    if (!userId) {
      return res.status(401).json({ error: 'Utilizador não autenticado' });
    }

    console.log(`🔍 DETAILED user authentication info:`, {
      userId,
      userObject: (req as any).user,
      userIdFromReq: (req as any).userId,
      headers: req.headers,
      cookies: req.cookies,
      signedCookies: req.signedCookies
    });

    // Check if user has already voted for this match - more comprehensive check
    const existingPlayerRatings = await client.query(
      'SELECT id FROM player_ratings WHERE user_id = $1 AND match_id = $2',
      [userId, match_id]
    );

    const existingManOfMatchVotes = await client.query(
      'SELECT id FROM man_of_match_votes WHERE user_id = $1 AND match_id = $2',
      [userId, match_id]
    );

    // ALSO check for recent votes (last 24 hours) to prevent duplicate voting after server restarts
    const recentPlayerRatings = await client.query(`
      SELECT id FROM player_ratings 
      WHERE user_id = $1 
      AND created_at > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `, [userId]);

    const recentManOfMatchVotes = await client.query(`
      SELECT id FROM man_of_match_votes 
      WHERE user_id = $1 
      AND created_at > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `, [userId]);

    console.log(`🔍 EXISTING votes check:`, {
      userId,
      match_id,
      existingPlayerRatings: existingPlayerRatings.rows.length,
      existingManOfMatchVotes: existingManOfMatchVotes.rows.length,
      recentPlayerRatings: recentPlayerRatings.rows.length,
      recentManOfMatchVotes: recentManOfMatchVotes.rows.length
    });

    const hasAlreadyVoted = existingPlayerRatings.rows.length > 0 || 
                           existingManOfMatchVotes.rows.length > 0 ||
                           recentPlayerRatings.rows.length > 0 ||
                           recentManOfMatchVotes.rows.length > 0;

    if (hasAlreadyVoted) {
      await client.query('ROLLBACK');
      console.log(`❌ User ${userId} has already voted (direct or recent votes found)`);
      return res.status(400).json({ error: 'Já votou neste jogo' });
    }

    // Insert player ratings
    for (const rating of ratings) {
      const playerType = rating.player_type || 'regular';
      
      if (playerType === 'regular') {
        await client.query(
          'INSERT INTO player_ratings (player_id, user_id, match_id, rating, player_type) VALUES ($1, $2, $3, $4, $5)',
          [rating.player_id, userId, match_id, rating.rating, 'regular']
        );
      } else {
        await client.query(
          'INSERT INTO player_ratings (match_player_id, user_id, match_id, rating, player_type) VALUES ($1, $2, $3, $4, $5)',
          [rating.player_id, userId, match_id, rating.rating, 'match']
        );
      }
    }

    // Insert man of the match vote
    const manOfMatchPlayerType = req.body.man_of_match_player_type || 'regular';
    
    console.log(`🏆 Inserting man of the match vote:`, {
      man_of_match_player_id,
      manOfMatchPlayerType,
      userId,
      match_id
    });
    
    if (manOfMatchPlayerType === 'regular') {
      await client.query(
        'INSERT INTO man_of_match_votes (player_id, user_id, match_id, player_type) VALUES ($1, $2, $3, $4)',
        [man_of_match_player_id, userId, match_id, 'regular']
      );
    } else {
      // Para jogadores 'match', vamos tentar encontrar um jogador correspondente na tabela players
      // baseado no nome, ou criar uma entrada especial
      const matchPlayerResult = await client.query(
        'SELECT name FROM match_players WHERE id = $1',
        [man_of_match_player_id]
      );
      
      if (matchPlayerResult.rows.length === 0) {
        throw new Error(`Match player with ID ${man_of_match_player_id} not found`);
      }
      
      const matchPlayerName = matchPlayerResult.rows[0].name;
      console.log(`🔍 Looking for match player: ${matchPlayerName}`);
      
      // Tentar encontrar um jogador correspondente na tabela players
      const correspondingPlayerResult = await client.query(
        'SELECT id FROM players WHERE LOWER(name) = LOWER($1)',
        [matchPlayerName]
      );
      
      if (correspondingPlayerResult.rows.length > 0) {
        // Encontrou correspondência na tabela players
        const actualPlayerId = correspondingPlayerResult.rows[0].id;
        console.log(`✅ Found corresponding player ID ${actualPlayerId} for ${matchPlayerName}`);
        
        await client.query(
          'INSERT INTO man_of_match_votes (player_id, user_id, match_id, player_type) VALUES ($1, $2, $3, $4)',
          [actualPlayerId, userId, match_id, 'match']
        );
      } else {
        // Não encontrou correspondência - vamos usar um ID especial ou criar uma entrada
        console.log(`⚠️ No corresponding player found for ${matchPlayerName}, using match_player_id directly`);
        
        // Verificar se a tabela tem a coluna match_player_id
        try {
          await client.query(
            'INSERT INTO man_of_match_votes (match_player_id, user_id, match_id, player_type) VALUES ($1, $2, $3, $4)',
            [man_of_match_player_id, userId, match_id, 'match']
          );
        } catch (error: any) {
          if (error.code === '42703') { // Column does not exist
            console.log(`❌ Column match_player_id does not exist, skipping vote for ${matchPlayerName}`);
            throw new Error(`Cannot vote for match player ${matchPlayerName} - database schema not updated`);
          } else {
            throw error;
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Votes submitted successfully for user ${userId}`);
    res.json({ success: true, message: 'Avaliações submetidas com sucesso' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting player ratings:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Get player average rating
export const getPlayerAverageRating = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const playerType = req.query.player_type as string || 'regular';

    let result;
    
    if (playerType === 'regular') {
      result = await pool.query(`
        SELECT 
          p.id as player_id,
          p.name as player_name,
          COALESCE(ROUND(AVG(pr.rating::numeric), 2), 0)::float as average_rating,
          COUNT(pr.rating)::int as total_ratings
        FROM players p
        LEFT JOIN player_ratings pr ON p.id = pr.player_id
        WHERE p.id = $1
        GROUP BY p.id, p.name
      `, [playerId]);
    } else {
      // For match players, we don't have historical ratings yet
      result = await pool.query(`
        SELECT 
          mp.id as player_id,
          mp.name as player_name,
          0::float as average_rating,
          0::int as total_ratings
        FROM match_players mp
        WHERE mp.id = $1
      `, [playerId]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    console.log(`📊 Player ${playerId} average rating:`, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching player average rating:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Get man of the match results
export const getManOfTheMatchResults = async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.matchId);

    console.log(`🏆 Getting man of the match results for match ${matchId}`);

    // Debug: verificar todos os votos para este match com detalhes completos
    const debugVotes = await pool.query(`
      SELECT 
        mmv.id as vote_id,
        mmv.player_id,
        mmv.user_id,
        mmv.match_id,
        mmv.created_at,
        p.name as player_name,
        u.username as voter_username
      FROM man_of_match_votes mmv 
      LEFT JOIN players p ON mmv.player_id = p.id 
      LEFT JOIN users u ON mmv.user_id = u.id
      WHERE mmv.match_id = $1
      ORDER BY mmv.created_at DESC
    `, [matchId]);
    
    console.log(`🔍 DETAILED man of the match votes for match ${matchId}:`, debugVotes.rows);

    // Debug: verificar todos os jogadores disponíveis na votação
    const debugPlayers = await pool.query(`
      SELECT p.id, p.name 
      FROM players p
      INNER JOIN match_voting_players mvp ON p.id = mvp.player_id
      INNER JOIN match_voting mv ON mvp.match_voting_id = mv.id
      WHERE mv.id = $1
      ORDER BY p.name
    `, [matchId]);
    
    console.log(`🔍 ALL players available in voting ${matchId}:`, debugPlayers.rows);

    // Debug: verificar se há discrepância entre os IDs
    const allPlayers = await pool.query(`
      SELECT id, name FROM players ORDER BY name
    `);
    console.log(`🔍 ALL players in database:`, allPlayers.rows);

    // Query simplificada - buscar apenas votos que existem
    const result = await pool.query(`
      SELECT 
        p.id as player_id,
        p.name as player_name,
        COUNT(mmv.id) as vote_count,
        ROUND((COUNT(mmv.id) * 100.0 / (
          SELECT COUNT(*) 
          FROM man_of_match_votes 
          WHERE match_id = $1
        ))::numeric, 1)::float as percentage
      FROM man_of_match_votes mmv
      INNER JOIN players p ON mmv.player_id = p.id
      WHERE mmv.match_id = $1
      GROUP BY p.id, p.name
      ORDER BY vote_count DESC, p.name ASC
    `, [matchId]);

    console.log(`🏆 Man of the match results:`, result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching man of the match results:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Check if user has voted for this match
export const hasUserVoted = async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Utilizador não autenticado' });
    }

    // FIRST: Check direct votes for this match_id
    const directPlayerRatings = await pool.query(
      'SELECT id FROM player_ratings WHERE user_id = $1 AND match_id = $2 LIMIT 1',
      [userId, matchId]
    );

    const directManOfMatch = await pool.query(
      'SELECT id FROM man_of_match_votes WHERE user_id = $1 AND match_id = $2 LIMIT 1',
      [userId, matchId]
    );

    // If we find direct votes, user has voted for this specific match
    if (directPlayerRatings.rows.length > 0 || directManOfMatch.rows.length > 0) {
      return res.json({ hasVoted: true });
    }

    // SECOND: Check for recent votes (last 24 hours) - this handles server restarts
    const recentPlayerRatings = await pool.query(`
      SELECT pr.*, mv.home_team, mv.away_team, mv.match_date 
      FROM player_ratings pr 
      LEFT JOIN match_voting mv ON pr.match_id = mv.id
      WHERE pr.user_id = $1 
      AND pr.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY pr.created_at DESC 
      LIMIT 1
    `, [userId]);

    const recentManOfMatch = await pool.query(`
      SELECT mmv.*, mv.home_team, mv.away_team, mv.match_date
      FROM man_of_match_votes mmv 
      LEFT JOIN match_voting mv ON mmv.match_id = mv.id
      WHERE mmv.user_id = $1 
      AND mmv.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY mmv.created_at DESC 
      LIMIT 1
    `, [userId]);

    const hasRecentVotes = recentPlayerRatings.rows.length > 0 || recentManOfMatch.rows.length > 0;

    res.json({ hasVoted: hasRecentVotes });
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Get user's ratings for a match
export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Utilizador não autenticado' });
    }

    // FIRST: Try to get direct votes for this match
    let ratingsResult = await pool.query(
      'SELECT * FROM player_ratings WHERE user_id = $1 AND match_id = $2',
      [userId, matchId]
    );

    let manOfMatchResult = await pool.query(
      'SELECT * FROM man_of_match_votes WHERE user_id = $1 AND match_id = $2 LIMIT 1',
      [userId, matchId]
    );

    // If no direct votes, get the most recent votes (handles server restarts)
    if (ratingsResult.rows.length === 0 && manOfMatchResult.rows.length === 0) {
      // Get most recent player ratings (last 24 hours)
      const recentRatings = await pool.query(`
        SELECT pr.*, p.name as player_name, p.id as original_player_id
        FROM player_ratings pr
        LEFT JOIN players p ON pr.player_id = p.id
        WHERE pr.user_id = $1 
        AND pr.created_at > NOW() - INTERVAL '24 hours'
        ORDER BY pr.created_at DESC
      `, [userId]);

      // Get most recent man of match vote (last 24 hours)  
      const recentManOfMatch = await pool.query(`
        SELECT mmv.*, p.name as player_name, p.id as original_player_id
        FROM man_of_match_votes mmv
        LEFT JOIN players p ON mmv.player_id = p.id
        WHERE mmv.user_id = $1 
        AND mmv.created_at > NOW() - INTERVAL '24 hours'
        ORDER BY mmv.created_at DESC
        LIMIT 1
      `, [userId]);

      // Use recent votes if available
      if (recentRatings.rows.length > 0) {
        ratingsResult.rows = recentRatings.rows;
      }

      if (recentManOfMatch.rows.length > 0) {
        // Include the player name in the response for frontend mapping
        recentManOfMatch.rows[0].voted_player_name = recentManOfMatch.rows[0].player_name;
        manOfMatchResult.rows = recentManOfMatch.rows;
      }
    }

    res.json({
      ratings: ratingsResult.rows,
      manOfMatchVote: manOfMatchResult.rows.length > 0 ? manOfMatchResult.rows[0] : null
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Admin: Create new match voting session
export const createMatchVoting = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    if (!(req as any).user?.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await client.query('BEGIN');

    const { home_team, away_team, match_date, player_ids } = req.body;

    // Deactivate any existing active voting
    await client.query(
      'UPDATE match_voting SET is_active = false WHERE is_active = true'
    );

    // Create new match voting
    const result = await client.query(
      'INSERT INTO match_voting (home_team, away_team, match_date, is_active) VALUES ($1, $2, $3, true) RETURNING id',
      [home_team, away_team, match_date]
    );

    const matchVotingId = result.rows[0].id;

    // Add players to the voting
    for (const playerId of player_ids) {
      await client.query(
        'INSERT INTO match_voting_players (match_voting_id, player_id) VALUES ($1, $2)',
        [matchVotingId, playerId]
      );
    }

    await client.query('COMMIT');
    res.json({ 
      success: true, 
      message: 'Votação criada com sucesso',
      votingId: matchVotingId 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating match voting:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Admin: End current voting session
export const endMatchVoting = async (req: Request, res: Response) => {
  try {
    if (!(req as any).user?.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await pool.query(
      'UPDATE match_voting SET is_active = false WHERE is_active = true'
    );

    res.json({ success: true, message: 'Votação terminada com sucesso' });
  } catch (error) {
    console.error('Error ending match voting:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Auto-create voting from real match data
export const createAutoVotingFromRealMatch = async (req: Request, res: Response) => {
  try {
    console.log('🚀 Creating automatic voting from real match data...');
    
    const result = await footballAPIService.createAutoVotingFromRealMatch();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        matchInfo: result.matchInfo
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in auto voting creation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor: ' + (error as any).message 
    });
  }
};

// Get recent matches from API (test endpoint)
export const getRecentMatchesFromAPI = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Testing API connection for recent matches...');
    
    const recentMatches = await footballAPIService.getRecentMatches(1);
    
    if (recentMatches.length > 0) {
      const lastMatch = recentMatches[0];
      console.log(`📅 Last match found: ${lastMatch.teams.home.name} vs ${lastMatch.teams.away.name}`);
      
      // Buscar lineup do último jogo
      const lineups = await footballAPIService.getMatchLineup(lastMatch.fixture.id);
      console.log(`👥 Lineups found: ${lineups.length} team(s)`);
      
      // Log dos jogadores encontrados
      if (lineups.length > 0) {
        lineups.forEach((lineup: any) => {
          console.log(`📋 Team: ${lineup.team.name} (${lineup.startXI.length} starters + ${lineup.substitutes.length} subs)`);
          if (lineup.team.name.toLowerCase().includes('marítimo') || lineup.team.name.toLowerCase().includes('maritimo')) {
            console.log('🔥 CS Marítimo players found:');
            lineup.startXI.forEach((player: any, index: number) => {
              console.log(`   ${index + 1}. ${player.player.name} (${player.player.pos}) #${player.player.number}`);
            });
          }
        });
      }
      
      res.json({
        success: true,
        lastMatch: {
          homeTeam: lastMatch.teams.home.name,
          awayTeam: lastMatch.teams.away.name,
          date: lastMatch.fixture.date,
          fixtureId: lastMatch.fixture.id
        },
        lineups: lineups.map((lineup: any) => ({
          teamName: lineup.team.name,
          playersCount: lineup.startXI.length + lineup.substitutes.length,
          isMaritimo: lineup.team.name.toLowerCase().includes('marítimo') || lineup.team.name.toLowerCase().includes('maritimo'),
          players: lineup.startXI.concat(lineup.substitutes).map((p: any) => ({
            name: p.player.name,
            position: p.player.pos,
            number: p.player.number
          }))
        }))
      });
    } else {
      res.json({
        success: false,
        message: 'Nenhum jogo encontrado'
      });
    }
  } catch (error) {
    console.error('Error testing API:', error);
    res.status(500).json({ error: 'Erro ao testar API' });
  }
};

// Check for new matches and create votings automatically (background job)
export const checkAndCreateNewVotings = async (req: Request, res: Response) => {
  try {
    await footballAPIService.checkAndCreateNewVotings();
    res.json({ success: true, message: 'Verificação de novos jogos concluída' });
  } catch (error) {
    console.error('Error checking for new votings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro na verificação de novos jogos: ' + (error as any).message 
    });
  }
};

// Find correct CS Marítimo team ID (debug endpoint)
export const findMaritimoTeamId = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Debug: Finding CS Marítimo team ID...');
    const teamId = await footballAPIService.findMaritimoTeamId();
    
    if (teamId) {
      res.json({ 
        success: true, 
        teamId: teamId,
        message: `CS Marítimo found with ID: ${teamId}` 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'CS Marítimo team ID not found' 
      });
    }
  } catch (error) {
    console.error('Error finding CS Marítimo team ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao procurar ID do CS Marítimo: ' + (error as any).message 
    });
  }
};

// Temporary endpoint to run migration
export const runMigration = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Running migration...');
    
    // Execute migration SQL
    await pool.query(`
      -- Atualizar tabela player_ratings para suportar tanto jogadores regulares como jogadores temporários
      ALTER TABLE player_ratings 
      ADD COLUMN IF NOT EXISTS player_type VARCHAR(20) DEFAULT 'regular' CHECK (player_type IN ('regular', 'match'));

      ALTER TABLE player_ratings 
      ADD COLUMN IF NOT EXISTS match_player_id INTEGER REFERENCES match_players(id);

      -- Atualizar tabela man_of_match_votes para suportar tanto jogadores regulares como jogadores temporários
      ALTER TABLE man_of_match_votes 
      ADD COLUMN IF NOT EXISTS player_type VARCHAR(20) DEFAULT 'regular' CHECK (player_type IN ('regular', 'match'));

      ALTER TABLE man_of_match_votes 
      ADD COLUMN IF NOT EXISTS match_player_id INTEGER REFERENCES match_players(id);
    `);
    
    console.log('✅ Migration completed successfully!');
    
    // Verificar se as colunas foram adicionadas
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'man_of_match_votes' 
      AND column_name IN ('player_type', 'match_player_id')
    `);
    
    console.log('📋 Columns in man_of_match_votes:', result.rows);
    
    res.json({ 
      success: true, 
      message: 'Migration completed successfully',
      columns: result.rows
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Migration failed: ' + (error as any).message 
    });
  }
};

 