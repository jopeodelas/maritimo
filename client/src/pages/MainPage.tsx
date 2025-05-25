import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { createStyles } from "../styles/styleUtils";
import api from "../services/api";
import type { Player } from "../types";

interface TransferRumor {
  id: number;
  player_name: string;
  type: "compra" | "venda";
  club: string;
  value: string;
  status: "rumor" | "negociação" | "confirmado";
  date: string;
}

const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topVotedPlayers, setTopVotedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  const [transferRumors] = useState<TransferRumor[]>([
    {
      id: 1,
      player_name: "Cláudio Winck",
      type: "venda",
      club: "FC Porto",
      value: "€2.5M",
      status: "rumor",
      date: "2024-01-15",
    },
    {
      id: 2,
      player_name: "André Vidigal",
      type: "venda",
      club: "Sporting CP",
      value: "€3M",
      status: "negociação",
      date: "2024-01-14",
    },
    {
      id: 3,
      player_name: "Marco Silva",
      type: "compra",
      club: "Gil Vicente",
      value: "€800K",
      status: "rumor",
      date: "2024-01-13",
    },
  ]);

  useEffect(() => {
    fetchTopVotedPlayers();
  }, []);

  const fetchTopVotedPlayers = async () => {
    try {
      const response = await api.get("/players");
      const { players, totalUniqueVoters } = response.data;

      const playersWithNumbers = players.map((player: any) => ({
        ...player,
        vote_count: parseInt(player.vote_count) || 0,
      }));

      // O número total de utilizadores únicos que votaram
      setTotalVotes(totalUniqueVoters);

      const sortedPlayers = playersWithNumbers
        .sort((a: Player, b: Player) => b.vote_count - a.vote_count)
        .slice(0, 8);

      setTopVotedPlayers(sortedPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      setTotalVotes(0);
      setTopVotedPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (voteCount: number) => {
    if (totalVotes === 0) return "0.0";
    return ((voteCount / totalVotes) * 100).toFixed(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "#27AE60";
      case "negociação":
        return "#F39C12";
      default:
        return "#7F8C8D";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "compra" ? "#27AE60" : "#E74C3C";
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
      padding: "clamp(1rem, 2vh, 2rem) clamp(0.5rem, 1vw, 1.5rem)",
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
      backdropFilter: "blur(20px)",
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
      margin: 0,
      fontWeight: "500",
      color: "#B0BEC5",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    mainGrid: {
      display: "grid",
      gap: "clamp(1.5rem, 3vh, 2.5rem)",
      gridTemplateColumns: "1fr 28rem",
      alignItems: "start",
    },
    mainContent: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(1.5rem, 3vh, 2.5rem)",
    },
    section: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2.5rem) clamp(1.5rem, 2.5vw, 2rem)",
      backdropFilter: "blur(20px)",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 3vh, 2.5rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.2)
      `,
      position: "relative",
      overflow: "hidden",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "clamp(1.5rem, 3vh, 2rem)",
      paddingBottom: "clamp(1rem, 2vh, 1.5rem)",
      position: "relative",
    },
    sectionTitle: {
      fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
      fontWeight: "700",
      color: "#FFFFFF",
      margin: 0,
      letterSpacing: "-0.01em",
      position: "relative",
    },
    sectionTitleUnderline: {
      position: "absolute",
      bottom: "-0.5rem",
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #4CAF50 0%, #FFD700 50%, #F44336 100%)",
      borderRadius: "2px",
    },
    playersGrid: {
      display: "grid",
      gap: "clamp(1rem, 2.5vw, 1.25rem)",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(15rem, 28vw), 1fr))",
      marginBottom: "clamp(1.5rem, 3vh, 2rem)",
    },
    playerCard: {
      background: "rgba(40, 55, 70, 0.9)",
      border: "1px solid rgba(76, 175, 80, 0.2)",
      borderRadius: "clamp(0.75rem, 2vw, 1.25rem)",
      padding: "clamp(1.25rem, 2.5vh, 1.75rem) clamp(1rem, 2vw, 1.25rem)",
      textAlign: "center",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      position: "relative",
      cursor: "pointer",
      overflow: "hidden",
    },
    playerRankBadge: {
      position: "absolute",
      top: "clamp(0.5rem, 1.5vw, 0.75rem)",
      right: "clamp(0.5rem, 1.5vw, 0.75rem)",
      background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
      color: "white",
      borderRadius: "clamp(0.375rem, 1vw, 0.5rem)",
      padding: "clamp(0.25rem, 0.75vh, 0.375rem) clamp(0.5rem, 1.5vw, 0.75rem)",
      fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
      fontWeight: "700",
      boxShadow: "0 0.25rem 0.75rem rgba(244, 67, 54, 0.4)",
      zIndex: 1,
    },
    playerImageContainer: {
      position: "relative",
      margin: "clamp(1rem, 2.5vh, 1.5rem) auto",
      width: "clamp(4rem, 10vw, 5.5rem)",
      height: "clamp(4rem, 10vw, 5.5rem)",
    },
    playerImage: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      objectFit: "cover",
      objectPosition: "top center",
      border: "3px solid #4CAF50",
      transition: "all 0.3s ease",
      boxShadow: "0 0.5rem 1rem rgba(76, 175, 80, 0.3)",
    },
    playerName: {
      fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
      fontWeight: "600",
      color: "#FFFFFF",
      margin: "clamp(0.75rem, 1.5vh, 1rem) 0 clamp(0.25rem, 0.75vh, 0.5rem) 0",
      lineHeight: "1.2",
    },
    playerPosition: {
      fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
      color: "#B0BEC5",
      margin: "0 0 clamp(1rem, 2vh, 1.25rem) 0",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    votePercentage: {
      fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
      fontWeight: "800",
      color: "#FFD700",
      margin: "clamp(0.5rem, 1vh, 0.75rem) 0",
      textShadow: "0 0.125rem 0.25rem rgba(255, 215, 0, 0.5)",
    },
    actionButton: {
      background: "linear-gradient(135deg, #FFD700 0%, #FF8F00 100%)",
      color: "#1A252F",
      border: "none",
      padding: "clamp(1rem, 2vh, 1.25rem) clamp(2rem, 4vw, 2.5rem)",
      borderRadius: "clamp(0.75rem, 2vw, 1rem)",
      fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      boxShadow: "0 0.5rem 1.5rem rgba(255, 215, 0, 0.4)",
      position: "relative",
      overflow: "hidden",
    },
    buttonContainer: {
      textAlign: "center",
      marginTop: "clamp(1.5rem, 2.5vh, 2rem)",
    },
    transferCard: {
      background: "rgba(40, 55, 70, 0.9)",
      border: "1px solid rgba(76, 175, 80, 0.2)",
      borderRadius: "clamp(0.75rem, 2vw, 1.25rem)",
      padding: "clamp(1.25rem, 2.5vh, 1.75rem) clamp(1.25rem, 2.5vw, 1.75rem)",
      marginBottom: "clamp(1rem, 2vh, 1.25rem)",
      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
    },
    transferHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "clamp(0.75rem, 1.5vh, 1rem)",
      gap: "1rem",
    },
    transferPlayer: {
      fontSize: "clamp(1.125rem, 2.75vw, 1.375rem)",
      fontWeight: "600",
      color: "#FFFFFF",
      flex: 1,
    },
    transferType: {
      padding: "clamp(0.5rem, 1vh, 0.625rem) clamp(1rem, 2vw, 1.25rem)",
      borderRadius: "clamp(0.5rem, 1vw, 0.625rem)",
      fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
      fontWeight: "600",
      color: "white",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      flexShrink: 0,
    },
    transferDetails: {
      display: "grid",
      gridTemplateColumns: "1fr auto auto",
      gap: "clamp(1rem, 2.5vw, 1.5rem)",
      alignItems: "center",
    },
    transferInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(0.25rem, 0.75vh, 0.5rem)",
    },
    transferClub: {
      fontSize: "clamp(0.875rem, 2vw, 1rem)",
      color: "#B0BEC5",
      fontWeight: "500",
    },
    transferValue: {
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      fontWeight: "700",
      color: "#4CAF50",
    },
    transferStatus: {
      padding: "clamp(0.375rem, 0.75vh, 0.5rem) clamp(0.75rem, 1.75vw, 1rem)",
      borderRadius: "clamp(0.375rem, 1vw, 0.5rem)",
      fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
      fontWeight: "600",
      color: "white",
      textTransform: "capitalize",
    },
    transferDate: {
      fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
      color: "#78909C",
      fontWeight: "500",
    },
    sidebar: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(1.5rem, 2.5vh, 2rem)",
    },
    statsCard: {
      background: "rgba(76, 175, 80, 0.9)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.25rem, 2.5vw, 1.75rem)",
      color: "white",
      boxShadow: "0 1rem 3rem rgba(76, 175, 80, 0.3)",
      backdropFilter: "blur(20px)",
      position: "relative",
      overflow: "hidden",
    },
    statsTitle: {
      fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
      fontWeight: "700",
      marginBottom: "clamp(1.5rem, 2.5vh, 1.75rem)",
      color: "#FFD700",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    statItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "clamp(0.75rem, 1.5vh, 1rem) 0",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    },
    statLabel: {
      fontSize: "clamp(0.875rem, 2vw, 0.975rem)",
      fontWeight: "500",
      opacity: 0.9,
    },
    statValue: {
      fontSize: "clamp(1.125rem, 2.75vw, 1.375rem)",
      fontWeight: "700",
      color: "#FFD700",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    quickActionsCard: {
      background: "rgba(244, 67, 54, 0.9)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.25rem, 2.5vw, 1.75rem)",
      color: "white",
      boxShadow: "0 1rem 3rem rgba(244, 67, 54, 0.3)",
      backdropFilter: "blur(20px)",
      textAlign: "center",
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "60vh",
      fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
      color: "#4CAF50",
      fontWeight: "600",
    },
    // Responsive breakpoints
    "@media (max-width: 80rem)": {
      mainGrid: {
        gridTemplateColumns: "1fr",
      },
      playersGrid: {
        gridTemplateColumns: "repeat(auto-fit, minmax(min(13rem, 32vw), 1fr))",
      },
    } as any,
    "@media (max-width: 48rem)": {
      content: {
        padding: "clamp(1rem, 2vh, 1.5rem) clamp(0.75rem, 2vw, 1rem)",
      },
      playersGrid: {
        gridTemplateColumns: "repeat(auto-fit, minmax(42vw, 1fr))",
      },
      transferHeader: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.75rem",
      },
      transferDetails: {
        gridTemplateColumns: "1fr",
        gap: "clamp(0.75rem, 1.5vh, 1rem)",
      },
    } as any,
    "@media (max-width: 30rem)": {
      playersGrid: {
        gridTemplateColumns: "1fr 1fr",
      },
    } as any,
  });

  // Enhanced hover effects
  const handlePlayerCardHover = (e: React.MouseEvent, isHover: boolean) => {
    const target = e.currentTarget as HTMLElement;
    if (isHover) {
      target.style.transform = "translateY(-0.5vh) scale(1.02)";
      target.style.borderColor = "#4CAF50";
      target.style.boxShadow = "0 1vh 2vh rgba(76, 175, 80, 0.3)";
      target.style.background = "rgba(50, 70, 90, 0.95)";
    } else {
      target.style.transform = "translateY(0) scale(1)";
      target.style.borderColor = "rgba(76, 175, 80, 0.2)";
      target.style.boxShadow = "none";
      target.style.background = "rgba(40, 55, 70, 0.9)";
    }
  };

  const handleButtonHover = (e: React.MouseEvent, isHover: boolean) => {
    const target = e.currentTarget as HTMLElement;
    if (isHover) {
      target.style.transform = "translateY(-0.25vh) scale(1.05)";
      target.style.boxShadow = "0 1vh 2vh rgba(255, 215, 0, 0.6)";
    } else {
      target.style.transform = "translateY(0) scale(1)";
      target.style.boxShadow = "0 0.5rem 1.5rem rgba(255, 215, 0, 0.4)";
    }
  };

  const handleTransferCardHover = (e: React.MouseEvent, isHover: boolean) => {
    const target = e.currentTarget as HTMLElement;
    if (isHover) {
      target.style.transform = "translateX(0.5vw)";
      target.style.borderColor = "#4CAF50";
      target.style.boxShadow = "0 0.5vh 1.5vh rgba(76, 175, 80, 0.2)";
      target.style.background = "rgba(50, 70, 90, 0.95)";
    } else {
      target.style.transform = "translateX(0)";
      target.style.borderColor = "rgba(76, 175, 80, 0.2)";
      target.style.boxShadow = "none";
      target.style.background = "rgba(40, 55, 70, 0.9)";
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.loading}>A carregar dados do Marítimo...</div>
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
          <h1 style={styles.heroTitle}>
            Bem-vindo, {user?.username}!
          </h1>
          <p style={styles.heroSubtitle}>
            Centro de Comando do CS Marítimo
          </p>
        </div>

        <div style={styles.mainGrid}>
          {/* Main Content */}
          <div style={styles.mainContent}>
            {/* Top Voted Players Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  Jogadores Mais Votados para Sair
                </h2>
                <div style={styles.sectionTitleUnderline}></div>
              </div>

              <div style={styles.playersGrid}>
                {topVotedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    style={styles.playerCard}
                    onMouseOver={(e) => handlePlayerCardHover(e, true)}
                    onMouseOut={(e) => handlePlayerCardHover(e, false)}
                  >
                    <div style={styles.playerRankBadge}>#{index + 1}</div>
                    <div style={styles.playerImageContainer}>
                      <img
                        src={player.image_url || "/images/default-player.jpg"}
                        alt={player.name}
                        style={styles.playerImage}
                        onError={(e) => {
                          e.currentTarget.src = "/images/default-player.jpg";
                        }}
                      />
                    </div>
                    <h3 style={styles.playerName}>{player.name}</h3>
                    <p style={styles.playerPosition}>{player.position}</p>
                    <div style={styles.votePercentage}>
                      {calculatePercentage(player.vote_count)}%
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.buttonContainer}>
                <button
                  style={styles.actionButton}
                  onClick={() => navigate("/voting")}
                  onMouseOver={(e) => handleButtonHover(e, true)}
                  onMouseOut={(e) => handleButtonHover(e, false)}
                >
                  Votar Agora
                </button>
              </div>
            </div>

            {/* Transfer Rumors Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  Rumores de Transferências
                </h2>
                <div style={styles.sectionTitleUnderline}></div>
              </div>

              {transferRumors.map((rumor) => (
                <div
                  key={rumor.id}
                  style={styles.transferCard}
                  onMouseOver={(e) => handleTransferCardHover(e, true)}
                  onMouseOut={(e) => handleTransferCardHover(e, false)}
                >
                  <div style={styles.transferHeader}>
                    <div style={styles.transferPlayer}>
                      {rumor.player_name}
                    </div>
                    <div
                      style={{
                        ...styles.transferType,
                        backgroundColor: getTypeColor(rumor.type),
                      }}
                    >
                      {rumor.type}
                    </div>
                  </div>
                  <div style={styles.transferDetails}>
                    <div style={styles.transferInfo}>
                      <span style={styles.transferClub}>
                        {rumor.type === "compra" ? "De: " : "Para: "}
                        {rumor.club}
                      </span>
                      <span style={styles.transferValue}>{rumor.value}</span>
                    </div>
                    <span
                      style={{
                        ...styles.transferStatus,
                        backgroundColor: getStatusColor(rumor.status),
                      }}
                    >
                      {rumor.status}
                    </span>
                    <span style={styles.transferDate}>
                      {new Date(rumor.date).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Stats Section */}
            <div style={styles.statsCard}>
              <h3 style={styles.statsTitle}>Estatísticas</h3>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Total de Votos</span>
                <span style={styles.statValue}>
                  {totalVotes.toLocaleString()}
                </span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Jogadores Avaliados</span>
                <span style={styles.statValue}>{topVotedPlayers.length}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Transferências Ativas</span>
                <span style={styles.statValue}>{transferRumors.length}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.quickActionsCard}>
              <h3 style={styles.statsTitle}>Ação Rápida</h3>
              <button
                style={styles.actionButton}
                onClick={() => navigate("/voting")}
                onMouseOver={(e) => handleButtonHover(e, true)}
                onMouseOut={(e) => handleButtonHover(e, false)}
              >
                Ir para Votação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
