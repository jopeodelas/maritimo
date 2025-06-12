import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { createStyles } from '../styles/styleUtils';
import api from '../services/api';
import maritimoLogo from '../assets/maritimo-crest.png';

interface Feedback {
  coluna: string;
  icone: 'verde' | 'amarelo' | 'vermelho' | 'seta-cima' | 'seta-baixo' | 'x-branco' | 'x-vermelho';
  trofeus_match?: string[];
  correto?: boolean;
}

interface GameState {
  feedback: Feedback[];
  venceu: boolean;
  perdeu: boolean;
  mostrar_clue1: boolean;
  clue1?: string;
  mostrar_clue2: boolean;
  clue2?: string;
  estatisticas?: { tentativas: number };
  segredo_completo?: any;
  palpite_dados?: any;
}

interface Tentativa {
  nome: string;
  feedback: Feedback[];
  palpite_dados: any; // Dados completos do palpite
}

const MaritodlePage = () => {
  const { user } = useAuth();
  const [nomes, setNomes] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [tentativas, setTentativas] = useState<Tentativa[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filteredNomes, setFilteredNomes] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [clue1, setClue1] = useState('');
  const [clue2, setClue2] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'vitoria' | 'derrota'>('vitoria');
  const [showCongrats, setShowCongrats] = useState(false);
  const [latestAttemptIndex, setLatestAttemptIndex] = useState(-1);
  const [flyingLogos, setFlyingLogos] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, rotation: number, scale: number}>>([]);
  const [showResult, setShowResult] = useState(false);
  const [logoAnimationActive, setLogoAnimationActive] = useState(false);
  const [clue1Revealed, setClue1Revealed] = useState(false);
  const [clue2Revealed, setClue2Revealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarNomes();
    iniciarNovoJogo();
    
    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInCell {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.8) rotateX(90deg);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1) rotateX(0deg);
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes titlePulse {
        0%, 100% {
          transform: scale(1);
          text-shadow: 
            0 0 20px rgba(255, 215, 0, 0.8),
            0 0 40px rgba(255, 215, 0, 0.6),
            0 0 60px rgba(255, 215, 0, 0.4);
        }
        50% {
          transform: scale(1.05);
          text-shadow: 
            0 0 30px rgba(255, 215, 0, 1),
            0 0 60px rgba(255, 215, 0, 0.8),
            0 0 90px rgba(255, 215, 0, 0.6);
        }
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes buttonBounce {
        0% {
          opacity: 0;
          transform: translateY(100px) scale(0.5);
        }
        60% {
          opacity: 1;
          transform: translateY(-10px) scale(1.1);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes pulse {
        from {
          box-shadow: 0 0.5rem 1.5rem rgba(255, 193, 7, 0.2);
        }
        to {
          box-shadow: 0 0.5rem 1.5rem rgba(255, 193, 7, 0.4);
        }
      }
      
      @keyframes slideInFromBottom {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Função para normalizar texto removendo acentos
  const normalizarTexto = (texto: string): string => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Função para verificar se um nome contém a busca
  const nomeContemBusca = (nome: string, busca: string): boolean => {
    const nomeNormalizado = normalizarTexto(nome);
    const buscaNormalizada = normalizarTexto(busca);
    
    // Dividir o nome em palavras para permitir busca por segundo nome
    const palavrasNome = nomeNormalizado.split(' ');
    
    // Verificar se alguma palavra do nome começa com a busca
    return palavrasNome.some(palavra => palavra.startsWith(buscaNormalizada)) ||
           nomeNormalizado.includes(buscaNormalizada);
  };

  useEffect(() => {
    if (inputValue) {
      const jogadoresTentados = tentativas.map(t => t.nome);
      const filtered = nomes
        .filter(nome => !jogadoresTentados.includes(nome))
        .filter(nome => nomeContemBusca(nome, inputValue))
        .slice(0, 5);
      setFilteredNomes(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, nomes, tentativas]);

  // Animar logos voadores
  useEffect(() => {
    if (!logoAnimationActive && flyingLogos.length === 0) return;
    
    const animateLogos = () => {
      setFlyingLogos(prev => prev
        .map(logo => ({
          ...logo,
          x: logo.x + logo.vx,
          y: logo.y + logo.vy,
          rotation: logo.rotation + 2
        }))
        .filter(logo => 
          logo.x > -100 && 
          logo.x < window.innerWidth + 100 && 
          logo.y > -100 && 
          logo.y < window.innerHeight + 100
        )
      );
    };
    
    const interval = setInterval(animateLogos, 16); // ~60fps
    return () => clearInterval(interval);
  }, [logoAnimationActive, flyingLogos.length]);

  const carregarNomes = async () => {
    try {
      const response = await api.get('/maritodle/nomes');
      setNomes(response.data.nomes);
    } catch (error) {
      console.error('Erro ao carregar nomes:', error);
      setError('Erro ao carregar dados do jogo');
    }
  };

  const iniciarNovoJogo = async () => {
    try {
      // Limpar cache do jogo para forçar refresh
      localStorage.removeItem('maritodle_cache');
      await api.get('/maritodle/novo-jogo');
      setTentativas([]);
      setGameState(null);
      setClue1('');
      setClue2('');
      setInputValue('');
      setError('');
      setShowModal(false);
      setShowCongrats(false);
      setLatestAttemptIndex(-1);
      setFlyingLogos([]);
      setShowResult(false);
      setLogoAnimationActive(false);
      setClue1Revealed(false);
      setClue2Revealed(false);
    } catch (error) {
      console.error('Erro ao iniciar novo jogo:', error);
    }
  };

  const submeterPalpite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    if (!nomes.includes(inputValue)) {
      setError('Nome não encontrado. Use o autocomplete para selecionar um nome válido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/maritodle/palpite', {
        nome: inputValue,
        tentativa_atual: tentativas.length
      });

      const state: GameState = response.data;
      setGameState(state);

      // Adicionar tentativa à lista
      setTentativas(prev => [...prev, {
        nome: inputValue,
        feedback: state.feedback,
        palpite_dados: state.palpite_dados
      }]);

      // Marcar qual é a tentativa mais recente para animação
      setLatestAttemptIndex(tentativas.length);

      // Mostrar clues automáticas baseadas no número de tentativas
      const numTentativas = tentativas.length + 1;
      if (numTentativas >= 6 && !clue1 && state.segredo_completo) {
        // Primeira dica: revelar a posição
        const posicoes = state.segredo_completo.posicoes || ['N/A'];
        setClue1(`O jogador secreto joga na posição: ${posicoes.join(', ')}`);
      }
      if (numTentativas >= 9 && !clue2 && state.segredo_completo) {
        // Segunda dica: revelar o período
        const entrada = state.segredo_completo.ano_entrada || 'N/A';
        const saida = state.segredo_completo.ano_saida === 9999 ? 'presente' : (state.segredo_completo.ano_saida || 'N/A');
        setClue2(`O jogador secreto esteve/está no Marítimo durante: ${entrada}-${saida}`);
      }

      // Mostrar clues se necessário
      if (state.mostrar_clue1 && state.clue1) {
        setClue1(state.clue1);
      }
      if (state.mostrar_clue2 && state.clue2) {
        setClue2(state.clue2);
      }

      // Verificar vitória ou derrota
      if (state.venceu || state.perdeu) {
        if (state.venceu) {
          setShowCongrats(true);
          startEpicCelebration();
        } else {
          setModalType('derrota');
          setShowModal(true);
        }
      }

      setInputValue('');
      setShowSuggestions(false);
    } catch (error: any) {
      setError(error.response?.data?.erro || 'Erro ao processar palpite');
    } finally {
      setLoading(false);
    }
  };

  const desistir = async () => {
    try {
      const response = await api.post('/maritodle/desistir');
      const state: GameState = response.data;
      setGameState(state);
      setModalType('derrota');
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao desistir:', error);
    }
  };

  const selecionarNome = (nome: string) => {
    setInputValue(nome);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const startEpicCelebration = () => {
    setLogoAnimationActive(true);
    
    // Mostrar resultado após 2 segundos
    setTimeout(() => {
      setShowResult(true);
      
      // Scroll automático para o resultado após ele aparecer
      setTimeout(() => {
        const resultElement = document.querySelector('[data-result-container]');
        if (resultElement) {
          resultElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100); // Pequeno delay para garantir que o elemento foi renderizado
    }, 2000);
    
    // Criar logos voadores durante 10 segundos
    let logoId = 0;
    const logoInterval = setInterval(() => {
      // Criar 2-3 logos por intervalo (cada 200ms)
      const numLogos = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numLogos; i++) {
        const side = Math.random() > 0.5; // true = direita, false = esquerda
        const logo = {
          id: logoId++,
          x: side ? window.innerWidth + 50 : -50,
          y: Math.random() * window.innerHeight,
          vx: side ? -2 - Math.random() * 3 : 2 + Math.random() * 3,
          vy: (Math.random() - 0.5) * 2,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5
        };
        
        setFlyingLogos(prev => [...prev, logo]);
      }
    }, 200);
    
    // Parar de criar logos após 10 segundos
    setTimeout(() => {
      clearInterval(logoInterval);
      setLogoAnimationActive(false);
      
      // Limpar logos restantes após mais 3 segundos
      setTimeout(() => {
        setFlyingLogos([]);
        setShowCongrats(false);
      }, 3000);
    }, 10000);
  };

  const getIconeDisplay = (feedback: Feedback) => {
    switch (feedback.icone) {
      case 'verde':
        return { type: 'square', color: '#4CAF50' };
      case 'amarelo':
        return { type: 'square', color: '#FFD700' };
      case 'vermelho':
        return { type: 'square', color: '#F44336' };
      case 'seta-cima':
        return { type: 'arrow', direction: 'up', color: '#F44336' };
      case 'seta-baixo':
        return { type: 'arrow', direction: 'down', color: '#F44336' };
      case 'x-branco':
        return { type: 'x', color: '#9E9E9E' };
      case 'x-vermelho':
        return { type: 'x', color: '#F44336' };
      default:
        return { type: 'square', color: '#9E9E9E' };
    }
  };

  const styles = createStyles({
    container: {
      height: tentativas.length === 0 ? '100vh' : 'auto',
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      position: "relative",
      overflow: tentativas.length === 0 ? "hidden" : "auto",
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
      padding: tentativas.length === 0 ? 'clamp(8rem, 10vh, 10rem) 2vw clamp(12rem, 15vh, 15rem)' : 'clamp(8rem, 10vh, 10rem) 2vw clamp(8rem, 10vh, 10rem)',
      position: "relative",
      zIndex: 2,
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
      color: '#B0BEC5',
      margin: 0,
    },
    inputSection: {
      background: 'rgba(30, 40, 50, 0.95)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      position: 'relative',
    },
    inputForm: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    inputContainer: {
      position: 'relative',
      flex: 1,
      minWidth: '300px',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      border: '2px solid rgba(76, 175, 80, 0.3)',
      borderRadius: '0.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      outline: 'none',
      transition: 'border-color 0.3s',
    },
    inputFocused: {
      borderColor: '#4CAF50',
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'rgba(15, 20, 25, 0.98)',
      border: '2px solid rgba(76, 175, 80, 0.5)',
      borderRadius: '0.5rem',
      marginTop: '0.25rem',
      zIndex: 1000,
      maxHeight: '200px',
      overflowY: 'auto',
      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.5)',
    },
    suggestion: {
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      borderBottom: '1px solid rgba(76, 175, 80, 0.2)',
      transition: 'background-color 0.2s',
      color: '#FFFFFF',
      fontSize: '1rem',
      fontWeight: '500',
    },
    suggestionHover: {
      backgroundColor: 'rgba(76, 175, 80, 0.3)',
      color: '#FFFFFF',
    },
    submitButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      minWidth: '120px',
    },
    submitButtonDisabled: {
      backgroundColor: '#666',
      cursor: 'not-allowed',
    },
    giveUpButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#F44336',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    newGameButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#FFD700',
      color: '#1A252F',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    error: {
      color: '#F44336',
      marginTop: '0.5rem',
      fontSize: '0.9rem',
    },
    grid: {
      background: 'rgba(30, 40, 50, 0.95)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '800px',
    },
    tableHeader: {
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
    },
    th: {
      padding: '0.75rem 0.5rem',
      textAlign: 'center',
      fontWeight: '600',
      color: '#FFD700',
      borderBottom: '2px solid rgba(76, 175, 80, 0.3)',
      fontSize: '0.9rem',
    },
    td: {
      padding: '0.5rem',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      minWidth: '120px',
      verticalAlign: 'middle',
      display: 'table-cell',
    },
    attemptRow: {
      transition: 'background-color 0.3s',
    },
    attemptRowHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    feedbackCell: {
      fontSize: '0.85rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60px',
      width: '100px',
      textAlign: 'center',
      color: 'white',
      padding: '0.5rem',
      borderRadius: '8px',
      wordWrap: 'break-word',
      lineHeight: '1.1',
      margin: '0 auto',
    },
    playerName: {
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'left',
      paddingLeft: '1rem',
    },
    legend: {
      background: 'rgba(30, 40, 50, 0.95)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: tentativas.length === 0 ? '6rem' : '2rem',
      border: '1px solid rgba(76, 175, 80, 0.3)',
      boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)',
    },
    legendTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#FFD700',
      textAlign: 'center',
    },
    legendGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem',
      alignItems: 'stretch',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      color: '#FFFFFF',
      padding: '1rem 1.5rem',
      background: 'rgba(40, 55, 70, 0.6)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(76, 175, 80, 0.2)',
      minHeight: '60px',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    feedbackSquare: {
      width: '100px',
      height: '60px',
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'white',
      textAlign: 'center',
      padding: '0.5rem',
      wordWrap: 'break-word',
      lineHeight: '1.1',
    },
    feedbackArrowSquare: {
      width: '100px',
      height: '60px',
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'white',
      textAlign: 'center',
      padding: '0.5rem',
    },
    arrowUp: {
      width: 0,
      height: 0,
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderBottom: '6px solid white',
    },
    arrowDown: {
      width: 0,
      height: 0,
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderTop: '6px solid white',
    },
    feedbackX: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      display: 'inline-block',
      width: '20px',
      textAlign: 'center',
    },
    legendSquare: {
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      display: 'inline-block',
      flexShrink: 0,
    },
    legendArrowSquare: {
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      position: 'relative',
    },
    legendArrowUp: {
      width: 0,
      height: 0,
      borderLeft: '5px solid transparent',
      borderRight: '5px solid transparent',
      borderBottom: '7px solid white',
    },
    legendArrowDown: {
      width: 0,
      height: 0,
      borderLeft: '5px solid transparent',
      borderRight: '5px solid transparent',
      borderTop: '7px solid white',
    },
    legendX: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      display: 'inline-flex',
      width: '24px',
      height: '24px',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cluesSection: {
      background: 'rgba(30, 40, 50, 0.95)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      border: '2px solid rgba(255, 193, 7, 0.4)',
      boxShadow: '0 0.5rem 1.5rem rgba(255, 193, 7, 0.2)',
      animation: 'pulse 2s ease-in-out infinite alternate',
    },
    clueCard: {
      background: 'rgba(255, 193, 7, 0.15)',
      border: '1px solid rgba(255, 193, 7, 0.4)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      marginBottom: '1rem',
      boxShadow: '0 0.25rem 0.5rem rgba(255, 193, 7, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    clueTitle: {
      color: '#FFD700',
      fontWeight: '700',
      marginBottom: '0.75rem',
      fontSize: '1.1rem',
    },
    clueText: {
      color: '#FFFFFF',
      fontSize: '1rem',
      lineHeight: '1.4',
      fontWeight: '500',
    },
    congratsOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 3000,
    },
    flyingLogo: {
      position: 'fixed',
      width: '60px',
      height: '60px',
      backgroundImage: `url(${maritimoLogo})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 0.5))',
      zIndex: 3001,
    },
    resultContainer: {
      background: 'rgba(15, 20, 25, 0.95)',
      border: '3px solid #4CAF50',
      borderRadius: '1rem',
      padding: '2rem 3rem',
      textAlign: 'center',
      boxShadow: '0 1rem 3rem rgba(0, 0, 0, 0.5)',
      animation: 'slideInFromBottom 1s ease-out',
      marginTop: '2rem',
      marginBottom: '2rem',
    },
    resultTitle: {
      fontSize: '2.5rem',
      fontWeight: '900',
      color: '#4CAF50',
      marginBottom: '1rem',
      textShadow: '0 0 20px rgba(76, 175, 80, 0.6)',
    },
    resultText: {
      fontSize: '1.5rem',
      color: '#FFFFFF',
      marginBottom: '0.5rem',
      fontWeight: '600',
    },
    congratsContent: {
      textAlign: 'center',
      position: 'relative',
    },
    congratsTitle: {
      fontSize: 'clamp(4rem, 12vw, 8rem)',
      fontWeight: '900',
      color: '#FFFFFF',
      marginBottom: '2rem',
      textShadow: `
        0 0 20px rgba(255, 215, 0, 0.8),
        0 0 40px rgba(255, 215, 0, 0.6),
        0 0 60px rgba(255, 215, 0, 0.4),
        0 0 80px rgba(255, 215, 0, 0.2)
      `,
      animation: 'titlePulse 2s ease-in-out infinite',
      letterSpacing: '0.1em',
    },
    congratsSubtitle: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      color: '#FFFFFF',
      marginBottom: '3rem',
      fontWeight: '600',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      animation: 'slideInUp 1s ease-out 0.5s both',
    },
    congratsParticles: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    },
    congratsButton: {
      padding: '1.25rem 2.5rem',
      fontSize: '1.5rem',
      fontWeight: '700',
      background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
      color: 'white',
      border: '3px solid #FFFFFF',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'buttonBounce 1s ease-out 1s both',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
    },
    modalContent: {
      background: 'rgba(30, 40, 50, 0.98)',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
      border: '2px solid',
    },
    modalVitoria: {
      borderColor: '#4CAF50',
    },
    modalDerrota: {
      borderColor: '#F44336',
    },
    modalTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '1rem',
    },
    modalTitleVitoria: {
      color: '#4CAF50',
    },
    modalTitleDerrota: {
      color: '#F44336',
    },
    modalText: {
      fontSize: '1.1rem',
      marginBottom: '2rem',
      lineHeight: '1.5',
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
    },
    modalButton: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    stats: {
      textAlign: 'center',
      marginTop: '1rem',
      fontSize: '1.1rem',
      color: '#B0BEC5',
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
      margin: 0,
      fontWeight: "500",
      color: "#B0BEC5",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    resultSubtext: {
      fontSize: '1.2rem',
      color: '#B0BEC5',
      fontWeight: '500',
    },
    hiddenClueContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    },
    hiddenClueText: {
      color: '#B0BEC5',
      fontSize: '0.9rem',
    },
    revealButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0.2rem 0.4rem rgba(76, 175, 80, 0.3)',
      textTransform: 'none',
    },
  });

  const colunas = [
    'Nome', 'Jogos', 'Posições', 'Altura', 'Papéis', 'Idade', 
    'Nacionalidade', 'Contribuições', 'Período'
  ];

  const renderFeedbackIndicator = (display: any) => {
    if (display.type === 'square') {
      return (
        <div 
          style={{
            ...styles.feedbackSquare,
            backgroundColor: display.color
          }}
        />
      );
    } else if (display.type === 'arrow') {
      return (
        <div 
          style={{
            ...styles.feedbackArrowSquare,
            backgroundColor: display.color
          }}
        >
          {display.direction === 'up' ? <div style={styles.arrowUp}></div> : <div style={styles.arrowDown}></div>}
        </div>
      );
    } else if (display.type === 'x') {
      return (
        <div 
          style={{
            ...styles.feedbackX,
            color: display.color
          }}
        >
          X
        </div>
      );
    }
    return null;
  };

  const renderLegendIndicator = (type: string, color: string, direction?: string) => {
    if (type === 'square') {
      return (
        <div 
          style={{
            ...styles.legendSquare,
            backgroundColor: color
          }}
        />
      );
    } else if (type === 'arrow') {
      return (
        <div 
          style={{
            ...styles.legendArrowSquare,
            backgroundColor: color
          }}
        >
          {direction === 'up' ? <div style={styles.legendArrowUp}></div> : <div style={styles.legendArrowDown}></div>}
        </div>
      );
    } else if (type === 'x') {
      return (
        <div 
          style={{
            ...styles.legendX,
            color: color
          }}
        >
          X
        </div>
      );
    }
    return null;
  };

  const renderFeedbackContent = (feedback: Feedback, coluna: string, palpite: any, segredo: any) => {
    const display = getIconeDisplay(feedback);
    
    // Determinar o texto baseado EXCLUSIVAMENTE na coluna, ignorando o feedback.coluna
    let texto = '';
    switch (coluna) {
      case 'Jogos':
        texto = palpite?.sexo || 'N/A';
        break;
      case 'Posições':
        texto = Array.isArray(palpite?.posicoes) ? palpite.posicoes.join(', ') : (palpite?.posicoes || 'N/A');
        break;
      case 'Altura':
        texto = `${palpite?.altura_cm || 'N/A'}cm`;
        break;
      case 'Papéis':
        texto = Array.isArray(palpite?.papeis) ? palpite.papeis.join(', ') : (palpite?.papeis || 'N/A');
        break;
      case 'Idade':
        texto = `${palpite?.idade || 'N/A'} anos`;
        break;
      case 'Nacionalidade':
        texto = palpite?.nacionalidade || 'N/A';
        break;
      case 'Contribuições':
        // SEMPRE mostrar o número de contribuições, NUNCA mostrar X
        if (feedback.trofeus_match && feedback.trofeus_match.length > 0) {
          texto = feedback.trofeus_match.join(', ');
        } else if (palpite?.trofeus?.length > 0) {
          texto = palpite.trofeus.join(', ');
        } else {
          texto = '0 contribuições'; // Mostrar "0 contribuições" em vez de "Nenhuma"
        }
        break;
      case 'Período':
        const entrada = palpite?.ano_entrada || 'N/A';
        const saida = palpite?.ano_saida === 9999 ? 'presente' : (palpite?.ano_saida || 'N/A');
        texto = `${entrada}-${saida}`;
        break;
      default:
        texto = 'N/A';
    }

    // Para setas numéricas
    if (display.type === 'arrow') {
      return (
        <div 
          style={{
            ...styles.feedbackArrowSquare,
            backgroundColor: display.color,
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          <div style={{fontSize: '0.75rem'}}>{texto}</div>
          {display.direction === 'up' ? <div style={styles.arrowUp}></div> : <div style={styles.arrowDown}></div>}
        </div>
      );
    }

    // Tratamento especial para "treinador/jogador" no campo Papéis
    if (coluna === 'Papéis' && texto === 'treinador/jogador') {
      return (
        <div 
          style={{
            ...styles.feedbackSquare,
            backgroundColor: display.color,
            color: 'white',
            fontSize: '0.7rem',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '2px',
            lineHeight: '1'
          }}
        >
          <div>treinador</div>
          <div>jogador</div>
        </div>
      );
    }

    // Para quadrados normais com texto - padronizar tamanho da fonte
    return (
      <div 
        style={{
          ...styles.feedbackSquare,
          backgroundColor: display.color,
          color: 'white',
          fontSize: '0.8rem' // Tamanho padronizado para todos os campos
        }}
      >
        {texto}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <Navbar />
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroAccent}></div>
          <h1 style={styles.heroTitle}>Maritodle</h1>
          <p style={styles.heroSubtitle}>Adivinha o jogador ou treinador do CS Marítimo!</p>
        </div>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <form style={styles.inputForm} onSubmit={submeterPalpite}>
            <div style={styles.inputContainer}>
              <input
                ref={inputRef}
                style={styles.input}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite o nome de um jogador ou treinador..."
                disabled={loading || gameState?.venceu || gameState?.perdeu}
              />
              {showSuggestions && (
                <div style={styles.suggestions}>
                  {filteredNomes.map((nome, index) => (
                    <div
                      key={index}
                      style={styles.suggestion}
                      onClick={() => selecionarNome(nome)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {nome}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading || !inputValue.trim() || gameState?.venceu || gameState?.perdeu 
                  ? styles.submitButtonDisabled : {})
              }}
              disabled={loading || !inputValue.trim() || gameState?.venceu || gameState?.perdeu}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
            <button
              type="button"
              style={styles.giveUpButton}
              onClick={desistir}
              disabled={loading || gameState?.venceu || gameState?.perdeu || tentativas.length === 0}
            >
              Desistir
            </button>
            <button
              type="button"
              style={styles.newGameButton}
              onClick={iniciarNovoJogo}
            >
              Novo Jogo
            </button>
          </form>
          {error && <div style={styles.error}>{error}</div>}
          {tentativas.length > 0 && (
            <div style={styles.stats}>
              Tentativas: {tentativas.length}
            </div>
          )}
        </div>

        {/* Clues Section - Movido para cima */}
        {(clue1 || clue2) && (
          <div style={styles.cluesSection}>
            <h3 style={styles.legendTitle}>🔍 Pistas</h3>
            {clue1 && (
              <div style={styles.clueCard}>
                <div style={styles.clueTitle}>💡 Pista 1 (após 6 tentativas)</div>
                {clue1Revealed ? (
                  <div style={styles.clueText}>{clue1}</div>
                ) : (
                  <div style={styles.hiddenClueContainer}>
                    <div style={styles.hiddenClueText}>A primeira pista está disponível!</div>
                    <button 
                      style={styles.revealButton}
                      onClick={() => setClue1Revealed(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#45A049';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 0.4rem 0.8rem rgba(76, 175, 80, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0.2rem 0.4rem rgba(76, 175, 80, 0.3)';
                      }}
                    >
                      🔍 Revelar Pista
                    </button>
                  </div>
                )}
              </div>
            )}
            {clue2 && (
              <div style={styles.clueCard}>
                <div style={styles.clueTitle}>🎯 Pista 2 (após 9 tentativas)</div>
                {clue2Revealed ? (
                  <div style={styles.clueText}>{clue2}</div>
                ) : (
                  <div style={styles.hiddenClueContainer}>
                    <div style={styles.hiddenClueText}>A segunda pista está disponível!</div>
                    <button 
                      style={styles.revealButton}
                      onClick={() => setClue2Revealed(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#45A049';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 0.4rem 0.8rem rgba(76, 175, 80, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0.2rem 0.4rem rgba(76, 175, 80, 0.3)';
                      }}
                    >
                      🔍 Revelar Pista
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Game Grid */}
        <div style={styles.grid}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                {colunas.map((coluna, index) => (
                  <th key={index} style={styles.th}>{coluna}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tentativas.map((tentativa, index) => {
                const isLatest = index === latestAttemptIndex;
                return (
                  <tr key={index} style={styles.attemptRow}>
                    <td style={{...styles.td, ...styles.playerName}}>{tentativa.nome}</td>
                    {tentativa.feedback.map((feedback, feedbackIndex) => {
                      // Mapear diretamente pelo índice - feedback[0] = Jogos, feedback[1] = Posições, etc.
                      const colunasData = ['Jogos', 'Posições', 'Altura', 'Papéis', 'Idade', 'Nacionalidade', 'Contribuições', 'Período'];
                      const coluna = colunasData[feedbackIndex];
                      
                      return (
                        <td 
                          key={feedbackIndex} 
                          style={{
                            ...styles.td,
                            ...(isLatest ? {
                              animation: `fadeInCell 1.2s ease-in-out ${feedbackIndex * 0.25}s both`,
                            } : {})
                          }}
                        >
                          {renderFeedbackContent(feedback, coluna, tentativa.palpite_dados, gameState?.segredo_completo)}
                        </td>
                      );
                    })}
                  </tr>
                );
              }).reverse()}
            </tbody>
          </table>
        </div>

        {/* Congratulations Overlay */}
        {showCongrats && (
          <div style={styles.congratsOverlay}>
            {/* Logos voadores */}
            {flyingLogos.map(logo => (
              <div
                key={logo.id}
                style={{
                  ...styles.flyingLogo,
                  left: `${logo.x}px`,
                  top: `${logo.y}px`,
                  transform: `rotate(${logo.rotation}deg) scale(${logo.scale})`,
                }}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={styles.legend}>
          <h3 style={styles.legendTitle}>Legenda</h3>
          <div style={styles.legendGrid}>
            <div style={styles.legendItem}>
              {renderLegendIndicator('square', '#4CAF50')}
              <span>Correto</span>
            </div>
            <div style={styles.legendItem}>
              {renderLegendIndicator('square', '#FFD700')}
              <span>Parcial (alguma informação coincide)</span>
            </div>
            <div style={styles.legendItem}>
              {renderLegendIndicator('square', '#F44336')}
              <span>Incorreto</span>
            </div>
            <div style={styles.legendItem}>
              {renderLegendIndicator('arrow', '#F44336', 'up')}
              <span>Valor secreto é MAIOR/DEPOIS</span>
            </div>
            <div style={styles.legendItem}>
              {renderLegendIndicator('arrow', '#F44336', 'down')}
              <span>Valor secreto é MENOR/ANTES</span>
            </div>
            <div style={styles.legendItem}>
              {renderLegendIndicator('x', '#4CAF50')}
              <span>X Verde: Sem contribuições (correto) | X Vermelho: Contribuições não coincidem</span>
            </div>
          </div>
        </div>

        {/* Resultado da Vitória */}
        {showResult && (
          <div style={styles.resultContainer} data-result-container>
            <h2 style={styles.resultTitle}>VITÓRIA!</h2>
            <p style={styles.resultText}>
              Jogador: {tentativas[tentativas.length - 1]?.nome}
            </p>
            <p style={styles.resultSubtext}>
              Tentativas: {tentativas.length}
            </p>
          </div>
        )}

        {/* Modal */}
        {showModal && gameState && (
          <div style={styles.modal}>
            <div style={{
              ...styles.modalContent,
              ...(modalType === 'vitoria' ? styles.modalVitoria : styles.modalDerrota)
            }}>
              <h2 style={{
                ...styles.modalTitle,
                ...(modalType === 'vitoria' ? styles.modalTitleVitoria : styles.modalTitleDerrota)
              }}>
                {modalType === 'vitoria' ? 'Parabéns!' : 'Fim de Jogo!'}
              </h2>
              
              <div style={styles.modalText}>
                {modalType === 'vitoria' ? (
                  <>
                    Adivinhaste em {gameState.estatisticas?.tentativas}/∞!<br/>
                    Era <strong>{tentativas[tentativas.length - 1]?.nome}</strong>!
                  </>
                ) : (
                  <>
                    O segredo era: <strong>{gameState.segredo_completo?.nome}</strong><br/>
                    {gameState.segredo_completo && (
                      <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#B0BEC5'}}>
                        {gameState.segredo_completo.sexo} • {gameState.segredo_completo.posicoes?.join(', ')} • 
                        {gameState.segredo_completo.altura_cm}cm • {gameState.segredo_completo.idade} anos • 
                        {gameState.segredo_completo.nacionalidade}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={styles.modalButtons}>
                <button
                  style={{...styles.modalButton, backgroundColor: '#4CAF50', color: 'white'}}
                  onClick={() => {
                    setShowModal(false);
                    iniciarNovoJogo();
                  }}
                >
                  Novo Jogo
                </button>
                <button
                  style={{...styles.modalButton, backgroundColor: '#666', color: 'white'}}
                  onClick={() => setShowModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaritodlePage; 