import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { createStyles } from '../styles/styleUtils';
import api from '../services/api';
import type { Discussion, Comment } from '../types';

const ChatPage = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Form states
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionDescription, setNewDiscussionDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Refs
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Profanity filter - lista de slurs que não são permitidos
  const bannedWords = [
    'nigger', 'nigga', 'faggot', 'retard', 'spic', 'chink', 'gook', 'kike', 
    'wetback', 'towelhead', 'raghead', 'sandnigger', 'beaner', 'coon',
    'preto', 'pretas', 'pretos', 'cigano', 'ciganos', 'cigana', 'ciganas',
    'judeu', 'judeus', 'judia', 'judias', 'mouro', 'mouros', 'moura', 'mouras'
  ];

  const containsBannedWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return bannedWords.some(word => lowerText.includes(word.toLowerCase()));
  };

  useEffect(() => {
    fetchDiscussions();
  }, [sortBy]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/discussions?sort=${sortBy}`);
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (discussionId: number) => {
    try {
      const response = await api.get(`/discussions/${discussionId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim() || !newDiscussionDescription.trim()) return;
    
    if (containsBannedWords(newDiscussionTitle) || containsBannedWords(newDiscussionDescription)) {
      alert('O seu texto contém palavras não permitidas. Por favor, revise o conteúdo.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/discussions', {
        title: newDiscussionTitle.trim(),
        description: newDiscussionDescription.trim()
      });
      
      setDiscussions(prev => [response.data, ...prev]);
      setNewDiscussionTitle('');
      setNewDiscussionDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Erro ao criar discussão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || !selectedDiscussion || submitting) return;
    
    if (containsBannedWords(newComment)) {
      alert('O seu comentário contém palavras não permitidas. Por favor, revise o conteúdo.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/discussions/${selectedDiscussion.id}/comments`, {
        content: newComment.trim()
      });
      
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      
      // Update discussion comment count
      setDiscussions(prev => prev.map(d => 
        d.id === selectedDiscussion.id 
          ? { ...d, comment_count: d.comment_count + 1, last_activity: new Date().toISOString() }
          : d
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setIsDrawerOpen(true);
    fetchComments(discussion.id);
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus();
      }
    }, 300);
  };

  const closeDiscussion = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedDiscussion(null);
      setComments([]);
    }, 300);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `Há ${diffMinutes} minutos`;
    if (diffHours < 24) return `Há ${diffHours} horas`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-PT');
  };

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      color: '#FFFFFF',
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
      animation: "optimized-float 20s ease-in-out infinite",
    },
    // Layout original quando não há gaveta
    content: {
      maxWidth: "min(98vw, 110rem)",
      margin: "0 auto",
      padding: "clamp(1rem, 2vh, 2rem) clamp(0.5rem, 1vw, 1.5rem)",
      position: "relative",
      zIndex: 2,
      display: isDrawerOpen ? 'none' : 'block',
    },
    header: {
      textAlign: 'center',
      marginBottom: '3vh',
    },
    title: {
      fontSize: '3.5vw',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '1vh',
      textShadow: '0.2vh 0.2vh 0.5vh rgba(0, 0, 0, 0.5)',
    },
    subtitle: {
      fontSize: '1.3vw',
      color: '#FFBB4C',
      fontWeight: '400',
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2vh',
      flexWrap: 'wrap',
      gap: '2vh',
      padding: '1vh 0',
    },
    leftControls: {
      display: 'flex',
      gap: '1.5vw',
      alignItems: 'center',
      flex: '1 1 auto',
      minWidth: '300px',
    },
    searchInput: {
      padding: '1vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      fontSize: '1vw',
      width: '20vw',
      transition: 'all 0.3s ease',
    },
    sortSelect: {
      padding: '1vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      fontSize: '1vw',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1vw center',
      backgroundSize: '1.2vw',
      paddingRight: '3vw',
      minWidth: '12vw',
    },
    createButton: {
      backgroundColor: '#009759',
      color: 'white',
      border: 'none',
      padding: '1.2vh 2vw',
      borderRadius: '0.8vw',
      fontSize: '1.1vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0.3vh 1vh rgba(0, 151, 89, 0.3)',
    },
    discussionsList: {
      display: 'grid',
      gap: '1.5vh',
    },
    discussionCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '1vw',
      padding: '2vh 2vw',
      border: '2px solid rgba(255, 187, 76, 0.2)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
    },
    discussionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1vh',
    },
    discussionTitle: {
      fontSize: '1.5vw',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '0.5vh',
    },
    discussionMeta: {
      fontSize: '0.9vw',
      color: '#FFBB4C',
      textAlign: 'right',
    },
    discussionDescription: {
      fontSize: '1vw',
      color: '#E0E0E0',
      marginBottom: '1vh',
      lineHeight: '1.5',
    },
    discussionStats: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.9vw',
      color: '#B0B0B0',
    },
    // Layout da gaveta
    mainLayout: {
      display: isDrawerOpen ? 'flex' : 'none',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 500, // Bem abaixo da navbar (que tem z-index 1000)
    },
    discussionsPanel: {
      width: '20%',
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      borderRight: '2px solid rgba(255, 187, 76, 0.3)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '80px', // Space for navbar
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
    },
    panelHeader: {
      padding: '2vh 2vw',
      borderBottom: '2px solid rgba(255, 187, 76, 0.3)',
      background: `
        linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(26, 37, 47, 0.9) 100%)
      `,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    },
    panelTitle: {
      fontSize: '1.8vw',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '1vh',
      textShadow: '0.2vh 0.2vh 0.5vh rgba(0, 0, 0, 0.5)',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    panelSubtitle: {
      fontSize: '0.9vw',
      color: '#FFBB4C',
      fontWeight: '500',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
    },
    panelControls: {
      padding: '2vh 2vw',
      borderBottom: '2px solid rgba(255, 187, 76, 0.3)',
      background: `
        linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(26, 37, 47, 0.7) 100%)
      `,
    },
    panelSearchInput: {
      width: '100%',
      padding: '1.2vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.4)',
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)
      `,
      color: '#FFFFFF',
      fontSize: '0.8vw',
      marginBottom: '1.5vh',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    },
    panelSortSelect: {
      width: '100%',
      padding: '1.2vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.4)',
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)
      `,
      color: '#FFFFFF',
      fontSize: '0.8vw',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1vw center',
      backgroundSize: '1.2vw',
      paddingRight: '3vw',
      marginBottom: '1.5vh',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    },
    panelCreateButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #009759 0%, #00b366 100%)',
      color: 'white',
      border: 'none',
      padding: '1.5vh 2vw',
      borderRadius: '0.8vw',
      fontSize: '0.9vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0, 151, 89, 0.4)',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
    },
    panelDiscussionsList: {
      flex: 1,
      overflow: 'auto',
      padding: '1.5vh 2vw',
      background: `
        linear-gradient(180deg, rgba(15, 20, 25, 0.3) 0%, rgba(26, 37, 47, 0.2) 100%)
      `,
    },
    panelDiscussionCard: {
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)
      `,
      borderRadius: '1vw',
      padding: '1.5vh 1.5vw',
      border: '2px solid rgba(255, 187, 76, 0.25)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      marginBottom: '1vh',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    },
    panelDiscussionTitle: {
      fontSize: '1vw',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '0.5vh',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
    },
    panelDiscussionMeta: {
      fontSize: '0.7vw',
      color: '#FFBB4C',
      marginBottom: '0.5vh',
      fontWeight: '500',
    },
    panelDiscussionStats: {
      fontSize: '0.7vw',
      color: '#B0BEC5',
      fontWeight: '400',
    },
    chatDrawer: {
      width: '80%',
      height: '100%',
      background: `
        radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '80px', // Space for navbar
      boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.3)',
    },
    chatHeader: {
      padding: '2vh 3vw',
      borderBottom: '2px solid rgba(255, 187, 76, 0.3)',
      background: `
        linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(26, 37, 47, 0.9) 100%)
      `,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    },
    chatHeaderInfo: {
      flex: 1,
    },
    chatTitle: {
      fontSize: '1.8vw',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '0.5vh',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0.2vh 0.2vh 0.5vh rgba(0, 0, 0, 0.5)',
    },
    chatMeta: {
      fontSize: '1vw',
      color: '#FFBB4C',
      marginBottom: '1vh',
      fontWeight: '500',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
    },
    chatDescription: {
      fontSize: '1.1vw',
      color: '#B0BEC5',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: '2px solid rgba(244, 67, 54, 0.5)',
      color: '#FFFFFF',
      fontSize: '2vw',
      cursor: 'pointer',
      padding: '0.5vh 1vw',
      borderRadius: '50%',
      transition: 'all 0.3s ease',
      width: '3vw',
      height: '3vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
    },
    messagesContainer: {
      flex: 1,
      overflow: 'auto',
      padding: '2vh 3vw',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5vh',
      background: `
        linear-gradient(180deg, rgba(15, 20, 25, 0.2) 0%, rgba(26, 37, 47, 0.1) 100%)
      `,
    },
    message: {
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)
      `,
      borderRadius: '1.2vw',
      padding: '1.5vh 2vw',
      border: '1px solid rgba(255, 187, 76, 0.2)',
      maxWidth: '85%',
      alignSelf: 'flex-start',
      animation: 'slideInLeft 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
    },
    messageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.8vh',
    },
    messageAuthor: {
      fontSize: '1vw',
      fontWeight: '600',
      color: '#FFBB4C',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
    },
    messageTime: {
      fontSize: '0.8vw',
      color: '#B0BEC5',
      fontWeight: '400',
    },
    messageContent: {
      fontSize: '1.1vw',
      color: '#FFFFFF',
      lineHeight: '1.5',
      wordWrap: 'break-word',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.2)',
    },
    chatInputContainer: {
      padding: '2vh 3vw',
      borderTop: '2px solid rgba(255, 187, 76, 0.3)',
      background: `
        linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(26, 37, 47, 0.9) 100%)
      `,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.2)',
    },
    chatInputWrapper: {
      display: 'flex',
      gap: '1vw',
      alignItems: 'center',
    },
    chatInput: {
      flex: 1,
      padding: '1.5vh 2vw',
      borderRadius: '2vw',
      border: '2px solid rgba(255, 187, 76, 0.4)',
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)
      `,
      color: '#FFFFFF',
      fontSize: '1.1vw',
      transition: 'all 0.3s ease',
      outline: 'none',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.2)',
    },
    sendButton: {
      background: 'linear-gradient(135deg, #009759 0%, #00b366 100%)',
      color: 'white',
      border: 'none',
      padding: '1.5vh 2vw',
      borderRadius: '50%',
      fontSize: '1.2vw',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '4vw',
      height: '4vw',
      boxShadow: '0 4px 15px rgba(0, 151, 89, 0.4)',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '2vh',
    },
    modalContent: {
      backgroundColor: '#1A252F',
      borderRadius: '1vw',
      padding: '3vh 3vw',
      maxWidth: '80vw',
      maxHeight: '80vh',
      overflow: 'auto',
      border: '2px solid rgba(255, 187, 76, 0.3)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2vh',
      borderBottom: '2px solid rgba(255, 187, 76, 0.2)',
      paddingBottom: '1vh',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5vh',
    },
    input: {
      padding: '1.2vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      fontSize: '1vw',
      transition: 'all 0.3s ease',
    },
    textarea: {
      padding: '1.2vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      fontSize: '1vw',
      minHeight: '10vh',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    submitButton: {
      backgroundColor: '#009759',
      color: 'white',
      border: 'none',
      padding: '1.5vh 2vw',
      borderRadius: '0.8vw',
      fontSize: '1.1vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      disabled: submitting,
    },
    loading: {
      textAlign: 'center',
      padding: '4vh',
      fontSize: '1.2vw',
      color: '#FFBB4C',
    },
    emptyState: {
      textAlign: 'center',
      padding: '4vh 2vw',
      color: '#B0B0B0',
      fontSize: '1.1vw',
    },
    '@media (max-width: 768px)': {
      title: {
        fontSize: '6vw',
      },
      subtitle: {
        fontSize: '3vw',
      },
      searchInput: {
        width: '100%',
        fontSize: '3vw',
      },
      sortSelect: {
        fontSize: '3vw',
        minWidth: '30vw',
        backgroundSize: '3vw',
        paddingRight: '8vw',
      },
      createButton: {
        fontSize: '3vw',
        padding: '2vh 4vw',
      },
      discussionTitle: {
        fontSize: '4vw',
      },
      discussionDescription: {
        fontSize: '3vw',
      },
      discussionMeta: {
        fontSize: '2.5vw',
      },
      discussionStats: {
        fontSize: '2.5vw',
      },
      mainLayout: {
        flexDirection: 'column',
      },
      discussionsPanel: {
        width: '100%',
        height: '30%',
      },
      chatDrawer: {
        width: '100%',
        height: '70%',
      },
      panelTitle: {
        fontSize: '4vw',
      },
      panelSubtitle: {
        fontSize: '2.5vw',
      },
      panelSearchInput: {
        fontSize: '3.5vw',
      },
      panelSortSelect: {
        fontSize: '3.5vw',
      },
      panelCreateButton: {
        fontSize: '3.5vw',
      },
      panelDiscussionTitle: {
        fontSize: '3vw',
      },
      panelDiscussionMeta: {
        fontSize: '2.5vw',
      },
      panelDiscussionStats: {
        fontSize: '2.5vw',
      },
      chatTitle: {
        fontSize: '4.5vw',
      },
      chatMeta: {
        fontSize: '3vw',
      },
      chatDescription: {
        fontSize: '3.2vw',
      },
      messageAuthor: {
        fontSize: '3vw',
      },
      messageTime: {
        fontSize: '2.5vw',
      },
      messageContent: {
        fontSize: '3.2vw',
      },
      chatInput: {
        fontSize: '3.5vw',
      },
      sendButton: {
        fontSize: '3.5vw',
        width: '12vw',
        height: '12vw',
      },
    } as any,
  });

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <Navbar />
      
      {/* Layout original quando não há gaveta */}
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Discussões</h1>
          <p style={styles.subtitle}>Partilhe as suas opiniões sobre o CS Marítimo</p>
        </div>

        <div style={styles.controls}>
          <div style={styles.leftControls}>
            <input
              type="text"
              placeholder="Pesquisar discussões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
              style={styles.sortSelect}
            >
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigas</option>
              <option value="popular">Mais Populares</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            style={styles.createButton}
            className="hover-button"
          >
            Nova Discussão
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>A carregar discussões...</div>
        ) : (
          <div style={styles.discussionsList}>
            {filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                style={styles.discussionCard}
                className="hover-card"
                onClick={() => openDiscussion(discussion)}
              >
                <div style={styles.discussionHeader}>
                  <div>
                    <h3 style={styles.discussionTitle}>{discussion.title}</h3>
                    <div style={styles.discussionMeta}>
                      Por {discussion.author_username} • {formatDate(discussion.created_at)}
                    </div>
                  </div>
                </div>
                <p style={styles.discussionDescription}>
                  {discussion.description.length > 200 
                    ? `${discussion.description.substring(0, 200)}...` 
                    : discussion.description}
                </p>
                <div style={styles.discussionStats}>
                  <span>{discussion.comment_count} comentários</span>
                  <span>Última atividade: {formatDate(discussion.last_activity)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Layout da gaveta */}
      <div style={styles.mainLayout}>
        {/* Discussions Panel */}
        <div style={styles.discussionsPanel}>
          <div style={styles.panelHeader}>
            <h1 style={styles.panelTitle}>Discussões</h1>
            <p style={styles.panelSubtitle}>Partilhe as suas opiniões sobre o CS Marítimo</p>
          </div>

          <div style={styles.panelControls}>
            <input
              type="text"
              placeholder="Pesquisar discussões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.panelSearchInput}
              className="panel-search-input"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
              style={styles.panelSortSelect}
            >
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigas</option>
              <option value="popular">Mais Populares</option>
            </select>
            <button
              onClick={() => setShowCreateForm(true)}
              style={styles.panelCreateButton}
              className="hover-button"
            >
              Nova Discussão
            </button>
          </div>

          <div style={styles.panelDiscussionsList}>
            {loading ? (
              <div style={styles.loading}>A carregar discussões...</div>
            ) : filteredDiscussions.length === 0 ? (
              <div style={styles.emptyState}>
                Nenhuma discussão encontrada.
              </div>
            ) : (
              filteredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  style={{
                    ...styles.panelDiscussionCard,
                    backgroundColor: selectedDiscussion?.id === discussion.id 
                      ? 'rgba(255, 187, 76, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderColor: selectedDiscussion?.id === discussion.id 
                      ? 'rgba(255, 187, 76, 0.5)' 
                      : 'rgba(255, 187, 76, 0.2)',
                  }}
                  className={`hover-card ${selectedDiscussion?.id === discussion.id ? 'panel-discussion-selected' : ''}`}
                  onClick={() => openDiscussion(discussion)}
                >
                  <h3 style={styles.panelDiscussionTitle}>{discussion.title}</h3>
                  <div style={styles.panelDiscussionMeta}>
                    Por {discussion.author_username} • {formatDate(discussion.created_at)}
                  </div>
                  <div style={styles.panelDiscussionStats}>
                    {discussion.comment_count} comentários
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Drawer */}
        <div style={styles.chatDrawer}>
          {selectedDiscussion && (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderInfo}>
                  <h2 style={styles.chatTitle}>{selectedDiscussion.title}</h2>
                  <div style={styles.chatMeta}>
                    Por {selectedDiscussion.author_username} • {formatDate(selectedDiscussion.created_at)}
                  </div>
                  <p style={styles.chatDescription}>{selectedDiscussion.description}</p>
                </div>
                <button 
                  style={styles.closeButton} 
                  onClick={closeDiscussion}
                  className="close-button"
                >
                  ×
                </button>
              </div>

              <div style={styles.messagesContainer}>
                {comments.length === 0 ? (
                  <div style={styles.emptyState}>
                    Seja o primeiro a comentar nesta discussão!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} style={styles.message}>
                      <div style={styles.messageHeader}>
                        <span style={styles.messageAuthor}>{comment.author_username}</span>
                        <span style={styles.messageTime}>{formatChatTime(comment.created_at)}</span>
                      </div>
                      <p style={styles.messageContent}>{comment.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.chatInputContainer}>
                <div style={styles.chatInputWrapper}>
                  <input
                    ref={chatInputRef}
                    type="text"
                    placeholder="Escreva a sua mensagem..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={styles.chatInput}
                    className="chat-input"
                    disabled={submitting}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    style={styles.sendButton}
                    className="send-button"
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? '...' : '→'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Discussion Modal */}
      {showCreateForm && (
        <div style={styles.modal} onClick={() => setShowCreateForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Nova Discussão</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} style={styles.form}>
              <input
                type="text"
                placeholder="Título da discussão"
                value={newDiscussionTitle}
                onChange={(e) => setNewDiscussionTitle(e.target.value)}
                style={styles.input}
                required
                maxLength={200}
              />
              <textarea
                placeholder="Descreva o que quer discutir..."
                value={newDiscussionDescription}
                onChange={(e) => setNewDiscussionDescription(e.target.value)}
                style={styles.textarea}
                required
                maxLength={2000}
              />
              <button
                type="submit"
                style={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? 'A criar...' : 'Criar Discussão'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes optimized-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }

        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 187, 76, 0.3);
          border-color: rgba(255, 187, 76, 0.5);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%);
        }

        .hover-button:hover {
          background: linear-gradient(135deg, #00b366 0%, #00d474 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 151, 89, 0.5);
        }

        input:focus, textarea:focus, select:focus {
          border-color: rgba(255, 187, 76, 0.7);
          box-shadow: 0 0 0 3px rgba(255, 187, 76, 0.15);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(255, 187, 76, 0.4) 0%, rgba(255, 187, 76, 0.6) 100%);
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(255, 187, 76, 0.6) 0%, rgba(255, 187, 76, 0.8) 100%);
        }

        /* Panel discussion card selected state */
        .panel-discussion-selected {
          background: linear-gradient(135deg, rgba(255, 187, 76, 0.25) 0%, rgba(255, 187, 76, 0.15) 100%);
          border-color: rgba(255, 187, 76, 0.6);
          box-shadow: 0 4px 15px rgba(255, 187, 76, 0.3);
        }

        /* Close button hover effects */
        .close-button:hover {
          background-color: rgba(244, 67, 54, 0.2);
          border-color: rgba(244, 67, 54, 0.8);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        }

        /* Send button disabled state */
        .send-button:disabled {
          background: linear-gradient(135deg, rgba(0, 151, 89, 0.5) 0%, rgba(0, 179, 102, 0.5) 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 8px rgba(0, 151, 89, 0.2);
        }

        /* Chat input placeholder styling */
        .chat-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        /* Panel search input placeholder styling */
        .panel-search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;