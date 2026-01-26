"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            });
    
            if (res.ok) {
                alert("Password reset successfully!");
                router.push("/login");
            } else {
                alert("Reset link expired or invalid.");
            }
        } catch (error) {
            console.log("reset password error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPasswordMismatch(password.length > 0 && confirm.length > 0 && password !== confirm);
    }, [password, confirm]);

    if (loading) return <div className="max-w-md mx-auto mt-20 p-8 bg-white text-center">Processing...</div>;

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-[#DDE5DB] rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-[#171A1FFF]">Set New Password</h2>
            <form onSubmit={handleReset} className="space-y-4">
                {/* ... existing form fields ... */}
                <div>
                    <label className="block text-sm font-medium text-[#171A1FFF] mb-2">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password" 
                            required 
                            className="w-full pl-4 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#171A1FFF] mb-2">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm New Password" 
                            required 
                            className="w-full pl-4 pr-4 py-2 border border-[#DEE1E6FF] rounded-md shadow-sm text-sm" 
                            value={confirm} 
                            onChange={(e) => setConfirm(e.target.value)} 
                        />
                    </div>
                    {passwordMismatch && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
                </div>
                <button 
                    type="submit" 
                    className={`w-full py-3 bg-[#7FAE96] text-white font-bold rounded-lg hover:bg-[#6E9F86] ${loading || passwordMismatch ? "cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={loading || passwordMismatch}
                >
                    Save Password
                </button>
            </form>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}