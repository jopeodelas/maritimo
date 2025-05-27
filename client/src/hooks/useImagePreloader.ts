import { useEffect, useState } from 'react';

interface UseImagePreloaderOptions {
  priority?: 'high' | 'low';
  loading?: 'eager' | 'lazy';
}

export const useImagePreloader = (
  imageSrcs: string[], 
  options: UseImagePreloaderOptions = {}
) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!imageSrcs.length) {
      setIsLoading(false);
      return;
    }

    const { priority = 'low', loading = 'lazy' } = options;
    let loadedCount = 0;
    const totalImages = imageSrcs.length;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        // Set loading attributes
        if (loading === 'eager') {
          img.loading = 'eager';
        }
        
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          loadedCount++;
          
          if (loadedCount === totalImages) {
            setIsLoading(false);
          }
          resolve();
        };
        
        img.onerror = () => {
          setErrors(prev => new Set([...prev, src]));
          loadedCount++;
          
          if (loadedCount === totalImages) {
            setIsLoading(false);
          }
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = src;
      });
    };

    // Preload images based on priority
    if (priority === 'high') {
      // Load all images immediately
      Promise.allSettled(imageSrcs.map(preloadImage));
    } else {
      // Load images with a slight delay to not block critical resources
      const timeoutId = setTimeout(() => {
        Promise.allSettled(imageSrcs.map(preloadImage));
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [imageSrcs, options.priority, options.loading]);

  return {
    loadedImages,
    isLoading,
    errors,
    isImageLoaded: (src: string) => loadedImages.has(src),
    hasError: (src: string) => errors.has(src),
  };
}; 