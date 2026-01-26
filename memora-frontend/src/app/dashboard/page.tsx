"use client";
import { useEffect, useState } from "react";
import { 
  Plus, 
  Cloud, 
  Users, 
  History, 
  LayoutDashboard, 
  Mail,
  Archive as ArchiveIcon,
  ChevronRight,
  CheckCircle2,
  Lock,
  User,
  Trash2,
  Upload
} from 'lucide-react';
import Link from "next/link";

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, shared: 0, storage: "0 MB" });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState< "overview" | "memories" | "settings" >("overview");
    const [memories, setMemories] = useState<any[]>([]);
    const [displayName, setDisplayName] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfileAndStats = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const profileRes = await fetch(`${apiUrl}/api/profile`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const profileData = await profileRes.json();
                if (profileRes.ok) {
                    setUser(profileData);
                    setDisplayName(profileData.name);
                }

                const memRes = await fetch(`${apiUrl}/api/memories`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const memData = await memRes.json();
                if (memRes.ok) {
                    setMemories(memData);
                    let totalMemories = memData.length;
                    let sharedCount = 0;
                    let totalPhotos = 0;
                    memData.forEach((m: any) => {
                        if(m.visibility === "shared") sharedCount++;
                        try {
                            const keys = JSON.parse(m.r2_key);
                            totalPhotos += Array.isArray(keys) ? keys.length : 1;
                        } catch {
                            totalPhotos += 1;
                        }
                    })
                    const storageUsed = `${(totalPhotos * 0.45).toFixed(2)} MB`;
                    setStats({
                        total: totalMemories,
                        shared: sharedCount,
                        storage: storageUsed,
                    });
                }
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndStats();
    }, []); 

    const handleUpdateName = async () => {
        setUpdateLoading(true);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/update-name`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ name: displayName })
            });

            if (res.ok) {
                const updatedUser = { ...user, name: displayName };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                alert("Profile updated successfully!");
            }
        } catch (err) {
            alert("Failed to update profile");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleUpdatePassword = async(e: React.FormEvent) =>{
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return alert("New passwords do not match");
        }
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/update-password`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Password updated successfully!");
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.message || "Failed to update password");
            }
        } catch (err) {
            console.error("Password update error:", err);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        setUser(null);
        window.location.href = "/login";
    };

    const handleAvatarUpdate = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/update-avatar`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}` 
                },
                body: formData 
            });

            const data = await res.json();
            
            if (res.ok) {
                const updatedUser = { ...user, avatar: data.user.avatar };
                setUser(updatedUser);
                
                localStorage.setItem("user", JSON.stringify(updatedUser));
                alert("Profile photo updated successfully!");
                window.location.reload()
            } else {
                alert(data.message || "Failed to update avatar");
            }
        } catch (err) {
            console.error("Avatar upload error:", err);
            alert("An error occurred during upload.");
        }
    }

    const handleDelete = async () => {
        const confirmPrimary = confirm("Do you want to delete your account? This action is irreversible.");
        if(!confirmPrimary) return;

        const confirmSecondary = confirm("This will permanently remove ALL your memories and photos. Are you absolutely sure?");
        if (!confirmSecondary) return;

        try{
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/delete-account`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if(res.ok){
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                alert("Your account has been permanently deleted.");
                window.location.href = "/signup";
            }else{
                const data = await res.json();
                alert(data.message || "Failed to delete account.")
            }
        }catch(err){
            console.error("Account deletion error:", err);
            alert("Failed to delete account.");
        }
    }

    if (loading)
        return (
            <div className="flex justify-center mt-32 text-slate-400">
                Syncing with vault...
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                <aside className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-2xl border border-[#DDE5DB] shadow-sm p-6 lg:p-8 flex flex-col items-center text-center lg:sticky lg:top-24">
                        <div className="relative mb-4">
                            <img 
                                src={user?.avatar || "/images/user-avatar.png"} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-[#F2F5F3]"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-[#7FAE96] p-1.5 rounded-lg border-2 border-white text-white cursor-pointer" onClick={()=>setActiveTab("settings" as any)}>
                                <Plus size={14} />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-[#171A1F]">{user?.name}</h2>
                        <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
                        <span className="bg-[#E8F3ED] text-[#7FAE96] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                            Active Account
                        </span>
                        
                        <p className="text-xs text-slate-400 leading-relaxed mb-8">
                            All memories private by default. Review your privacy settings to adjust.
                        </p>

                        <button className="w-full py-2.5 bg-[#7FAE96] hover:bg-[#6E9F86] text-white rounded-xl font-bold text-sm transition-all mb-3 cursor-pointer" onClick={()=>setActiveTab("settings" as any)}>
                            Edit Profile
                        </button>

                        <button className="w-full  px-4 py-2.5 text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-all rounded-xl cursor-pointer" onClick={handleLogout}>
                            🚪 Logout
                        </button>
                    </div>
                </aside>

                
                <main className="lg:col-span-8 xl:col-span-9 space-y-8">
                    
                    <div className="bg-[#F2F5F3] p-1.5 rounded-2xl flex gap-2 w-fit mb-8">
                        {["overview", "memories", "settings"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={
                                activeTab === tab
                                    ? "bg-white text-[#171A1F] px-6 py-2 rounded-xl text-sm font-bold shadow-sm"
                                    : "text-slate-500 px-6 py-2 rounded-xl text-sm font-bold cursor-pointer"
                                }
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === "overview" && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                                <StatCard
                                    title="Quick Stats"
                                    subTitle="Total Memories"
                                    value={stats.total}
                                    icon={<LayoutDashboard size={24} />}
                                />
                                <StatCard
                                    title="Shared Assets"
                                    subTitle="Share Mmeories"
                                    value={stats.shared}
                                    icon={<Users size={24} />}
                                />
                                <StatCard
                                    title="Cloud Status"
                                    subTitle="Storage used"
                                    value={stats.storage}
                                    icon={<Cloud size={24} />}
                                />
                            </div>

                            <div className="bg-white border border-[#DDE5DB] rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-[#DDE5DB] flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-[#171A1F]">Recent Activity</h3>
                                    <Link
                                        href="/"
                                        className="text-xs font-bold text-[#7FAE96] hover:underline"
                                    >
                                        View All
                                    </Link>
                                </div>

                                <div className="divide-y divide-slate-50">
                                {memories.length === 0 && (
                                    <p className="p-6 text-sm text-slate-400">
                                    No activity yet
                                    </p>
                                )}

                                    {memories.slice(0, 5).map((m) => (
                                        <Link
                                            key={m.id}
                                            href={`/memory/${m.id}`}
                                            className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className="bg-emerald-50 p-2.5 rounded-lg text-[#7FAE96]">
                                                    <History size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#171A1F]">
                                                        Added memory “{m.title}”
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {new Date(m.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300" />
                                        </Link>
                                    ))} 
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "memories" && (
                        <>
                            <div className="bg-white p-10 rounded-2xl border text-center">
                                <p className="text-slate-600 mb-6">
                                    Manage and explore all your memories.
                                </p>
                                <Link
                                    href="/"
                                    className="px-6 py-3 bg-[#7FAE96] text-white rounded-xl font-bold"
                                >
                                    Go to All Memories
                                </Link>
                            </div>
                        </>
                    )}

                    {activeTab === "settings" && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <section className="bg-white border border-[#DDE5DB] rounded-2xl shadow-sm overflow-hidden">

                                <div className="p-6 border-b border-[#DDE5DB]">
                                    <h3 className="text-lg font-bold text-[#171A1F]">Profile Details</h3>
                                    <p className="text-sm text-slate-500 mt-1">Manage your personal information.</p>
                                </div>

                                <div className="p-8 space-y-8">

                                    <div className="flex items-center gap-6">
                                        <img src={user?.avatar || "/images/user-avatar.png"} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F2F5F3]"/>
                                    </div>
                                    <p className="text-sm font-bold text-[#171A1F] mb-1">Profile Photo</p>
                                    <p className="text-xs text-slate-400 mb-3">Upload a new avatar or change your existing one.</p>
                                    <label className="flex items-center gap-2 px-4 py-2 border border-[#DDE5DB] rounded-xl text-xs font-bold text-[#7FAE96] hover:bg-[#F2F5F3] transition-all cursor-pointer">
                                        <Upload size={14} /> Upload new photo
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleAvatarUpdate} 
                                        />
                                    </label>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Display Name</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="text-slate-500 flex-1 p-2.5 border border-[#DDE5DB] rounded-xl text-sm focus:ring-2 focus:ring-[#7FAE96]/20 focus:outline-none"
                                            />
                                            <button className="px-4 py-2.5 bg-[#7FAE96] text-white rounded-xl text-xs font-bold hover:bg-[#6E9F86] transition-all cursor-pointer" onClick={handleUpdateName} disabled={updateLoading}>
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-slate-300">
                                                <Mail size={16} />
                                            </div>
                                            <input 
                                                type="email" 
                                                disabled
                                                value={user?.email || ""}
                                                className="w-full pl-12 p-3 bg-[#FAF9F6] border border-[#DDE5DB] rounded-xl text-sm text-slate-500 cursor-not-allowed"
                                            />
                                            <CheckCircle2 className="absolute right-4 top-3.5 text-emerald-500" size={18} />
                                        </div>
                                    </div>
                                </div>   
                            </section>

                            {user?.hasPassword && (
                                <section className="bg-white border border-[#DDE5DB] rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-[#DDE5DB]">
                                        <h3 className="text-lg font-bold text-[#171A1F]">Security</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Manage your account security.
                                        </p>
                                    </div>

                                    <form className="p-8 space-y-6 max-w-xl" onSubmit={handleUpdatePassword}>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.currentPassword}
                                                placeholder="Enter current password"
                                                className="text-slate-500 w-full p-3 border border-[#DDE5DB] rounded-xl text-sm"
                                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                required
                                                value={passwordData.newPassword}
                                                onChange={(e)=> setPasswordData({...passwordData,newPassword: e.target.value})}
                                                className="text-slate-500 w-full p-3 border border-[#DDE5DB] rounded-xl text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.confirmPassword}
                                                placeholder="Confirm new password"
                                                onChange={(e)=>{setPasswordData({...passwordData,confirmPassword: e.target.value})}}
                                                className="text-slate-500 w-full p-3 border border-[#DDE5DB] rounded-xl text-sm"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button className="cursor-pointer px-6 py-2.5 bg-[#7FAE96] hover:bg-[#6E9F86] text-white rounded-xl font-bold text-sm transition">
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            )}

                            <section className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-red-50 bg-red-50/30">
                                    <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                                    <p className="text-xs text-red-400">Irreversible actions for your account.</p>
                                </div>
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-[#171A1F]">Delete Account Permanently</p>
                                            <p className="text-xs text-slate-400">All memories and media will be removed from the vault immediately.</p>
                                        </div>
                                        <button className="px-10 py-3.5 border border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-all cursor-pointer" onClick={handleDelete}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                    
                </main>
            </div>
        </div>
    );
}


function StatCard({
    title,
    subTitle,
    value,
    icon,
    }: {
        title: string;
        subTitle:string;
        value: any;
        icon: React.ReactNode;
    }) {
        return (
            <div className="bg-white border border-[#DDE5DB] p-6 rounded-2xl shadow-sm">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</h3>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-black text-[#171A1F]">{value}</p>
                        <p className="text-xs text-slate-400">{subTitle}</p>
                    </div>
                    <div className="bg-[#F2F5F3] p-3 rounded-xl text-[#7FAE96]">
                        {icon}
                    </div>
                </div>
            </div>
        );
    }   