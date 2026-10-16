import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pill, ShoppingBag, Menu, X, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { LanguageCode } from '../../types';

interface NavbarProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  basketCount: number;
  onOpenBasket: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  basketCount,
  onOpenBasket,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: language === 'pcm' ? 'Home' : 'Home' },
    { to: '/check', label: language === 'pcm' ? 'Check Medicine' : 'Check a Medicine' },
    { to: '/how-it-works', label: language === 'pcm' ? 'How E Dey Work' : 'How It Works' },
    { to: '/safety', label: language === 'pcm' ? 'Safety & Limits' : 'Safety & Limitations' },
    { to: '/about', label: language === 'pcm' ? 'About MEV' : 'About' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#FFF9ED] border-b-2 sm:border-b-[3px] border-[#171717]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#171717]"
          aria-label="MEV Home"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#F5E947] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] flex items-center justify-center font-heading font-black text-base text-[#171717] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
            MEV
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-[#171717]">
                MEV
              </span>
              <span className="neo-badge bg-[#A9F04D] text-[#171717] hidden xs:inline-block">
                NAFDAC REG
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#171717]/70 uppercase tracking-wider font-semibold -mt-1 hidden sm:block">
              {language === 'pcm' ? 'Medicine Registry Verification' : 'Medicine Registry Verification'}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 font-heading font-bold text-sm">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-1.5 border-2 transition-all ${
                  active
                    ? 'bg-[#171717] text-[#FFF9ED] border-[#171717] shadow-[3px_3px_0px_#F5E947]'
                    : 'text-[#171717] border-transparent hover:border-[#171717] hover:bg-white hover:shadow-[2px_2px_0px_#171717]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action Controls & CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dual Language Toggle (EN | PCM) */}
          <div className="flex items-center border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717] text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 transition-colors ${
                language === 'en'
                  ? 'bg-[#171717] text-[#FFF9ED]'
                  : 'text-[#171717] hover:bg-[#FFF9ED]'
              }`}
              title="Standard English"
            >
              EN
            </button>
            <span className="w-0.5 h-4 bg-[#171717]" />
            <button
              type="button"
              onClick={() => onLanguageChange('pcm')}
              className={`px-2 py-1 transition-colors ${
                language === 'pcm'
                  ? 'bg-[#171717] text-[#FFF9ED]'
                  : 'text-[#171717] hover:bg-[#FFF9ED]'
              }`}
              title="Nigerian Pidgin"
            >
              PCM
            </button>
          </div>

          {/* Medicine Basket Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenBasket}
            aria-label="View Medication Basket"
            className="relative p-2 sm:p-2.5 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#171717] active:shadow-none transition-all"
            title="Check Medication Basket & Duplicate Ingredients"
          >
            <ShoppingBag className="w-5 h-5 text-[#171717]" />
            {basketCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF7B70] text-[#171717] font-mono font-black text-[10px] w-5 h-5 rounded-none border-2 border-[#171717] flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                {basketCount}
              </span>
            )}
          </button>

          {/* Primary CTA Button (Desktop) */}
          <Link
            to="/check"
            className="hidden sm:inline-flex neo-btn-primary px-4 py-2 text-xs sm:text-sm uppercase tracking-wide gap-1.5"
          >
            <span>{language === 'pcm' ? 'CHECK PACK' : 'CHECK A MEDICINE'}</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 bg-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717] text-[#171717] hover:bg-[#F5E947] transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF9ED] border-t-2 border-[#171717] px-4 py-5 space-y-3 shadow-lg animate-slide-down">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 font-heading font-black text-sm border-2 transition-all flex items-center justify-between ${
                    active
                      ? 'bg-[#171717] text-[#FFF9ED] border-[#171717] shadow-[3px_3px_0px_#F5E947]'
                      : 'bg-white text-[#171717] border-[#171717] shadow-[3px_3px_0px_#171717]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t-2 border-[#171717] flex flex-col gap-2">
            <Link
              to="/check"
              onClick={() => setIsMobileMenuOpen(false)}
              className="neo-btn-primary w-full py-3 text-sm uppercase tracking-wider gap-2 text-center"
            >
              <Pill className="w-4 h-4" />
              <span>{language === 'pcm' ? 'CHECK MEDICINE NOW' : 'CHECK A MEDICINE'}</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
