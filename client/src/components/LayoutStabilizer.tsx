import type { ReactNode } from 'react';

interface LayoutStabilizerProps {
  children: ReactNode;
  minHeight?: string;
  width?: string;
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
}

const LayoutStabilizer = ({ 
  children, 
  minHeight = 'auto', 
  width = '100%',
  aspectRatio,
  className,
  style 
}: LayoutStabilizerProps) => {
  const containerStyle: React.CSSProperties = {
    width,
    minHeight,
    ...(aspectRatio && { aspectRatio }),
    display: 'flex',
    flexDirection: 'column',
    ...style
  };

  return (
    <div style={containerStyle} className={className}>
      {children}
    </div>
  );
};

export default LayoutStabilizer; 