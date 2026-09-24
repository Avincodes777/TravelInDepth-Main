import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { getMediaUrl } from '../../utils/media';

function HeroSection() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const vid = [
        getMediaUrl('videos/v1.mp4'),
        getMediaUrl('videos/v2.mp4'),
        getMediaUrl('videos/v3.mp4'),
        getMediaUrl('videos/v4.mp4')
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRefs = useRef([]); // Saare videos ka reference store karne ke liye

    const handleExploreClick = () => {
        if (user) {
            navigate('/destinations');
        } else {
            navigate('/login', { state: { from: '/destinations' } });
        }
    };

    const handleDashboardClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login', { state: { from: '/dashboard' } });
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % vid.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [vid.length]);

    // Ensure only the active video plays and transitions cleanly
    useEffect(() => {
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
            currentVideo.play().catch(err => console.log("Auto-play blocked", err));
        }
    }, [currentIndex]);

    return (
        <div className='relative w-full h-screen overflow-hidden bg-black'>
            {vid.map((videoPath, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % vid.length;
                // Only load media source for current and next upcoming video to save bandwidth
                const shouldLoad = isActive || isNext;

                return (
                    <video
                        key={index}
                        ref={(el) => (videoRefs.current[index] = el)}
                        src={shouldLoad ? videoPath : undefined}
                        loop
                        muted
                        playsInline
                        preload={isActive ? "auto" : isNext ? "metadata" : "none"}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                            isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    />
                );
            })}

            {/* Overlay Content */}
            <div className='inset-0 absolute z-10 bg-black/25'>
                <div className='flex flex-col justify-center items-center h-full z-20 px-4 text-center'>
                    <h1 className="text-4xl md:text-7xl font-black text-white/90 uppercase tracking-tighter max-w-5xl leading-[1.05] drop-shadow-lg">
                        Lose Yourself in the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 italic px-2">
                            Journey
                        </span>
                    </h1>
                    <p className="mt-5 text-xs md:text-base font-bold text-amber-100/90 tracking-[0.35em] uppercase drop-shadow-md">
                        Find Yourself in the World
                    </p>

                    {/* Action Buttons Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-9">
                        <button
                            onClick={handleExploreClick}
                            className='tracking-[0.2em] px-8 py-3.5 rounded-full font-black uppercase text-xs md:text-sm text-black bg-white hover:bg-amber-400 hover:scale-105 hover:text-black transition-all duration-300 active:scale-95 cursor-pointer shadow-2xl border border-white/40'
                        >
                            Explore Now
                        </button>
                        <button
                            onClick={() => navigate('/book-trip')}
                            className='tracking-[0.2em] px-8 py-3.5 rounded-full font-black uppercase text-xs md:text-sm text-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer shadow-2xl font-sans'
                        >
                            Book Trip
                        </button>
                    </div>

                    {/* Beautiful Toggling Dashboard Button with Right Pointer — Placed directly below Book Trip */}
                    <div className="mt-5">
                        <button
                            onClick={handleDashboardClick}
                            className="group relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-xl border border-amber-400/50 hover:border-amber-300 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            {/* Pulse indicator */}
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                            </span>

                            <LayoutDashboard size={15} className="text-amber-400 group-hover:rotate-12 transition-transform duration-300" />

                            <span className="text-xs md:text-sm font-bold tracking-[0.18em] uppercase text-white group-hover:text-amber-300 transition-colors">
                                {user ? `${user.name?.split(" ")[0]}'s Dashboard` : "Travel Dashboard"}
                            </span>

                            {/* Pointer pointing to the right */}
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 group-hover:from-amber-300 group-hover:to-orange-400 flex items-center justify-center text-black shadow-md transition-all duration-300 group-hover:translate-x-1.5">
                                <ArrowRight size={14} className="stroke-[2.8]" />
                            </div>
                        </button>
                    </div>
                </div>
                
                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <div className="w-[2px] h-12 bg-gradient-to-b from-white to-transparent"></div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection;