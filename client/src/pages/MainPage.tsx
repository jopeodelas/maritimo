import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import PlayerImage from "../components/PlayerImage";
import LayoutStabilizer from "../components/LayoutStabilizer";
import { createStyles } from "../styles/styleUtils";
import api from "../services/api";
import transferService from "../services/transferService";
import type { TransferRumor, TransferStats } from "../services/transferService";
import type { Player } from "../types";

interface CustomPoll {
  id: number;
  title: string;
  options: string[];
  created_by: number;
  created_at: string;
  is_active: boolean;
  votes: number[];
  total_votes: number;
  user_voted_option?: number;
}

const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topVotedPlayers, setTopVotedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [transferRumors, setTransferRumors] = useState<TransferRumor[]>([]);
  const [transferStats, setTransferStats] = useState<TransferStats | null>(null);
  const [loadingRumors, setLoadingRumors] = useState(false);
  const [lastRumorUpdate, setLastRumorUpdate] = useState<Date | null>(null);
  
  // Poll states
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollResults, setPollResults] = useState<{[key: string]: number}>({});
  const [totalPollVotes, setTotalPollVotes] = useState(0);

  // Custom polls states
  const [customPolls, setCustomPolls] = useState<CustomPoll[]>([]);

  useEffect(() => {
    fetchTopVotedPlayers();
    fetchTransferRumors();
    fetchTransferStats();
    checkPollVoteStatus();
    fetchCustomPolls();
  }, []);

  const checkPollVoteStatus = async () => {
    try {
      const response = await api.get('/poll/positions/check');
      setHasVoted(response.data.hasVoted);
      if (response.data.hasVoted) {
        setPollResults(response.data.results);
        setTotalPollVotes(response.data.totalVotes);
      }
    } catch (error) {
      console.error("Error checking poll status:", error);
      // If there's an error, assume user hasn't voted (safe default)
      setHasVoted(false);
    }
  };

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

  const fetchTransferRumors = async () => {
    try {
      const rumors = await transferService.getRumors();
      setTransferRumors(rumors);
      setLastRumorUpdate(new Date());
    } catch (error) {
      console.error("Error fetching transfer rumors:", error);
    }
  };

  const fetchTransferStats = async () => {
    try {
      const stats = await transferService.getStats();
      setTransferStats(stats);
    } catch (error) {
      console.error("Error fetching transfer stats:", error);
    }
  };

  const handleRefreshRumors = async () => {
    setLoadingRumors(true);
    try {
      const rumors = await transferService.refreshRumors();
      setTransferRumors(rumors);
      setLastRumorUpdate(new Date());
      await fetchTransferStats(); // Update stats as well
    } catch (error) {
      console.error("Error refreshing rumors:", error);
    } finally {
      setLoadingRumors(false);
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

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 4) return "#27AE60"; // Green for high reliability
    if (reliability >= 3) return "#F39C12"; // Orange for medium reliability
    return "#E74C3C"; // Red for low reliability
  };

  const getReliabilityText = (reliability: number) => {
    if (reliability >= 4) return "Alta";
    if (reliability >= 3) return "Média";
    return "Baixa";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hoje";
    if (diffDays === 2) return "Ontem";
    if (diffDays <= 7) return `Há ${diffDays - 1} dias`;
    return date.toLocaleDateString("pt-PT");
  };

  // Poll functions
  const positions = [
    { id: 'guarda-redes', name: 'Guarda-Redes' },
    { id: 'defesa-central', name: 'Defesa Central' },
    { id: 'laterais', name: 'Laterais' },
    { id: 'medio-centro', name: 'Médio Centro' },
    { id: 'extremos', name: 'Extremos' },
    { id: 'ponta-de-lanca', name: 'Ponta de Lança' }
  ];

  const handlePositionToggle = (positionId: string) => {
    if (hasVoted) return;
    
    setSelectedPositions(prev => 
      prev.includes(positionId) 
        ? prev.filter(id => id !== positionId)
        : [...prev, positionId]
    );
  };

  const handleSubmitPoll = async () => {
    if (selectedPositions.length === 0 || hasVoted) return;
    
    try {
      const response = await api.post('/poll/positions', {
        positions: selectedPositions
      });
      
      setHasVoted(true);
      setPollResults(response.data.results);
      setTotalPollVotes(response.data.totalVotes);
    } catch (error) {
      console.error("Error submitting poll:", error);
      // If there's an error, don't change the state
      // The user can try again
    }
  };

  const calculatePollPercentage = (votes: number) => {
    if (totalPollVotes === 0) return "0.0";
    // Calculate percentage based on unique voters who chose this position
    return ((votes / totalPollVotes) * 100).toFixed(1);
  };

  const fetchCustomPolls = async () => {
    try {
      const response = await api.get('/custom-polls');
      setCustomPolls(response.data);
    } catch (error) {
      console.error("Error fetching custom polls:", error);
    }
  };

  const handleCustomPollVote = async (pollId: number, optionIndex: number) => {
    try {
      await api.post(`/custom-polls/${pollId}/vote`, { optionIndex });
      // Refresh custom polls to get updated results
      await fetchCustomPolls();
    } catch (error: any) {
      console.error("Error voting on custom poll:", error);
      alert(error.response?.data?.message || 'Erro ao votar na poll');
    }
  };

  const calculateCustomPollPercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return "0.0";
    return ((votes / totalVotes) * 100).toFixed(1);
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
      backdropFilter: "blur(15px)",
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
      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
      fontWeight: "900",
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
      backdropFilter: "blur(10px)",
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
    sectionHeaderLeft: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(0.5rem, 1vh, 0.75rem)",
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
    totalVotesDisplay: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    totalVotesLabel: {
      fontSize: "clamp(0.875rem, 2vw, 0.975rem)",
      fontWeight: "500",
      color: "#B0BEC5",
    },
    totalVotesValue: {
      fontSize: "clamp(1.125rem, 2.75vw, 1.375rem)",
      fontWeight: "700",
      color: "#FFD700",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    transferStatsDisplay: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    transferStat: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    transferStatLabel: {
      fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
      fontWeight: "500",
      color: "#B0BEC5",
    },
    transferStatValue: {
      fontSize: "clamp(0.875rem, 2vw, 1rem)",
      fontWeight: "700",
      color: "#4CAF50",
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
      transition: "all 0.2s ease",
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
      borderRadius: "50%",
      overflow: "hidden",
      border: "3px solid #4CAF50",
      boxShadow: "0 0.5rem 1rem rgba(76, 175, 80, 0.3)",
      transition: "all 0.3s ease",
    },
    playerImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "top center",
      transition: "all 0.3s ease",
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
      fontSize: "clamp(1.2rem, 2.4vw, 1.4rem)",
      fontWeight: "800",
      cursor: "pointer",
      transition: "all 0.2s ease",
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
      transition: "all 0.2s ease",
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
    refreshButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
      color: "white",
      border: "none",
      padding: "clamp(0.5rem, 1vh, 0.75rem) clamp(1rem, 2vw, 1.5rem)",
      borderRadius: "clamp(0.5rem, 1vw, 0.75rem)",
      fontSize: "clamp(0.75rem, 1.9vw, 0.875rem)",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      boxShadow: "0 0.25rem 0.75rem rgba(76, 175, 80, 0.3)",
    },
    updateInfo: {
      fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
      color: "#78909C",
      textAlign: "center",
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
      fontStyle: "italic",
    },
    transferMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "clamp(0.5rem, 1vh, 0.75rem)",
      paddingTop: "clamp(0.5rem, 1vh, 0.75rem)",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    },
    transferSource: {
      fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
      color: "#90A4AE",
      fontStyle: "italic",
    },
    reliabilityBadge: {
      padding: "clamp(0.25rem, 0.5vh, 0.375rem) clamp(0.5rem, 1vw, 0.75rem)",
      borderRadius: "clamp(0.25rem, 0.5vw, 0.375rem)",
      fontSize: "clamp(0.625rem, 1.4vw, 0.75rem)",
      fontWeight: "600",
      color: "white",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
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
      backdropFilter: "blur(10px)",
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
      backdropFilter: "blur(10px)",
      textAlign: "center",
    },
    gameCard: {
      background: "rgba(76, 175, 80, 0.9)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.25rem, 2.5vw, 1.75rem)",
      marginBottom: "clamp(1.5rem, 3vh, 2rem)",
      color: "white",
      boxShadow: "0 1rem 3rem rgba(76, 175, 80, 0.3)",
      backdropFilter: "blur(10px)",
      position: "relative",
      overflow: "hidden",
    },
    gameHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "clamp(1rem, 2vh, 1.25rem)",
    },
    gameTitle: {
      fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
      fontWeight: "700",
      margin: 0,
      color: "white",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    gameBadge: {
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      color: "#1A252F",
      padding: "clamp(0.25rem, 0.5vh, 0.375rem) clamp(0.5rem, 1vw, 0.75rem)",
      borderRadius: "clamp(0.375rem, 1vw, 0.5rem)",
      fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      boxShadow: "0 0.25rem 0.75rem rgba(255, 215, 0, 0.4)",
    },
    gameDescription: {
      fontSize: "clamp(0.875rem, 1.8vw, 1rem)",
      lineHeight: "1.4",
      margin: "0 0 clamp(1.25rem, 2.5vh, 1.5rem) 0",
      color: "rgba(255, 255, 255, 0.9)",
    },
    gameFeatures: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(0.5rem, 1vh, 0.75rem)",
      marginBottom: "clamp(1.5rem, 3vh, 2rem)",
    },
    gameFeature: {
      display: "flex",
      alignItems: "center",
      gap: "clamp(0.5rem, 1vw, 0.75rem)",
    },
    gameFeatureIcon: {
      fontSize: "clamp(1rem, 2vw, 1.25rem)",
      flexShrink: 0,
    },
    gameFeatureText: {
      fontSize: "clamp(0.8rem, 1.7vw, 0.925rem)",
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: "500",
    },
    gameButton: {
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      color: "#1A252F",
      border: "none",
      padding: "clamp(1rem, 2vh, 1.25rem) clamp(2rem, 4vw, 2.5rem)",
      borderRadius: "clamp(0.75rem, 2vw, 1rem)",
      fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
      fontWeight: "800",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      boxShadow: "0 0.5rem 1.5rem rgba(255, 215, 0, 0.4)",
      width: "100%",
    },
    pollCard: {
      background: "rgba(255, 193, 7, 0.9)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.25rem, 2.5vw, 1.75rem)",
      color: "white",
            boxShadow: "0 1rem 3rem rgba(255, 193, 7, 0.3)",
      backdropFilter: "blur(10px)",
      position: "relative",
    },
    pollTitle: {
      fontSize: "clamp(1rem, 2vw, 1.25rem)",
      fontWeight: "700",
      marginBottom: "clamp(1.5rem, 2.5vh, 1.75rem)",
      color: "#1A252F",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
      lineHeight: "1.1",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    positionsList: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(0.75rem, 1.5vh, 1rem)",
      marginBottom: "clamp(1.5rem, 2.5vh, 2rem)",
      flex: 1,
    },
    positionOption: {
      background: "rgba(26, 37, 47, 0.8)",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "clamp(0.5rem, 1.5vw, 0.75rem)",
      padding: "clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    positionSelected: {
      background: "rgba(76, 175, 80, 0.9)",
      borderColor: "#4CAF50",
      transform: "scale(1.02)",
      boxShadow: "0 0.5rem 1rem rgba(76, 175, 80, 0.4)",
    },
    positionName: {
      fontSize: "clamp(0.875rem, 1.8vw, 1rem)",
      fontWeight: "600",
      color: "white",
      margin: 0,
      flex: 1,
    },
    pollSubmitButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
      color: "white",
      border: "none",
      padding: "clamp(1rem, 2vh, 1.25rem) clamp(2rem, 4vw, 2.5rem)",
      borderRadius: "clamp(0.75rem, 2vw, 1rem)",
      fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      boxShadow: "0 0.5rem 1.5rem rgba(76, 175, 80, 0.4)",
      marginTop: "auto",
    },
    pollSubmitDisabled: {
      background: "rgba(120, 144, 156, 0.5)",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    resultsList: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(0.75rem, 1.5vh, 1rem)",
      flex: 1,
      marginBottom: "clamp(1.5rem, 2.5vh, 2rem)",
    },
    resultItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "rgba(26, 37, 47, 0.8)",
      borderRadius: "clamp(0.5rem, 1vw, 0.75rem)",
      padding: "clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    resultPosition: {
      display: "flex",
      alignItems: "center",
      fontSize: "clamp(0.875rem, 2vw, 1rem)",
      fontWeight: "600",
      color: "white",
      flex: 1,
    },
    resultPercentage: {
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      fontWeight: "700",
      color: "#4CAF50",
      flexShrink: 0,
    },
    pollInfo: {
      fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
      color: "#1A252F",
      marginTop: "clamp(1rem, 2vh, 1.25rem)",
      opacity: 0.8,
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

  // Add custom poll styles to the existing styles object
  const customPollStyles = {
    customPollCard: {
      background: "rgba(255, 193, 7, 0.9)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.25rem, 2.5vw, 1.75rem)",
      marginBottom: "clamp(1.5rem, 3vh, 2rem)",
      color: "white",
      boxShadow: "0 1rem 3rem rgba(255, 193, 7, 0.3)",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
      position: "relative" as const,
      overflow: "hidden" as const,
    },
    customPollTitle: {
      fontSize: "clamp(1rem, 2vw, 1.25rem)",
      fontWeight: "700",
      marginBottom: "clamp(1.5rem, 2.5vh, 1.75rem)",
      color: "#1A252F",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
      lineHeight: "1.1",
      whiteSpace: "nowrap" as const,
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
    },
    customPollOptions: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "clamp(0.75rem, 1.5vh, 1rem)",
      marginBottom: "clamp(1.5rem, 2.5vh, 2rem)",
      flex: 1,
    },
    customPollOption: {
      background: "rgba(26, 37, 47, 0.8)",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "clamp(0.5rem, 1.5vw, 0.75rem)",
      padding: "clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center" as const,
    },
    customPollOptionHover: {
      background: "rgba(76, 175, 80, 0.9)",
      borderColor: "#4CAF50",
      transform: "scale(1.02)",
      boxShadow: "0 0.5rem 1rem rgba(76, 175, 80, 0.4)",
    },
    customPollOptionText: {
      fontSize: "clamp(0.875rem, 1.8vw, 1rem)",
      fontWeight: "600",
      color: "white",
      margin: 0,
      flex: 1,
    },
    customPollResults: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "clamp(0.75rem, 1.5vh, 1rem)",
      flex: 1,
      marginBottom: "clamp(1.5rem, 2.5vh, 2rem)",
    },
    customPollResultItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "rgba(26, 37, 47, 0.8)",
      borderRadius: "clamp(0.5rem, 1vw, 0.75rem)",
      padding: "clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    customPollResultText: {
      display: "flex",
      alignItems: "center",
      fontSize: "clamp(0.875rem, 2vw, 1rem)",
      fontWeight: "600",
      color: "white",
      flex: 1,
    },
    customPollResultPercentage: {
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      fontWeight: "700",
      color: "#4CAF50",
      flexShrink: 0,
    },
    customPollInfo: {
      fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
      color: "#1A252F",
      marginTop: "clamp(1rem, 2vh, 1.25rem)",
      opacity: 0.8,
      textAlign: "center" as const,
    },
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
      <div style={styles.content} className="mobile-landscape-content">
        {/* Hero Section */}
        <div style={styles.heroSection} className="mobile-hero-section mobile-landscape-hero mobile-small-hero">
          <div style={styles.heroAccent}></div>
          <h1 style={styles.heroTitle} className="mobile-title-readable">
            Bem-vindo, {user?.username}!
          </h1>
          <p style={styles.heroSubtitle} className="mobile-text-readable">
            Centro de Comando do CS Marítimo Fans
          </p>
        </div>

        <div style={styles.mainGrid} className="mobile-main-grid mobile-landscape-main-grid">
          {/* Main Content */}
          <div style={styles.mainContent}>
            {/* Top Voted Players Section */}
            <div style={styles.section} className="mobile-section-padding mobile-small-section-padding">
              <div style={styles.sectionHeader}>
                <div style={styles.sectionHeaderLeft}>
                  <h2 style={styles.sectionTitle} className="mobile-title-readable">
                    Jogadores Mais Votados para Sair
                  </h2>
                  <div style={styles.totalVotesDisplay}>
                    <span style={styles.totalVotesLabel} className="mobile-text-readable">Total de Votos:</span>
                    <span style={styles.totalVotesValue} className="mobile-text-readable">{totalVotes.toLocaleString()}</span>
                  </div>
                </div>
                <div style={styles.sectionTitleUnderline}></div>
              </div>

              <LayoutStabilizer minHeight="400px" className="layout-stable">
                <div style={styles.playersGrid} className="mobile-players-grid mobile-landscape-players-grid mobile-small-players-grid mobile-small-landscape-players-grid">
                  {topVotedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      style={styles.playerCard}
                      className="hover-card layout-stable touch-friendly-card"
                    >
                      <div style={styles.playerRankBadge}>#{index + 1}</div>
                      <LayoutStabilizer 
                        style={styles.playerImageContainer}
                        aspectRatio="1"
                        className="image-container"
                      >
                        <PlayerImage
                          imageUrl={player.image_url}
                          playerName={player.name}
                          style={styles.playerImage}
                          loading="lazy"
                          width="88"
                          height="88"
                          showFallbackText={true}
                        />
                      </LayoutStabilizer>
                      <h3 style={styles.playerName}>{player.name}</h3>
                      <p style={styles.playerPosition}>{player.position}</p>
                      <div style={styles.votePercentage}>
                        {calculatePercentage(player.vote_count)}%
                      </div>
                    </div>
                  ))}
                </div>
              </LayoutStabilizer>

              <div style={styles.buttonContainer}>
                <button
                  style={styles.actionButton}
                  className="hover-button touch-friendly-button mobile-button-readable"
                  onClick={() => navigate("/voting")}
                >
                  Votar Agora
                </button>
              </div>
            </div>

            {/* Transfer Rumors Section */}
            <div style={styles.section} className="mobile-section-padding mobile-small-section-padding">
              <div style={styles.sectionHeader}>
                <div style={styles.sectionHeaderLeft}>
                  <h2 style={styles.sectionTitle} className="mobile-title-readable">
                    Rumores de Transferências
                  </h2>
                  <div style={styles.transferStatsDisplay}>
                    <div style={styles.transferStat}>
                      <span style={styles.transferStatLabel} className="mobile-text-readable">Transferências Ativas:</span>
                      <span style={styles.transferStatValue} className="mobile-text-readable">{transferRumors.length}</span>
                    </div>
                    {transferStats && (
                      <div style={styles.transferStat}>
                        <span style={styles.transferStatLabel} className="mobile-text-readable">Confiabilidade Média:</span>
                        <span style={styles.transferStatValue} className="mobile-text-readable">{transferStats.averageReliability}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  style={styles.refreshButton}
                  className="hover-refresh touch-friendly-button mobile-button-readable"
                  onClick={handleRefreshRumors}
                  disabled={loadingRumors}
                >
                  
                  {loadingRumors ? "A atualizar..." : "Atualizar"}
                </button>
                <div style={styles.sectionTitleUnderline}></div>
              </div>

              {lastRumorUpdate && (
                <div style={styles.updateInfo}>
                  Última atualização: {lastRumorUpdate.toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              )}

              {transferRumors.length === 0 ? (
                <div style={styles.updateInfo}>
                  Nenhum rumor de transferência disponível no momento.
                </div>
              ) : (
                transferRumors.map((rumor) => (
                  <div
                    key={rumor.id}
                    style={styles.transferCard}
                    className="hover-transfer-card mobile-transfer-card touch-friendly-card"
                  >
                    <div style={styles.transferHeader} className="mobile-transfer-header mobile-landscape-transfer-header">
                      <div style={styles.transferPlayer} className="mobile-text-readable">
                        {rumor.player_name}
                      </div>
                      <div
                        style={{
                          ...styles.transferType,
                          backgroundColor: getTypeColor(rumor.type),
                        }}
                        className="mobile-text-readable"
                      >
                        {rumor.type}
                      </div>
                    </div>
                    
                    <div style={styles.transferDetails} className="mobile-transfer-details mobile-landscape-transfer-details">
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
                        {formatDate(rumor.date)}
                      </span>
                    </div>

                    <div style={styles.transferMeta}>
                      <span style={styles.transferSource}>
                        Fonte: {rumor.source}
                      </span>
                      <span
                        style={{
                          ...styles.reliabilityBadge,
                          backgroundColor: getReliabilityColor(rumor.reliability),
                        }}
                      >
                        {getReliabilityText(rumor.reliability)}
                      </span>
                    </div>

                    {rumor.description && (
                      <div style={{
                        marginTop: "clamp(0.5rem, 1vh, 0.75rem)",
                        fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)",
                        color: "#B0BEC5",
                        fontStyle: "italic",
                        lineHeight: "1.4"
                      }}>
                        {rumor.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar} className="mobile-sidebar">
            {/* Maritodle Game Section */}
            <div style={styles.gameCard} className="touch-friendly-card">
              <div style={styles.gameHeader}>
                <h3 style={styles.gameTitle}>Maritodle</h3>
                <div style={styles.gameBadge}>Novo!</div>
              </div>
              <p style={styles.gameDescription}>
                Adivinha o jogador ou treinador do CS Marítimo! 
                Um jogo inspirado no Wordle.
              </p>
              <div style={styles.gameFeatures}>
                <div style={styles.gameFeature}>
                  <span style={styles.gameFeatureIcon}>•</span>
                  <span style={styles.gameFeatureText}>Tentativas ilimitadas</span>
                </div>
                <div style={styles.gameFeature}>
                  <span style={styles.gameFeatureIcon}>•</span>
                  <span style={styles.gameFeatureText}>Pistas após 6 e 9 tentativas</span>
                </div>
                <div style={styles.gameFeature}>
                  <span style={styles.gameFeatureIcon}>•</span>
                  <span style={styles.gameFeatureText}>9 atributos para comparar</span>
                </div>
              </div>
              <button
                style={styles.gameButton}
                className="hover-button touch-friendly-button mobile-button-readable"
                onClick={() => navigate("/maritodle")}
              >
                Jogar Maritodle
              </button>
            </div>

            {/* Poll Section */}
            <div style={styles.pollCard} className="touch-friendly-card">
              {!hasVoted ? (
                /* Front of card - Poll */
                <div>
                  <h3 style={styles.pollTitle} className="mobile-poll-title mobile-title-readable">
                    Que posição deveríamos reforçar?
                  </h3>
                  
                  <div style={styles.positionsList}>
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        style={{
                          ...styles.positionOption,
                          ...(selectedPositions.includes(position.id) ? styles.positionSelected : {})
                        }}
                        onClick={() => handlePositionToggle(position.id)}
                        className={`hover-position touch-friendly ${selectedPositions.includes(position.id) ? 'selected' : ''}`}
                      >
                        <span style={styles.positionName}>{position.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    style={{
                      ...styles.pollSubmitButton,
                      ...(selectedPositions.length === 0 ? styles.pollSubmitDisabled : {})
                    }}
                    onClick={handleSubmitPoll}
                    disabled={selectedPositions.length === 0}
                    className="hover-button touch-friendly-button mobile-button-readable"
                  >
                    Submeter Resposta
                  </button>
                  
                  <p style={styles.pollInfo}>
                    Selecione uma ou mais posições
                  </p>
                </div>
              ) : (
                /* Back of card - Results */
                <div>
                  <h3 style={styles.pollTitle} className="mobile-poll-title mobile-title-readable">
                    Resultados da Poll
                  </h3>
                  
                  <div style={styles.resultsList}>
                    {positions
                      .sort((a, b) => (pollResults[b.id] || 0) - (pollResults[a.id] || 0))
                      .map((position) => (
                        <div key={position.id} style={styles.resultItem}>
                          <div style={styles.resultPosition}>
                            <span>{position.name}</span>
                          </div>
                          <span style={styles.resultPercentage}>
                            {calculatePollPercentage(pollResults[position.id] || 0)}%
                          </span>
                        </div>
                      ))}
                  </div>
                  
                  <p style={styles.pollInfo}>
                    Total de votos: {totalPollVotes}
                  </p>
                </div>
              )}
            </div>

            {/* Custom Polls Section */}
            {customPolls.map((poll) => (
              <div key={poll.id} style={customPollStyles.customPollCard} className="touch-friendly-card">
                <h3 style={customPollStyles.customPollTitle} className="mobile-custom-poll-title mobile-title-readable">
                  {poll.title}
                </h3>
                
                {poll.user_voted_option !== undefined ? (
                  /* Show results if user has voted */
                  <div>
                    <div style={customPollStyles.customPollResults}>
                      {poll.options.map((option, index) => (
                        <div key={index} style={customPollStyles.customPollResultItem}>
                          <div style={customPollStyles.customPollResultText}>
                            <span>{option}</span>
                            {poll.user_voted_option === index && " ✓"}
                          </div>
                          <span style={customPollStyles.customPollResultPercentage}>
                            {calculateCustomPollPercentage(poll.votes[index] || 0, poll.total_votes)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <p style={customPollStyles.customPollInfo}>
                      Total de votos: {poll.total_votes}
                    </p>
                  </div>
                ) : (
                  /* Show voting options if user hasn't voted */
                  <div>
                    <div style={customPollStyles.customPollOptions}>
                      {poll.options.map((option, index) => (
                        <div
                          key={index}
                          style={customPollStyles.customPollOption}
                          onClick={() => handleCustomPollVote(poll.id, index)}
                          className="hover-position touch-friendly"
                        >
                          <span style={customPollStyles.customPollOptionText}>
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p style={customPollStyles.customPollInfo}>
                      Clique numa opção para votar
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
