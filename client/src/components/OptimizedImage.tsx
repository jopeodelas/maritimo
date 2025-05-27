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
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      // Fallback to original image if WebP fails
      if (imageSrc.includes('.webp')) {
        const fallbackSrc = imageSrc.replace('.webp', '.png').replace('.webp', '.jpg');
        setImageSrc(fallbackSrc);
      } else {
        // If original also fails, use a default placeholder
        setImageSrc('/images/default-player.jpg');
      }
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