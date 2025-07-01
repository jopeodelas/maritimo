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

  const fetchTopVotedPlayers = async () => {
    try {
      const response = await api.get('/players/top-voted');
      setTopVotedPlayers(response.data.players);
      setTotalVotes(response.data.totalVotes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching top voted players:', error);
      setLoading(false);
    }
  };

  const fetchTransferRumors = async () => {
    try {
      setLoadingRumors(true);
      const rumors = await transferService.getRumors();
      setTransferRumors(rumors);
      setLastRumorUpdate(new Date());
    } catch (error) {
      console.error('Error fetching transfer rumors:', error);
    } finally {
      setLoadingRumors(false);
    }
  };

  const fetchTransferStats = async () => {
    try {
      const stats = await transferService.getStats();
      setTransferStats(stats);
    } catch (error) {
      console.error('Error fetching transfer stats:', error);
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
      console.error('Error refreshing rumors:', error);
    } finally {
      setLoadingRumors(false);
    }
  };

  const checkPollVoteStatus = async () => {
    try {
      const response = await api.get('/polls/status');
      setHasVoted(response.data.hasVoted);
      if (response.data.hasVoted) {
        setPollResults(response.data.results);
        setTotalPollVotes(response.data.totalVotes);
      }
    } catch (error) {
      console.error('Error checking poll status:', error);
    }
  };

  const fetchCustomPolls = async () => {
    try {
      const response = await api.get('/polls/custom');
      setCustomPolls(response.data.polls);
    } catch (error) {
      console.error('Error fetching custom polls:', error);
    }
  };

  const handleCustomPollVote = async (pollId: number, optionIndex: number) => {
    try {
      await api.post(`/polls/custom/${pollId}/vote`, { optionIndex });
      // Refresh polls to get updated results
      fetchCustomPolls();
    } catch (error) {
      console.error('Error voting in custom poll:', error);
    }
  };

  const calculatePercentage = (votes: number) => {
    if (!totalVotes) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const calculateCustomPollPercentage = (votes: number, totalVotes: number) => {
    if (!totalVotes) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const handlePositionSelect = (position: string) => {
    if (selectedPositions.includes(position)) {
      setSelectedPositions(selectedPositions.filter(p => p !== position));
    } else {
      setSelectedPositions([...selectedPositions, position]);
    }
  };

  const handlePollSubmit = async () => {
    try {
      await api.post('/polls/vote', { positions: selectedPositions });
      setHasVoted(true);
      const results = await api.get('/polls/results');
      setPollResults(results.data.results);
      setTotalPollVotes(results.data.totalVotes);
    } catch (error) {
      console.error('Error submitting poll vote:', error);
    }
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

                <div className="mainpage-players-grid">
                  {topVotedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="mainpage-player-card hover-card layout-stable"
                    >
                      <div className="mainpage-player-rank-badge">#{index + 1}</div>
                      <LayoutStabilizer 
                        className="mainpage-player-image-container image-container"
                        aspectRatio="1"
                      >
                        <PlayerImage
                          imageUrl={player.image_url}
                          playerName={player.name}
                          className="mainpage-player-image"
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

                <div className="mainpage-button-container">
                  <button
                    className="mainpage-action-button hover-button"
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
                      {transferStats && (
                        <div className="mainpage-transfer-stat">
                          <span className="mainpage-transfer-stat-label">Transferências Ativas:</span>
                          <span className="mainpage-transfer-stat-value">{transferStats.activeRumors}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="mainpage-refresh-button hover-button"
                    onClick={handleRefreshRumors}
                    disabled={loadingRumors}
                  >
                    {loadingRumors ? "A atualizar..." : "Atualizar"}
                  </button>
                </div>

                {lastRumorUpdate && (
                  <p className="mainpage-update-info">
                    Última atualização: {lastRumorUpdate.toLocaleTimeString()}
                  </p>
                )}

                {transferRumors.map((rumor) => (
                  <div key={rumor.id} className="mainpage-transfer-card hover-card">
                    <div className="mainpage-transfer-header">
                      <h3 className="mainpage-transfer-player">{rumor.player_name}</h3>
                      <div className="mainpage-transfer-type">{rumor.type}</div>
                    </div>

                    <div className="mainpage-transfer-details">
                      <div className="mainpage-transfer-info">
                        <div className="mainpage-transfer-club">{rumor.club}</div>
                        <div className="mainpage-transfer-value">{rumor.value}</div>
                      </div>
                      <div className="mainpage-transfer-status">{rumor.status}</div>
                      <div className="mainpage-transfer-date">{rumor.date}</div>
                    </div>

                    <div className="mainpage-transfer-meta">
                      <div className="mainpage-transfer-source">{rumor.source}</div>
                      <div className="mainpage-reliability-badge">{rumor.reliability}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile: Game Card */}
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
                    className="mainpage-game-button hover-button"
                    onClick={() => navigate("/maritodle")}
                  >
                    Jogar Maritodle
                  </button>
                </div>
              )}

              {/* Mobile: Custom Polls */}
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
                          <button
                            key={index}
                            className={`mainpage-custom-poll-option ${
                              selectedPositions.includes(option) ? 'mainpage-custom-poll-option-hover' : ''
                            }`}
                            onClick={() => handleCustomPollVote(poll.id, index)}
                          >
                            <span className="mainpage-custom-poll-option-text">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className={`mainpage-sidebar ${isMobile ? 'hidden' : ''}`}>
              {/* Maritodle Game Section - Desktop */}
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
                  className="mainpage-game-button hover-button"
                  onClick={() => navigate("/maritodle")}
                >
                  Jogar Maritodle
                </button>
              </div>

              {/* Stats Card */}
              <div className="mainpage-stats-card">
                <h3 className="mainpage-stats-title">Estatísticas</h3>
                <div className="mainpage-stat-item">
                  <span className="mainpage-stat-label">Votos Únicos</span>
                  <span className="mainpage-stat-value">{totalVotes}</span>
                </div>
                {transferStats && (
                  <>
                    <div className="mainpage-stat-item">
                      <span className="mainpage-stat-label">Rumores Ativos</span>
                      <span className="mainpage-stat-value">{transferStats.activeRumors}</span>
                    </div>
                    <div className="mainpage-stat-item">
                      <span className="mainpage-stat-label">Total de Rumores</span>
                      <span className="mainpage-stat-value">{transferStats.totalRumors}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Poll Section */}
              <div className="mainpage-poll-card">
                <h3 className="mainpage-poll-title">
                  Que posição precisa de reforços?
                </h3>
                
                {hasVoted ? (
                  <div>
                    <div className="mainpage-results-list">
                      {Object.entries(pollResults).map(([position, votes]) => (
                        <div key={position} className="mainpage-result-item">
                          <div className="mainpage-result-position">
                            <span>{position}</span>
                          </div>
                          <span className="mainpage-result-percentage">
                            {((votes / totalPollVotes) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mainpage-poll-info">
                      Total de votos: {totalPollVotes}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mainpage-positions-list">
                      {['GR', 'DF', 'MD', 'AV'].map((position) => (
                        <button
                          key={position}
                          className={`mainpage-position-option ${
                            selectedPositions.includes(position) ? 'mainpage-position-selected' : ''
                          }`}
                          onClick={() => handlePositionSelect(position)}
                        >
                          <span className="mainpage-position-name">{position}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      className={`mainpage-poll-submit-button ${
                        selectedPositions.length === 0 ? 'mainpage-poll-submit-disabled' : ''
                      }`}
                      onClick={handlePollSubmit}
                      disabled={selectedPositions.length === 0}
                    >
                      Votar
                    </button>
                  </div>
                )}
              </div>

              {/* Custom Polls - Desktop */}
              {customPolls.map((poll) => (
                <div key={poll.id} className="mainpage-custom-poll-card">
                  <h3 className="mainpage-custom-poll-title">
                    {poll.title}
                  </h3>
                  
                  {poll.user_voted_option !== undefined ? (
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
                    <div>
                      <div className="mainpage-custom-poll-options">
                        {poll.options.map((option, index) => (
                          <button
                            key={index}
                            className={`mainpage-custom-poll-option ${
                              selectedPositions.includes(option) ? 'mainpage-custom-poll-option-hover' : ''
                            }`}
                            onClick={() => handleCustomPollVote(poll.id, index)}
                          >
                            <span className="mainpage-custom-poll-option-text">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MainPage;
