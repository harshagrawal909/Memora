"use client"

import Link from "next/link"
import Image from "next/image"
import {Mail,Lock,Eye,EyeOff} from "lucide-react"
import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';



export default function Login(){
    const [showPassword, setShowPassword] = useState(false);
    const[email,setEmail]=useState('');
    const[password,setPassword]=useState('');
    const[loading,setLoading]=useState(false);
    const[error,setError]=useState('');
    const [rememberMe, setRememberMe] = useState(false);



    const handleSocialAuth = async (token: string, provider: string )  => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const res = await fetch(`${apiUrl}/api/social-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, provider }),
            });
            const data = await res.json();
            
            if (res.ok) {
                document.cookie = `token=${data.token}; path=/; SameSite=Strict`;
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "/";
            }
        } catch (err) {
            setError("Connection to server failed.");
        }finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try{
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const res= await fetch(`${apiUrl}/api/login`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify({email,password}),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }
            document.cookie = `token=${data.token}; path=/;  SameSite=Strict`;
            if (rememberMe) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
            } else {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
            }
            window.location.href = "/";
            
        }catch(err : any){
            setError(err.message || 'Invalid Credentials.');
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="bg-[#F2F6F1] max-w-sm w-[92%] sm:w-full mx-auto shadow-sm border border-[#DDE5DB] rounded-xl flex flex-col items-center pt-8 pb-8 my-6 lg:my-10">
            <Link href="/">
                <Image src="/logo/logo.png" alt="Logo" width={120} height={40} />
            </Link>
            <div className="flex flex-col items-center w-full px-8">
                {error && (
                    <p className="text-sm text-red-500 text-center">
                        {error}
                    </p>
                )}
                <h2 className="text-xl font-bold text-[#171A1FFF] mb-1">Welcome Back</h2>
                <p className="text-sm text-[#565D6DFF] mb-8">
                    Log in to access your private memories.
                </p>
                <form className="w-full space-y-4 px-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                            Email Address
                        </label>
                        <div className="relative"> 
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                                size={18}
                            />
                            <input
                                type="email"
                                id="email"
                                placeholder="your.email@example.com"
                                className="w-full pl-10 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm text-[#171A1FFF]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                            Paasword
                        </label>
                        <div className="relative"> 
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                                size={18}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm text-[#171A1FFF]"
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-center pt-1 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-[#5F7F72]">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className=" h-4 w-4 rounded focus:ring-[#9FC7B4] accent-[#7FAE96] focus:ring-2" 
                            />
                            Remember me
                        </label>

                        <Link href="/forgot-password" className="font-medium text-[#5F7F72] hover:text-[#7FAE96] transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 bg-[#7FAE96] text-white font-medium rounded-md shadow-md hover:bg-[#6E9F86] transition duration-150 ${loading ? "cursor-not-allowed" : "cursor-pointer" }`}
                        disabled={loading}
                        >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
                 <div className="flex items-center w-full my-6">
                    <div className="grow border-t border-gray-300"></div>
                    <span className="shrink mx-4 text-sm text-gray-500">OR CONTINUE WITH</span>
                    <div className="grow border-t border-gray-300"></div>
                </div>
                <div className="w-full space-y-3 px-4 sm:px-6">
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                            handleSocialAuth(credentialResponse.credential!, "google");
                            }}
                            onError={() => setError("Google login failed")}
                            width="100%"
                            theme="outline"
                            size="large"
                            shape="rectangular"
                            text="continue_with"
                        />
                    </div>
                </div>     
                <div className="mt-8 text-sm text-[#565D6DFF]">
                    <p>All memories are private by default.</p>
                </div>
                <div className="mt-8 text-sm text-gray-500">
                    Don&apos;t have an account? 
                    <Link href="/signup" className="text-[#5F7F72] font-medium hover:underline ml-1">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    )
}