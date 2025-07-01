import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import PlayerImage from "../components/PlayerImage";
import LayoutStabilizer from "../components/LayoutStabilizer";
import useIsMobile from "../hooks/useIsMobile";
import api from "../services/api";
import transferService from "../services/transferService";
import type { TransferRumor, TransferStats } from "../services/transferService";
import type { Player } from "../types";
import '../styles/AllpagesStyles.css';

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
  const isMobile = useIsMobile();
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

  if (loading) {
    return (
      <PageLayout>
        <div className="mainpage-container">
          <div className="mainpage-background-pattern"></div>
          <div className="mainpage-content">
            <div className="mainpage-loading">A carregar dados do Marítimo...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mainpage-container">
        <div className="mainpage-background-pattern"></div>
        <div className="mainpage-content">
        {/* Hero Section */}
        <div className="mainpage-hero-section">
          <div className="mainpage-hero-accent"></div>
          <h1 className="mainpage-hero-title">
            Bem-vindo, {user?.username}!
          </h1>
          <p className="mainpage-hero-subtitle">
            Centro de Comando do CS Marítimo Fans
          </p>
        </div>

        <div className="mainpage-main-grid">
          {/* Main Content */}
          <div className="mainpage-main-content">
            {/* Top Voted Players Section */}
            <div className="mainpage-section">
              <div className="mainpage-section-header">
                <div className="mainpage-section-header-left">
                  <h2 className="mainpage-section-title">
                    Jogadores Mais Votados para Sair
                  </h2>
                  <div className="mainpage-total-votes-display">
                    <span className="mainpage-total-votes-label">Total de Votos:</span>
                    <span className="mainpage-total-votes-value">{totalVotes.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mainpage-section-title-underline"></div>
              </div>

              <LayoutStabilizer minHeight="400px" className="layout-stable">
                <div className="mainpage-players-grid">
                  {topVotedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="mainpage-player-card layout-stable hover-card"
                    >
                      <div className="mainpage-player-rank-badge">{index + 1}</div>
                      <LayoutStabilizer 
                        className="image-container"
                      >
                        <PlayerImage
                          imageUrl={player.image_url}
                          playerName={player.name}
                          loading="lazy"
                          width="88"
                          height="88"
                          showFallbackText={true}
                        />
                      </LayoutStabilizer>
                      <h3 className="mainpage-player-name">{player.name}</h3>
                      <p className="mainpage-player-position">{player.position}</p>
                      <div className="mainpage-vote-percentage">
                        {calculatePercentage(player.vote_count)}%
                      </div>
                    </div>
                  ))}
                </div>
              </LayoutStabilizer>

              <div className="mainpage-button-container">
                <button
                  className="hover-button"
                  onClick={() => navigate("/voting")}
                >
                  Votar Agora
                </button>
              </div>
            </div>

            {/* Transfer Rumors Section */}
            <div className="mainpage-section">
              <div className="mainpage-section-header">
                <div className="mainpage-section-header-left">
                  <h2 className="mainpage-section-title">
                    Rumores de Transferências
                  </h2>
                  <div className="mainpage-transfer-stats-display">
                    <div className="mainpage-transfer-stat">
                      <span className="mainpage-transfer-stat-label">Transferências Ativas:</span>
                      <span className="mainpage-transfer-stat-value">{transferRumors.length}</span>
                    </div>
                    {transferStats && (
                      <div className="mainpage-transfer-stat">
                        <span className="mainpage-transfer-stat-label">Confiabilidade Média:</span>
                        <span className="mainpage-transfer-stat-value">{transferStats.averageReliability}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="hover-refresh"
                  onClick={handleRefreshRumors}
                  disabled={loadingRumors}
                >
                  
                  {loadingRumors ? "A atualizar..." : "Atualizar"}
                </button>
                <div className="mainpage-section-title-underline"></div>
              </div>

              {lastRumorUpdate && (
                <div className="mainpage-update-info">
                  Última atualização: {lastRumorUpdate.toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              )}

              {transferRumors.length === 0 ? (
                <div className="mainpage-update-info">
                  Nenhum rumor de transferência disponível no momento.
                </div>
              ) : (
                transferRumors.map((rumor) => (
                  <div
                    key={rumor.id}
                    className="mainpage-transfer-card hover-transfer-card"
                  >
                    <div className="mainpage-transfer-header">
                      <div className="mainpage-transfer-player">
                        {rumor.player_name}
                      </div>
                      <div
                        className={`mainpage-transfer-type ${getTypeColor(rumor.type)}`}
                      >
                        {rumor.type}
                      </div>
                    </div>
                    
                    <div className="mainpage-transfer-details">
                      <div className="mainpage-transfer-info">
                        <span className="mainpage-transfer-club">
                          {rumor.type === "compra" ? "De: " : "Para: "}
                          {rumor.club}
                        </span>
                        <span className="mainpage-transfer-value">{rumor.value}</span>
                      </div>
                      <span
                        className={`mainpage-transfer-status ${getStatusColor(rumor.status)}`}
                      >
                        {rumor.status}
                      </span>
                      <span className="mainpage-transfer-date">
                        {formatDate(rumor.date)}
                      </span>
                    </div>

                    <div className="mainpage-transfer-meta">
                      <span className="mainpage-transfer-source">
                        Fonte: {rumor.source}
                      </span>
                      <span
                        className={`mainpage-reliability-badge ${getReliabilityColor(rumor.reliability)}`}
                      >
                        {getReliabilityText(rumor.reliability)}
                      </span>
                    </div>

                    {rumor.description && (
                      <div className="mainpage-transfer-description">
                        {rumor.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Mobile: Maritodle Game Section movido para o main content */}
            {isMobile && (
              <div className="mainpage-game-card">
                <div className="mainpage-game-header">
                  <h3 className="mainpage-game-title">Maritodle</h3>
                  <div className="mainpage-game-badge">Novo!</div>
                </div>
                <p className="mainpage-game-description">
                  Adivinha o jogador do CS Marítimo diáriamente! 
                  Um jogo inspirado no Wordle.
                </p>
                <div className="mainpage-game-features">
                  <div className="mainpage-game-feature">
                    <span className="mainpage-game-feature-icon">•</span>
                    <span className="mainpage-game-feature-text">Tentativas ilimitadas</span>
                  </div>
                  <div className="mainpage-game-feature">
                    <span className="mainpage-game-feature-icon">•</span>
                    <span className="mainpage-game-feature-text">Pistas após 6 e 9 tentativas</span>
                  </div>
                  <div className="mainpage-game-feature">
                    <span className="mainpage-game-feature-icon">•</span>
                    <span className="mainpage-game-feature-text">9 atributos para comparar</span>
                  </div>
                </div>
                <button
                  className="hover-button"
                  onClick={() => navigate("/maritodle")}
                >
                  Jogar Maritodle
                </button>
              </div>
            )}

            {/* Mobile: Poll Section movido para o main content */}
            {isMobile && (
              <div className="mainpage-poll-card">
                {!hasVoted ? (
                  /* Front of card - Poll */
                  <div>
                    <h3 className="mainpage-poll-title">
                      Que posição deveríamos reforçar?
                    </h3>
                    
                    <div className="mainpage-positions-list">
                      {positions.map((position) => (
                        <div
                          key={position.id}
                          className={`mainpage-position-option ${selectedPositions.includes(position.id) ? 'mainpage-position-selected' : ''}`}
                          onClick={() => handlePositionToggle(position.id)}
                        >
                          <span className="mainpage-position-name">{position.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      className={`mainpage-poll-submit-button ${selectedPositions.length === 0 ? 'mainpage-poll-submit-disabled' : ''}`}
                      onClick={handleSubmitPoll}
                      disabled={selectedPositions.length === 0}
                    >
                      Submeter Resposta
                    </button>
                    
                    <p className="mainpage-poll-info">
                      Selecione uma ou mais posições
                    </p>
                  </div>
                ) : (
                  /* Back of card - Results */
                  <div>
                    <h3 className="mainpage-poll-title">
                      Resultados da Poll
                    </h3>
                    
                    <div className="mainpage-results-list">
                      {positions
                        .sort((a, b) => (pollResults[b.id] || 0) - (pollResults[a.id] || 0))
                        .map((position) => (
                          <div key={position.id} className="mainpage-result-item">
                            <div className="mainpage-result-position">
                              <span>{position.name}</span>
                            </div>
                            <span className="mainpage-result-percentage">
                              {calculatePollPercentage(pollResults[position.id] || 0)}%
                            </span>
                          </div>
                        ))}
                    </div>
                    
                    <p className="mainpage-poll-info">
                      Total de votos: {totalPollVotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile: Custom Polls Section movido para o main content */}
            {isMobile && customPolls.map((poll) => (
              <div key={poll.id} className="mainpage-custom-poll-card">
                <h3 className="mainpage-custom-poll-title">
                  {poll.title}
                </h3>
                
                {poll.user_voted_option !== undefined ? (
                  /* Show results if user has voted */
                  <div>
                    <div className="mainpage-custom-poll-results">
                      {poll.options.map((option, index) => (
                        <div key={index} className="mainpage-custom-poll-result-item">
                          <div className="mainpage-custom-poll-result-text">
                            <span>{option}</span>
                            {poll.user_voted_option === index && " ✓"}
                          </div>
                          <span className="mainpage-custom-poll-result-percentage">
                            {calculateCustomPollPercentage(poll.votes[index] || 0, poll.total_votes)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mainpage-custom-poll-info">
                      Total de votos: {poll.total_votes}
                    </p>
                  </div>
                ) : (
                  /* Show voting options if user hasn't voted */
                  <div>
                    <div className="mainpage-custom-poll-options">
                      {poll.options.map((option, index) => (
                        <div
                          key={index}
                          className="mainpage-custom-poll-option"
                          onClick={() => handleCustomPollVote(poll.id, index)}
                        >
                          <span className="mainpage-custom-poll-option-text">
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mainpage-custom-poll-info">
                      Clique numa opção para votar
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar - Only visible on desktop */}
          <div className={`mainpage-sidebar ${isMobile ? 'hidden' : ''}`}>
            {/* Maritodle Game Section - Movido para primeiro na desktop */}
            <div className="mainpage-game-card">
              <div className="mainpage-game-header">
                <h3 className="mainpage-game-title">Maritodle</h3>
                <div className="mainpage-game-badge">Novo!</div>
              </div>
              <p className="mainpage-game-description">
                Adivinha o jogador do CS Marítimo diáriamente! 
                Um jogo inspirado no Wordle.
              </p>
              <div className="mainpage-game-features">
                <div className="mainpage-game-feature">
                  <span className="mainpage-game-feature-icon">•</span>
                  <span className="mainpage-game-feature-text">Tentativas ilimitadas</span>
                </div>
                <div className="mainpage-game-feature">
                  <span className="mainpage-game-feature-icon">•</span>
                  <span className="mainpage-game-feature-text">Pistas após 6 e 9 tentativas</span>
                </div>
                <div className="mainpage-game-feature">
                  <span className="mainpage-game-feature-icon">•</span>
                  <span className="mainpage-game-feature-text">9 atributos para comparar</span>
                </div>
              </div>
              <button
                className="hover-button"
                onClick={() => navigate("/maritodle")}
              >
                Jogar Maritodle
              </button>
            </div>

            {/* Poll Section */}
            <div className="mainpage-poll-card">
              {!hasVoted ? (
                /* Front of card - Poll */
                <div>
                  <h3 className="mainpage-poll-title">
                    Que posição deveríamos reforçar?
                  </h3>
                  
                  <div className="mainpage-positions-list">
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className={`mainpage-position-option ${selectedPositions.includes(position.id) ? 'mainpage-position-selected' : ''}`}
                        onClick={() => handlePositionToggle(position.id)}
                      >
                        <span className="mainpage-position-name">{position.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className={`mainpage-poll-submit-button ${selectedPositions.length === 0 ? 'mainpage-poll-submit-disabled' : ''}`}
                    onClick={handleSubmitPoll}
                    disabled={selectedPositions.length === 0}
                  >
                    Submeter Resposta
                  </button>
                  
                  <p className="mainpage-poll-info">
                    Selecione uma ou mais posições
                  </p>
                </div>
              ) : (
                /* Back of card - Results */
                <div>
                  <h3 className="mainpage-poll-title">
                    Resultados da Poll
                  </h3>
                  
                  <div className="mainpage-results-list">
                    {positions
                      .sort((a, b) => (pollResults[b.id] || 0) - (pollResults[a.id] || 0))
                      .map((position) => (
                        <div key={position.id} className="mainpage-result-item">
                          <div className="mainpage-result-position">
                            <span>{position.name}</span>
                          </div>
                          <span className="mainpage-result-percentage">
                            {calculatePollPercentage(pollResults[position.id] || 0)}%
                          </span>
                        </div>
                      ))}
                  </div>
                  
                  <p className="mainpage-poll-info">
                    Total de votos: {totalPollVotes}
                  </p>
                </div>
              )}
            </div>

            {/* Custom Polls Section */}
            {customPolls.map((poll) => (
              <div key={poll.id} className="mainpage-custom-poll-card">
                <h3 className="mainpage-custom-poll-title">
                  {poll.title}
                </h3>
                
                {poll.user_voted_option !== undefined ? (
                  /* Show results if user has voted */
                  <div>
                    <div className="mainpage-custom-poll-results">
                      {poll.options.map((option, index) => (
                        <div key={index} className="mainpage-custom-poll-result-item">
                          <div className="mainpage-custom-poll-result-text">
                            <span>{option}</span>
                            {poll.user_voted_option === index && " ✓"}
                          </div>
                          <span className="mainpage-custom-poll-result-percentage">
                            {calculateCustomPollPercentage(poll.votes[index] || 0, poll.total_votes)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mainpage-custom-poll-info">
                      Total de votos: {poll.total_votes}
                    </p>
                  </div>
                ) : (
                  /* Show voting options if user hasn't voted */
                  <div>
                    <div className="mainpage-custom-poll-options">
                      {poll.options.map((option, index) => (
                        <div
                          key={index}
                          className="mainpage-custom-poll-option"
                          onClick={() => handleCustomPollVote(poll.id, index)}
                        >
                          <span className="mainpage-custom-poll-option-text">
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mainpage-custom-poll-info">
                      Clique numa opção para votar
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MainPage;
