import { useState, useEffect } from 'react';
import { createStyles } from '../styles/styleUtils';
import PlayerImage from './PlayerImage';
import api from '../services/api';
import * as matchService from '../services/matchService';
import type { Player, MatchVoting } from '../types';

const PlayerRatingsAdmin = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [activeVoting, setActiveVoting] = useState<MatchVoting | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form states
  const [homeTeam, setHomeTeam] = useState('CS Marítimo');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchPlayers();
    fetchActiveVoting();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/players');
      // Fix: The API returns { players: [...], totalUniqueVoters: number }
      setPlayers(response.data.players || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchActiveVoting = async () => {
    try {
      const response = await api.get('/player-ratings/active-voting');
      setActiveVoting(response.data);
    } catch (error) {
      console.error('Error fetching active voting:', error);
    }
  };

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const selectAllPlayers = () => {
    setSelectedPlayers(players.map(p => p.id));
  };

  const deselectAllPlayers = () => {
    setSelectedPlayers([]);
  };

  const createVoting = async () => {
    if (!awayTeam.trim()) {
      alert('Por favor, insira o nome da equipa adversária');
      return;
    }

    if (selectedPlayers.length === 0) {
      alert('Por favor, selecione pelo menos um jogador');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/player-ratings/admin/create-voting', {
        home_team: homeTeam,
        away_team: awayTeam,
        match_date: matchDate,
        player_ids: selectedPlayers
      });

      if (response.data.success) {
        alert('Votação criada com sucesso!');
        setAwayTeam('');
        setSelectedPlayers([]);
        fetchActiveVoting();
      }
    } catch (error: any) {
      console.error('Error creating voting:', error);
      alert(error.response?.data?.error || 'Erro ao criar votação');
    } finally {
      setCreating(false);
    }
  };

  const endVoting = async () => {
    if (!confirm('Tem certeza que quer terminar a votação ativa?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/player-ratings/admin/end-voting');
      
      if (response.data.success) {
        alert('Votação terminada com sucesso!');
        fetchActiveVoting();
      }
    } catch (error: any) {
      console.error('Error ending voting:', error);
      alert(error.response?.data?.error || 'Erro ao terminar votação');
    } finally {
      setLoading(false);
    }
  };

  const createAutoVoting = async () => {
    setCreating(true);
    try {
      const result = await matchService.createAutoVotingFromLastMatch();
      
      if (result.success) {
        alert(result.message);
        fetchActiveVoting();
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error('Error creating auto voting:', error);
      alert('Erro ao criar votação automática');
    } finally {
      setCreating(false);
    }
  };

  const styles = createStyles({
    container: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(0, 151, 89, 0.3)",
      borderRadius: "1rem",
      padding: "2rem",
      backdropFilter: "blur(10px)",
      boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.3)",
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: "800",
      color: "#FFD700",
      marginBottom: "1.5rem",
      textAlign: "center",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    },
    activeVotingCard: {
      background: "rgba(244, 67, 54, 0.1)",
      border: "1px solid rgba(244, 67, 54, 0.3)",
      borderRadius: "0.8rem",
      padding: "1.5rem",
      marginBottom: "2rem",
      color: "white",
    },
    votingInfo: {
      fontSize: "1.1rem",
      marginBottom: "1rem",
      color: "#FFD700",
      fontWeight: "600",
    },
    endButton: {
      background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
      color: "white",
      border: "none",
      padding: "0.8rem 1.5rem",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    label: {
      color: "#FFD700",
      fontSize: "1rem",
      fontWeight: "600",
    },
    input: {
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "0.5rem",
      padding: "0.8rem",
      color: "white",
      fontSize: "1rem",
    },
    formRow: {
      display: "flex",
      gap: "1rem",
    },
    playersSection: {
      marginBottom: "2rem",
    },
    sectionTitle: {
      fontSize: "1.3rem",
      fontWeight: "700",
      color: "#FFD700",
      marginBottom: "1rem",
    },
    playerControls: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1rem",
      flexWrap: "wrap",
    },
    controlButton: {
      background: "rgba(0, 151, 89, 0.8)",
      color: "white",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    playersGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "1rem",
      maxHeight: "400px",
      overflowY: "auto",
      padding: "0.5rem",
    },
    playerCard: {
      background: "rgba(255, 255, 255, 0.1)",
      border: "2px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "0.8rem",
      padding: "1rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
    },
    playerCardSelected: {
      background: "rgba(0, 151, 89, 0.3)",
      border: "2px solid #009759",
      boxShadow: "0 0 10px rgba(0, 151, 89, 0.5)",
    },
    playerImage: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid rgba(255, 255, 255, 0.3)",
    },
    playerName: {
      color: "white",
      fontSize: "0.9rem",
      fontWeight: "600",
      textAlign: "center",
    },
    playerPosition: {
      color: "#FFD700",
      fontSize: "0.8rem",
      fontWeight: "500",
    },
    createButton: {
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      color: "#000",
      border: "none",
      padding: "1rem 2rem",
      borderRadius: "0.8rem",
      fontSize: "1.1rem",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
          createButtonDisabled: {
        opacity: 0.5,
        cursor: "not-allowed",
      },
      autoCreateButton: {
        background: "linear-gradient(135deg, #4CAF50 0%, #009759 100%)",
        color: "white",
        border: "none",
        padding: "0.8rem 1.5rem",
        borderRadius: "0.8rem",
        fontSize: "1rem",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginBottom: "1rem",
        width: "100%",
      },
      divider: {
        border: "none",
        borderTop: "1px solid rgba(255, 255, 255, 0.2)",
        margin: "2rem 0",
      },
    selectedCount: {
      color: "#FFD700",
      fontSize: "1rem",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: "1rem",
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>Gestão de Avaliações de Jogadores</div>
      
      {activeVoting && (
        <div style={styles.activeVotingCard}>
          <div style={styles.votingInfo}>
            <strong>Votação Ativa:</strong> {activeVoting.home_team} vs {activeVoting.away_team}
          </div>
          <div style={styles.votingInfo}>
            <strong>Data:</strong> {new Date(activeVoting.match_date).toLocaleDateString('pt-PT')}
          </div>
          <div style={styles.votingInfo}>
            <strong>Jogadores:</strong> {activeVoting.players.length}
          </div>
          <button 
            style={styles.endButton}
            onClick={endVoting}
            disabled={loading}
          >
            {loading ? 'A terminar...' : 'Terminar Votação'}
          </button>
        </div>
      )}

      {!activeVoting && (
        <>
          <button
            style={styles.autoCreateButton}
            onClick={createAutoVoting}
            disabled={creating}
          >
            {creating ? 'A criar...' : 'Criar Votação Automática (Último Jogo: CS Marítimo vs FC Tondela)'}
          </button>
          
          <div style={styles.divider}></div>
          
          <div style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Equipa da Casa</label>
                <input
                  style={styles.input}
                  type="text"
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Equipa Visitante</label>
                <input
                  style={styles.input}
                  type="text"
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  placeholder="Ex: SL Benfica"
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Data do Jogo</label>
              <input
                style={styles.input}
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.playersSection}>
            <div style={styles.sectionTitle}>Selecionar Jogadores</div>
            
            <div style={styles.playerControls}>
              <button style={styles.controlButton} onClick={selectAllPlayers}>
                Selecionar Todos
              </button>
              <button style={styles.controlButton} onClick={deselectAllPlayers}>
                Desselecionar Todos
              </button>
            </div>

            <div style={styles.selectedCount}>
              Jogadores selecionados: {selectedPlayers.length}
            </div>

            <div style={styles.playersGrid}>
              {players.map(player => (
                <div
                  key={player.id}
                  style={{
                    ...styles.playerCard,
                    ...(selectedPlayers.includes(player.id) ? styles.playerCardSelected : {})
                  }}
                  onClick={() => togglePlayerSelection(player.id)}
                >
                  <PlayerImage
                    imageUrl={player.image_url}
                    playerName={player.name}
                    style={styles.playerImage}
                    showFallbackText={true}
                  />
                  <div style={styles.playerName}>{player.name}</div>
                  <div style={styles.playerPosition}>{player.position}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            style={{
              ...styles.createButton,
              ...(creating || !awayTeam || selectedPlayers.length === 0 ? styles.createButtonDisabled : {})
            }}
            onClick={createVoting}
            disabled={creating || !awayTeam || selectedPlayers.length === 0}
          >
            {creating ? 'A criar...' : 'Criar Votação'}
          </button>
        </>
      )}
    </div>
  );
};

export default PlayerRatingsAdmin; 