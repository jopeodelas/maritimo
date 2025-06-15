import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import OptimizedImage from '../components/OptimizedImage';
import PlayerImage from '../components/PlayerImage';
import { createStyles } from '../styles/styleUtils';
import { getPlayerImageUrl } from '../utils/imageUtils';
import * as playerRatingsService from '../services/playerRatingsService';
import * as matchService from '../services/matchService';
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
        const results = await playerRatingsService.getManOfTheMatchResults(voting.id);
        setManOfMatchResults(results);
        
        // Get user's previous ratings
        const userRatings = await playerRatingsService.getUserRatings(voting.id);
        const ratingsState = voting.players.map(player => ({
          playerId: player.id,
          rating: userRatings.ratings.find(r => r.player_id === player.id)?.rating || 6,
          showAverage: false
        }));
        setPlayerRatings(ratingsState);
        setManOfMatchPlayerId(userRatings.manOfMatchVote?.player_id || null);
      } else {
        // Initialize ratings for new vote
        const ratingsState = voting.players.map(player => ({
          playerId: player.id,
          rating: 6, // Default "average" rating
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
    
    setPlayerRatings(prev => 
      prev.map(p => 
        p.playerId === playerId ? { ...p, rating } : p
      )
    );
  };

  const handlePlayerClick = async (playerId: number) => {
    const playerRating = playerRatings.find(p => p.playerId === playerId);
    if (!playerRating) return;

    if (playerRating.showAverage && playerRating.averageRating) {
      // Hide average if already showing
      setPlayerRatings(prev => 
        prev.map(p => 
          p.playerId === playerId ? { ...p, showAverage: false } : p
        )
      );
    } else {
      // Fetch and show average
      const averageRating = await playerRatingsService.getPlayerAverageRating(playerId);
      setPlayerRatings(prev => 
        prev.map(p => 
          p.playerId === playerId 
            ? { ...p, averageRating: averageRating || undefined, showAverage: true } 
            : p
        )
      );
    }
  };

  const handleManOfMatchSelect = (playerId: number) => {
    if (hasVoted) return; // Prevent changes if already voted
    setManOfMatchPlayerId(playerId === manOfMatchPlayerId ? null : playerId);
  };

  const canSubmit = () => {
    return playerRatings.every(p => p.rating >= 1 && p.rating <= 10) && 
           manOfMatchPlayerId !== null && 
           !hasVoted;
  };

  const handleSubmit = async () => {
    if (!activeVoting || !canSubmit()) return;

    try {
      setSubmitting(true);
      const ratingsData = {
        match_id: activeVoting.id,
        ratings: playerRatings.map(p => ({
          player_id: p.playerId,
          rating: p.rating
        })),
        man_of_match_player_id: manOfMatchPlayerId!
      };

      const success = await playerRatingsService.submitPlayerRatings(ratingsData);
      
      if (success) {
        setHasVoted(true);
        setShowResults(true);
        const results = await playerRatingsService.getManOfTheMatchResults(activeVoting.id);
        setManOfMatchResults(results);
      } else {
        setError('Erro ao submeter as avaliações. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting ratings:', error);
      setError('Erro ao submeter as avaliações. Tente novamente.');
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
      padding: "clamp(8rem, 10vh, 10rem) clamp(0.5rem, 1vw, 1.5rem) clamp(1rem, 2vh, 2rem)",
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
      fontWeight: "800",
      color: "white",
      margin: "0 0 clamp(0.3rem, 1vh, 0.5rem) 0",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    },
    playerPosition: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "rgba(255, 255, 255, 0.8)",
      fontWeight: "600",
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
      width: "clamp(3rem, 6vw, 4rem)",
      height: "clamp(3rem, 6vw, 4rem)",
      borderRadius: "50%",
      border: "2px solid rgba(255, 215, 0, 0.3)",
      background: "rgba(255, 215, 0, 0.1)",
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    manOfMatchButtonActive: {
      background: "rgba(255, 215, 0, 0.9)",
      border: "2px solid #FFD700",
      transform: "scale(1.1)",
      boxShadow: "0 0 20px rgba(255, 215, 0, 0.6)",
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
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.loadingMessage}>
            <div style={styles.loadingSpinner}></div>
            <div>A carregar avaliações dos jogadores...</div>
            <div style={styles.loadingSubtext}>A buscar dados do último jogo do CS Marítimo</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activeVoting) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <Navbar />
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
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <Navbar />
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroAccent}></div>
          <h1 style={styles.heroTitle}>Avaliação dos Jogadores</h1>
          <p style={styles.heroSubtitle}>{activeVoting.home_team} vs {activeVoting.away_team}</p>
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
              <strong>REGRAS:</strong> Dê uma avaliação de 1-10 a cada jogador e treinador (6 é a média), 
              e escolha o seu Homem do Jogo para registar o seu voto
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
                style={{
                  ...styles.playerCard,
                  ...(player.position.toLowerCase().includes('gk') || player.position.toLowerCase().includes('guarda-redes') ? styles.playerCardRed : {})
                }}
                onClick={() => handlePlayerClick(player.id)}
                className="hover-card"
              >
                {playerRating?.showAverage && playerRating.averageRating && (
                  <div style={styles.averageRating}>
                    Média: {playerRating.averageRating.average_rating.toFixed(1)} 
                    ({playerRating.averageRating.total_ratings} votos)
                  </div>
                )}

                <div style={styles.playerInfo}>
                  <PlayerImage
                    imageUrl={player.image_url}
                    playerName={player.name}
                    style={styles.playerImage}
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
                  
                  <div style={styles.currentRating}>
                    {playerRating?.rating || 6}
                  </div>
                </div>

                <div style={styles.manOfMatchSection}>
                  <button
                    style={{
                      ...styles.manOfMatchButton,
                      ...(isManOfMatch ? styles.manOfMatchButtonActive : {})
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManOfMatchSelect(player.id);
                    }}
                    disabled={hasVoted}
                    title="Homem do Jogo"
                    className="hover-button"
                  >
                    <span style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)" }}>⭐</span>
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

        {showResults && manOfMatchResults.length > 0 && (
          <div style={styles.resultsSection}>
            <div style={styles.resultsTitle}>Homem do Jogo</div>
            {manOfMatchResults[0] && (
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
                <div style={styles.winnerPercentage}>{manOfMatchResults[0].percentage.toFixed(1)}%</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerRatings; 