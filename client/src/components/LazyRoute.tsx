import { Suspense, lazy } from 'react';

interface LazyRouteProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
}

const LazyRoute = ({ component, fallback }: LazyRouteProps) => {
  const LazyComponent = lazy(component);
  
  const defaultFallback = (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)',
      color: '#FFFFFF',
      fontSize: '1.2rem',
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #009759',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>A carregar...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent />
    </Suspense>
  );
};

export default LazyRoute; 