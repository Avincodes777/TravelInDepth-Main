import React from 'react'
import { Plane } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom';

function Footer() {
    const location = useLocation();
    const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

    if (isDashboardOrAdmin) {
        return null;
    }
    return (
        <footer className='bg-[#120600] text-white border-t border-[#2d1205]'>
            {/* Main Section */}
            <div className='max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12'>

                {/* Column 1 - Logo and About */}
                <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                        <div className="bg-[#FF6B1A] p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-orange-950/40">
                            <Plane size={22} className="text-black fill-black" />
                        </div>
                        <h2 className='text-xl font-bold tracking-tight'>
                            <span className='text-white'>TRAVEL </span>
                            <span className='text-[#FF6B1A]'>IN DEPTH</span>
                        </h2>
                    </div>
                    <p className='text-sm text-stone-400 leading-relaxed max-w-sm'>
                        Explore the world deeply. We curate sustainable, immersive travel experiences that connect you with culture, nature, and people.
                    </p>
                </div>

                {/* Column 2 - Quick Links */}
                <div>
                    <h3 className='text-[#FF6B1A] font-bold tracking-[0.14em] text-xs uppercase mb-5'>
                        QUICK LINKS
                    </h3>
                    <ul className='space-y-2.5 text-sm text-stone-300'>
                        <li><Link to='/' className='hover:text-[#FF6B1A] transition-colors duration-200'>Home</Link></li>
                        <li><Link to='/destinations' className='hover:text-[#FF6B1A] transition-colors duration-200'>Destinations</Link></li>
                        <li><Link to='/experience' className='hover:text-[#FF6B1A] transition-colors duration-200'>Experience</Link></li>
                        <li><Link to='/reviews' className='hover:text-[#FF6B1A] transition-colors duration-200'>Reviews & Ratings</Link></li>
                        <li><Link to='/about' className='hover:text-[#FF6B1A] transition-colors duration-200'>About</Link></li>
                    </ul>
                </div>

                {/* Column 3 - Destinations */}
                <div>
                    <h3 className='text-[#FF6B1A] font-bold tracking-[0.14em] text-xs uppercase mb-5'>
                        TOP DESTINATIONS
                    </h3>
                    <ul className='space-y-2.5 text-sm text-stone-300'>
                        <li><Link to='/destinations/manali' className='hover:text-[#FF6B1A] transition-colors duration-200'>Manali, India</Link></li>
                        <li><Link to='/destinations/jaipur' className='hover:text-[#FF6B1A] transition-colors duration-200'>Jaipur, Rajasthan</Link></li>
                        <li><Link to='/destinations/odisha' className='hover:text-[#FF6B1A] transition-colors duration-200'>Odisha, Kerala</Link></li>
                        <li><Link to='/destinations/nainital' className='hover:text-[#FF6B1A] transition-colors duration-200'>Nainital, Uttarakhand</Link></li>
                    </ul>
                </div>

                {/* Column 4 - Contact */}
                <div>
                    <h3 className='text-[#FF6B1A] font-bold tracking-[0.14em] text-xs uppercase mb-5'>
                        CONTACT US
                    </h3>
                    <ul className='space-y-2.5 text-sm text-stone-300'>
                        <li>
                            <a href="mailto:av6821246@gmail.com" className='hover:text-[#FF6B1A] transition-colors duration-200'>
                                av6821246@gmail.com
                            </a>
                        </li>
                        <li className='text-stone-300'>+91 7052501218</li>
                        <li className='text-stone-300'>Kanpur, Uttar Pradesh</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Copyright section */}
            <div className='border-t border-[#2a0e02] py-6 text-center text-sm font-normal text-stone-400'>
                © 2025 Travel In Depth. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer;
