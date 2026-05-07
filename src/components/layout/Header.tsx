import { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="bg-brand-black text-white py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-brand-orange" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Free Course Finder</h1>
            <p className="text-xs sm:text-sm text-white/60 font-mono">
              AI-powered learning resource discovery
            </p>
          </div>
        </div>
        
        <div className="font-bold text-sm sm:text-base sm:border-l-2 sm:border-white/20 sm:pl-4 mt-2 sm:mt-0 drop-shadow-[0_0_10px_rgba(56,189,248,0.7)] bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-pulse">
          A.G Patil Institute Of Technology, Solapur
        </div>
        
        {children}
      </div>
    </header>
  );
}
