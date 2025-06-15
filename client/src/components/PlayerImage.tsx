import { useState, useRef, useEffect } from 'react';
import { getPlayerImageUrl } from '../utils/imageUtils';

interface PlayerImageProps {
  imageUrl?: string;
  playerName: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  loading?: 'lazy' | 'eager';
  showFallbackText?: boolean;
}

const PlayerImage = ({ 
  imageUrl,
  playerName,
  width = "80", 
  height = "80", 
  style, 
  className, 
  loading = 'lazy',
  showFallbackText = true
}: PlayerImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [usesFallback, setUsesFallback] = useState(false);
  const [attemptedUrls, setAttemptedUrls] = useState<string[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cache buster para forçar reload
  const getCacheBuster = () => `?v=${Date.now()}`;

  // Mapeamento direto para jogadores problemáticos com cache busting
  const getCorrectImageUrl = (playerName: string, originalUrl?: string): string => {
    const name = playerName.toLowerCase();
    const cacheBuster = getCacheBuster();
    
    // Correções específicas e diretas com cache busting
    if (name.includes('gonçalo') && name.includes('tabuaço')) {
      const url = `/images/goncalo-tabuaco.png${cacheBuster}`;
      console.log(`🎯 FORÇA Gonçalo Tabuaço: ${url}`);
      return url;
    }
    
    if (name.includes('tomás') && name.includes('domingos')) {
      const url = `/images/tomas-domingos.png${cacheBuster}`;
      console.log(`🎯 FORÇA Tomás Domingos: ${url}`);
      return url;
    }
    
    if (name.includes('francisco') && name.includes('frança')) {
      const url = `/images/francisco-franca.png${cacheBuster}`;
      console.log(`🎯 FORÇA Francisco França: ${url}`);
      return url;
    }
    
    // Para outros jogadores, usar a lógica normal
    return getPlayerImageUrl(originalUrl || '');
  };

  // URLs de fallback com cache busting
  const getFallbackUrls = (playerName: string): string[] => {
    const fallbacks: string[] = [];
    const name = playerName.toLowerCase();
    const cacheBuster = getCacheBuster();
    
    if (name.includes('gonçalo')) {
      fallbacks.push(`/images/goncalo-tabuaco.png${cacheBuster}`);
      fallbacks.push(`/images/optimized/goncalo-tabuaco.webp${cacheBuster}`);
      fallbacks.push(`/images/optimized/goncalo-tabuaco.png${cacheBuster}`);
      fallbacks.push(`/images/optimized/goncalo-tabuaco-large.webp${cacheBuster}`);
    }
    
    if (name.includes('tomás')) {
      fallbacks.push(`/images/tomas-domingos.png${cacheBuster}`);
      fallbacks.push(`/images/optimized/tomas-domingos.webp${cacheBuster}`);
      fallbacks.push(`/images/optimized/tomas-domingos.png${cacheBuster}`);
      fallbacks.push(`/images/optimized/tomas-domingos-large.webp${cacheBuster}`);
    }
    
    if (name.includes('francisco')) {
      fallbacks.push(`/images/francisco-franca.png${cacheBuster}`);
      fallbacks.push(`/images/optimized/francisco-franca.webp${cacheBuster}`);
      fallbacks.push(`/images/optimized/francisco-franca-large.webp${cacheBuster}`);
    }
    
    return fallbacks;
  };

  useEffect(() => {
    const correctUrl = getCorrectImageUrl(playerName, imageUrl);
    
    console.log(`🔍 PlayerImage para ${playerName}:`, {
      originalUrl: imageUrl,
      correctUrl: correctUrl,
      fallbacks: getFallbackUrls(playerName)
    });
    
    // Log adicional para debugging
    console.log(`🚀 TENTANDO CARREGAR: ${correctUrl}`);
    
    setImageSrc(correctUrl);
    setAttemptedUrls([]);
    setIsLoaded(false);
    setUsesFallback(false);
  }, [imageUrl, playerName]);

  const handleLoad = () => {
    console.log(`✅ 🎉 SUCESSO! Imagem carregou para ${playerName}: ${imageSrc}`);
    setIsLoaded(true);
    setUsesFallback(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`❌ 💥 FALHOU para ${playerName}: ${imageSrc}`);
    console.log(`❌ Error details:`, e.nativeEvent);
    
    const fallbacks = getFallbackUrls(playerName);
    const newAttempted = [...attemptedUrls, imageSrc];
    
    // Tentar próximo fallback
    const nextUrl = fallbacks.find(url => !newAttempted.includes(url));
    
    if (nextUrl) {
      console.log(`🔄 Tentando fallback ${newAttempted.length + 1} para ${playerName}: ${nextUrl}`);
      setImageSrc(nextUrl);
      setAttemptedUrls(newAttempted);
    } else {
      console.log(`💥 TODOS os ${newAttempted.length + 1} URLs falharam para ${playerName}, usando template`);
      console.log(`💥 URLs testadas:`, [...newAttempted, imageSrc]);
      setUsesFallback(true);
      setIsLoaded(true);
    }
  };

  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0.6,
    transition: 'opacity 0.3s ease',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: style?.borderRadius || '50%',
    objectFit: 'cover' as const,
    background: 'transparent',
  };

  // Template de fallback personalizado
  if (usesFallback && showFallbackText) {
    const containerStyle: React.CSSProperties = {
      ...style,
      width,
      height,
      borderRadius: style?.borderRadius || '50%',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '10px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '4px',
      boxSizing: 'border-box',
      border: '2px solid rgba(255, 255, 255, 0.3)',
    };

    const initials = playerName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div style={containerStyle} className={className}>
        <div style={{ fontSize: '16px', marginBottom: '2px' }}>{initials}</div>
        <div style={{ fontSize: '8px', opacity: 0.8 }}>JOGADOR</div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={`Foto de ${playerName}`}
      width={width}
      height={height}
      style={imageStyle}
      className={className}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      decoding="async"
    />
  );
};

export default PlayerImage; 