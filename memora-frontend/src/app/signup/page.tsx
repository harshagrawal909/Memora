"use client"
import Link from "next/link";
import Image from "next/image";
import {Mail,Lock,Eye,EyeOff} from "lucide-react";
import { useState } from "react";
import GoogleIcon from "../components/icons/GoogleIcon";
import FacebookIcon from "../components/icons/FacebookIcon";
import AppleIcon from "../components/icons/AppleIcon";
import { useRouter } from "next/navigation";
import { GoogleLogin } from '@react-oauth/google';

export default function Signup(){
    const [showPassword, setShowPassword] = useState(false);
    const [formData,setFormData] = useState({
        name:'',
        email:'',
        password:'',
        confirmPassword:''
    })
    const [loading,setLoading] = useState(false);
    const router= useRouter();
    const [error,setError]= useState('');
    const [passwordMismatch, setPasswordMismatch] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const { id, value } = e.target;

        const updatedForm = { ...formData, [id]: value };
        setFormData(updatedForm);

        if (id === "confirmPassword" || id === "password") {
            if (
                updatedForm.confirmPassword && updatedForm.password !== updatedForm.confirmPassword
            ) {
                setPasswordMismatch(true);
            } else {
                setPasswordMismatch(false);
            }
        }

        setError("");
    }

    const handleSubmit =async (e:React.FormEvent)=> {
        e.preventDefault();
        setLoading(true);
        if(passwordMismatch){
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        try{
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const res= await fetch(`${apiUrl}/api/signup`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    name:formData.name,
                    email:formData.email,
                    password:formData.password
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Signup failed");
            }
            alert("Signup successful! Please check your email to verify your account before logging in.");
            router.push("/login");
        }catch(err:any){
            setError(err.message || "Signup failed");
        }finally{
            setLoading(false);
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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
                <h2 className="text-xl font-bold text-[#171A1FFF] mb-1">Create Your Account</h2>
                <p className="text-sm text-[#565D6DFF] mb-8">
                    Start securing storing and organizing your life's memories.
                </p>
                <form className="w-full space-y-4 px-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                            Full name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter your full name"
                                className="w-full pl-4 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm text-[#171A1FFF]"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                            Email Address
                        </label>
                        <div className="relative"> 
                            <input
                                type="email"
                                id="email"
                                placeholder="your.email@example.com"
                                className="w-full pl-4 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm text-[#171A1FFF]"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                            Password
                        </label>
                        <div className="relative"> 
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Create a strong password"
                                className="w-full pl-4 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm text-[#171A1FFF]"
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
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
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                            Confirm Password
                        </label>
                        <div className="relative"> 
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                placeholder="Re-enter your password"
                                className="w-full pl-4 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm text-[#171A1FFF]"
                                minLength={8}
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                        {passwordMismatch && (
                            <p className="text-xs text-red-500 mt-1">
                                Passwords do not match
                            </p>
                        )}
                    </div>
                    <div className="text-center pt-1 pb-2 text-[#565D6DFF]">
                        <p>Your memories are private by default.</p>
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 bg-[#7FAE96] text-white font-medium rounded-md shadow-md hover:bg-[#6E9F86] transition duration-150 ${loading ? "cursor-not-allowed" : "cursor-pointer" }`}
                        disabled={loading}
                        >
                        {loading ? "Creating Account..." : "Create Account"}
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
                <div className="mt-8 text-sm text-gray-500">
                    Already have an account? 
                    <Link href="/login" className="text-[#5F7F72] font-medium hover:underline ml-1">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    )
}