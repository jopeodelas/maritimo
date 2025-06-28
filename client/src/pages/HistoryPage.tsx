import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import LayoutStabilizer from '../components/LayoutStabilizer';
import { createStyles } from '../styles/styleUtils';
import useIsMobile from '../hooks/useIsMobile';

interface HistoryEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  category: 'fundacao' | 'conquista' | 'marco' | 'jogador' | 'estadio';
  image?: string;
  isHighlight?: boolean;
}

const HistoryPage = () => {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const historyEvents: HistoryEvent[] = [
    {
      id: 1,
      year: 1910,
      title: 'Fundação do Club Sport Marítimo',
      description: 'O Club Sport Marítimo foi fundado em 20 de setembro de 1910 no bar do Aurora, no Funchal, por Cândido Gouveia, iniciando-se como voz da corrente republicana na Madeira.',
      category: 'fundacao',
      isHighlight: true
    },
    {
      id: 2,
      year: 1917,
      title: 'Primeiro Campeonato da Madeira',
      description: 'Conquista do primeiro Campeonato da Madeira em 1916/17, vencendo os dois primeiros troféus regionais e estabelecendo o domínio no futebol madeirense.',
      category: 'conquista'
    },
    {
      id: 3,
      year: 1926,
      title: 'Campeão Nacional de Portugal',
      description: 'Vitória histórica no Campeonato de Portugal: derrota ao FC Porto por 7–1 na meia-final e ao Belenenses por 2–0 na final, tornando-se campeão nacional.',
      category: 'conquista',
      isHighlight: true
    },
    {
      id: 4,
      year: 1957,
      title: 'Inauguração do Estádio dos Barreiros',
      description: 'Em 5 de maio de 1957 foi inaugurado o mítico Estádio dos Barreiros (obras iniciadas em 1953), com 12.000 espectadores e presidido pelo Ministro Arantes de Oliveira.',
      category: 'estadio',
      isHighlight: true
    },
    {
      id: 5,
      year: 1973,
      title: 'Regresso às Competições Nacionais',
      description: 'Regresso às competições nacionais após décadas de exclusão de clubes insulares, marcando uma nova era para o futebol madeirense.',
      category: 'marco'
    },
    {
      id: 6,
      year: 1977,
      title: 'Primeira Subida à I Divisão',
      description: 'Triunfo na II Divisão (Zona Sul) em 1976–77 e primeira promoção à I Divisão, tornando-se pioneiro fora do território continental português.',
      category: 'conquista',
      isHighlight: true
    },
    {
      id: 7,
      year: 1982,
      title: 'Regresso à Elite',
      description: 'Novo título da II Divisão (Zona Sul) em 1981–82 e regresso à I Divisão, preparando-se para uma longa permanência na elite do futebol português.',
      category: 'conquista'
    },
    {
      id: 8,
      year: 1985,
      title: 'Início do Ciclo Histórico na I Liga',
      description: 'Início de um ciclo histórico de 38 temporadas consecutivas na Primeira Liga (1985–2023), consolidando-se entre os grandes do futebol nacional.',
      category: 'marco',
      isHighlight: true
    },
    {
      id: 9,
      year: 1995,
      title: 'Primeira Final da Taça de Portugal',
      description: 'Em 10 de junho de 1995, primeira final da Taça de Portugal no Estádio Nacional, frente ao Sporting CP (derrota por 0–2).',
      category: 'conquista',
      isHighlight: true
    },
    {
      id: 10,
      year: 2001,
      title: 'Segunda Final da Taça de Portugal',
      description: 'Em 10 de junho de 2001, segunda final da Taça de Portugal, novamente no Jamor, contra o FC Porto (derrota por 0–2).',
      category: 'conquista'
    },
    {
      id: 11,
      year: 2007,
      title: 'Cedência do Terreno dos Barreiros',
      description: 'Em 14 de setembro de 2007, cedência do espaço do Estádio dos Barreiros pelo Governo Regional da Madeira para construção do novo estádio.',
      category: 'estadio'
    },
    {
      id: 12,
      year: 2013,
      title: 'Primeira Fase de Grupos da Liga Europa',
      description: 'Na temporada 2012/13, primeira qualificação para a fase de grupos da Liga Europa, a melhor campanha europeia do clube até então.',
      category: 'conquista',
      isHighlight: true
    },
    {
      id: 13,
      year: 2015,
      title: 'Novo Troço do Estádio dos Barreiros',
      description: 'Em 18 de janeiro de 2015, estreia do primeiro troço do novo estádio, com 7.000 lugares, no triunfo sobre o Braga.',
      category: 'estadio'
    },
    {
      id: 14,
      year: 2016,
      title: 'Final da Taça da Liga',
      description: 'Em 20 de maio de 2016, final da Taça da Liga em Coimbra, derrota por 2–6 contra o Benfica.',
      category: 'conquista'
    },
    {
      id: 15,
      year: 2017,
      title: 'Segunda Final da Taça da Liga',
      description: 'Em 29 de janeiro de 2017, segunda final consecutiva da Taça da Liga, derrota por 0–1 frente ao Moreirense no Estádio do Algarve.',
      category: 'conquista'
    },
    {
      id: 16,
      year: 2023,
      title: 'Fim do Ciclo na Primeira Liga',
      description: 'Em 11 de junho de 2023, derrota nos penáltis (3–2) frente ao Estrela da Amadora na "liguilha" de manutenção, e descida à Liga Portugal 2, encerrando 38 anos seguidos na Primeira Liga.',
      category: 'marco',
      isHighlight: true
    },
    {
      id: 17,
      year: 2024,
      title: '4º Lugar na Liga Portugal 2',
      description: 'Na temporada 2023/24, concluíram a época na Liga Portugal 2 em 4.º lugar, com ambição de regresso ao principal escalão.',
      category: 'marco'
    },
    {
      id: 18,
      year: 2025,
      title: 'Projetos de Retoma',
      description: 'Em 27 de maio de 2025, o Marítimo mantém-se na Liga Portugal 2, preparando projetos de retoma desportiva e estabilidade financeira.',
      category: 'marco'
    },
    {
      id: 19,
      year: 1993,
      title: 'Contratação de Alex Bunbury',
      description: 'O avançado canadiano chegou ao Marítimo vindo do West Ham United na temporada 1993–94, tornando-se num dos principais marcadores do clube. Em seis épocas, disputou 165 jogos e apontou 59 golos na Primeira Liga.',
      category: 'jogador',
      isHighlight: true
    },
    {
      id: 20,
      year: 2010,
      title: 'Contratação de Héldon Ramos',
      description: 'O médio ofensivo cabo-verdiano assinou pelo Marítimo junto do C.D. Fátima em agosto de 2010, tendo marcado 15 golos em 82 jogos antes de ser transferido para o Sporting CP.',
      category: 'jogador'
    },
    {
      id: 21,
      year: 2014,
      title: 'Contratação de Edgar Costa',
      description: 'O avançado madeirense assinou contrato profissional vindo do C.D. Nacional em 7 de julho de 2014. Tornou-se capitão e ultrapassou as 230 presenças pelo Marítimo até 2024.',
      category: 'jogador',
      isHighlight: true
    },
    {
      id: 22,
      year: 2017,
      title: 'Contratação de Zainadine Júnior',
      description: 'O defesa-central moçambicano chegou por empréstimo do Tianjin Teda em janeiro de 2017 e confirmou o vínculo definitivo em julho, ultrapassando as 180 partidas pelo clube até 2024.',
      category: 'jogador'
    },
    {
      id: 23,
      year: 2021,
      title: 'Contratação de André Vidigal',
      description: 'O extremo português foi contratado ao Fortuna Sittard por €500.000, tendo somado 9 golos em 65 jogos antes de sair para o Stoke City.',
      category: 'jogador'
    },
    {
      id: 24,
      year: 2025,
      title: 'Contratação de Fábio Blanco',
      description: 'O extremo espanhol de 21 anos foi contratado ao Villarreal B em 14 de janeiro de 2025, assinando até 30 de junho de 2027 com o Marítimo.',
      category: 'jogador'
    },
    {
      id: 25,
      year: 1992,
      title: 'Chegada de Eusébio',
      description: 'O lateral-esquerdo estreou-se em 1992 e, até 2005, realizou 173 partidas na Primeira Liga (189 em todas as competições) e apontou 16 golos, tornando-se num símbolo de longevidade e lealdade ao Marítimo.',
      category: 'jogador',
      isHighlight: true
    },
    {
      id: 26,
      year: 1997,
      title: 'Contratação de Albertino',
      description: 'Lateral-direito contratado em 1997, foi peça-chave entre 1997 e 2004, cumprindo 169 jogos na Primeira Liga (187 em todas as competições) e marcando 18 golos, notabilizando-se pela consistência defensiva.',
      category: 'jogador'
    },
    {
      id: 27,
      year: 2001,
      title: 'Chegada de Pepe',
      description: 'O defesa-central brasileiro-naturalizado português chegou ao Marítimo B em 2001, subiu em 2002–03 à equipa principal, somando 63 partidas e 3 golos até 2004, antes de se transferir para o FC Porto e lançar-se numa carreira de elite mundial.',
      category: 'jogador',
      isHighlight: true
    },
    {
      id: 28,
      year: 2005,
      title: 'Contratação de Marcinho',
      description: 'O médio ofensivo brasileiro chegou do Santos FC em janeiro de 2005 e, entre 2005 e 2009, nunca fez menos de 27 jogos por época na I Liga, atingindo o seu auge em 2008–09 com 29 partidas e 6 golos, incluindo um golo na Taça UEFA contra o Valencia CF.',
      category: 'jogador'
    },
    {
      id: 29,
      year: 2013,
      title: 'Contratação de Danilo Pereira',
      description: 'O médio defensivo assinou proveniente do Parma em 1 de agosto de 2013, fez 57 jogos e marcou 4 golos pelo Marítimo em duas épocas (2013–15) e, em julho de 2015, rumou ao FC Porto num negócio de €4,5 M.',
      category: 'jogador',
      isHighlight: true
    },
    {
      id: 30,
      year: 2014,
      title: 'Contratação de Moussa Marega',
      description: 'O avançado maliano foi contratado do Amiens SC e, na temporada 2014–15, brilhou com 15 golos em 34 jogos na Primeira Liga. O seu rendimento valeu-lhe a transferência para o FC Porto por cerca de €3,8 M em janeiro de 2015.',
      category: 'jogador',
      isHighlight: true
    },
    {
      id: 31,
      year: 2014,
      title: 'Contratação de Dyego Sousa',
      description: 'Contratado do Portimonense em julho de 2014, destacou-se na equipa principal ao totalizar 61 jogos e 19 golos na Primeira Liga entre 2014 e 2017, assumindo-se como um finalizador letal.',
      category: 'jogador'
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todos', color: '#009759' },
    { id: 'fundacao', name: 'Fundação', color: '#E74C3C' },
    { id: 'conquista', name: 'Conquistas', color: '#F39C12' },
    { id: 'marco', name: 'Marcos', color: '#3498DB' },
    { id: 'jogador', name: 'Jogadores', color: '#9B59B6' },
    { id: 'estadio', name: 'Estádio', color: '#27AE60' }
  ];

  const filteredEvents = selectedCategory === 'todos' 
    ? [...historyEvents].sort((a, b) => a.year - b.year)
    : historyEvents.filter(event => event.category === selectedCategory).sort((a, b) => a.year - b.year);

  const openModal = (event: HistoryEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : '#009759';
  };

  const styles = createStyles({
    container: {
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      color: '#FFFFFF',
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(30deg, transparent 40%, rgba(76, 175, 80, 0.03) 40%, rgba(76, 175, 80, 0.03) 60%, transparent 60%),
        linear-gradient(-30deg, transparent 40%, rgba(244, 67, 54, 0.03) 40%, rgba(244, 67, 54, 0.03) 60%, transparent 60%)
      `,
      backgroundSize: 'clamp(3rem, 8vw, 6rem) clamp(3rem, 8vw, 6rem)',
      animation: 'float 20s ease-in-out infinite',
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile 
        ? '70px 1rem 1rem' // Mobile: padding top para header + spacing
        : '4vh 3vw', // Desktop original
      position: 'relative',
      zIndex: 2,
    },
    header: {
      textAlign: 'center',
      marginBottom: '6vh',
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
    title: {
      fontSize: '4vw',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '2vh',
      textShadow: '0.2vh 0.2vh 0.6vh rgba(0, 0, 0, 0.5)',
      fontFamily: '"Shockwave", cursive',
    },
    subtitle: {
      fontSize: '1.5vw',
      color: '#FFBB4C',
      fontWeight: '400',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    filterContainer: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '1.5vw',
      marginBottom: '6vh',
    },
    filterButton: {
      padding: '1.2vh 2.5vw',
      borderRadius: '2vw',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.15)',
      color: '#FFFFFF',
      fontSize: '1.1vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.7)',
    },
    filterButtonActive: {
      background: 'linear-gradient(135deg, #009759 0%, #006633 100%)',
      borderColor: '#FFBB4C',
      transform: 'translateY(-0.2vh)',
      boxShadow: '0 0.5vh 1.5vh rgba(0, 151, 89, 0.4)',
    },
    timelineContainer: {
      position: 'relative',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    timelineLine: {
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: '4px',
      background: 'linear-gradient(to bottom, #009759, #FFBB4C, #009759)',
      transform: 'translateX(-50%)',
      borderRadius: '2px',
    },
    timelineEvent: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '4vh',
      position: 'relative',
    },
    timelineEventLeft: {
      flexDirection: 'row-reverse',
    },
    timelineEventRight: {
      flexDirection: 'row',
    },
    eventCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(15px)',
      borderRadius: '1.5vw',
      padding: '3vh 2.5vw',
      width: '45%',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    eventYear: {
      fontSize: '2.5vw',
      fontWeight: '700',
      color: '#FFBB4C',
      marginBottom: '1vh',
      fontFamily: '"Shockwave", cursive',
    },
    eventTitle: {
      fontSize: '1.4vw',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '1.5vh',
      lineHeight: '1.3',
    },
    eventDescription: {
      fontSize: '1vw',
      color: '#B0B0B0',
      lineHeight: '1.5',
      marginBottom: '1.5vh',
    },
    eventCategory: {
      display: 'inline-block',
      padding: '0.5vh 1.5vw',
      borderRadius: '1vw',
      fontSize: '0.9vw',
      fontWeight: '600',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    timelineDot: {
      position: 'absolute',
      left: '50%',
      top: '3vh',
      width: '2vw',
      height: '2vw',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #009759, #FFBB4C)',
      transform: 'translateX(-50%)',
      border: '4px solid #FFFFFF',
      boxShadow: '0 0.5vh 1.5vh rgba(0, 0, 0, 0.3)',
      zIndex: 10,
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    },
    modalContent: {
      background: 'linear-gradient(135deg, #1A252F 0%, #2C3E50 100%)',
      borderRadius: '2vw',
      padding: '4vh 3vw',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
      border: '2px solid rgba(255, 187, 76, 0.3)',
      boxShadow: '0 2vh 6vh rgba(0, 0, 0, 0.5)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '3vh',
    },
    modalTitle: {
      fontSize: '2vw',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '1vh',
    },
    modalYear: {
      fontSize: '1.5vw',
      color: '#FFBB4C',
      fontWeight: '600',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#FFFFFF',
      fontSize: '2vw',
      cursor: 'pointer',
      padding: '0.5vh',
      borderRadius: '50%',
      width: '3vw',
      height: '3vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    modalDescription: {
      fontSize: '1.2vw',
      color: '#E0E0E0',
      lineHeight: '1.6',
      marginBottom: '2vh',
    },
    '@media (max-width: 768px)': {
      title: {
        fontSize: '8vw',
      },
      subtitle: {
        fontSize: '3.5vw',
      },
      filterButton: {
        fontSize: '2.5vw',
        padding: '1.5vh 4vw',
      },
      timelineLine: {
        left: '5vw',
      },
      eventCard: {
        width: '85%',
        marginLeft: '10vw',
      },
      timelineEvent: {
        flexDirection: 'row !important',
      },
      timelineDot: {
        left: '5vw',
        width: '4vw',
        height: '4vw',
      },
      eventYear: {
        fontSize: '5vw',
      },
      eventTitle: {
        fontSize: '3.5vw',
      },
      eventDescription: {
        fontSize: '2.5vw',
      },
      eventCategory: {
        fontSize: '2vw',
      },
      modalTitle: {
        fontSize: '4vw',
      },
      modalYear: {
        fontSize: '3vw',
      },
      modalDescription: {
        fontSize: '2.8vw',
      },
      closeButton: {
        fontSize: '4vw',
        width: '6vw',
        height: '6vw',
      },
    } as any,
  });

  useEffect(() => {
    // Add float animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-10px) rotate(1deg); }
        66% { transform: translateY(5px) rotate(-1deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <PageLayout>
      <LayoutStabilizer>
        <div style={styles.container}>
          <div style={styles.backgroundPattern}></div>
          <div style={{
            ...styles.content, 
            paddingTop: isMobile ? "70px" : "clamp(8rem, 10vh, 10rem)"
          }}>
          {/* Hero Section */}
          <div style={styles.heroSection}>
            <div style={styles.heroAccent}></div>
            <h1 style={styles.heroTitle}>História do CS Marítimo</h1>
            <p style={styles.heroSubtitle}>
              Mais de 115 anos de paixão, tradição e momentos inesquecíveis que marcaram 
              a história do nosso querido clube madeirense
            </p>
          </div>

          <div style={styles.filterContainer}>
            {categories.map(category => (
              <button
                key={category.id}
                style={{
                  ...styles.filterButton,
                  ...(selectedCategory === category.id ? styles.filterButtonActive : {}),
                  backgroundColor: selectedCategory === category.id ? category.color : undefined,
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div style={styles.timelineContainer}>
            <div style={styles.timelineLine}></div>
            
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                style={{
                  ...styles.timelineEvent,
                  ...(index % 2 === 0 ? styles.timelineEventLeft : styles.timelineEventRight),
                }}
              >
                <div
                  style={{
                    ...styles.eventCard,
                  }}
                  onClick={() => openModal(event)}
                >
                  <div 
                    style={styles.eventYear}
                    className={isMobile ? "mobile-history-event-year" : ""}
                  >
                    {event.year}
                  </div>
                  <h3 
                    style={styles.eventTitle}
                    className={isMobile ? "mobile-history-event-title" : ""}
                  >
                    {event.title}
                  </h3>
                  <p 
                    style={styles.eventDescription}
                    className={isMobile ? "mobile-history-event-description" : ""}
                  >
                    {event.description.length > 120 
                      ? `${event.description.substring(0, 120)}...` 
                      : event.description}
                  </p>
                  <span
                    style={{
                      ...styles.eventCategory,
                      backgroundColor: getCategoryColor(event.category),
                    }}
                    className={isMobile ? "mobile-history-event-category" : ""}
                  >
                    {categories.find(c => c.id === event.category)?.name}
                  </span>
                </div>
                
                <div
                  style={{
                    ...styles.timelineDot,
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {isModalOpen && selectedEvent && (
          <div style={styles.modal} onClick={closeModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>{selectedEvent.title}</h2>
                  <div style={styles.modalYear}>{selectedEvent.year}</div>
                </div>
                <button style={styles.closeButton} onClick={closeModal}>
                  ×
                </button>
              </div>
              <p style={styles.modalDescription}>{selectedEvent.description}</p>
              <span
                style={{
                  ...styles.eventCategory,
                  backgroundColor: getCategoryColor(selectedEvent.category),
                }}
              >
                {categories.find(c => c.id === selectedEvent.category)?.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </LayoutStabilizer>
    </PageLayout>
  );
};

export default HistoryPage; 