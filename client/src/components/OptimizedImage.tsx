import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  style, 
  className, 
  loading = 'lazy',
  onError 
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fallbackAttempts, setFallbackAttempts] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageSrc(src);
    setIsLoaded(false);
    setFallbackAttempts(0);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackAttempts === 0) {
      // First attempt: try without .webp if it was webp
      if (imageSrc.includes('.webp')) {
        const fallbackSrc = imageSrc.replace('.webp', '.png').replace('.webp', '.jpg');
        setImageSrc(fallbackSrc);
        setFallbackAttempts(1);
        return;
      }
      // If not webp, go directly to default
      setFallbackAttempts(1);
    }
    
    if (fallbackAttempts <= 1 && !imageSrc.includes('default-player.png')) {
      // Final fallback: use default player image
      setImageSrc('/images/default-player.png');
      setFallbackAttempts(2);
    }
    
    if (onError) {
      onError(e);
    }
  };

  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 1,
    transition: 'opacity 0.3s ease',
    maxWidth: '100%',
    height: 'auto',
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
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

export default OptimizedImage; 