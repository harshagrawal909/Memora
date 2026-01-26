import Link from 'next/link';

export default function Footer(){
    return(
        <footer className="w-full bg-[#F6F4EF] border-t border-[#E2DED4]">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-[#C9B37E] p-1.5 rounded-md">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                                </svg>
                            </div>
                            <span className="text-[#1E2A28] font-bold text-lg">Memora</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                        Your personal digital vault for life's most precious moments. 
                        Powered by Midvault security.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link href="/dashboard" className="hover:text-[#9C855A] transition">Dashboard</Link></li>
                            <li><Link href="/" className="hover:text-[#9C855A] transition">Memories Feed</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">System</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li>
                                <button className="hover:text-[#9C855A] transition text-left">
                                    Privacy Settings
                                </button>
                            </li>
                            <li>
                                <button className="hover:text-[#9C855A] transition text-left">
                                    Storage Details
                                </button>
                            </li>
                            <li>
                                <button className="hover:text-[#9C855A] transition text-left">
                                    Help Center
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400 font-medium">
                        © 2026 Memora. Where your memories remain private and timeless.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Memora Systems Online
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}