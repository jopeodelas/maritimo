import { Link } from 'react-router-dom';
import React from 'react';

const NotFoundPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404 - Página não encontrada</h1>
      <p style={styles.text}>
        Ups! Parece que a página que procura não existe.<br />
        Explore algumas das nossas páginas principais abaixo.
      </p>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Início</Link>
        <Link to="/login" style={styles.link}>Entrar</Link>
        <Link to="/news" style={styles.link}>Notícias</Link>
        <Link to="/squad" style={styles.link}>Plantel</Link>
      </nav>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)',
    color: '#fff'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  text: {
    fontSize: '1.1rem',
    marginBottom: '2rem'
  },
  nav: {
    display: 'flex',
    gap: '1rem'
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none'
  }
};

export default NotFoundPage; 