import React, { useEffect, useState } from 'react';
import { Plane, Menu, X, User, Search, LogOut, ArrowRight, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ThemeToggle';
import GlobalSearchModal from '../common/GlobalSearchModal';

function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { user, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const isHomepage = location.pathname === '/';
    const isDarkActive = !isHomepage && isDarkMode;

    // Do not show public fixed navbar on dashboard, admin, or individual city detail pages (which has its own dedicated in-page navigation)
    const isExcludedPage = location.pathname.startsWith('/dashboard') || 
                           location.pathname.startsWith('/admin') ||
                           (/^\/destinations\/[^/]+$/.test(location.pathname));

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => { window.removeEventListener('scroll', handleScroll); };
    }, []);

    // Global keyboard shortcut (Ctrl+K or Cmd+K or '/') to trigger search
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    if (isExcludedPage) {
        return null;
    }

    const navTextColor = isScrolled 
      ? 'text-white' 
      : isDarkActive 
        ? 'text-slate-100' 
        : 'text-stone-900';

    const navLinkHover = isDarkActive ? 'hover:text-amber-400' : 'hover:text-amber-600';

    return (
      <>
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-6 py-3 md:px-12 ${
  isScrolled 
    ? 'bg-orange-600/95 backdrop-blur-md py-2.5 border-b border-white/10 shadow-lg text-white' 
    : isDarkActive
      ? 'bg-slate-900/85 backdrop-blur-md py-3.5 border-b border-slate-800/80 text-white'
      : 'bg-transparent text-stone-900'
}`}>
      <div className="max-w-8xl mx-auto p-1 flex justify-between items-center">
        
        {/* Brand & Back Button */}
        <div className="flex flex-col items-start gap-1">
          <Link to="/" className="flex items-center gap-2 cursor-pointer group text-decoration-none">
            <div className="bg-amber-500 p-2 rounded-lg group-hover:rotate-[360deg] transition-all duration-700 shadow-md shadow-amber-500/20">
              <Plane size={20} className="text-black" />
            </div>
            <span className={`text-2xl font-black tracking-tighter uppercase transition-colors duration-300 ${navTextColor}`}>
              Travel <span className={isScrolled ? 'text-amber-300 tracking-[0.05em]' : 'text-amber-500'}>In Depth</span>
            </span>
          </Link>

          {/* Back button below site name */}
          {!isHomepage && (
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
              title="Go back to previous page"
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer border ${
                isScrolled
                  ? 'bg-white/20 hover:bg-white text-white hover:text-orange-600 border-white/30'
                  : isDarkActive
                    ? 'bg-[#121a2d] hover:bg-[#FF6B1A] text-slate-300 hover:text-white border-[#23324d] hover:border-[#FF6B1A]'
                    : 'bg-white hover:bg-[#FF6B1A] text-[#8B1A1A] hover:text-white border-[#F5A623]/30 hover:border-[#FF6B1A]'
              }`}
            >
              <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* navlinks */}
        <ul className={`hidden md:flex items-center gap-8 text-[13px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
          isScrolled ? 'text-white/90' : isDarkActive ? 'text-slate-200' : 'text-stone-800'
        }`}>
          <li className={`${navLinkHover} cursor-pointer transition-colors`}><Link to='/'>Home</Link></li>
          <li className={`${navLinkHover} cursor-pointer transition-colors`}><Link to='/destinations'>Destinations</Link></li>
          <li className={`${navLinkHover} cursor-pointer transition-colors`}><Link to='/experience'>Experience</Link></li>
          <li className={`${navLinkHover} cursor-pointer transition-colors`}><Link to='/reviews'>Reviews</Link></li>
          <li className={`${navLinkHover} cursor-pointer transition-colors`}><Link to='/about'>About</Link></li>
        </ul>

        {/* ACTIONS */}
        <div className={`flex items-center gap-4 sm:gap-6 transition-colors duration-300 ${navTextColor}`}>
          {/* Theme Toggle in Navbar */}
          <ThemeToggle isScrolled={isScrolled} />
          
          {/* Search Button with Keyboard Hint */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Search destinations (Ctrl+K or /)"
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 hover:text-amber-500 transition-all cursor-pointer flex items-center gap-1.5 group"
            aria-label="Search destinations"
          >
            <Search size={19} className="group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs opacity-75">
              ⌘K
            </span>
          </button>

          {/* Login User rendering section */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard/profile" title="My Profile" className="flex items-center gap-2 cursor-pointer hover:text-amber-500 transition-colors group text-decoration-none">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "Profile"}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500 shadow-sm group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <User size={18} className={isScrolled ? 'text-green-400 group-hover:text-amber-300' : 'text-amber-600 group-hover:text-amber-500'}/>
                )}
                <span className={`text-sm font-bold hidden md:block ${isScrolled ? 'text-green-400 group-hover:text-amber-300' : 'text-black group-hover:text-amber-600'}`}>
                  {user.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className={`hidden md:flex items-center transition-colors ${
                  isScrolled ? 'text-white/70 hover:text-red-400' : isDarkActive ? 'text-slate-300 hover:text-red-400' : 'text-stone-700 hover:text-red-600'
                }`}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to='/login'>
              <button className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                isScrolled
                  ? 'bg-transparent border border-white text-white hover:bg-white hover:text-black'
                  : isDarkActive
                  ? 'bg-transparent border border-amber-400/80 text-amber-300 hover:bg-amber-400 hover:text-slate-900'
                  : 'bg-transparent border border-black text-black hover:bg-black hover:text-white'
              }`}>
                Login
              </button>
            </Link>
          )}
          <Link to="/book-trip">
            <button className="hidden md:block bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm cursor-pointer">
              Book Trip
            </button>
          </Link>

          {/* Mobile Menu Icon */}
          <div className="md:hidden cursor-pointer hover:text-amber-500" onClick={()=>{setIsOpened(!isOpened)}}>
            {isOpened? <X size={22}/>:<Menu size={22} />}
          </div>
        </div>

      </div>
      {isOpened && (
  <div className={`fixed top-0 right-0 w-full h-screen ${isScrolled ? 'bg-orange-600/95 backdrop-blur-xl text-white' : 'bg-white/95 backdrop-blur-xl text-black'} z-[-1] transition-all duration-300`}>
    <div className='flex flex-col items-center justify-center gap-7 h-full w-full px-6 py-16 text-sm font-bold uppercase tracking-widest'>
      
      {/* Search Button in Mobile Menu */}
      <button
        onClick={() => {
          setIsOpened(false);
          setIsSearchOpen(true);
        }}
        className="w-full max-w-xs flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-amber-500 text-black font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
      >
        <Search size={16} />
        <span>Search Destinations</span>
      </button>

      <Link 
        to='/' 
        onClick={() => setIsOpened(false)} 
        className={isScrolled ? 'text-white hover:text-amber-300' : 'text-black hover:text-amber-600'}
      >
        Home
      </Link>
      
      <Link to='/destinations' onClick={() => setIsOpened(false)} className={isScrolled ? 'text-white hover:text-amber-300' : 'text-black hover:text-amber-600'}>
        Destinations
      </Link>
      
      <Link to='/experience' onClick={() => setIsOpened(false)} className={isScrolled ? 'text-white hover:text-amber-300' : 'text-black hover:text-amber-600'}>
        Experience
      </Link>
      
      <Link to='/reviews' onClick={() => setIsOpened(false)} className={isScrolled ? 'text-white hover:text-amber-300' : 'text-black hover:text-amber-600'}>
        Reviews
      </Link>
      
      <Link to='/about' onClick={() => setIsOpened(false)} className={isScrolled ? 'text-white hover:text-amber-300' : 'text-black hover:text-amber-600'}>
        About
      </Link>
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <Link to="/dashboard/profile" onClick={() => setIsOpened(false)} className={`flex items-center gap-2 cursor-pointer ${isScrolled ? 'text-green-400' : 'text-amber-600'}`}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "Profile"}
                className="w-8 h-8 rounded-full object-cover border border-amber-500 shadow-sm"
              />
            ) : (
              <User size={20} />
            )}
            <span>{user.name} (My Profile)</span>
          </Link>
          <button onClick={() => { logout(); setIsOpened(false); }} className="text-red-500 text-xs uppercase tracking-widest cursor-pointer">
            Logout
          </button>
        </div>
      ) : (
        <Link to='/login' onClick={() => setIsOpened(false)}>
          <button className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all w-fit cursor-pointer ${
            isScrolled
              ? 'bg-transparent border border-white text-white hover:bg-white hover:text-black'
              : 'bg-transparent border border-black text-black hover:bg-black hover:text-white'
          }`}>
            Login
          </button>
        </Link>
      )}
      <Link to="/book-trip" onClick={() => setIsOpened(false)}>
        <button className="bg-amber-500 text-black px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest w-fit shadow-xl transition-all duration-300 hover:scale-105 hover:bg-amber-400 cursor-pointer">
          Book Trip
        </button>
      </Link>

      <Link 
        to="/dashboard" 
        onClick={() => setIsOpened(false)}
        className="group flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-amber-400/60 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-md hover:scale-105"
      >
        <LayoutDashboard size={14} className="text-amber-400" />
        <span>Dashboard</span>
        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-black group-hover:translate-x-1 transition-transform">
          <ArrowRight size={12} className="stroke-[3]" />
        </div>
      </Link>

    </div>
  </div>
)}
    </nav>

    {/* Spotlight Global Search Modal */}
    <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
    );
}

export default Navbar;
