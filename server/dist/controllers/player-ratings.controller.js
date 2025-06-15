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
exports.findMaritimoTeamId = exports.checkAndCreateNewVotings = exports.getRecentMatchesFromAPI = exports.createAutoVotingFromRealMatch = exports.endMatchVoting = exports.createMatchVoting = exports.getUserRatings = exports.hasUserVoted = exports.getManOfTheMatchResults = exports.getPlayerAverageRating = exports.submitPlayerRatings = exports.getActiveVoting = void 0;
const db_1 = __importDefault(require("../config/db"));
const footballAPI_service_1 = __importDefault(require("../services/footballAPI.service"));
// Get active voting session
const getActiveVoting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const votingQuery = `
      SELECT mv.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'position', p.position,
                   'image_url', p.image_url
                 )
               ) FILTER (WHERE p.id IS NOT NULL), '[]'::json
             ) as players
      FROM match_voting mv
      LEFT JOIN match_voting_players mvp ON mv.id = mvp.match_voting_id
      LEFT JOIN players p ON mvp.player_id = p.id
      WHERE mv.is_active = true
      GROUP BY mv.id
      ORDER BY mv.created_at DESC
      LIMIT 1
    `;
        const result = yield db_1.default.query(votingQuery);
        if (result.rows.length === 0) {
            return res.json(null);
        }
        const voting = result.rows[0];
        res.json({
            id: voting.id,
            match_id: voting.match_id,
            home_team: voting.home_team,
            away_team: voting.away_team,
            match_date: voting.match_date,
            is_active: voting.is_active,
            players: voting.players,
            created_at: voting.created_at
        });
    }
    catch (error) {
        console.error('Error fetching active voting:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.getActiveVoting = getActiveVoting;
// Submit player ratings and man of the match vote
const submitPlayerRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const client = yield db_1.default.connect();
    try {
        yield client.query('BEGIN');
        const { match_id, ratings, man_of_match_player_id } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Utilizador não autenticado' });
        }
        // Check if user has already voted for this match
        const existingVotesResult = yield client.query('SELECT id FROM player_ratings WHERE user_id = $1 AND match_id = $2 LIMIT 1', [userId, match_id]);
        if (existingVotesResult.rows.length > 0) {
            yield client.query('ROLLBACK');
            return res.status(400).json({ error: 'Já votou neste jogo' });
        }
        // Insert player ratings
        for (const rating of ratings) {
            yield client.query('INSERT INTO player_ratings (player_id, user_id, match_id, rating) VALUES ($1, $2, $3, $4)', [rating.player_id, userId, match_id, rating.rating]);
        }
        // Insert man of the match vote
        yield client.query('INSERT INTO man_of_match_votes (player_id, user_id, match_id) VALUES ($1, $2, $3)', [man_of_match_player_id, userId, match_id]);
        yield client.query('COMMIT');
        res.json({ success: true, message: 'Avaliações submetidas com sucesso' });
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('Error submitting player ratings:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
    finally {
        client.release();
    }
});
exports.submitPlayerRatings = submitPlayerRatings;
// Get player average rating
const getPlayerAverageRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId);
        const result = yield db_1.default.query(`
      SELECT 
        p.id as player_id,
        p.name as player_name,
        ROUND(AVG(pr.rating::numeric), 2) as average_rating,
        COUNT(pr.rating) as total_ratings
      FROM players p
      LEFT JOIN player_ratings pr ON p.id = pr.player_id
      WHERE p.id = $1
      GROUP BY p.id, p.name
    `, [playerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching player average rating:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.getPlayerAverageRating = getPlayerAverageRating;
// Get man of the match results
const getManOfTheMatchResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matchId = parseInt(req.params.matchId);
        const result = yield db_1.default.query(`
      SELECT 
        p.id as player_id,
        p.name as player_name,
        COUNT(mmv.id) as vote_count,
        ROUND((COUNT(mmv.id) * 100.0 / (
          SELECT COUNT(*) 
          FROM man_of_match_votes 
          WHERE match_id = $1
        ))::numeric, 1) as percentage
      FROM players p
      JOIN man_of_match_votes mmv ON p.id = mmv.player_id
      WHERE mmv.match_id = $1
      GROUP BY p.id, p.name
      ORDER BY vote_count DESC, p.name ASC
    `, [matchId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching man of the match results:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.getManOfTheMatchResults = getManOfTheMatchResults;
// Check if user has voted for this match
const hasUserVoted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const matchId = parseInt(req.params.matchId);
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId) {
            return res.status(401).json({ error: 'Utilizador não autenticado' });
        }
        const result = yield db_1.default.query('SELECT id FROM player_ratings WHERE user_id = $1 AND match_id = $2 LIMIT 1', [userId, matchId]);
        res.json({ hasVoted: result.rows.length > 0 });
    }
    catch (error) {
        console.error('Error checking if user has voted:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.hasUserVoted = hasUserVoted;
// Get user's ratings for a match
const getUserRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const matchId = parseInt(req.params.matchId);
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        if (!userId) {
            return res.status(401).json({ error: 'Utilizador não autenticado' });
        }
        // Get user's player ratings
        const ratingsResult = yield db_1.default.query('SELECT * FROM player_ratings WHERE user_id = $1 AND match_id = $2', [userId, matchId]);
        // Get user's man of the match vote
        const manOfMatchResult = yield db_1.default.query('SELECT * FROM man_of_match_votes WHERE user_id = $1 AND match_id = $2 LIMIT 1', [userId, matchId]);
        res.json({
            ratings: ratingsResult.rows,
            manOfMatchVote: manOfMatchResult.rows.length > 0 ? manOfMatchResult.rows[0] : null
        });
    }
    catch (error) {
        console.error('Error fetching user ratings:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.getUserRatings = getUserRatings;
// Admin: Create new match voting session
const createMatchVoting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const client = yield db_1.default.connect();
    try {
        if (!((_d = req.user) === null || _d === void 0 ? void 0 : _d.is_admin)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        yield client.query('BEGIN');
        const { home_team, away_team, match_date, player_ids } = req.body;
        // Deactivate any existing active voting
        yield client.query('UPDATE match_voting SET is_active = false WHERE is_active = true');
        // Create new match voting
        const result = yield client.query('INSERT INTO match_voting (home_team, away_team, match_date, is_active) VALUES ($1, $2, $3, true) RETURNING id', [home_team, away_team, match_date]);
        const matchVotingId = result.rows[0].id;
        // Add players to the voting
        for (const playerId of player_ids) {
            yield client.query('INSERT INTO match_voting_players (match_voting_id, player_id) VALUES ($1, $2)', [matchVotingId, playerId]);
        }
        yield client.query('COMMIT');
        res.json({
            success: true,
            message: 'Votação criada com sucesso',
            votingId: matchVotingId
        });
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('Error creating match voting:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
    finally {
        client.release();
    }
});
exports.createMatchVoting = createMatchVoting;
// Admin: End current voting session
const endMatchVoting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        if (!((_e = req.user) === null || _e === void 0 ? void 0 : _e.is_admin)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        yield db_1.default.query('UPDATE match_voting SET is_active = false WHERE is_active = true');
        res.json({ success: true, message: 'Votação terminada com sucesso' });
    }
    catch (error) {
        console.error('Error ending match voting:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.endMatchVoting = endMatchVoting;
// Auto-create voting from real match data
const createAutoVotingFromRealMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🚀 Creating automatic voting from real match data...');
        const result = yield footballAPI_service_1.default.createAutoVotingFromRealMatch();
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                matchInfo: result.matchInfo
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    }
    catch (error) {
        console.error('Error in auto voting creation:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
});
exports.createAutoVotingFromRealMatch = createAutoVotingFromRealMatch;
// Get recent matches from API (test endpoint)
const getRecentMatchesFromAPI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔍 Testing API connection for recent matches...');
        const recentMatches = yield footballAPI_service_1.default.getRecentMatches(1);
        if (recentMatches.length > 0) {
            const lastMatch = recentMatches[0];
            console.log(`📅 Last match found: ${lastMatch.teams.home.name} vs ${lastMatch.teams.away.name}`);
            // Buscar lineup do último jogo
            const lineups = yield footballAPI_service_1.default.getMatchLineup(lastMatch.fixture.id);
            console.log(`👥 Lineups found: ${lineups.length} team(s)`);
            // Log dos jogadores encontrados
            if (lineups.length > 0) {
                lineups.forEach((lineup) => {
                    console.log(`📋 Team: ${lineup.team.name} (${lineup.startXI.length} starters + ${lineup.substitutes.length} subs)`);
                    if (lineup.team.name.toLowerCase().includes('marítimo') || lineup.team.name.toLowerCase().includes('maritimo')) {
                        console.log('🔥 CS Marítimo players found:');
                        lineup.startXI.forEach((player, index) => {
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
                lineups: lineups.map((lineup) => ({
                    teamName: lineup.team.name,
                    playersCount: lineup.startXI.length + lineup.substitutes.length,
                    isMaritimo: lineup.team.name.toLowerCase().includes('marítimo') || lineup.team.name.toLowerCase().includes('maritimo'),
                    players: lineup.startXI.concat(lineup.substitutes).map((p) => ({
                        name: p.player.name,
                        position: p.player.pos,
                        number: p.player.number
                    }))
                }))
            });
        }
        else {
            res.json({
                success: false,
                message: 'Nenhum jogo encontrado'
            });
        }
    }
    catch (error) {
        console.error('Error testing API:', error);
        res.status(500).json({ error: 'Erro ao testar API' });
    }
});
exports.getRecentMatchesFromAPI = getRecentMatchesFromAPI;
// Check for new matches and create votings automatically (background job)
const checkAndCreateNewVotings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield footballAPI_service_1.default.checkAndCreateNewVotings();
        res.json({ success: true, message: 'Verificação de novos jogos concluída' });
    }
    catch (error) {
        console.error('Error checking for new votings:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na verificação de novos jogos: ' + error.message
        });
    }
});
exports.checkAndCreateNewVotings = checkAndCreateNewVotings;
// Find correct CS Marítimo team ID (debug endpoint)
const findMaritimoTeamId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔍 Debug: Finding CS Marítimo team ID...');
        const teamId = yield footballAPI_service_1.default.findMaritimoTeamId();
        if (teamId) {
            res.json({
                success: true,
                teamId: teamId,
                message: `CS Marítimo found with ID: ${teamId}`
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'CS Marítimo team ID not found'
            });
        }
    }
    catch (error) {
        console.error('Error finding CS Marítimo team ID:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao procurar ID do CS Marítimo: ' + error.message
        });
    }
});
exports.findMaritimoTeamId = findMaritimoTeamId;
