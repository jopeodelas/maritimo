import PageLayout from "../components/PageLayout";
import LayoutStabilizer from "../components/LayoutStabilizer";
import { createStyles } from "../styles/styleUtils";
import useIsMobile from "../hooks/useIsMobile";
import Seo from '../components/Seo';
import { useEffect, useState } from 'react';
import { getSeasonFixtures, type Fixture } from '../services/scheduleService';
import OptimizedImage from "../components/OptimizedImage";

const Schedule = () => {
  const isMobile = useIsMobile();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSeasonFixtures(2025);
        setFixtures(data);
      } catch (err) {
        console.error('Erro a buscar calendário:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusDisplay = (status: string, homeScore?: number, awayScore?: number) => {
    switch (status) {
      case 'FT':
        return {
          text: `${homeScore ?? 0}-${awayScore ?? 0}`,
          color: '#4CAF50'
        };
      case 'LIVE':
        return {
          text: `${homeScore ?? 0}-${awayScore ?? 0}`,
          color: '#F44336'
        };
      case 'HT':
        return {
          text: 'Intervalo',
          color: '#FFA000'
        };
      case 'CANC':
        return {
          text: 'Cancelado',
          color: '#F44336'
        };
      case 'PST':
        return {
          text: 'Adiado',
          color: '#FF9800'
        };
      default:
        return {
          text: 'Por começar',
          color: '#FFFFFF'
        };
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
      padding: isMobile 
        ? "70px 1rem 1rem" // Mobile: padding top para header + spacing
        : "clamp(8rem, 10vh, 10rem) clamp(0.5rem, 1vw, 1.5rem) clamp(1rem, 2vh, 2rem)", // Desktop original
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
    messageContainer: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(2rem, 4vh, 3rem) clamp(1.5rem, 3vw, 2.5rem)",
      backdropFilter: "blur(10px)",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 3vh, 2.5rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.2)
      `,
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    },
    message: {
      fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
      lineHeight: "1.6",
      color: "#FFFFFF",
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
      fontWeight: "600",
    },
    subMessage: {
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      color: "#B0BEC5",
      lineHeight: "1.6",
      fontWeight: "400",
    },
    calendarIcon: {
      width: "clamp(4rem, 8vw, 6rem)",
      height: "clamp(4rem, 8vw, 6rem)",
      margin: "0 auto clamp(1rem, 2vh, 1.5rem)",
      background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
      borderRadius: "clamp(0.5rem, 1vw, 0.75rem)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      boxShadow: "0 clamp(0.25rem, 1vh, 0.5rem) clamp(1rem, 2vh, 1.5rem) rgba(76, 175, 80, 0.3)",
    },
    calendarTop: {
      position: "absolute",
      top: "15%",
      left: "20%",
      right: "20%",
      height: "15%",
      background: "rgba(255, 255, 255, 0.9)",
      borderRadius: "clamp(0.1rem, 0.2vw, 0.2rem)",
    },
    calendarBody: {
      position: "absolute",
      top: "35%",
      left: "15%",
      right: "15%",
      bottom: "15%",
      background: "white",
      borderRadius: "clamp(0.1rem, 0.2vw, 0.2rem)",
      display: "flex",
      flexDirection: "column",
      padding: "8%",
    },
    calendarLine: {
      height: "15%",
      background: "rgba(76, 175, 80, 0.3)",
      marginBottom: "10%",
      borderRadius: "clamp(0.05rem, 0.1vw, 0.1rem)",
    },
    calendarRings: {
      position: "absolute",
      top: "8%",
      left: "25%",
      right: "25%",
      height: "20%",
      display: "flex",
      justifyContent: "space-between",
    },
    calendarRing: {
      width: "15%",
      height: "100%",
      background: "rgba(255, 255, 255, 0.8)",
      borderRadius: "50%",
    },
    scheduleTable: {
      width: '100%',
      maxWidth: '80rem',
      margin: '0 auto',
      borderCollapse: 'separate',
      borderSpacing: '0 0.5rem',
      color: '#FFFFFF',
    },
    tableHeader: {
      textAlign: 'left',
      padding: '1rem',
      background: 'rgba(76, 175, 80, 0.1)',
      borderBottom: '2px solid rgba(76, 175, 80, 0.4)',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: '600',
    },
    tableRow: {
      background: 'rgba(30, 40, 50, 0.95)',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
    },
    tableCell: {
      padding: '1rem',
      verticalAlign: 'middle',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    },
    teamContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    teamLogo: {
      width: '2rem',
      height: '2rem',
      objectFit: 'contain',
    },
    teamName: {
      flex: 1,
    },
    statusBadge: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      textAlign: 'center',
      minWidth: '6rem',
    },
    competitionInfo: {
      fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
      color: '#B0BEC5',
    },
  });

  return (
    <PageLayout>
      <Seo title="Calendário de Jogos - CS Marítimo Fans" description="Consulta o calendário e resultados dos jogos do CS Marítimo." />
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <LayoutStabilizer>
          <div style={styles.content}>
            <div style={styles.heroSection}>
              <div style={styles.heroAccent}></div>
              <h1 style={styles.heroTitle}>Calendário e Resultados</h1>
            </div>
            <div style={styles.messageContainer}>
              {loading ? (
                <p style={styles.message}>A carregar calendário...</p>
              ) : fixtures.length === 0 ? (
                <p style={styles.message}>Sem jogos disponíveis para mostrar.</p>
              ) : (
                <table style={styles.scheduleTable}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Data</th>
                      <th style={styles.tableHeader}>Competição</th>
                      <th style={styles.tableHeader}>Casa</th>
                      <th style={styles.tableHeader}>Resultado</th>
                      <th style={styles.tableHeader}>Fora</th>
                      <th style={styles.tableHeader}>Local</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixtures.map(match => {
                      const dateObj = new Date(match.match_date);
                      const dateStr = dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      const timeStr = dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                      const status = getStatusDisplay(match.status, match.home_score, match.away_score);
                      
                      return (
                        <tr key={match.fixture_id} style={styles.tableRow}>
                          <td style={styles.tableCell}>
                            <div>{dateStr}</div>
                            <div style={styles.competitionInfo}>{timeStr}</div>
                          </td>
                          <td style={styles.tableCell}>
                            <div>{match.competition}</div>
                            <div style={styles.competitionInfo}>{match.round}</div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.teamContainer}>
                              {match.home_team_logo && (
                                <OptimizedImage
                                  src={match.home_team_logo}
                                  alt={`${match.home_team} logo`}
                                  style={styles.teamLogo}
                                />
                              )}
                              <span style={styles.teamName}>{match.home_team}</span>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ ...styles.statusBadge, color: status.color }}>
                              {status.text}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.teamContainer}>
                              {match.away_team_logo && (
                                <OptimizedImage
                                  src={match.away_team_logo}
                                  alt={`${match.away_team} logo`}
                                  style={styles.teamLogo}
                                />
                              )}
                              <span style={styles.teamName}>{match.away_team}</span>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div>{match.venue}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </LayoutStabilizer>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default Schedule; 