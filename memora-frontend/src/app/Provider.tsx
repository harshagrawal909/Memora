"use client"

import {Header} from './components/layout/Header';
import Footer from './components/layout/Footer';
import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';


export default function Provider({ children }: { children: React.ReactNode }){

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
        throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    }

    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [user, setUser] = useState<any>(null);
    
    useEffect(() => {

        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };
        const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }else{
            setIsLoggedIn(false);
            setUser(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        
        setIsLoggedIn(false);
        setUser(null);
        window.location.href = "/login";
    };

    return(
        <GoogleOAuthProvider clientId={clientId}>
            <Header 
                user={isLoggedIn ? user : null} 
                isLoggedIn={isLoggedIn} 
                handleLogout={handleLogout}
            />
            <main className="bg-[#FAF9F6] min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
                    {children}
            </main>
            <Footer />
        </GoogleOAuthProvider>
    )
}