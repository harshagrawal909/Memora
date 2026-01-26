"use client";
import { useState } from "react";
import Link from "next/link";
import {Mail} from "lucide-react"

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading,setLoading]=useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            setMessage(data.message);
        } catch (error) {
            console.log("forgot password error:", error);
        }finally{
            setLoading(false);
        }
    };

    if(loading) return <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-[#DDE5DB] rounded-xl shadow-sm text-center text-[#171A1FFF]">Processing...</div>

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-[#DDE5DB] rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-[#171A1FFF]">Forgot Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>     
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        className="text-[#171A1FFF] w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#7FAE96]/20"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit" className={`w-full py-3 bg-[#7FAE96] text-white font-bold rounded-lg hover:bg-[#6E9F86] ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                    {loading ? "Sending Link" : "Send Reset Link"}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-[#7FAE96] font-medium text-center">{message}</p>}
        </div>
    );
}