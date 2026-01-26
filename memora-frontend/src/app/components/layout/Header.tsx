"use client"

import Link from 'next/link';
import Image from "next/image";
import { usePathname } from "next/navigation"; 
import  { useState, useRef, useEffect } from 'react';


export const Header = ({ user,isLoggedIn, handleLogout } : any) => {
    const pathname = usePathname();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const links = [
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Dashboard" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowDropdown(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropDown = () => setShowDropdown(!showDropdown);

    return (
        <header className="w-full border-b bg-[#F2F5F3] px-6 h-16 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
            
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="">
                        <Image
                            src="/logo/logo.png" 
                            alt="Logo" 
                            width={100} 
                            height={40}
                            priority 
                        />
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-8">
                <nav className="hidden sm:flex items-center gap-4 lg:gap-8 text-sm font-medium text-slate-600">
                    {links.map((link) => {
                        if (!isLoggedIn) return null;
                        return ( 
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-2 lg:px-3 flex items-center justify-center text-[#1E2A28] duration-200 hover:text-[#7FAE96] h-full ${
                                pathname === link.href ? "font-bold border-b-2 border-[#7FAE96]" : ""
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="relative border-l border-slate-200 pl-4 sm:pl-6 ml-2 sm:ml-4" ref={dropdownRef}>
                    <button onClick={toggleDropDown} className="flex items-center space-x-3 focus:outline-none group">
                        {isLoggedIn ? (
                            <img 
                                src={user?.avatar || "/images/user-avatar.png"} 
                                alt="User"
                                className="w-9 h-9 rounded-md object-cover border border-slate-200 group-hover:scale-105 transition-transform duration-300"
                            />
                            ) : (
                            <div className="w-9 h-9 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center">
                                <span className="text-slate-400 text-sm font-bold">?</span>
                            </div>
                        )}
                        <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
                            Hlo, {isLoggedIn ? user?.name : "Guest"}
                        </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 cursor-pointer text-gray-400 transition-transform ${
                            showDropdown ? "rotate-180" : "rotate-0"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {isLoggedIn ? (
                                <>
                                <Link
                                    href="/dashboard"
                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    👤 Visit Dashboard
                                </Link>
                        
                                <div className="border-t border-slate-100 my-1"></div>
                                
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    🚪 Logout
                                </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 transition-colors font-semibold"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    🔐 Login to Memora
                                </Link>
                            )}
                        </div>
                    )}
                </div>
        </div>
        </header>
    );
};