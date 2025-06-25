import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PlayerImage from '../components/PlayerImage';
import { createStyles } from '../styles/styleUtils';

interface Player {
  id: number;
  name: string;
  position: string;
  image_url: string;
  vote_count: number;
}

interface PositionData {
  name: string;
  displayName: string;
  players: Player[];
}

const Squad = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const positions: PositionData[] = [
    {
      name: 'goalkeepers',
      displayName: 'Guarda-Redes',
      players: [],
    },
    {
      name: 'defenders',
      displayName: 'Defesas',
      players: [],
    },
    {
      name: 'midfielders',
      displayName: 'Médios',
      players: [],
    },
    {
      name: 'forwards',
      displayName: 'Atacantes',
      players: [],
    }
  ];

  const styles = createStyles({
    container: {
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      position: "relative",
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
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2vh 2vw',
      position: "relative",
      zIndex: 2,
    },
    heroSection: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "2px solid rgba(76, 175, 80, 0.4)",
      borderRadius: "clamp(0.8rem, 2vw, 1.2rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.5rem, 3vw, 2rem)",
      marginBottom: "2vh",
      color: "white",
      textAlign: "center",
      boxShadow: `
        0 clamp(0.3rem, 1vh, 0.8rem) clamp(1.5rem, 3vh, 2rem) rgba(0, 0, 0, 0.4),
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
      borderRadius: "clamp(0.8rem, 2vw, 1.2rem) clamp(0.8rem, 2vw, 1.2rem) 0 0",
    },
    heroTitle: {
      fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
      fontWeight: "800",
      margin: "0 0 clamp(0.3rem, 1vh, 0.8rem) 0",
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textShadow: "0 0.125rem 0.25rem rgba(255, 215, 0, 0.3)",
      letterSpacing: "-0.02em",
      position: "relative",
    },
    heroSubtitle: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      margin: 0,
      fontWeight: "500",
      color: "#B0BEC5",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    squadContainer: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(0.8rem, 2vw, 1.2rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.5rem, 3vw, 2rem)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 clamp(0.3rem, 1vh, 0.8rem) clamp(1.5rem, 3vh, 2rem) rgba(0, 0, 0, 0.4)",
      position: "relative",
      overflow: "hidden",
      height: "85vh",
      display: 'flex',
      flexDirection: 'column',
    },
    positionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "2vh",
      padding: "0 2%",
      flexWrap: "wrap",
      gap: "1vh",
      flexShrink: 0,
    },
    positionInfo: {
      display: "flex",
      alignItems: "center",
      gap: "2%",
      flex: "1",
    },
    positionTitle: {
      fontSize: "clamp(1.8rem, 4.5vw, 2.5rem)",
      fontWeight: "800",
      color: "#FFFFFF",
      margin: 0,
      textShadow: "0 3px 6px rgba(0, 0, 0, 0.6), 0 0 20px rgba(76, 175, 80, 0.3)",
      background: "linear-gradient(135deg, #FFFFFF 0%, #FFD700 50%, #4CAF50 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      letterSpacing: "-0.02em",
    },
    positionCount: {
      fontSize: "clamp(1rem, 2.2vw, 1.3rem)",
      color: "#B0BEC5",
      fontWeight: "600",
      marginTop: "clamp(0.5rem, 1vh, 0.8rem)",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    },
    navigationControls: {
      display: "flex",
      gap: "2%",
      flexShrink: 0,
    },
    navButton: {
      width: "clamp(3rem, 6vw, 4rem)",
      height: "clamp(3rem, 6vw, 4rem)",
      borderRadius: "50%",
      border: "2px solid rgba(76, 175, 80, 0.4)",
      background: "linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(76, 175, 80, 0.6) 100%)",
      color: "white",
      fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0.5vh 1vh rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(10px)",
      fontWeight: "600",
    },
    playersGrid: {
      display: "grid",
      gridAutoRows: "1fr",
      gap: "2%",
      padding: "2%",
      height: "70vh",
      opacity: 1,
      transform: "translateX(0)",
      transition: "all 0.3s ease",
      alignContent: 'stretch',
      justifyContent: 'center',
    },
    playersGridAnimating: {
      opacity: 0.7,
      transform: "translateX(2%)",
    },
    playerCard: {
      background: "rgba(40, 55, 70, 0.95)",
      border: "2px solid rgba(76, 175, 80, 0.6)",
      borderRadius: "8px",
      padding: "3%",
      textAlign: "center",
      color: "white",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
      transition: "all 0.2s ease",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    playerCardGlow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)",
      borderRadius: "8px",
      opacity: 0,
      transition: "opacity 0.2s ease",
      zIndex: -1,
    },
    playerImageContainer: {
      position: "relative",
      width: "100%",
      height: "0",
      marginBottom: "3%",
      borderRadius: "6px",
      overflow: "hidden",
      border: "2px solid rgba(76, 175, 80, 0.6)",
      background: "rgba(20, 30, 40, 0.8)",
    },
    playerImage: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center top",
      transition: "transform 0.2s ease",
    },
    playerName: {
      fontSize: "clamp(0.8rem, 1.5vh, 1.1rem)",
      fontWeight: "700",
      margin: "0",
      color: "#FFFFFF",
      lineHeight: "1.2",
      textAlign: "center",
      padding: "0 2%",
    },

    loading: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60vh',
      gap: '3vh',
    },
    loadingSpinner: {
      width: 'clamp(3rem, 6vw, 4rem)',
      height: 'clamp(3rem, 6vw, 4rem)',
      border: '0.4vh solid rgba(76, 175, 80, 0.2)',
      borderTop: '0.4vh solid #4CAF50',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      color: '#B0BEC5',
      fontWeight: '500',
    },
    emptyState: {
      textAlign: "center",
      color: "#78909C",
      fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
      padding: "8vh 4%",
      fontStyle: "italic",
    },
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/players');
        setPlayers(response.data || []);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Group players by position
  const groupedPositions = positions.map(position => {
    let filteredPlayers: Player[] = [];
    
    switch (position.name) {
      case 'goalkeepers':
        filteredPlayers = players.filter(player => 
          player.position.toLowerCase().includes('goalkeeper') || 
          player.position.toLowerCase().includes('gk') ||
          player.position.toLowerCase().includes('guarda-redes')
        );
        break;
      case 'defenders':
        filteredPlayers = players.filter(player => 
          player.position.toLowerCase().includes('defender') || 
          player.position.toLowerCase().includes('defence') ||
          player.position.toLowerCase().includes('defesa') ||
          player.position.toLowerCase().includes('central') ||
          player.position.toLowerCase().includes('lateral')
        );
        break;
      case 'midfielders':
        filteredPlayers = players.filter(player => 
          player.position.toLowerCase().includes('midfielder') || 
          player.position.toLowerCase().includes('midfield') ||
          player.position.toLowerCase().includes('médio') ||
          player.position.toLowerCase().includes('meio') ||
          player.position.toLowerCase().includes('medio')
        );
        break;
      case 'forwards':
        filteredPlayers = players.filter(player => 
          player.position.toLowerCase().includes('forward') || 
          player.position.toLowerCase().includes('striker') ||
          player.position.toLowerCase().includes('winger') ||
          player.position.toLowerCase().includes('extremo') ||
          player.position.toLowerCase().includes('atacante') ||
          player.position.toLowerCase().includes('avançado')
        );
        break;
    }
    
    return {
      ...position,
      players: filteredPlayers
    };
  });

  const currentPosition = groupedPositions[currentPositionIndex];

  // Calcular número ideal de colunas baseado no número de jogadores
  const getOptimalColumns = (playerCount: number): number => {
    if (playerCount <= 3) return 3;
    if (playerCount <= 6) return 4;
    if (playerCount <= 8) return 4;
    if (playerCount <= 12) return 4;
    return 5;
  };

  const optimalColumns = getOptimalColumns(currentPosition.players.length);

  // Calcular altura da imagem baseada no número de jogadores
  const getImagePadding = (playerCount: number): string => {
    if (playerCount <= 3) return "100%"; // Aproveita mais espaço para 3 jogadores - não deixa vazio
    if (playerCount <= 6) return "80%"; // Meio termo para 6 jogadores
    if (playerCount <= 8) return "80%"; // Já está perfeito para 8 jogadores
    return "50%"; // Bem compacto para muitos jogadores
  };

  const imagePadding = getImagePadding(currentPosition.players.length);

  const navigatePosition = (direction: 'next' | 'prev') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentPositionIndex((prev) => (prev + 1) % groupedPositions.length);
      } else {
        setCurrentPositionIndex((prev) => (prev - 1 + groupedPositions.length) % groupedPositions.length);
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 250);
  };

  const renderPlayerCard = (player: Player) => (
    <div 
      key={player.id} 
      style={styles.playerCard}
      className="hover-player-card"
      onMouseEnter={(e) => {
        const card = e.currentTarget;
        card.style.transform = 'translateY(-1vh) scale(1.02)';
        card.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
        card.style.borderColor = 'rgba(76, 175, 80, 1)';
        const glow = card.querySelector('.player-glow') as HTMLElement;
        if (glow) glow.style.opacity = '1';
        const image = card.querySelector('img') as HTMLElement;
        if (image) image.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        card.style.borderColor = 'rgba(76, 175, 80, 0.6)';
        const glow = card.querySelector('.player-glow') as HTMLElement;
        if (glow) glow.style.opacity = '0';
        const image = card.querySelector('img') as HTMLElement;
        if (image) image.style.transform = 'scale(1)';
      }}
    >
      <div style={styles.playerCardGlow} className="player-glow"></div>
      
      <div style={{
        ...styles.playerImageContainer,
        paddingBottom: imagePadding
      }}>
        <PlayerImage 
          imageUrl={player.image_url}
          playerName={player.name}
          style={styles.playerImage}
          loading="lazy"
          width="200"
          height="200"
          showFallbackText={true}
        />
      </div>
      
      <h3 style={styles.playerName}>{player.name}</h3>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern} className="background-pattern"></div>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.loading}>
            <div style={styles.loadingSpinner} className="loading-spinner"></div>
            <p style={styles.loadingText}>A carregar plantel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern} className="background-pattern"></div>
      <Navbar />

      <div style={{...styles.content, paddingTop: "clamp(8rem, 10vh, 10rem)"}}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroAccent}></div>
          <h1 style={styles.heroTitle}>Plantel CS Marítimo</h1>
          <p style={styles.heroSubtitle}>
            Conheça os jogadores que defendem as cores verde e vermelha
          </p>
        </div>

        {/* Squad Container */}
        <div style={styles.squadContainer}>
          {/* Position Header with Navigation */}
          <div style={styles.positionHeader}>
            <div style={styles.positionInfo}>
              <div>
                <h2 style={styles.positionTitle}>{currentPosition.displayName}</h2>
                <p style={styles.positionCount}>
                  {currentPosition.players.length} jogador{currentPosition.players.length !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
            
            <div style={styles.navigationControls}>
              <button 
                style={{
                  ...styles.navButton,
                  ...(isAnimating ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
                onClick={() => navigatePosition('prev')}
                disabled={isAnimating}
                onMouseEnter={(e) => {
                  if (!isAnimating) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 1.2vh 3vh rgba(76, 175, 80, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0.5vh 1.5vh rgba(0, 0, 0, 0.3)';
                }}
              >
                ←
              </button>
              <button 
                style={{
                  ...styles.navButton,
                  ...(isAnimating ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
                onClick={() => navigatePosition('next')}
                disabled={isAnimating}
                onMouseEnter={(e) => {
                  if (!isAnimating) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 1.2vh 3vh rgba(76, 175, 80, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0.5vh 1.5vh rgba(0, 0, 0, 0.3)';
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Players Grid */}
          {currentPosition.players.length > 0 ? (
            <div 
              style={{
                ...styles.playersGrid,
                gridTemplateColumns: `repeat(${optimalColumns}, 1fr)`,
                ...(isAnimating ? styles.playersGridAnimating : {})
              }}
            >
              {currentPosition.players.map((player) => renderPlayerCard(player))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              Nenhum jogador encontrado nesta posição
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Squad; 