import React, { useEffect, useState } from 'react';
import { Plane, Menu, X, User, Search, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

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

    if (isExcludedPage) {
        return null;
    }
    return (
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-6 py-4 md:px-12 ${
  isScrolled 
    ? 'bg-orange-600/90 backdrop-blur-md py-3 border-b border-white/10 shadow-lg text-white' 
    : 'bg-transparent text-black'
}`}>
      <div className="max-w-8xl mx-auto p-2 flex justify-between items-center h-12">
        
        {/* plane logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group text-decoration-none">
          <div className="bg-amber-500 p-2 rounded-lg group-hover:rotate-[360deg] transition-all duration-700 shadow-md">
            <Plane size={20} className="text-black" />
          </div>
          <span className={`text-2xl font-black tracking-tighter uppercase transition-colors duration-300 ${
            isScrolled ? 'text-white' : 'text-black'
          }`}>
            Travel <span className={isScrolled ? 'text-amber-300 tracking-[0.05em]' : 'text-amber-600'}>In Depth</span>
          </span>
        </Link>

        {/* navlinks */}
        <ul className={`hidden md:flex items-center gap-8 text-[13px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
          isScrolled ? 'text-white/90' : 'text-black'
        }`}>
          <li className="hover:text-amber-500 cursor-pointer transition-colors"><Link to='/'>Home</Link></li>
          <li className="hover:text-amber-500 cursor-pointer transition-colors"><Link to='/destinations'>Destinations</Link></li>
          <li className="hover:text-amber-500 cursor-pointer transition-colors"><Link to='/experience'>Experience</Link></li>
          <li className="hover:text-amber-500 cursor-pointer transition-colors"><Link to='/reviews'>Reviews</Link></li>
          <li className="hover:text-amber-500 cursor-pointer transition-colors"><Link to='/about'>About</Link></li>
        </ul>

        {/* ACTIONS */}
        <div className={`flex items-center gap-6 transition-colors duration-300 ${
          isScrolled ? 'text-white' : 'text-black'
        }`}>
          <Search size={18} className="cursor-pointer hover:text-amber-500 transition-colors hidden sm:block" />
          {/* Login User rendering section */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer hover:text-amber-500 transition-colors">
                <User size={18} className={isScrolled ? 'text-green-400' : 'text-amber-600'}/>
                <span className={`text-sm font-bold hidden md:block ${isScrolled ? 'text-green-400' : 'text-black'}`}>
                  {user.name?.split(" ")[0] || "Dashboard"}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className={`hidden md:flex items-center transition-colors ${
                  isScrolled ? 'text-white/70 hover:text-red-400' : 'text-black/70 hover:text-red-600'
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
                  : 'bg-transparent border border-black text-black hover:bg-black hover:text-white'
              }`}>
                Login
              </button>
            </Link>
          )}
          <Link to="/book-trip">
            <button className="hidden md:block bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">
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
    <div className='flex flex-col items-center justify-center gap-10 h-full w-full px-6 py-20 text-sm font-bold uppercase tracking-widest'>
      
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
          <Link to="/dashboard" onClick={() => setIsOpened(false)} className={`flex items-center gap-2 cursor-pointer ${isScrolled ? 'text-green-400' : 'text-amber-600'}`}>
            <User size={18} />
            <span>{user.name}</span>
          </Link>
          <button onClick={() => { logout(); setIsOpened(false); }} className="text-red-500 text-xs uppercase tracking-widest">
            Logout
          </button>
        </div>
      ) : (
        <Link to='/login' onClick={() => setIsOpened(false)}>
          <button className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all w-fit ${
            isScrolled
              ? 'bg-transparent border border-white text-white hover:bg-white hover:text-black'
              : 'bg-transparent border border-black text-black hover:bg-black hover:text-white'
          }`}>
            Login
          </button>
        </Link>
      )}
      <Link to="/book-trip" onClick={() => setIsOpened(false)}>
        <button className="bg-amber-500 text-black px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest w-fit shadow-xl transition-all duration-300 hover:scale-105 hover:bg-amber-400">
          Book Trip
        </button>
      </Link>

    </div>
  </div>
)}
    </nav>
    
    )
}

export default Navbar
