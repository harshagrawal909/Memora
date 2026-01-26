"use client";
import {useState} from "react";
import { useRouter } from "next/navigation";
import { Upload, X, MapPin, Calendar, Check, ChevronLeft } from 'lucide-react';

export default function CreateMemory() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [visibility, setVisibility] = useState<"private" | "shared">("private");
    const [selectedMood, setSelectedMood] = useState('Adventurous');
    const [previews, setPreviews] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    const moods = ['Happy', 'Reflective', 'Adventurous', 'Calm', 'Grateful'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const newFiles = Array.from(selectedFiles);
            setFiles(prev => [...prev, ...newFiles]); 

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]); 
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (files.length === 0) return alert("Please upload at least one photo");
        setLoading(true);

        const formElement = e.currentTarget;
        const formData = new FormData();


        formData.append('title', (formElement.elements.namedItem('title') as HTMLInputElement).value);
        formData.append('description', (formElement.elements.namedItem('description') as HTMLTextAreaElement).value);
        formData.append('date', (formElement.elements.namedItem('date') as HTMLInputElement).value);
        formData.append('location', (formElement.elements.namedItem('location') as HTMLInputElement).value);
        formData.append('mood', selectedMood);
        formData.append('visibility', visibility);
        files.forEach((file) => {
            formData.append('media', file);
        });

        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const res = await fetch(`${apiUrl}/api/memories`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                router.push('/');
            }else {
                const errorData = await res.json();
                console.error("Server responded with error:", errorData.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 bg-[#FAF9F6] py-8 lg:py-12">
            <button onClick={() => router.back()} className=" cursor-pointer flex items-center gap-2 text-slate-500 hover:text-[#7FAE96] mb-6 transition-colors font-medium">
                <ChevronLeft size={20} /> Back to Home
            </button>
            <h1 className="text-3xl font-bold text-[#171A1F] mb-10 ">
                Create a New Memory
            </h1>
            <form className="space-y-10" onSubmit={handleSubmit}>
                <section className="bg-white p-8 rounded-xl border border-[#DDE5DB] shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#171A1F]">Memory Details</h2>
                        <p className="text-sm text-slate-500">Capture the essence of your moment.</p>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#171A1F] mb-2">
                                Memory Title
                            </label>
                            <input name="title" required placeholder="Summer Hike to Cascade Falls" 
                                className="w-full p-3 border border-[#DEE1E6] rounded-lg text-sm placeholder:text-slate-400 text-[#171A1F] focus:outline-none  focus:ring-2 focus:ring-[#7FAE96]/40" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#171A1F] mb-2">Description/Story</label>
                            <textarea name="description" rows={4} placeholder="A vibrant day spent exploring..." 
                                className="w-full p-3 border border-[#DEE1E6] rounded-lg text-sm placeholder:text-slate-400 text-[#171A1F] focus:outline-none  focus:ring-2 focus:ring-[#7FAE96]/40" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 relative">
                                <label className="block text-sm font-medium text-[#171A1F] mb-2">Date</label>
                                <div className="relative">
                                    <Calendar
                                        className="absolute left-3 top-3 text-slate-400"
                                        size={18}
                                    />
                                    <input type="date" name="date" required className="w-full pl-10 p-3 border border-[#DEE1E6] rounded-lg text-sm text-[#171A1F] focus:outline-none focus:ring-2 focus:ring-[#7FAE96]/40" />
                                </div>
                            </div>
                            <div className="space-y-1 relative">
                                <label className="block text-sm font-medium text-[#171A1F] mb-2">Location (Optional)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18}/>
                                    <input name="location" placeholder="Cascade Falls Trail, Pacific Northwest" 
                                        className="w-full pl-10 p-3 border border-[#DEE1E6] rounded-lg text-sm placeholder:text-slate-400 text-[#171A1F] focus:outline-none focus:ring-2 focus:ring-[#7FAE96]/40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white p-8 rounded-xl border border-[#DDE5DB] shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#171A1F]">Mood & Feeling</h2>
                        <p className="text-sm text-slate-500">How did this memory make you feel?</p>
                    </div>
                    <label className="block text-sm font-medium text-[#171A1F] mb-4">Choose a Mood</label>
                    <div className="flex flex-wrap gap-3">
                        {moods.map(mood => (
                            <button key={mood} type="button" onClick={() => setSelectedMood(mood)} 
                                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                                    selectedMood === mood ? 'bg-[#f8fbfe] text-[#7FAE96] border-[#7FAE96]' : 'bg-white text-slate-500 border-[#DEE1E6] hover:bg-slate-50'
                                }`}>
                                {mood}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="bg-white p-8 rounded-xl border border-[#DDE5DB] shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#171A1F]">Photos</h2>
                        <p className="text-sm text-slate-500">Bring your memories to life with images. Max 10 photos.</p>
                    </div>

                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#DEE1E6] rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center">
                            <Upload className="text-slate-400 mb-2" size={32} />
                            <p className="text-sm text-slate-500">Drag & drop photos here, or <span className="text-[#7FAE96] font-semibold">click to browse</span></p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple/>
                    </label>

                    {previews.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-4">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#DDE5DB]">
                                    <img src={preview} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                                        <X size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                </section>

                <section className="bg-white p-8 rounded-xl border border-[#DDE5DB] shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#171A1F]">Privacy Settings</h2>
                        <p className="text-sm text-slate-500">Control who can view this memory. All memories are private by default.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setVisibility("private")}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-all ${
                            visibility === "private"
                                ? "bg-[#7FAE96] text-white border-[#7FAE96]"
                                : "bg-white text-slate-500 border-[#DEE1E6]"
                            }`}
                        >
                            Private
                        </button>

                        <button
                            type="button"
                            onClick={() => setVisibility("shared")}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-all ${
                            visibility === "shared"
                                ? "bg-[#7FAE96] text-white border-[#7FAE96]"
                                : "bg-white text-slate-500 border-[#DEE1E6]"
                            }`}
                        >
                            Share with specific emails
                        </button>
                    </div>
                    {visibility === "shared" && (
                        <div className="mt-6 mx-auto max-w-md rounded-lg border border-dashed border-[#DDE5DB] bg-[#FAF9F6] p-4 text-center">
                            <p className="text-sm font-semibold text-[#171A1F] mb-1">Sharing is coming soon 🚧</p>
                            <p className="text-sm text-slate-500">For now, memories can only be saved as Private.</p>
                        </div>
                    )}   
                </section>

                <div className="flex justify-end items-center gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-slate-500 font-bold border border-[#DEE1E6] rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading || visibility === "shared"} 
                        className={`px-10 py-2.5  text-white font-bold rounded-lg shadow-lg  bg-[#7FAE96] hover:bg-[#6E9F86]  transition-all disabled:opacity-50 ${visibility === "shared" ? "cursor-not-allowed" : "cursor-pointer"}`}>
                        {loading ? 'Saving Memory...' : 'Save Memory'}
                    </button>
                </div>
            </form>
        </div>
    )
}