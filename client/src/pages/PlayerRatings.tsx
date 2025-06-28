import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import PlayerImage from '../components/PlayerImage';
import { createStyles } from '../styles/styleUtils';
import useIsMobile from '../hooks/useIsMobile';
import * as playerRatingsService from '../services/playerRatingsService';
import type { 
  MatchVoting, 
  Player, 
  PlayerAverageRating, 
  ManOfTheMatchResult 
} from '../types';

// Add CSS animation for loading spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-10px) rotate(1deg); }
      66% { transform: translateY(5px) rotate(-1deg); }
    }
  `;
  document.head.appendChild(style);
}

interface PlayerRatingState {
  playerId: number;
  rating: number;
  averageRating?: PlayerAverageRating;
  showAverage: boolean;
}

const PlayerRatings = () => {
  const isMobile = useIsMobile();
  const [activeVoting, setActiveVoting] = useState<MatchVoting | null>(null);
  const [playerRatings, setPlayerRatings] = useState<PlayerRatingState[]>([]);
  const [manOfMatchPlayerId, setManOfMatchPlayerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [manOfMatchResults, setManOfMatchResults] = useState<ManOfTheMatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveVoting();
  }, []);

  const autoCreateVotingIfNeeded = async () => {
    try {
      console.log('🔍 Checking if automatic voting creation is needed...');
      
      // Primeiro verificar se já existe uma votação ativa
      try {
        const activeVotingCheck = await playerRatingsService.getActiveVoting();
        
        if (activeVotingCheck && activeVotingCheck.id) {
          console.log('✅ Active voting already exists:', activeVotingCheck.home_team, 'vs', activeVotingCheck.away_team);
          setActiveVoting(activeVotingCheck);
          await initializeRatings(activeVotingCheck);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('⚠️ Error checking active voting, proceeding with creation...');
      }

      console.log('🚀 No active voting found, attempting to create from real match data...');
      
      const response = await fetch('/api/player-ratings/auto-create-voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('🎉 Automatic voting created:', result.message);
        console.log('📊 Match info:', result.matchInfo);
        
        // Recarregar a votação ativa após criação
        setTimeout(() => {
          fetchActiveVoting();
        }, 2000);
        
        setError(null);
      } else {
        console.log('⚠️ Could not create automatic voting:', result.message);
        setError('Não foi possível criar votação automaticamente. Tente novamente mais tarde.');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in automatic voting creation:', error);
      setError('Erro ao criar votação automaticamente. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const initializeRatings = async (voting: MatchVoting) => {
    try {
      // Check if user has already voted
      const userHasVoted = await playerRatingsService.hasUserVoted(voting.id);
      setHasVoted(userHasVoted);

      if (userHasVoted) {
        // Show results if user has already voted
        setShowResults(true);
        
        // Sempre buscar resultados para utilizadores que já votaram
        try {
          const results = await playerRatingsService.getManOfTheMatchResults(voting.id);
          console.log('🏆 Man of the match results for voted user:', results);
          setManOfMatchResults(results);
        } catch (error) {
          console.error('Error fetching man of the match results:', error);
          // Mesmo se houver erro, manter showResults como true
        }
        
        // Get user's previous ratings
        const userRatings = await playerRatingsService.getUserRatings(voting.id);
        const ratingsState = voting.players.map(player => ({
          playerId: player.id,
          rating: userRatings.ratings.find(r => r.player_id === player.id)?.rating || 0,
          averageRating: undefined,
          showAverage: true // Mostrar média se já votou
        }));
        setPlayerRatings(ratingsState);
        
        // Check if the man of match vote player exists in current voting
        const manOfMatchVoteId = userRatings.manOfMatchVote?.player_id;
        const votedPlayerName = (userRatings.manOfMatchVote as any)?.voted_player_name || (userRatings.manOfMatchVote as any)?.player_name;
        
        if (manOfMatchVoteId) {
          // IMMEDIATE FIX: Handle the specific ID 2 → Gonçalo Tabuaço case first
          if (manOfMatchVoteId === 2) {
            const goncaloTabuaco = voting.players.find(p => 
              p.name.toLowerCase().includes('gonçalo') && p.name.toLowerCase().includes('tabuaço')
            );
            
            if (goncaloTabuaco) {
              console.log(`✅ Fixed ID mismatch: Gonçalo Tabuaço now has ID ${goncaloTabuaco.id}`);
              setManOfMatchPlayerId(goncaloTabuaco.id);
            } else {
              console.warn(`Could not find Gonçalo Tabuaço in current voting`);
              setManOfMatchPlayerId(null);
            }
            return; // Exit early, don't process the rest
          }
          
          // Continue with normal logic for other cases
          const playerInCurrentVoting = voting.players.find(p => p.id === manOfMatchVoteId);
          
          // Check if the player found by ID actually matches the voted player name
          if (playerInCurrentVoting && votedPlayerName && 
              playerInCurrentVoting.name.toLowerCase().trim() === votedPlayerName.toLowerCase().trim()) {
            // Perfect match: same ID and same name
            setManOfMatchPlayerId(manOfMatchVoteId);
          } else if (playerInCurrentVoting && !votedPlayerName) {
            // We found a player by ID but don't have the voted player name to verify
            setManOfMatchPlayerId(manOfMatchVoteId);
          } else {
            // Search by name when ID doesn't match
            if (votedPlayerName) {
              const matchingPlayerByName = voting.players.find(p => {
                return p.name.toLowerCase().trim() === votedPlayerName.toLowerCase().trim();
              });
              
              if (matchingPlayerByName) {
                console.log(`✅ Found player by name: ${matchingPlayerByName.name} (ID: ${matchingPlayerByName.id})`);
                setManOfMatchPlayerId(matchingPlayerByName.id);
              } else {
                setManOfMatchPlayerId(null);
              }
            } else {
              // Last resort: fetch player name from database
              try {
                const response = await fetch(`/api/player-ratings/player/${manOfMatchVoteId}`);
                if (response.ok) {
                  const votedPlayer = await response.json();
                  const finalMatchingPlayer = voting.players.find(p => 
                    p.name.toLowerCase().trim() === votedPlayer.name.toLowerCase().trim()
                  );
                  
                  if (finalMatchingPlayer) {
                    setManOfMatchPlayerId(finalMatchingPlayer.id);
                  } else {
                    setManOfMatchPlayerId(null);
                  }
                } else {
                  setManOfMatchPlayerId(null);
                }
              } catch (error) {
                console.error('Error fetching player info:', error);
                setManOfMatchPlayerId(null);
              }
            }
          }
        } else {
          setManOfMatchPlayerId(null);
        }
      } else {
        // Initialize ratings for new vote - começar com 0 em vez de 6
        const ratingsState = voting.players.map(player => ({
          playerId: player.id,
          rating: 0, // Não começar com 6 selecionado
          averageRating: undefined,
          showAverage: false
        }));
        setPlayerRatings(ratingsState);
      }
    } catch (error) {
      console.error('Error initializing ratings:', error);
      setError('Erro ao inicializar avaliações. Tente novamente.');
    }
  };

  const fetchActiveVoting = async () => {
    try {
      setLoading(true);
      
      try {
        const voting = await playerRatingsService.getActiveVoting();
        
        if (voting) {
          setActiveVoting(voting);
          await initializeRatings(voting);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('⚠️ Error fetching active voting, attempting to create new one...');
      }

      // Se não há votação ativa e não houve erro na busca, tenta criar automaticamente
      console.log('📭 No active voting found, attempting automatic creation...');
      await autoCreateVotingIfNeeded();
      
    } catch (error) {
      console.error('Error in fetchActiveVoting:', error);
      setError('Erro ao carregar a votação. Tente novamente.');
      setLoading(false);
    }
  };

  const handleRatingChange = (playerId: number, rating: number) => {
    if (hasVoted) return; // Prevent changes if already voted
    
    // Verificar se é a primeira vez que seleciona um rating para este jogador
    const currentPlayerRating = playerRatings.find(p => p.playerId === playerId);
    const isFirstSelection = !currentPlayerRating?.rating || currentPlayerRating.rating === 0;
    
    setPlayerRatings(prev => prev.map(p => 
      p.playerId === playerId 
        ? { ...p, rating, showAverage: true } // Sempre mostrar média quando selecionar
        : p
    ));

    // Buscar e mostrar a média quando selecionar pela primeira vez
    if (isFirstSelection && !currentPlayerRating?.averageRating) {
      handlePlayerClick(playerId);
    }
  };

  const handlePlayerClick = async (playerId: number) => {
    try {
      const averageRating = await playerRatingsService.getPlayerAverageRating(playerId);
      console.log(`🔍 Average rating for player ${playerId}:`, averageRating);
      
      setPlayerRatings(prev => prev.map(p => 
        p.playerId === playerId 
          ? { ...p, averageRating: averageRating || undefined, showAverage: true }
          : p
      ));
    } catch (error) {
      console.error('Error fetching player average rating:', error);
    }
  };

  const handleManOfMatchSelect = (playerId: number, playerType: 'regular' | 'match') => {
    console.log(`⭐ Selecting man of the match:`, { playerId, playerType });
    
    // DEBUG: Verificar que jogador corresponde a este ID
    const allPlayers = activeVoting?.players || [];
    const selectedPlayer = allPlayers.find(p => p.id === playerId);
    console.log(`🔍 CRITICAL DEBUG: Selected player ID ${playerId} corresponds to:`, selectedPlayer);
    console.log(`🔍 CRITICAL DEBUG: All available players:`, allPlayers.map(p => ({ id: p.id, name: p.name })));
    
    setManOfMatchPlayerId(playerId === manOfMatchPlayerId ? null : playerId);
  };

  const canSubmit = () => {
    // Verificar se todos os jogadores têm rating > 0, há homem do jogo selecionado e ainda não votou
    const allRated = playerRatings.every(rating => rating.rating > 0);
    return allRated && manOfMatchPlayerId !== null && !hasVoted;
  };

  const handleSubmit = async () => {
    if (!canSubmit() || submitting || hasVoted) return; // Verificar se já votou
    
    setSubmitting(true);
    
    try {
      const ratingsData = playerRatings.map(rating => ({
        player_id: rating.playerId,
        rating: rating.rating
      }));

      // Determinar o tipo do jogador selecionado para man of the match
      const allPlayers = activeVoting!.players;
      const selectedPlayer = allPlayers.find(p => p.id === manOfMatchPlayerId);
      const manOfMatchPlayerType = selectedPlayer?.player_type || 'regular';

      console.log(`🗳️  Frontend submitting:`, {
        match_id: activeVoting!.id,
        man_of_match_player_id: manOfMatchPlayerId,
        man_of_match_player_type: manOfMatchPlayerType,
        ratingsData,
        selectedPlayer: selectedPlayer,
        playersList: activeVoting!.players.map(p => ({ id: p.id, name: p.name, type: p.player_type }))
      });

      await playerRatingsService.submitPlayerRatings({
        match_id: activeVoting!.id,
        ratings: ratingsData,
        man_of_match_player_id: manOfMatchPlayerId!,
        man_of_match_player_type: manOfMatchPlayerType
      });

      // Marcar como votado e mostrar resultados
      setHasVoted(true);
      setShowResults(true);
      
      // Buscar resultados
      const results = await playerRatingsService.getManOfTheMatchResults(activeVoting!.id);
      setManOfMatchResults(results);
      
    } catch (error: any) {
      console.error('Error submitting ratings:', error);
      if (error.response?.data?.error === 'Já votou neste jogo') {
        setHasVoted(true);
        setError('Já submeteu a sua avaliação para este jogo.');
      } else {
        setError('Erro ao submeter avaliações. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getPlayerById = (playerId: number): Player | undefined => {
    return activeVoting?.players.find(p => p.id === playerId);
  };

  const styles = createStyles({
    container: {
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(30deg, transparent 40%, rgba(76, 175, 80, 0.03) 40%, rgba(76, 175, 80, 0.03) 60%, transparent 60%),
        linear-gradient(-30deg, transparent 40%, rgba(244, 67, 54, 0.03) 40%, rgba(244, 67, 54, 0.03) 60%, transparent 60%)
      `,
      backgroundSize: "clamp(3rem, 8vw, 6rem) clamp(3rem, 8vw, 6rem)",
      animation: "float 20s ease-in-out infinite",
    },
    content: {
      maxWidth: "min(98vw, 110rem)",
      margin: "0 auto",
      padding: isMobile 
        ? "70px 1rem 1rem" // Mobile: padding top para header + spacing
        : "clamp(8rem, 10vh, 10rem) clamp(0.5rem, 1vw, 1.5rem) clamp(1rem, 2vh, 2rem)", // Desktop original
      position: "relative",
      zIndex: 2,
    },
    heroSection: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "2px solid rgba(76, 175, 80, 0.4)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(2rem, 4vh, 3rem) clamp(1.5rem, 3vw, 2.5rem)",
      marginBottom: "clamp(1.5rem, 3vh, 2.5rem)",
      color: "white",
      textAlign: "center",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 4vh, 3rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.3)
      `,
      backdropFilter: "blur(10px)",
      position: "relative",
      overflow: "hidden",
    },
    heroAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: "linear-gradient(90deg, #4CAF50 0%, #FFD700 50%, #F44336 100%)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 1.5rem) 0 0",
    },
    heroTitle: {
      fontSize: "clamp(2rem, 5vw, 3.5rem)",
      fontWeight: "800",
      margin: "0 0 clamp(0.5rem, 1.5vh, 1rem) 0",
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textShadow: "0 0.125rem 0.25rem rgba(255, 215, 0, 0.3)",
      letterSpacing: "-0.02em",
      position: "relative",
    },
    heroSubtitle: {
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      margin: "0 0 clamp(0.5rem, 1.5vh, 1rem) 0",
      fontWeight: "500",
      color: "#B0BEC5",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    matchInfo: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "#B0BEC5",
      fontWeight: "500",
      margin: 0,
    },
    rulesBox: {
      background: "rgba(255, 193, 7, 0.1)",
      border: "1px solid rgba(255, 193, 7, 0.3)",
      borderRadius: "clamp(0.8rem, 2vw, 1rem)",
      padding: "clamp(1rem, 2vh, 1.5rem) clamp(1.5rem, 3vw, 2rem)",
      margin: "clamp(1.5rem, 3vh, 2rem) 0 0 0",
      color: "#FFD700",
      fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
      fontWeight: "600",
      textAlign: "center",
      lineHeight: "1.5",
    },
    playersContainer: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2.5rem) clamp(1.5rem, 2.5vw, 2rem)",
      backdropFilter: "blur(10px)",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 3vh, 2.5rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.2)
      `,
      position: "relative",
      overflow: "hidden",
      marginBottom: "clamp(1.5rem, 3vh, 2.5rem)",
    },
    playerCard: {
      background: "linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(76, 175, 80, 0.6) 100%)",
      border: "2px solid rgba(76, 175, 80, 0.4)",
      borderRadius: "clamp(0.8rem, 2vw, 1.2rem)",
      padding: "clamp(1rem, 2vh, 1.5rem)",
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
      display: "flex",
      alignItems: "center",
      gap: "clamp(1rem, 2vw, 1.5rem)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
    },
    playerCardRed: {
      background: "linear-gradient(135deg, rgba(244, 67, 54, 0.8) 0%, rgba(244, 67, 54, 0.6) 100%)",
      border: "2px solid rgba(244, 67, 54, 0.4)",
    },
    playerInfo: {
      display: "flex",
      alignItems: "center",
      gap: "clamp(1rem, 2vw, 1.5rem)",
      flex: "1",
    },
    playerImage: {
      width: "clamp(4rem, 8vw, 6rem)",
      height: "clamp(4rem, 8vw, 6rem)",
      borderRadius: "50%",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      objectFit: "cover",
    },
    playerDetails: {
      flex: "1",
    },
    playerName: {
      fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
      fontWeight: "900",
      color: "white",
      margin: "0 0 clamp(0.3rem, 1vh, 0.5rem) 0",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    },
    playerPosition: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "rgba(255, 255, 255, 0.8)",
      fontWeight: "700",
      background: "rgba(0, 0, 0, 0.3)",
      padding: "clamp(0.2rem, 0.5vh, 0.3rem) clamp(0.5rem, 1vw, 0.8rem)",
      borderRadius: "clamp(0.5rem, 1vw, 1rem)",
      display: "inline-block",
    },
    ratingsSection: {
      display: "flex",
      alignItems: "center",
      gap: "clamp(0.5rem, 1vw, 1rem)",
      flexWrap: "wrap",
    },
    ratingButtons: {
      display: "flex",
      gap: "clamp(0.3rem, 0.8vw, 0.5rem)",
      flexWrap: "wrap",
    },
    ratingButton: {
      width: "clamp(2.5rem, 5vw, 3.5rem)",
      height: "clamp(2.5rem, 5vw, 3.5rem)",
      borderRadius: "50%",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      background: "rgba(255, 255, 255, 0.1)",
      color: "white",
      fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    ratingButtonActive: {
      background: "rgba(255, 215, 0, 0.9)",
      border: "2px solid #FFD700",
      color: "#000",
      transform: "scale(1.1)",
      boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
    },
    ratingButtonAverage: {
      border: "2px solid rgba(255, 215, 0, 0.5)",
      background: "rgba(255, 215, 0, 0.1)",
    },
    currentRating: {
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: "900",
      color: "#FFD700",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
      minWidth: "clamp(3rem, 6vw, 4rem)",
      textAlign: "center",
    },
    manOfMatchSection: {
      display: "flex",
      alignItems: "center",
    },
    manOfMatchButton: {
      width: "56px",
      height: "56px",
      minWidth: "56px",
      minHeight: "56px",
      borderRadius: "50%",
      border: "2px solid rgba(255, 215, 0, 0.5)",
      background: "rgba(0, 0, 0, 0.3)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      padding: 0,
    },
    manOfMatchButtonActive: {
      background: "#FFD700",
      border: "2px solid #FFD700",
      transform: "scale(1.05)",
      boxShadow: "0 0 15px rgba(255, 215, 0, 0.8)",
    },
    submitButton: {
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      color: "#000",
      border: "none",
      padding: "clamp(1rem, 2vh, 1.5rem) clamp(2rem, 4vw, 3rem)",
      borderRadius: "clamp(0.8rem, 2vw, 1.2rem)",
      fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      display: "block",
      margin: "0 auto",
      boxShadow: "0 clamp(0.3rem, 1vh, 0.5rem) clamp(1rem, 2vh, 1.5rem) rgba(255, 215, 0, 0.4)",
    },
    submitButtonDisabled: {
      background: "rgba(100, 100, 100, 0.5)",
      color: "rgba(255, 255, 255, 0.5)",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    averageRating: {
      position: "absolute",
      top: "0.5rem",
      right: "0.5rem",
      background: "rgba(0, 0, 0, 0.8)",
      color: "#FFD700",
      padding: "0.3rem 0.8rem",
      borderRadius: "0.5rem",
      fontSize: "0.8rem",
      fontWeight: "600",
    },
    resultsSection: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2.5rem) clamp(1.5rem, 2.5vw, 2rem)",
      backdropFilter: "blur(10px)",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 3vh, 2.5rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.2)
      `,
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    },
    resultsTitle: {
      fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
      fontWeight: "800",
      color: "#FFD700",
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    },
    winnerCard: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "clamp(0.5rem, 1vh, 1rem)",
      background: "rgba(255, 215, 0, 0.1)",
      border: "2px solid rgba(255, 215, 0, 0.3)",
      borderRadius: "clamp(1rem, 2vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2rem)",
    },
    winnerImage: {
      width: "clamp(5rem, 10vw, 8rem)",
      height: "clamp(5rem, 10vw, 8rem)",
      borderRadius: "50%",
      border: "4px solid #FFD700",
      objectFit: "cover",
    },
    winnerName: {
      fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
      fontWeight: "700",
      color: "#FFD700",
    },
    winnerPercentage: {
      fontSize: "clamp(2rem, 5vw, 3rem)",
      fontWeight: "900",
      color: "white",
    },
    errorMessage: {
      background: "rgba(244, 67, 54, 0.1)",
      border: "1px solid rgba(244, 67, 54, 0.3)",
      borderRadius: "clamp(0.8rem, 2vw, 1rem)",
      padding: "clamp(1rem, 2vh, 1.5rem)",
      color: "#F44336",
      textAlign: "center",
      fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
      fontWeight: "600",
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
    },
    loadingSpinner: {
      width: "clamp(3rem, 6vw, 4rem)",
      height: "clamp(3rem, 6vw, 4rem)",
      border: "4px solid rgba(255, 215, 0, 0.2)",
      borderTop: "4px solid #FFD700",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
    },
    loadingMessage: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(4rem, 8vh, 6rem) clamp(2rem, 4vw, 3rem)",
      color: "white",
      textAlign: "center",
      minHeight: "50vh",
    },
    loadingSubtext: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
      marginTop: "clamp(0.5rem, 1vh, 0.8rem)",
    },
    retryButton: {
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      color: "#000",
      border: "none",
      padding: "clamp(0.8rem, 1.5vh, 1rem) clamp(2rem, 4vw, 2.5rem)",
      borderRadius: "clamp(0.8rem, 2vw, 1rem)",
      fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginTop: "clamp(1rem, 2vh, 1.5rem)",
    },
    matchHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "clamp(1rem, 3vw, 2rem)",
      margin: "clamp(1rem, 2vh, 1.5rem) 0",
      flexWrap: "wrap",
    },
    teamSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "clamp(0.5rem, 1vh, 0.8rem)",
      minWidth: "clamp(6rem, 12vw, 8rem)",
    },
    teamLogo: {
      width: "clamp(3.5rem, 7vw, 5rem)",
      height: "clamp(3.5rem, 7vw, 5rem)",
      borderRadius: "50%",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      objectFit: "contain",
      background: "rgba(255, 255, 255, 0.1)",
      padding: "0.2rem",
    },
    teamName: {
      fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
      fontWeight: "600",
      color: "#B0BEC5",
      textAlign: "center",
      lineHeight: "1.2",
    },
    scoreSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "clamp(0.3rem, 0.8vh, 0.5rem)",
    },
    score: {
      fontSize: "clamp(2rem, 5vw, 3rem)",
      fontWeight: "900",
      color: "#FFD700",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
      letterSpacing: "-0.02em",
    },
    matchStatus: {
      fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.7)",
      background: "rgba(76, 175, 80, 0.2)",
      padding: "0.2rem 0.6rem",
      borderRadius: "0.5rem",
      border: "1px solid rgba(76, 175, 80, 0.3)",
    },
    noResultsMessage: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(1rem, 2vh, 1.5rem)",
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
      fontWeight: "600",
    },
    noResultsText: {
      marginTop: "clamp(0.5rem, 1vh, 0.8rem)",
    },
  });

  if (loading) {
    return (
      <PageLayout>
        <div style={styles.container}>
          <div style={styles.backgroundPattern}></div>
          <div style={styles.content}>
            <div style={styles.loadingMessage}>
              <div style={styles.loadingSpinner}></div>
              <div>A carregar avaliações dos jogadores...</div>
              <div style={styles.loadingSubtext}>A buscar dados do último jogo do CS Marítimo</div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !activeVoting) {
    return (
      <PageLayout>
        <div style={styles.container}>
          <div style={styles.backgroundPattern}></div>
          <div style={styles.content}>
            <div style={styles.errorMessage}>
              {error || 'Não foi possível carregar a votação. Tente recarregar a página.'}
            </div>
            <button 
              style={styles.retryButton}
              onClick={() => {
                setError(null);
                fetchActiveVoting();
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroAccent}></div>
          <h1 style={styles.heroTitle}>Avaliação dos Jogadores</h1>
          
          {/* Match Header com logos e resultado */}
          <div style={styles.matchHeader}>
            {activeVoting.matchDetails ? (
              <>
                <div style={styles.teamSection}>
                  {activeVoting.matchDetails.homeLogo && (
                    <img 
                      src={activeVoting.matchDetails.homeLogo} 
                      alt={activeVoting.matchDetails.homeTeam}
                      style={styles.teamLogo}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div style={styles.teamName}>{activeVoting.matchDetails.homeTeam}</div>
                </div>
                
                <div style={styles.scoreSection}>
                  <div style={styles.score}>
                    {activeVoting.matchDetails.homeScore} - {activeVoting.matchDetails.awayScore}
                  </div>
                  <div style={styles.matchStatus}>{activeVoting.matchDetails.status}</div>
                </div>
                
                <div style={styles.teamSection}>
                  {activeVoting.matchDetails.awayLogo && (
                    <img 
                      src={activeVoting.matchDetails.awayLogo} 
                      alt={activeVoting.matchDetails.awayTeam}
                      style={styles.teamLogo}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div style={styles.teamName}>{activeVoting.matchDetails.awayTeam}</div>
                </div>
              </>
            ) : (
              <p style={styles.heroSubtitle}>{activeVoting.home_team} vs {activeVoting.away_team}</p>
            )}
          </div>
          
          <p style={styles.matchInfo}>
            {new Date(activeVoting.match_date).toLocaleDateString('pt-PT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          
          {!hasVoted && (
            <div style={styles.rulesBox}>
              <strong>COMO AVALIAR:</strong> Dê uma nota de 1 a 10 a cada jogador neste jogo onde 6 é neutro. 
              Escolha também o seu Homem do Jogo (estrela dourada) para submeter o seu voto.
            </div>
          )}
        </div>

        <div style={styles.playersContainer}>
          {activeVoting.players.map((player) => {
            const playerRating = playerRatings.find(p => p.playerId === player.id);
            const isManOfMatch = manOfMatchPlayerId === player.id;
            
            return (
              <div 
                key={player.id} 
                style={styles.playerCard} // Remover cor diferente para GR
                onClick={() => handlePlayerClick(player.id)}
                className="hover-card"
              >
                {playerRating?.showAverage && playerRating.averageRating && (
                  <div style={styles.averageRating}>
                    Média: {(() => {
                      const avgRating = playerRating.averageRating.average_rating;
                      console.log(`🎯 Displaying average for player:`, {
                        playerId: player.id,
                        playerName: player.name,
                        avgRating,
                        type: typeof avgRating,
                        totalRatings: playerRating.averageRating.total_ratings
                      });
                      
                      // Converter string para número se necessário
                      const numericRating = typeof avgRating === 'string' ? parseFloat(avgRating) : avgRating;
                      
                      if (typeof numericRating === 'number' && numericRating > 0 && !isNaN(numericRating)) {
                        return numericRating.toFixed(1);
                      } else {
                        return 'N/A';
                      }
                    })()} 
                    ({playerRating.averageRating.total_ratings || 0} votos)
                  </div>
                )}

                <div style={styles.playerInfo}>
                  <PlayerImage
                    imageUrl={player.image_url}
                    playerName={player.name}
                    style={{
                      ...styles.playerImage,
                      // Zoom out para imagens default para evitar corte
                      objectFit: player.image_url?.includes('default-player') ? 'contain' : 'cover',
                      padding: player.image_url?.includes('default-player') ? '0.2rem' : '0',
                    }}
                    loading="lazy"
                    width="80"
                    height="80"
                    showFallbackText={true}
                  />
                  <div style={styles.playerDetails}>
                    <div style={styles.playerName}>{player.name}</div>
                    <div style={styles.playerPosition}>{player.position}</div>
                  </div>
                </div>

                <div style={styles.ratingsSection}>
                  <div style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <button
                        key={rating}
                        style={{
                          ...styles.ratingButton,
                          ...(rating === 6 ? styles.ratingButtonAverage : {}),
                          ...(playerRating?.rating === rating ? styles.ratingButtonActive : {})
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRatingChange(player.id, rating);
                        }}
                        disabled={hasVoted}
                        className="hover-button"
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  
                  {/* REMOVER COMPLETAMENTE - não mostrar número à direita */}
                </div>

                <div style={styles.manOfMatchSection}>
                  <button
                    style={{
                      ...styles.manOfMatchButton,
                      ...(isManOfMatch ? styles.manOfMatchButtonActive : {})
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManOfMatchSelect(player.id, 'regular');
                    }}
                    disabled={hasVoted}
                    title="Homem do Jogo"
                    className="hover-button"
                  >
                    {/* Estrela usando CSS */}
                    <span 
                      style={{
                        fontSize: "36px",
                        color: isManOfMatch ? "#000000" : "#FFD700",
                        textShadow: isManOfMatch 
                          ? "none" 
                          : "1px 1px 2px rgba(0, 0, 0, 0.8)",
                        lineHeight: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "normal"
                      }}
                    >
                      ★
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!hasVoted && (
          <button
            style={{
              ...styles.submitButton,
              ...(!canSubmit() ? styles.submitButtonDisabled : {})
            }}
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            className="hover-button"
          >
            {submitting ? 'A submeter...' : 'Submeter Avaliações'}
          </button>
        )}

        {hasVoted && showResults && (
          <div style={styles.resultsSection}>
            <div style={styles.resultsTitle}>Homem do Jogo</div>
            {manOfMatchResults.length > 0 ? (
              <div style={styles.winnerCard}>
                <PlayerImage
                  imageUrl={getPlayerById(manOfMatchResults[0].player_id)?.image_url || ''}
                  playerName={manOfMatchResults[0].player_name}
                  style={styles.winnerImage}
                  loading="lazy"
                  width="120"
                  height="120"
                  showFallbackText={true}
                />
                <div style={styles.winnerName}>{manOfMatchResults[0].player_name}</div>
                <div style={styles.winnerPercentage}>
                  {typeof manOfMatchResults[0].percentage === 'number' 
                    ? manOfMatchResults[0].percentage.toFixed(1) 
                    : '0.0'}%
                </div>
              </div>
            ) : (
              <div style={styles.noResultsMessage}>
                <div style={styles.noResultsText}>
                  Ainda não há votos suficientes para determinar o Homem do Jogo
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PageLayout>
  );
};

export default PlayerRatings; 