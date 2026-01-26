"use client";
import {useState, useEffect,useRef} from "react";
import Link from "next/link";
import { Plus, Lock, Users, MoreVertical,Edit2, Trash2, Archive } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
          const fetchMemories = async () => {
              try {
                  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                  const res = await fetch(`${apiUrl}/api/memories`, {
                      headers: { "Authorization": `Bearer ${token}` }
                  });
                  const data = await res.json();
                  if (res.ok) setMemories(data);
              } catch (err) {
                  console.error("Failed to fetch memories");
              } finally {
                  setLoading(false);
              }
          };
          fetchMemories();

          const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setActiveMenu(null);
            }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

    const handleAction = async (e: React.MouseEvent, action: string, memoryId: string) => {
      e.preventDefault(); 
      e.stopPropagation();
      setActiveMenu(null);

      if (action === 'delete') {
        if (confirm("Are you sure you want to delete this memory?")) {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${apiUrl}api/memories/${memoryId}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    setMemories(prev => prev.filter((m: any) => m.id !== memoryId));
                } else {
                    const error = await res.json();
                    alert(error.message || "Failed to delete memory");
                }
            } catch (err) {
                console.error("Delete request failed", err);
            }
        }
      } 
    };

  if (loading) return <div className="flex justify-center mt-20 text-slate-400">Loading your vault...</div>;

  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="flex justify-end mb-8">
        <Link href="/create" className="flex items-center gap-2 bg-[#7FAE96] hover:bg-[#6E9F86] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all">
          <Plus size={20} />
          Create New Memory
        </Link>
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <div className="bg-emerald-50 p-4 rounded-full mb-4">
            <Link href="/create">
              <Plus className="text-[#7FAE96]" size={32} />
            </Link>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Your vault is empty</h3>
          <p className="text-slate-500 mt-2">Let&apos;s start capturing and securing your life&apos;s most precious moments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {memories.map((memory:any) => (
            <div className="cursor-pointer block relative" onClick={() => router.push(`/memories/${memory.id}`)} key={memory.id}>

              <div key={memory.id} className="group bg-white rounded-xl border border-[#DDE5DB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img src={memory.all_media_urls?.[0] || memory.media_url} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />


                  <div className="absolute top-3 right-3 z-10" ref={activeMenu === memory.id ? menuRef : null}>
                    <button onClick={(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenu(activeMenu === memory.id ? null : memory.id);
                      }} 
                      className="cursor-pointer absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-colors">
                      <MoreVertical size={18} />
                    </button>

                    {activeMenu === memory.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                          <Link 
                            href={`/edit/${memory.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 size={14} className="text-slate-400" /> Edit Story
                          </Link>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button 
                            onClick={(e) => handleAction(e, 'delete', memory.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            <Trash2 size={14} /> Delete Story
                          </button>
                        </div>
                    )}
                  </div>

                </div>
                <div className="p-4">
                  <h4 className="font-bold text-[#171A1F] truncate">{memory.title || "Untitled Moment"}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${memory.visibility === 'shared' ? 'text-blue-500' : 'text-slate-400'}`}>
                      {memory.visibility === 'shared' ? (
                        <>
                          <Users size={12} />
                          Shared
                        </>
                      ) : (
                        <>
                          <Lock size={12} />
                          Private
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link 
        href="/create"
        className="fixed bottom-8 right-8 md:hidden bg-[#7FAE96] text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
