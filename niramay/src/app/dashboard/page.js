"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VcfUploader from '@/components/VcfUploader';
import {
    FileText, User, Activity, LogOut,
    Thermometer, Shield, Grid, Zap,
    Microscope, Dna, CheckCircle2
} from 'lucide-react';
import GlassPanel from '@/components/dashboard/GlassPanel';
import StatCard from '@/components/dashboard/StatCard';
import AnalysisPanel from '@/components/dashboard/AnalysisPanel';
import { EmptyState } from '@/components/dashboard/StatusStates';
import AnalysisLabView from '@/components/dashboard/AnalysisLabView';
import ProfileView from '@/components/dashboard/ProfileView';
import SecurityView from '@/components/dashboard/SecurityView';
import { motion, AnimatePresence } from 'framer-motion';

// Format a Date into a relative string, e.g. "3h ago", "just now"
function formatRelativeTime(date) {
    if (!date) return '—';
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}

export default function Dashboard() {
    const supabase = createClient();
    const router = useRouter();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [uploadFileName, setUploadFileName] = useState(null);

    // ── Real data from Supabase ───────────────────────────────────────────────
    const [user, setUser] = useState(null);
    const [genomicFiles, setGenomicFiles] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    // Fetch user + their genomic_files rows
    async function loadDashboardData() {
        setStatsLoading(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) { setStatsLoading(false); return; }
            setUser(currentUser);

            const { data: files, error } = await supabase
                .from('genomic_files')
                .select('id, file_name, file_path, file_size, status, created_at')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (!error && files) setGenomicFiles(files);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setStatsLoading(false);
        }
    }

    useEffect(() => {
        loadDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Derived stats from real data ──────────────────────────────────────────
    const totalUploads = genomicFiles.length;
    const completedFiles = genomicFiles.filter(f => f.status === 'done').length;
    const processingFiles = genomicFiles.filter(f => f.status === 'processing').length;
    const lastUploadDate = genomicFiles[0]?.created_at ? new Date(genomicFiles[0].created_at) : null;

    // Real session ID: first 4 + last 4 chars of user UUID
    const sessionId = user
        ? `${user.id.slice(0, 4)}-${user.id.slice(-4)}`.toUpperCase()
        : '--------';

    // Recent events from the 3 most recent uploads
    const recentEvents = genomicFiles.slice(0, 3).map(f => ({
        time: formatRelativeTime(new Date(f.created_at)),
        text: `Uploaded: ${f.file_name}`,
        type: f.status === 'done' ? 'success' : 'info',
    }));

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.replace('/');
    };

    const handleUploadComplete = async (url, fileName) => {
        setUploadedFileUrl(url);
        setUploadFileName(fileName);
        setShowAnalysis(true);
        await loadDashboardData(); // refresh stats
    };

    const handleNewScan = async () => {
        setUploadedFileUrl(null);
        setUploadFileName(null);
        setShowAnalysis(false);
        await loadDashboardData(); // refresh stats
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-cyan-50">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950/80 to-slate-950 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none z-0" />

            {/* Sidebar */}
            <aside className="w-20 lg:w-64 border-r border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl flex flex-col z-20">
                <div className="p-6 border-b border-cyan-500/10 flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/30 border border-cyan-500/10 grid place-items-center text-cyan-600/50">
                        <Grid size={18} />
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-[10px] text-cyan-500/40 uppercase tracking-[0.2em] font-mono">Module: Genomics</p>
                        <p className="text-xs text-slate-500 font-bold">Pharmacogenomics</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<Grid />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={<Microscope />} label="Analysis Lab" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                    <NavItem icon={<FileText />} label="Genomic Data" active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
                    <div className="pt-4 mt-4 border-t border-cyan-500/10">
                        <NavItem icon={<User />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <NavItem icon={<Shield />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                    </div>
                </nav>

                <div className="p-4 border-t border-cyan-500/10">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="hidden lg:block">Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto z-10 relative scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                {/* DNA Watermark */}
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
                    <div className="relative opacity-[0.03] blur-sm scale-150 grayscale mix-blend-screen">
                        <Dna strokeWidth={0.5} className="w-[800px] h-[800px] text-cyan-500/50" />
                    </div>
                </div>

                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/10 px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full" />
                                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 backdrop-blur-md grid place-items-center group-hover:scale-105 group-hover:border-cyan-500/40 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                                    <Dna className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-widest text-slate-100 group-hover:text-white transition-colors">NIRMAY</span>
                            </div>
                        </Link>

                        <div className="h-8 w-px bg-cyan-500/10 mx-2 hidden md:block"></div>

                        <div className="hidden md:block">
                            <h2 className="text-sm font-light tracking-wide text-slate-400 uppercase">
                                Command <span className="text-cyan-500/80 font-semibold">Center</span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Real session ID from user UUID */}
                        <div className="px-3 py-1 rounded border border-cyan-500/20 bg-cyan-950/30 text-xs text-cyan-400 font-mono">
                            SESSION: {sessionId}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/20 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20"></div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-8">
                    <AnimatePresence mode="wait">

                        {/* ── OVERVIEW TAB ── */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">
                                {/* StatCards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard label="Total Uploads" value={statsLoading ? '—' : String(totalUploads)} subtext="VCF files in your vault" icon={FileText} />
                                    <StatCard label="Completed" value={statsLoading ? '—' : String(completedFiles)} subtext="Analyses finished" icon={Zap} trend={completedFiles > 0 ? 'up' : undefined} />
                                    <StatCard label="Processing" value={statsLoading ? '—' : String(processingFiles)} subtext={processingFiles > 0 ? 'Running in background' : 'No active jobs'} icon={Activity} />
                                    <StatCard label="Last Upload" value={statsLoading ? '—' : formatRelativeTime(lastUploadDate)} subtext={lastUploadDate ? lastUploadDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No uploads yet'} icon={Shield} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Upload Section */}
                                        <AnimatePresence mode="wait">
                                            {!showAnalysis ? (
                                                <motion.div key="uploader" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                    <GlassPanel title="Genomic Sequence Upload" action={<span className="text-cyan-400 cursor-pointer hover:underline">View History</span>}>
                                                        <div className="min-h-[300px] flex flex-col justify-center">
                                                            <VcfUploader onUploadComplete={handleUploadComplete} />
                                                        </div>
                                                    </GlassPanel>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="upload-done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                    <GlassPanel title="Sequence Upload">
                                                        <div className="flex items-center gap-4 py-2">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-emerald-200">Upload Transmission Complete</p>
                                                                <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">Sequence data encrypted and stored in secure vault.</p>
                                                            </div>
                                                            <button onClick={handleNewScan} className="flex-shrink-0 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs uppercase tracking-wide rounded-lg border border-slate-700/80 hover:border-slate-600 transition-all">
                                                                New Scan
                                                            </button>
                                                        </div>
                                                    </GlassPanel>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Genomic Risk Assessment */}
                                        <GlassPanel title="Genomic Risk Assessment Model">
                                            <AnimatePresence mode="wait">
                                                {!showAnalysis ? (
                                                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <EmptyState onAction={() => setActiveTab('analysis')} />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <AnalysisPanel vcfUrl={uploadedFileUrl} drugs={[]} onReset={handleNewScan} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </GlassPanel>
                                    </div>

                                    {/* System Diagnostics */}
                                    <div className="space-y-6">
                                        <GlassPanel title="System Diagnostics" className="h-full">
                                            <div className="space-y-6">
                                                <StatusRow label="Database Shard 01" status="Operational" />
                                                <StatusRow label="Encryption Layer" status="Active" isSecure />
                                                <StatusRow label="AI Inference Engine" status={showAnalysis ? 'Active' : 'Standby'} />
                                                <StatusRow label="API Gateway" status="Operational" />
                                                <div className="pt-6 border-t border-cyan-500/10">
                                                    <h4 className="text-xs uppercase text-cyan-500/50 mb-4 tracking-widest">Recent Events</h4>
                                                    <div className="space-y-3">
                                                        {showAnalysis && (
                                                            <EventItem time="Now" text={`Analysis dispatched${uploadFileName ? ': ' + uploadFileName : ''}`} type="success" />
                                                        )}
                                                        {!statsLoading && recentEvents.length > 0
                                                            ? recentEvents.map((ev, i) => <EventItem key={i} time={ev.time} text={ev.text} type={ev.type} />)
                                                            : !statsLoading && <p className="text-xs text-slate-600 font-mono italic">No uploads yet.</p>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassPanel>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── ANALYSIS LAB TAB ── */}
                        {activeTab === 'analysis' && (
                            <motion.div key="analysis-lab" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                <AnalysisLabView
                                    genomicFiles={genomicFiles}
                                    onGoToUpload={() => setActiveTab('overview')}
                                />
                            </motion.div>
                        )}

                        {/* ── GENOMIC DATA TAB ── */}
                        {activeTab === 'files' && (
                            <motion.div key="files" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                <GlassPanel title="Genomic File Vault" action={
                                    <button onClick={() => setActiveTab('overview')} className="text-cyan-400 hover:text-cyan-300 text-xs uppercase tracking-widest">+ Upload New</button>
                                }>
                                    {!statsLoading && genomicFiles.length === 0 ? (
                                        <EmptyState onAction={() => setActiveTab('overview')} />
                                    ) : (
                                        <div className="space-y-2">
                                            {/* Table header */}
                                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-mono border-b border-slate-800">
                                                <span className="col-span-5">File Name</span>
                                                <span className="col-span-3">Uploaded</span>
                                                <span className="col-span-2">Size</span>
                                                <span className="col-span-2">Status</span>
                                            </div>
                                            {statsLoading
                                                ? Array.from({ length: 3 }).map((_, i) => (
                                                    <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg animate-pulse">
                                                        <div className="col-span-5 h-3 bg-slate-800 rounded" />
                                                        <div className="col-span-3 h-3 bg-slate-800 rounded" />
                                                        <div className="col-span-2 h-3 bg-slate-800 rounded" />
                                                        <div className="col-span-2 h-3 bg-slate-800 rounded" />
                                                    </div>
                                                ))
                                                : genomicFiles.map((f, i) => (
                                                    <motion.div
                                                        key={f.id}
                                                        initial={{ opacity: 0, x: -8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-slate-800/40 transition-colors text-xs items-center border border-transparent hover:border-slate-700/50"
                                                    >
                                                        <span className="col-span-5 flex items-center gap-2 font-mono text-slate-200 truncate">
                                                            <FileText className="w-3.5 h-3.5 text-cyan-500/50 flex-shrink-0" />
                                                            {f.file_name}
                                                        </span>
                                                        <span className="col-span-3 text-slate-500 font-mono">
                                                            {new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="col-span-2 text-slate-500 font-mono">
                                                            {f.file_size ? `${(f.file_size / 1024).toFixed(1)} KB` : '—'}
                                                        </span>
                                                        <span className="col-span-2">
                                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${f.status === 'done' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30' :
                                                                f.status === 'processing' ? 'border-amber-500/30 text-amber-400 bg-amber-950/20' :
                                                                    'border-slate-600 text-slate-400 bg-slate-900'
                                                                }`}>{f.status || 'uploaded'}</span>
                                                        </span>
                                                    </motion.div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </GlassPanel>
                            </motion.div>
                        )}

                        {/* ── PROFILE TAB ── */}
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                <ProfileView user={user} />
                            </motion.div>
                        )}

                        {/* ── SECURITY TAB ── */}
                        {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                <SecurityView user={user} onSignOut={handleSignOut} />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden ${active
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                : 'text-slate-400 hover:text-cyan-100 hover:bg-slate-800/50'
                }`}
        >
            <span className={`relative z-10 transition-colors ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
                {icon}
            </span>
            <span className="relative z-10 hidden lg:block">{label}</span>
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>
            )}
        </button>
    );
}

function StatusRow({ label, status, isSecure }) {
    return (
        <div className="flex justify-between items-center text-sm font-mono border-b border-dashed border-cyan-500/10 pb-2 last:border-0 last:pb-0">
            <span className="text-slate-400">{label}</span>
            <div className="flex items-center gap-2">
                {isSecure && <Shield className="w-3 h-3 text-emerald-500" />}
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Standby' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className={status === 'Standby' ? 'text-amber-400' : 'text-emerald-400'}>{status}</span>
            </div>
        </div>
    );
}

function EventItem({ time, text, type }) {
    return (
        <div className="flex gap-3 text-xs">
            <span className="text-slate-500 font-mono w-16 flex-shrink-0 opacity-70">{time}</span>
            <span className={type === 'success' ? 'text-emerald-400' : 'text-cyan-200/80'}>{text}</span>
        </div>
    );
}
