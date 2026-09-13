import React, { useEffect } from 'react';
import './App.css';
import Navbar from './components/layout/Navbar';
import AppRouter from './routes/AppRouter';
import Footer from './components/layout/Footer';
import { CityProvider } from './context/CityContext';
import { AuthProvider } from './features/auth/AuthContext';
import { WishlistProvider } from './features/wishlist/WishlistContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { useLocation } from 'react-router-dom';

function MainAppLayout() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  const isDarkActive = !isHomepage && isDarkMode;

  React.useEffect(() => {
    if (isDarkActive) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkActive]);

  return (
    <div
      className={`min-h-screen font-montserrat transition-colors duration-300 ${
        isDarkActive
          ? 'dark bg-[#0a0f1d] text-slate-100 selection:bg-amber-500/30'
          : 'bg-[#FAFAFA] text-black selection:bg-orange-500/20'
      }`}
    >
      <Navbar />
      <div className="min-h-screen">
        <AppRouter />
      </div>
      <Footer />
      {/* Floating Theme Toggle (accessible across all non-homepage pages, and easily toggleable anywhere) */}
      <ThemeToggle variant="floating" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WishlistProvider>
          <CityProvider>
            <MainAppLayout />
          </CityProvider>
        </WishlistProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}


