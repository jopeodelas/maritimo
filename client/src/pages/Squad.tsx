import { useState, useEffect } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import PlayerImage from '../components/PlayerImage';
import { createStyles } from '../styles/styleUtils';
import useIsMobile from '../hooks/useIsMobile';
import Seo from '../components/Seo';

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
  const isMobile = useIsMobile();
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
      paddingBottom: isMobile ? "2rem" : "0", // Mobile: padding inferior
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
      maxWidth: isMobile ? "100%" : "1400px",
      margin: '0 auto',
      padding: isMobile 
        ? '70px 0.5rem 1rem' // Mobile: padding top para header + spacing menor
        : '2vh 2vw', // Desktop original
      position: "relative",
      zIndex: 2,
      width: isMobile ? "100%" : "auto",
      boxSizing: isMobile ? "border-box" : "content-box",
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
      padding: isMobile ? "1rem" : "clamp(1.5rem, 3vh, 2rem) clamp(1.5rem, 3vw, 2rem)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 clamp(0.3rem, 1vh, 0.8rem) clamp(1.5rem, 3vh, 2rem) rgba(0, 0, 0, 0.4)",
      position: "relative",
      overflow: isMobile ? "visible" : "hidden",
      height: isMobile ? "auto" : "85vh",
      display: 'flex',
      flexDirection: 'column',
      width: isMobile ? "100%" : "auto",
      maxWidth: isMobile ? "100%" : "auto",
      boxSizing: isMobile ? "border-box" : "content-box",
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
      gridTemplateColumns: isMobile 
        ? "repeat(2, 1fr)" // Mobile: exatamente 2 colunas
        : "repeat(var(--grid-columns, 3), 1fr)", // Desktop: será definido no JSX
      gridAutoRows: "1fr",
      gap: isMobile ? "1rem" : "2%",
      padding: isMobile ? "1rem" : "2%",
      height: isMobile ? "auto" : "70vh",
      opacity: 1,
      transform: "translateX(0)",
      transition: "all 0.3s ease",
      alignContent: isMobile ? "start" : "stretch",
      justifyContent: 'center',
      marginBottom: isMobile ? "2rem" : "0",
      width: isMobile ? "100%" : "auto",
      maxWidth: isMobile ? "100%" : "auto",
      boxSizing: isMobile ? "border-box" : "content-box",
      overflow: isMobile ? "hidden" : "visible",
    },
    playersGridAnimating: {
      opacity: 0.7,
      transform: "translateX(2%)",
    },
    playerCard: {
      background: "rgba(40, 55, 70, 0.95)", // Apenas para desktop
      border: "2px solid rgba(76, 175, 80, 0.6)", // Apenas para desktop
      borderRadius: "8px",
      padding: "3%", // Apenas para desktop
      textAlign: "center",
      color: "white",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)", // Apenas para desktop
      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between", // Apenas para desktop
      contain: "paint",
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
      marginBottom: "3%", // Apenas para desktop
      borderRadius: "6px",
      overflow: "hidden",
      border: "2px solid rgba(76, 175, 80, 0.6)", // Apenas para desktop
      background: "rgba(20, 30, 40, 0.8)", // Apenas para desktop
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
      fontSize: "clamp(0.8rem, 1.5vh, 1.1rem)", // Apenas para desktop
      fontWeight: "700",
      margin: "0", // Apenas para desktop
      color: "#FFFFFF",
      lineHeight: "1.2",
      textAlign: "center",
      padding: "0",
      background: "transparent",
      textShadow: "none", // Apenas para desktop
    },
    playerPosition: {
      fontSize: "clamp(0.7rem, 1.2vh, 0.9rem)", // Apenas para desktop
      fontWeight: "600",
      margin: "0.25rem 0 0 0", // Apenas para desktop
      color: "#4CAF50",
      lineHeight: "1.1",
      textAlign: "center",
      padding: "0 2%", // Apenas para desktop
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

    // Estilos para mobile
    mobilePlayerCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      background: "rgba(30, 40, 50, 0.8)",
      border: "1px solid rgba(76, 175, 80, 0.4)",
      borderRadius: "12px",
      padding: "0.5rem",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(5px)",
    },
    mobileImageContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: "1",
      borderRadius: "8px",
      overflow: "hidden",
      backgroundColor: "rgba(20, 30, 40, 0.8)",
    },
    mobilePlayerImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "top center", // Cabeça sempre visível
      borderRadius: "8px",
    },
    mobilePlayerName: {
      fontSize: "clamp(0.8rem, 3.5vw, 1rem)",
      fontWeight: "700",
      margin: "0",
      color: "#FFFFFF",
      lineHeight: "1.2",
      textAlign: "center",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.9)",
      wordBreak: "break-word",
      hyphens: "auto",
      background: "transparent",
      padding: "0.25rem 0.5rem",
      maxWidth: '100%',
      boxSizing: 'border-box',
    },
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/players');
        setPlayers(response.data.players || []);
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
    if (isMobile) {
      // Mobile: sempre 2 colunas
      return 2;
    }
    
    // Desktop: lógica original
    if (playerCount <= 3) return 3;
    if (playerCount <= 6) return 4;
    if (playerCount <= 8) return 4;
    if (playerCount <= 12) return 4;
    return 5;
  };

  // Segurança: verificar se currentPosition existe antes de usar
  const playerCount = currentPosition?.players?.length || 0;
  const optimalColumns = getOptimalColumns(playerCount);

  // Calcular altura da imagem baseada no número de jogadores
  const getImagePadding = (playerCount: number): string => {
    if (isMobile) {
      // Mobile: não precisa mais desta função pois usa aspectRatio: "1"
      return "100%";
    }
    
    // Desktop: lógica original
    if (playerCount <= 3) return "100%"; // Aproveita mais espaço para 3 jogadores - não deixa vazio
    if (playerCount <= 6) return "80%"; // Meio termo para 6 jogadores
    if (playerCount <= 8) return "80%"; // Já está perfeito para 8 jogadores
    return "50%"; // Bem compacto para muitos jogadores
  };

  const imagePadding = getImagePadding(playerCount);

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

  const renderPlayerCard = (player: Player) => {
    if (isMobile) {
      // Layout melhorado para mobile com container global
      return (
        <div key={player.id} style={styles.mobilePlayerCard}>
          {/* Container da imagem */}
          <div style={styles.mobileImageContainer}>
            <PlayerImage 
              imageUrl={player.image_url}
              playerName={player.name}
              style={styles.mobilePlayerImage}
              loading="lazy"
              width="200"
              height="200"
              showFallbackText={true}
            />
          </div>
          
          {/* Nome do jogador */}
          <h3 style={styles.mobilePlayerName}>
            {player.name}
          </h3>
        </div>
      );
    }

    // Layout original para desktop com hover CSS puro
    return (
      <div 
        key={player.id} 
        style={styles.playerCard}
        className="player-card-hover"
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
        
        <h3 style={styles.playerName}>
          {player.name}
        </h3>
        <p 
          style={styles.playerPosition}
          className="desktop-player-position"
        >
          {player.position}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <PageLayout>
        <Seo title="Plantel CS Marítimo" description="Conheça os jogadores que defendem as cores verde e vermelha." />
        <div style={styles.container}>
          <div style={styles.backgroundPattern} className="background-pattern"></div>
          <div style={styles.content}>
            <div style={styles.loading}>
              <div style={styles.loadingSpinner} className="loading-spinner"></div>
              <p style={styles.loadingText}>A carregar plantel...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Verificação de segurança: se não há posição atual, mostrar loading
  if (!currentPosition) {
    return (
      <PageLayout>
        <Seo title="Plantel CS Marítimo" description="Conheça os jogadores que defendem as cores verde e vermelha." />
        <div style={styles.container}>
          <div style={styles.backgroundPattern} className="background-pattern"></div>
          <div style={styles.content}>
            <div style={styles.loading}>
              <div style={styles.loadingSpinner} className="loading-spinner"></div>
              <p style={styles.loadingText}>A carregar plantel...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Seo title="Plantel CS Marítimo" description="Conheça os jogadores que defendem as cores verde e vermelha." />
      <div style={styles.container}>
        <div style={styles.backgroundPattern} className="background-pattern"></div>

      <div style={{
        ...styles.content, 
        paddingTop: isMobile ? "70px" : "clamp(8rem, 10vh, 10rem)"
      }}>
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
                className="nav-button-hover"
                onClick={() => navigatePosition('prev')}
                disabled={isAnimating}
              >
                ←
              </button>
              <button 
                style={{
                  ...styles.navButton,
                  ...(isAnimating ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
                className="nav-button-hover"
                onClick={() => navigatePosition('next')}
                disabled={isAnimating}
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
                '--grid-columns': optimalColumns,
                ...(isAnimating ? styles.playersGridAnimating : {})
              } as React.CSSProperties}
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

    {/* CSS otimizado para performance */}
    <style>{`
      /* Keyframes otimizado para performance */
      @keyframes float {
        0%, 100% { 
          transform: translate3d(0, 0, 0); 
        }
        50% { 
          transform: translate3d(0, -10px, 0); 
        }
      }

      .player-card-hover {
        /* Mantemos apenas as transições estritamente necessárias */
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
      }

      .player-card-hover:hover {
        will-change: transform, box-shadow;
        transform: translateY(-1vh) scale(1.02) !important;
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
        border-color: rgba(76, 175, 80, 1) !important;
      }

      .player-card-hover:hover .player-glow {
        opacity: 1 !important;
      }

      .player-card-hover:hover img {
        transform: scale(1.05) !important;
        transition: transform 0.2s ease !important;
      }

      .nav-button-hover:not(:disabled):hover {
        will-change: transform, box-shadow;
        transform: scale(1.1) !important;
        box-shadow: 0 1.2vh 3vh rgba(76, 175, 80, 0.4) !important;
      }

      .nav-button-hover {
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
      }

      /* Otimização global para performance */
      .background-pattern {
        will-change: transform;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      /* Limitar repaints apenas em hover */
      .player-card-hover,
      .nav-button-hover {
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
    `}</style>
    </PageLayout>
  );
};

export default Squad; 