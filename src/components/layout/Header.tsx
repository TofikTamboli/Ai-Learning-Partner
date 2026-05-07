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
        
        <div className="text-brand-orange font-bold text-sm sm:text-base border-l-2 border-white/20 pl-4 hidden sm:block">
          A.G Patil Institute Of Technology, Solapur
        </div>
        
        {children}
      </div>
    </header>
  );
}
