import React, { useState } from 'react';
import { Handshake } from 'lucide-react';
import { COMPANY_NAME, COMPANY_LOGO } from '../constants';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", showText = true }) => {
  const [error, setError] = useState(false);

  // If we have a logo and it hasn't errored, try to show it
  if (COMPANY_LOGO && !error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img 
          src={COMPANY_LOGO} 
          alt={COMPANY_NAME} 
          referrerPolicy="no-referrer"
          className="h-full w-auto object-contain"
          onError={() => setError(true)}
        />
        {showText && <span className="text-xl font-bold tracking-tight text-slate-800">Workflow</span>}
      </div>
    );
  }

  // Fallback: A high-quality CSS/SVG logo that matches the corporate brand
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* The teal "E" container */}
        <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center text-white italic font-serif text-2xl shadow-lg border border-teal-500/20">
          E
        </div>
        {/* The handshake accent */}
        <div className="absolute -right-2 -bottom-1 bg-amber-500 rounded-full p-1 shadow-md border-2 border-white">
          <Handshake size={14} className="text-white" strokeWidth={3} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className="text-xl font-black tracking-tighter text-slate-900">EON</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-teal-600">Workflow</span>
        </div>
      )}
    </div>
  );
};
