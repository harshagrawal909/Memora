"use client"
import { useEffect, useState, Suspense } from "react"; 
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("Verifying...");
    const router = useRouter();

    useEffect(() => {
        if (!token) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        fetch(`${apiUrl}/api/verify?token=${token}`)
            .then(res => res.json())
            .then(data => {
                setStatus(data.message);
                if (data.message.includes("successfully")) {
                    setTimeout(() => router.push("/login"), 3000);
                }
            })
            .catch(() => setStatus("An error occurred during verification."));
    }, [token, router]);

    return (
        <div className="bg-[#F2F6F1] min-h-screen flex items-center justify-center px-4">
            <div className="bg-white max-w-sm w-full shadow-[0px_8px_30px_rgba(0,0,0,0.08)] border border-[#DDE5DB] rounded-xl flex flex-col items-center py-10 px-6 text-center">
            
                <h1 className="text-xl font-bold text-[#171A1FFF] mb-3">
                    {status}
                </h1>

                <p className="text-sm text-[#565D6DFF] mb-6 leading-relaxed">
                    {status.toLowerCase().includes("success")
                    ? "Your email has been successfully verified. You can now log in to access your private memories."
                    : "Please wait while we verify your email address."}
                </p>

                {status.toLowerCase().includes("success") && (
                    <div>
                        <p className="text-xs text-[#7FAE96] font-medium">
                            Redirecting you to login…
                        </p>
                        <p className="text-[11px] text-[#9CA3AF] mt-1">
                            Please do not press the back button.
                        </p>   
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F2F6F1]">
                <div className="text-slate-400 font-medium">Loading verification module...</div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}