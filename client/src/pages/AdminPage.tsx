import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createStyles } from '../styles/styleUtils';
import { getPlayerImageUrl } from '../utils/imageUtils';
import api from '../services/api';

interface CustomPoll {
  id: number;
  title: string;
  options: string[];
  created_by: number;
  created_at: string;
  is_active: boolean;
  votes: number[];
  total_votes: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

interface Player {
  id: number;
  name: string;
  position: string;
  image_url: string;
  vote_count: number;
}

type TabType = 'polls' | 'users' | 'banned' | 'players';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('polls');
  
  // Poll states
  const [polls, setPolls] = useState<CustomPoll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [creatingPoll, setCreatingPoll] = useState(false);

  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBannedUsers, setLoadingBannedUsers] = useState(false);

  // Player management states
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [newPlayerImageFile, setNewPlayerImageFile] = useState<File | null>(null);
  const [creatingPlayer, setCreatingPlayer] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user?.is_admin) {
      navigate('/main');
      return;
    }
    if (activeTab === 'polls') {
      fetchPolls();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'banned') {
      fetchBannedUsers();
    } else if (activeTab === 'players') {
      fetchPlayers();
    }
  }, [user, navigate, activeTab]);

  const fetchPolls = async () => {
    setLoadingPolls(true);
    console.log('Fetching polls from /custom-polls...');
    try {
      const response = await api.get('/custom-polls');
      console.log('Polls response:', response);
      console.log('Polls data:', response.data);
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      alert('Erro ao carregar polls: ' + (error as any)?.response?.data?.message || (error as any)?.message);
    } finally {
      setLoadingPolls(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    console.log('Fetching users from /admin/users...');
    try {
      const response = await api.get('/admin/users');
      console.log('Users response:', response);
      console.log('Users data:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Erro ao carregar utilizadores: ' + (error as any)?.response?.data?.message || (error as any)?.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBannedUsers = async () => {
    setLoadingBannedUsers(true);
    try {
      const response = await api.get('/admin/users/banned');
      setBannedUsers(response.data);
    } catch (error) {
      console.error('Error fetching banned users:', error);
    } finally {
      setLoadingBannedUsers(false);
    }
  };

  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const response = await api.get('/players');
      console.log('Players response:', response);
      console.log('Players data:', response.data);
      setPlayers(response.data.players || response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
      alert('Erro ao carregar jogadores: ' + (error as any)?.response?.data?.message || (error as any)?.message);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const addOption = () => {
    if (newPollOptions.length < 10) {
      setNewPollOptions([...newPollOptions, '']);
    }
  };

  const removeOption = (index: number) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(newPollOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  const createPoll = async () => {
    if (!newPollTitle.trim()) {
      alert('Por favor, insira um título para a poll');
      return;
    }

    const validOptions = newPollOptions.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Por favor, insira pelo menos 2 opções válidas');
      return;
    }

    setCreatingPoll(true);
    try {
      await api.post('/custom-polls', {
        title: newPollTitle.trim(),
        options: validOptions
      });
      
      setNewPollTitle('');
      setNewPollOptions(['', '']);
      setShowCreateModal(false);
      fetchPolls();
    } catch (error: any) {
      console.error('Error creating poll:', error);
      alert(error.response?.data?.message || 'Erro ao criar poll');
    } finally {
      setCreatingPoll(false);
    }
  };

  const deactivatePoll = async (pollId: number) => {
    try {
      await api.post(`/custom-polls/${pollId}/deactivate`);
      fetchPolls();
    } catch (error: any) {
      console.error('Error deactivating poll:', error);
      alert(error.response?.data?.message || 'Erro ao desativar poll');
    }
  };

  const banUser = async (userId: number) => {
    if (window.confirm('Tem a certeza que deseja banir este utilizador?')) {
      try {
        await api.post(`/admin/users/${userId}/ban`);
        fetchUsers();
        alert('Utilizador banido com sucesso');
      } catch (error: any) {
        console.error('Error banning user:', error);
        alert(error.response?.data?.message || 'Erro ao banir utilizador');
      }
    }
  };

  const unbanUser = async (userId: number) => {
    if (window.confirm('Tem a certeza que deseja desbanir este utilizador?')) {
      try {
        await api.post(`/admin/users/${userId}/unban`);
        fetchBannedUsers();
        fetchUsers(); // Refresh users list as well
        alert('Utilizador desbanido com sucesso');
      } catch (error: any) {
        console.error('Error unbanning user:', error);
        alert(error.response?.data?.message || 'Erro ao desbanir utilizador');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openPlayerModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setNewPlayerName(player.name);
      setNewPlayerPosition(player.position);
      setNewPlayerImageFile(null);
    } else {
      setEditingPlayer(null);
      setNewPlayerName('');
      setNewPlayerPosition('');
      setNewPlayerImageFile(null);
    }
    setShowPlayerModal(true);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setEditingPlayer(null);
    setNewPlayerName('');
    setNewPlayerPosition('');
    setNewPlayerImageFile(null);
  };

  const createOrUpdatePlayer = async () => {
    if (!newPlayerName.trim() || !newPlayerPosition.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!editingPlayer && !newPlayerImageFile) {
      alert('Por favor, selecione uma imagem para o jogador');
      return;
    }

    setCreatingPlayer(true);
    try {
      const formData = new FormData();
      formData.append('name', newPlayerName.trim());
      formData.append('position', newPlayerPosition.trim());
      
      if (newPlayerImageFile) {
        formData.append('image', newPlayerImageFile);
      }

      if (editingPlayer) {
        await api.put(`/players/${editingPlayer.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/players', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      closePlayerModal();
      fetchPlayers();
    } catch (error: any) {
      console.error('Error creating/updating player:', error);
      alert(error.response?.data?.message || 'Erro ao salvar jogador');
    } finally {
      setCreatingPlayer(false);
    }
  };

  const deletePlayer = async (playerId: number) => {
    if (window.confirm('Tem a certeza que deseja remover este jogador?')) {
      try {
        await api.delete(`/players/${playerId}`);
        fetchPlayers();
        alert('Jogador removido com sucesso');
      } catch (error: any) {
        console.error('Error deleting player:', error);
        alert(error.response?.data?.message || 'Erro ao remover jogador');
      }
    }
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
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "clamp(8rem, 10vh, 10rem) 1rem 2rem",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "3rem",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "700",
      color: "#FFD700",
      marginBottom: "0.5rem",
    },
    subtitle: {
      fontSize: "1.2rem",
      color: "#B0BEC5",
    },
    tabNavigation: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "2rem",
      gap: "1rem",
    },
    tab: {
      padding: "1rem 2rem",
      background: "rgba(40, 55, 70, 0.8)",
      border: "2px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "0.75rem",
      color: "#B0BEC5",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontWeight: "600",
    },
    activeTab: {
      background: "rgba(76, 175, 80, 0.9)",
      border: "2px solid #4CAF50",
      color: "white",
    },
    section: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "1rem",
      padding: "2rem",
      backdropFilter: "blur(10px)",
      boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.4)",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
    },
    sectionTitle: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#FFFFFF",
    },
    button: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
      color: "white",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    dangerButton: {
      background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
    },
    successButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      marginTop: "1rem",
    },
    tableHeader: {
      background: "rgba(76, 175, 80, 0.2)",
      borderBottom: "2px solid rgba(76, 175, 80, 0.3)",
    },
    tableHeaderCell: {
      padding: "1rem",
      textAlign: "left" as const,
      fontWeight: "600",
      color: "#FFFFFF",
      fontSize: "0.95rem",
    },
    tableRow: {
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      transition: "background-color 0.2s ease",
    },
    tableCell: {
      padding: "1rem",
      color: "#B0BEC5",
      fontSize: "0.9rem",
    },
    pollCard: {
      background: "rgba(40, 55, 70, 0.8)",
      border: "1px solid rgba(76, 175, 80, 0.2)",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginBottom: "1rem",
    },
    pollTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#FFFFFF",
      marginBottom: "1rem",
    },
    pollMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "0.875rem",
      color: "#78909C",
      marginBottom: "1rem",
    },
    pollOptions: {
      marginBottom: "1rem",
    },
    pollOption: {
      display: "flex",
      justifyContent: "space-between",
      padding: "0.5rem 0",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#FFFFFF",
    },
    modal: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "rgba(30, 40, 50, 0.98)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "1rem",
      padding: "2rem",
      width: "90%",
      maxWidth: "500px",
      backdropFilter: "blur(10px)",
    },
    modalTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: "1.5rem",
      textAlign: "center" as const,
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      background: "rgba(40, 55, 70, 0.8)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "0.5rem",
      color: "#FFFFFF",
      fontSize: "1rem",
      marginBottom: "1rem",
    },
    optionGroup: {
      marginBottom: "1rem",
    },
    optionInput: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "0.5rem",
    },
    removeButton: {
      background: "#F44336",
      color: "white",
      border: "none",
      borderRadius: "0.25rem",
      padding: "0.5rem",
      cursor: "pointer",
      fontSize: "0.875rem",
    },
    addOptionButton: {
      background: "transparent",
      color: "#4CAF50",
      border: "1px dashed #4CAF50",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      fontSize: "0.875rem",
      marginBottom: "1rem",
    },
    modalActions: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
    },
    cancelButton: {
      background: "transparent",
      color: "#B0BEC5",
      border: "1px solid rgba(176, 190, 197, 0.3)",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
    },
    userStatus: {
      padding: "0.25rem 0.75rem",
      borderRadius: "1rem",
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase" as const,
    },
    adminStatus: {
      background: "rgba(255, 193, 7, 0.2)",
      color: "#FFD700",
      border: "1px solid rgba(255, 193, 7, 0.3)",
    },
    bannedStatus: {
      background: "rgba(244, 67, 54, 0.2)",
      color: "#F44336",
      border: "1px solid rgba(244, 67, 54, 0.3)",
    },
    activeStatus: {
      background: "rgba(76, 175, 80, 0.2)",
      color: "#4CAF50",
      border: "1px solid rgba(76, 175, 80, 0.3)",
    },
    loading: {
      textAlign: "center" as const,
      color: "#4CAF50",
      fontSize: "1.2rem",
      padding: "2rem",
    },
    emptyState: {
      textAlign: "center" as const,
      color: "#78909C",
      fontSize: "1.1rem",
      padding: "3rem",
    },
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'polls':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Gerir Polls Personalizadas</h2>
              <button 
                style={styles.button} 
                onClick={() => setShowCreateModal(true)}
              >
                + Nova Poll
              </button>
            </div>
            
            {loadingPolls ? (
              <div style={styles.loading}>A carregar polls...</div>
            ) : polls.length === 0 ? (
              <div style={styles.emptyState}>Nenhuma poll criada ainda</div>
            ) : (
              polls.map(poll => (
                <div key={poll.id} style={styles.pollCard}>
                  <h3 style={styles.pollTitle}>{poll.title}</h3>
                  <div style={styles.pollMeta}>
                    <span>Criada em: {formatDate(poll.created_at)}</span>
                    <span>Total de votos: {poll.total_votes}</span>
                  </div>
                  <div style={styles.pollOptions}>
                    {poll.options.map((option, index) => (
                      <div key={index} style={styles.pollOption}>
                        <span>{option}</span>
                        <span>{poll.votes[index] || 0} votos</span>
                      </div>
                    ))}
                  </div>
                  {poll.is_active && (
                    <button 
                      style={{...styles.button, ...styles.dangerButton}}
                      onClick={() => deactivatePoll(poll.id)}
                    >
                      Desativar Poll
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'users':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Gerir Utilizadores</h2>
              <button 
                style={styles.button} 
                onClick={fetchUsers}
                disabled={loadingUsers}
              >
                {loadingUsers ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
            
            {loadingUsers ? (
              <div style={styles.loading}>A carregar utilizadores...</div>
            ) : users.length === 0 ? (
              <div style={styles.emptyState}>Nenhum utilizador encontrado</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>ID</th>
                    <th style={styles.tableHeaderCell}>Username</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Registado em</th>
                    <th style={styles.tableHeaderCell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userData => (
                    <tr key={userData.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{userData.id}</td>
                      <td style={styles.tableCell}>{userData.username}</td>
                      <td style={styles.tableCell}>{userData.email}</td>
                      <td style={styles.tableCell}>
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                          {userData.is_admin && (
                            <span style={{...styles.userStatus, ...styles.adminStatus}}>
                              Admin
                            </span>
                          )}
                          {userData.is_banned ? (
                            <span style={{...styles.userStatus, ...styles.bannedStatus}}>
                              Banido
                            </span>
                          ) : (
                            <span style={{...styles.userStatus, ...styles.activeStatus}}>
                              Ativo
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.tableCell}>{formatDate(userData.created_at)}</td>
                      <td style={styles.tableCell}>
                        {!userData.is_banned && !userData.is_admin && userData.id.toString() !== user?.id && (
                          <button 
                            style={{...styles.button, ...styles.dangerButton}}
                            onClick={() => banUser(userData.id)}
                          >
                            Banir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'banned':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Utilizadores Banidos</h2>
              <button 
                style={styles.button} 
                onClick={fetchBannedUsers}
                disabled={loadingBannedUsers}
              >
                {loadingBannedUsers ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
            
            {loadingBannedUsers ? (
              <div style={styles.loading}>A carregar utilizadores banidos...</div>
            ) : bannedUsers.length === 0 ? (
              <div style={styles.emptyState}>Nenhum utilizador banido</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>ID</th>
                    <th style={styles.tableHeaderCell}>Username</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Banido em</th>
                    <th style={styles.tableHeaderCell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers.map(userData => (
                    <tr key={userData.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{userData.id}</td>
                      <td style={styles.tableCell}>{userData.username}</td>
                      <td style={styles.tableCell}>{userData.email}</td>
                      <td style={styles.tableCell}>{formatDate(userData.created_at)}</td>
                      <td style={styles.tableCell}>
                        <button 
                          style={{...styles.button, ...styles.successButton}}
                          onClick={() => unbanUser(userData.id)}
                        >
                          Desbanir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'players':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Gerir Jogadores</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  style={styles.button} 
                  onClick={() => openPlayerModal()}
                >
                  + Novo Jogador
                </button>
                <button 
                  style={styles.button} 
                  onClick={fetchPlayers}
                  disabled={loadingPlayers}
                >
                  {loadingPlayers ? 'A carregar...' : 'Atualizar'}
                </button>
              </div>
            </div>
            
            {loadingPlayers ? (
              <div style={styles.loading}>A carregar jogadores...</div>
            ) : players.length === 0 ? (
              <div style={styles.emptyState}>Nenhum jogador encontrado</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>ID</th>
                    <th style={styles.tableHeaderCell}>Nome</th>
                    <th style={styles.tableHeaderCell}>Posição</th>
                    <th style={styles.tableHeaderCell}>Imagem</th>
                    <th style={styles.tableHeaderCell}>Votos</th>
                    <th style={styles.tableHeaderCell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{player.id}</td>
                      <td style={styles.tableCell}>{player.name}</td>
                      <td style={styles.tableCell}>{player.position}</td>
                      <td style={styles.tableCell}>
                        <img
                          src={getPlayerImageUrl(player.image_url)}
                          alt={player.name}
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid rgba(76, 175, 80, 0.3)'
                          }}
                          onError={(e) => {
                            console.error('Error loading player image:', player.image_url);
                            e.currentTarget.src = '/images/default-player.jpg';
                          }}
                        />
                      </td>
                      <td style={styles.tableCell}>{player.vote_count}</td>
                      <td style={styles.tableCell}>
                        <button 
                          style={styles.button} 
                          onClick={() => openPlayerModal(player)}
                        >
                          Editar
                        </button>
                        <button 
                          style={{...styles.button, ...styles.dangerButton}}
                          onClick={() => deletePlayer(player.id)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Painel de Administração</h1>
          <p style={styles.subtitle}>Bem-vindo, {user?.username}</p>
        </div>

        <div style={styles.tabNavigation}>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'polls' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('polls')}
          >
            Polls Personalizadas
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'users' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('users')}
          >
            Gerir Utilizadores
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'banned' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('banned')}
          >
            Utilizadores Banidos
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'players' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('players')}
          >
            Jogadores
          </button>
        </div>

        {renderTabContent()}

        {/* Create Poll Modal */}
        {showCreateModal && (
          <div style={styles.modal} onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Criar Nova Poll</h2>
              
              <input
                style={styles.input}
                type="text"
                placeholder="Título da poll"
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
              />
              
              <div style={styles.optionGroup}>
                <label style={{color: '#B0BEC5', marginBottom: '0.5rem', display: 'block'}}>
                  Opções da poll:
                </label>
                {newPollOptions.map((option, index) => (
                  <div key={index} style={styles.optionInput}>
                    <input
                      style={{...styles.input, margin: 0, flex: 1}}
                      type="text"
                      placeholder={`Opção ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {newPollOptions.length > 2 && (
                      <button
                        style={styles.removeButton}
                        onClick={() => removeOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {newPollOptions.length < 10 && (
                  <button style={styles.addOptionButton} onClick={addOption}>
                    + Adicionar Opção
                  </button>
                )}
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelButton} 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  style={styles.button} 
                  onClick={createPoll}
                  disabled={creatingPoll}
                >
                  {creatingPoll ? 'A criar...' : 'Criar Poll'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Modal */}
        {showPlayerModal && (
          <div style={styles.modal} onClick={(e) => {
            if (e.target === e.currentTarget) closePlayerModal();
          }}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>{editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}</h2>
              
              <input
                style={styles.input}
                type="text"
                placeholder="Nome"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
              
              <select
                style={styles.input}
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value)}
              >
                <option value="">Selecionar Posição</option>
                <option value="Guarda-redes">Guarda-redes</option>
                <option value="Defesa">Defesa</option>
                <option value="Médio">Médio</option>
                <option value="Atacante">Atacante</option>
              </select>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  color: '#B0BEC5', 
                  marginBottom: '0.5rem', 
                  display: 'block',
                  fontSize: '0.9rem'
                }}>
                  Imagem do Jogador:
                </label>
                <input
                  style={{
                    ...styles.input,
                    padding: '0.5rem',
                    backgroundColor: 'rgba(40, 55, 70, 0.8)',
                    border: '2px dashed rgba(76, 175, 80, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPlayerImageFile(e.target.files?.[0] || null)}
                />
                {newPlayerImageFile && (
                  <p style={{
                    color: '#4CAF50',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    marginBottom: '0'
                  }}>
                    Ficheiro selecionado: {newPlayerImageFile.name}
                  </p>
                )}
                {editingPlayer && !newPlayerImageFile && (
                  <p style={{
                    color: '#78909C',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    marginBottom: '0'
                  }}>
                    Deixe em branco para manter a imagem atual
                  </p>
                )}
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelButton} 
                  onClick={closePlayerModal}
                >
                  Cancelar
                </button>
                <button 
                  style={styles.button} 
                  onClick={createOrUpdatePlayer}
                  disabled={creatingPlayer}
                >
                  {creatingPlayer ? 'A salvar...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage; 