/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SafetyBanner } from './components/layout/SafetyBanner';
import { BasketDrawer } from './components/BasketDrawer';
import { Home } from './pages/Home';
import { CheckMedicine } from './pages/CheckMedicine';
import { HowItWorks } from './pages/HowItWorks';
import { Safety } from './pages/Safety';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { LanguageCode, BasketItem } from './types';

// ScrollToTop on Route Change component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  const handleAddToBasket = (item: BasketItem) => {
    if (!basket.some((b) => b.id === item.id || (b.nrn === item.nrn && b.nrn !== 'N/A'))) {
      setBasket((prev) => [item, ...prev]);
      setIsBasketOpen(true);
    }
  };

  const handleRemoveFromBasket = (id: string) => {
    setBasket((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#FFF9ED] text-[#171717] flex flex-col font-sans selection:bg-[#F5E947] selection:text-[#171717]">
        
        {/* 1. Global Navigation Bar */}
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          basketCount={basket.length}
          onOpenBasket={() => setIsBasketOpen(true)}
        />

        {/* 2. Permanent Critical Safety Banner */}
        <SafetyBanner language={language} />

        {/* 3. Multi-Page Routes */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home language={language} />} />
            <Route 
              path="/check" 
              element={
                <CheckMedicine 
                  language={language} 
                  onAddToBasket={handleAddToBasket} 
                  basket={basket} 
                />
              } 
            />
            <Route path="/how-it-works" element={<HowItWorks language={language} />} />
            <Route path="/safety" element={<Safety language={language} />} />
            <Route path="/about" element={<About language={language} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* 4. Global Footer */}
        <Footer language={language} />

        {/* 5. Medication Check Basket Drawer with Duplicate Ingredient Warnings */}
        <BasketDrawer
          isOpen={isBasketOpen}
          onClose={() => setIsBasketOpen(false)}
          items={basket}
          onRemoveItem={handleRemoveFromBasket}
          onClearBasket={handleClearBasket}
          language={language}
        />

      </div>
    </BrowserRouter>
  );
}
