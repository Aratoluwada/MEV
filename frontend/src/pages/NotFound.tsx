import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-[#FF7B70] border-3 border-[#171717] shadow-[5px_5px_0px_#171717] flex items-center justify-center mx-auto text-[#171717]">
        <AlertCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="neo-badge bg-[#F5E947] text-[#171717]">
          ERROR 404 • ROUTE UNRECOGNIZED
        </span>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-[#171717]">
          PAGE NOT FOUND
        </h1>
        <p className="text-sm text-[#555555] font-medium max-w-sm mx-auto leading-relaxed">
          The requested page or resource does not exist in the MEV directory.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to="/"
          className="neo-btn-primary px-6 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 w-full sm:w-auto"
        >
          <Home className="w-4 h-4" />
          <span>RETURN TO HOME</span>
        </Link>
        <Link
          to="/check"
          className="neo-btn-secondary px-6 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 w-full sm:w-auto"
        >
          <Search className="w-4 h-4" />
          <span>CHECK A MEDICINE</span>
        </Link>
      </div>
    </div>
  );
};
