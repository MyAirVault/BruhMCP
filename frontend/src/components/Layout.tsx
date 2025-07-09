import React, { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, userName }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header userName={userName} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;