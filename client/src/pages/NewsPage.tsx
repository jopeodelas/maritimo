import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { createStyles } from "../styles/styleUtils";
import { newsService } from "../services/newsService";
import type { NewsItem } from "../services/newsService";

const NewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cacheTime, setCacheTime] = useState<number>(0);

  // PERFORMANCE: Smart caching with stale-while-revalidate strategy
  const STALE_TIME = 30_000; // 30 seconds

  const fetchNews = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Use cache if data is fresh and not forcing refresh
    if (!forceRefresh && news.length > 0 && (now - cacheTime) < STALE_TIME) {
      console.log('📰 FRONTEND: Using cached news data');
      setLoading(false);
      return;
    }

    try {
      console.log('📰 FRONTEND: Fetching fresh news...');
      const newsData = await newsService.getNews();
      setNews(newsData);
      setLastUpdate(new Date());
      setCacheTime(now);
      console.log(`📰 FRONTEND: Loaded ${newsData.length} news items`);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, [news.length, cacheTime]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefreshNews = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 FRONTEND: Force refreshing news...');
      const newsData = await newsService.refreshNews();
      setNews(newsData);
      setLastUpdate(new Date());
      setCacheTime(Date.now());
      console.log(`🔄 FRONTEND: Refreshed ${newsData.length} news items`);
    } catch (error) {
      console.error("Error refreshing news:", error);
    } finally {
      setRefreshing(false);
    }
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

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'record':
        return '#E74C3C';
      case 'a bola':
        return '#3498DB';
      case 'o jogo':
        return '#27AE60';
      case 'google news':
        return '#F39C12';
      default:
        return '#7F8C8D';
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
      margin: "0 0 clamp(1.5rem, 3vh, 2rem) 0",
      fontWeight: "500",
      color: "#B0BEC5",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    refreshButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
      color: "white",
      border: "2px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(0.5rem, 1.5vw, 0.75rem)",
      padding: "clamp(0.75rem, 2vh, 1rem) clamp(1.5rem, 3vw, 2rem)",
      fontSize: "clamp(0.875rem, 2vw, 1rem)",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: "clamp(0.5rem, 1vw, 0.75rem)",
      boxShadow: "0 0.25rem 0.5rem rgba(76, 175, 80, 0.3)",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    updateInfo: {
      textAlign: "center",
      color: "#B0BEC5",
      fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
      marginTop: "clamp(1rem, 2vh, 1.5rem)",
      fontStyle: "italic",
    },
    newsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(20rem, 45vw), 1fr))",
      gap: "clamp(1rem, 2.5vw, 1.5rem)",
      marginTop: "clamp(1.5rem, 3vh, 2rem)",
    },
    newsCard: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(1.5rem, 3vh, 2rem) clamp(1.5rem, 2.5vw, 2rem)",
      backdropFilter: "blur(10px)",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 3vh, 2.5rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.2)
      `,
      transition: "all 0.2s ease",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "clamp(12rem, 25vh, 16rem)", // Fixed height for all cards
      minHeight: "12rem",
    },
    newsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "clamp(0.75rem, 1.5vh, 1rem)",
      gap: "clamp(0.75rem, 1.5vw, 1rem)",
    },
    sourceContainer: {
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
    },
    newsContent: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    newsTitle: {
      fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
      fontWeight: "600",
      lineHeight: "1.4",
      margin: 0,
      color: "#FFFFFF",
      flex: 1,
    },
    newsSource: {
      fontSize: "clamp(0.75rem, 1.6vw, 0.8rem)",
      fontWeight: "600",
      padding: "clamp(0.25rem, 0.75vh, 0.375rem) clamp(0.5rem, 1.5vw, 0.75rem)",
      borderRadius: "clamp(0.25rem, 0.75vw, 0.375rem)",
      color: "white",
      whiteSpace: "nowrap",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.3)",
    },
    newsDescription: {
      fontSize: "clamp(0.875rem, 1.8vw, 0.9rem)",
      color: "#B0BEC5",
      lineHeight: "1.5",
      marginBottom: "clamp(1rem, 2vh, 1.5rem)",
    },
    newsFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "clamp(0.75rem, 1.6vw, 0.8rem)",
      color: "#95A5A6",
      paddingTop: "clamp(0.75rem, 1.5vh, 1rem)",
      borderTop: "1px solid rgba(76, 175, 80, 0.2)",
      marginTop: "auto", // This pushes the footer to the bottom
    },
    newsDate: {
      fontWeight: "500",
    },
    readMore: {
      color: "#4CAF50",
      textDecoration: "none",
      fontWeight: "600",
      transition: "color 0.3s ease",
      cursor: "pointer",
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      color: "#B0BEC5",
      fontWeight: "500",
    },
    emptyState: {
      textAlign: "center",
      padding: "clamp(2rem, 5vh, 4rem)",
      color: "#B0BEC5",
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      backdropFilter: "blur(10px)",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 3vh, 2.5rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.2)
      `,
    },
    emptyTitle: {
      fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
      fontWeight: "600",
      color: "#FFFFFF",
      marginBottom: "clamp(0.5rem, 1vh, 1rem)",
    },
    emptyText: {
      fontSize: "clamp(0.875rem, 2vw, 1rem)",
      color: "#B0BEC5",
    }
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern} className="background-pattern"></div>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.loading}>
            🔄 A carregar notícias do CS Marítimo...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern} className="background-pattern"></div>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.heroSection}>
          <div style={styles.heroAccent}></div>
          <h1 style={styles.heroTitle}>Notícias do CS Marítimo</h1>
          <p style={styles.heroSubtitle}>
            Todas as últimas notícias sobre o clube
          </p>
          
          <button
            style={styles.refreshButton}
            onClick={handleRefreshNews}
            disabled={refreshing}
            className="hover-refresh-news"
          >
            {refreshing ? "A atualizar..." : "Atualizar Notícias"}
          </button>

          {lastUpdate && (
            <div style={styles.updateInfo}>
              Última atualização: {lastUpdate.toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          )}
        </div>

        {news.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>Nenhuma notícia disponível no momento</h3>
            <p style={styles.emptyText}>Tente atualizar as notícias ou volte mais tarde.</p>
          </div>
        ) : (
          <div style={styles.newsGrid}>
            {news.map((item, index) => (
              <div
                key={`${item.url}_${index}`}
                style={styles.newsCard}
                            className="hover-news-card"
                onClick={() => window.open(item.url, '_blank')}
              >
                <div style={styles.newsContent}>
                  <div style={styles.newsHeader}>
                    <h3 style={styles.newsTitle}>{item.title}</h3>
                  </div>
                  
                  <div style={styles.sourceContainer}>
                    <span
                      style={{
                        ...styles.newsSource,
                        backgroundColor: getSourceColor(item.source)
                      }}
                    >
                      {item.source}
                    </span>
                  </div>
                </div>

                <div style={styles.newsFooter}>
                  <span style={styles.newsDate}>
                    {formatDate(item.publishedAt)}
                  </span>
                  <span style={styles.readMore}>
                    Ler mais →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage; 