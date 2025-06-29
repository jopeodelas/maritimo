import { useState } from 'react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import MobileHeader from './MobileHeader';
import MobileSidebar from './MobileSidebar';
import useIsMobile from '../hooks/useIsMobile';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {!isMobile && <Navbar />}
      {isMobile && (
        <>
          <MobileHeader onMenuToggle={() => setIsSidebarOpen(true)} />
          <MobileSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        </>
      )}
      {children}
    </>
  );
};

export default PageLayout; 