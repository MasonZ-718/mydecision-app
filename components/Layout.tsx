import React from 'react';
import { Shield, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuroraBackground } from './AuroraBackground';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const hideHeader = location.pathname === '/';

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col items-center relative overflow-hidden">
      <AuroraBackground />
      
      <div className="w-full max-w-md min-h-screen flex flex-col relative z-10 border-x border-zinc-900/50 bg-black/20 backdrop-blur-sm">
        {/* Header - Hidden on Home for cleaner look */}
        {!hideHeader && (
          <header className="px-6 py-6 flex justify-between items-center sticky top-0 z-20">
              <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-70">
                  <Shield className="w-5 h-5 text-zinc-100" />
                  <h1 className="text-lg font-medium tracking-tight text-white">MyDecision</h1>
              </Link>
              
              {/* Portal target for page-specific header controls */}
              <div id="header-portal-target" className="flex-1 flex justify-center px-4"></div>

              <Link to="/settings" className="text-zinc-500 hover:text-zinc-300 transition-colors p-2">
                 <SettingsIcon className="w-5 h-5" />
              </Link>
          </header>
        )}

        {isHome && (
            <div className="absolute top-6 right-6 z-50">
                <Link to="/settings" className="text-zinc-500 hover:text-white transition-colors p-2 bg-zinc-900/50 rounded-full backdrop-blur-md border border-zinc-800">
                    <SettingsIcon className="w-4 h-4" />
                </Link>
            </div>
        )}

        {/* Content */}
        <main className={`flex-1 px-6 ${isHome ? 'py-12' : 'py-2'} flex flex-col`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;