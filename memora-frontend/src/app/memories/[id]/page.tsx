"use client"
import { useEffect, useState} from "react";
import {useParams,useRouter} from "next/navigation";
import {Trash2, X, MapPin, Calendar, Lock, Users, ChevronLeft, Plus, Edit3, Shield,Upload } from 'lucide-react';
import Link from "next/link";

export default function MemoryDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [memory, setMemory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [openPhoto,setOpenPhoto]=useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [manage,setManage] = useState(false);



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length === 0) return;

        const newPreviews = selectedFiles.map(file =>
            URL.createObjectURL(file)
        );

        setFiles(prev => [...prev, ...selectedFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const uploadPhotos = async () => {
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append("media", file));

        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const res = await fetch(
                `${apiUrl}/api/memories/${id}/photos`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message);
            }

            setOpenPhoto(false);
            setFiles([]);
            setPreviews([]);

            window.location.reload(); 

        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload photos");
        }
    };

    useEffect(() => {
        const fetchMemory = async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${apiUrl}/api/memories/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setMemory(data);
            } catch (err) {
                console.error("Failed to fetch memory detail");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchMemory();
    }, [id]);

    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                setActiveIndex((i) =>
                    i === memory.all_media_urls.length - 1 ? 0 : i + 1
                );
            }
            if (e.key === "ArrowLeft") {
                setActiveIndex((i) =>
                    i === 0 ? memory.all_media_urls.length - 1 : i - 1
                );
            }
            if (e.key === "Escape") {
                setLightboxOpen(false);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightboxOpen, memory]);

    useEffect(()=>{
        if(!openPhoto) return;
    },[openPhoto]);

    const handleAction = async (e: React.MouseEvent, action: string, memoryId: string) => {
        e.preventDefault(); 
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this memory?")) {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const res = await fetch(`${apiUrl}/api/memories/${memoryId}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    router.push('/');
                } else {
                    const error = await res.json();
                    alert(error.message || "Failed to delete memory");
                }
            } catch (err) {
                console.error("Delete request failed", err);
            }
        }
    }

    if (loading) return <div className="flex justify-center mt-20 text-slate-400">Opening vault...</div>;
    if (!memory) return <div className="text-center mt-20">Memory not found.</div>;
    
    const isManageDisabled = memory.visibility === "private";

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 bg-white min-h-screen">
            <button onClick={() => router.back()} className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-[#7FAE96] mb-6 transition-colors font-medium">
                <ChevronLeft size={20} /> Back to Home
            </button>

            <div className="relative w-full h-64 sm:h-80 md:h-100 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 shadow-lg">
                <img 
                    src={memory.all_media_urls?.[0] || memory.media_url} 
                    alt={memory.title} 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{memory.title}</h1>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                        {memory.visibility === 'shared' ? <Users size={16} /> : <Lock size={16} />}
                        <span className="capitalize">{memory.visibility} Memory</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-8 text-slate-500 text-sm border-b pb-6">
                <span className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    {new Date(memory.memory_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {memory.location && (
                    <span className="flex items-center gap-2">
                        <MapPin size={18} className="text-slate-400" /> {memory.location}
                    </span>
                )}
                <span className="flex items-center gap-2">
                    <span className="text-lg">😊</span> {memory.mood}
                </span>
            </div>

            <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4">My Story</h2>
                <p className="text-slate-600 leading-relaxed max-w-4xl whitespace-pre-wrap">
                    {memory.description || "No story added to this memory yet."}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-12">
                <button
                 onClick={() => { setOpenPhoto(true); }}
                 className="sm:w-auto w-full cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    <Plus size={16} /> Add Photo
                </button>
                <Link href={`/edit/${memory.id}`} key={memory.id} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    <Edit3 size={16} /> Edit Memory
                </Link>
                <button 
                    onClick={()=>{
                        if (!isManageDisabled) {
                            setManage(!manage);
                        }
                    }} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${isManageDisabled ?  "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#7FAE96] text-white hover:bg-[#6E9F86]"}`}
                >
                    <Shield size={16} /> Manage Access
                </button>
                <button onClick={(e) => handleAction(e, 'delete', memory.id)} className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-50 transition">
                    <Trash2 size={16}/>Delete
                </button>
            </div>

            {manage && memory.visibility === "private" && (
                <div className="mt-6 mx-auto max-w-md rounded-lg border border-dashed border-[#DDE5DB] bg-[#FAF9F6] p-4 text-center">
                    <p className="text-sm font-semibold text-[#171A1F] mb-1">Sharing is coming soon 🚧</p>
                    <p className="text-sm text-slate-500">For now, memories can only be saved as Private.</p>
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Photo Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {memory.all_media_urls?.map((url: string, index: number) => (
                        <div 
                            key={index} 
                            className="aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                                setActiveIndex(index);
                                setLightboxOpen(true);
                            }}>
                            <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                    ))}
                </div>
            </div>

            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white text-3xl font-bold"
                        onClick={() => setLightboxOpen(false)}
                    >
                        ✕
                    </button>

                    <button
                        className="cursor-pointer absolute left-6 text-white text-5xl select-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveIndex(
                                activeIndex === 0
                                    ? memory.all_media_urls.length - 1
                                    : activeIndex - 1
                            );
                        }}
                    >
                        ‹
                    </button>

                    <img
                        src={memory.all_media_urls[activeIndex]}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="absolute right-6 text-white text-5xl select-none cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveIndex(
                                activeIndex === memory.all_media_urls.length - 1
                                    ? 0
                                    : activeIndex + 1
                            );
                        }}
                    >
                        ›
                    </button>
                </div>
            )}

            {openPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={() => setOpenPhoto(false)}
                >
                    <div className="bg-white p-8 rounded-xl border border-[#DDE5DB] shadow-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#171A1F]">Photos</h2>
                            <p className="text-sm text-slate-500">Bring your memories to life with images. Max 10 photos.</p>
                        </div>

                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#DEE1E6] rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col items-center">
                                <Upload className="text-slate-400 mb-2" size={32} />
                                <p className="text-sm text-slate-500">Drag & drop photos here, or <span className="text-[#7FAE96] font-semibold">click to browse</span></p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange}/>
                        </label>

                        {previews.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#DDE5DB]">
                                        <img src={preview} className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                            onClick={() => {
                                            setPreviews(prev => prev.filter((_, i) => i !== index));
                                            setFiles(prev => prev.filter((_, i) => i !== index));
                                        }}>
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setOpenPhoto(false)}
                                className="px-4 py-2 border rounded-lg text-slate-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={uploadPhotos}
                                className="cursor-pointer px-5 py-2 bg-[#7FAE96] text-white rounded-lg font-semibold"
                            >
                                Upload Photos
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}