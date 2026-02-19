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
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const supabase = createClient();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [uploadFileName, setUploadFileName] = useState(null);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.replace('/');
    };

    // Called by VcfUploader once upload is done and a signed URL is ready
    const handleUploadComplete = (url, fileName) => {
        setUploadedFileUrl(url);
        setUploadFileName(fileName);
        setShowAnalysis(true);
    };

    // Reset everything for a new scan
    const handleNewScan = () => {
        setUploadedFileUrl(null);
        setUploadFileName(null);
        setShowAnalysis(false);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-cyan-50">
            {/* Background Overlay - Adds vignette and subtle grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950/80 to-slate-950 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none z-0" />

            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 border-r border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl flex flex-col z-20">
                <div className="p-6 border-b border-cyan-500/10 flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/30 border border-cyan-500/10 grid place-items-center text-cyan-600/50">
                        <Grid size={18} />
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-[10px] text-cyan-500/40 uppercase tracking-[0.2em] font-mono">Module: Genomics</p>
                        <p className="text-xs text-slate-500 font-bold">V 2.4.0</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        icon={<Grid />}
                        label="Overview"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <NavItem
                        icon={<Microscope />}
                        label="Analysis Lab"
                        active={activeTab === 'analysis'}
                        onClick={() => setActiveTab('analysis')}
                    />
                    <NavItem
                        icon={<FileText />}
                        label="Genomic Data"
                        active={activeTab === 'files'}
                        onClick={() => setActiveTab('files')}
                    />
                    <div className="pt-4 mt-4 border-t border-cyan-500/10">
                        <NavItem
                            icon={<User />}
                            label="Profile"
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <NavItem
                            icon={<Shield />}
                            label="Security"
                            active={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
                        />
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

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto z-10 relative scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                {/* Background Watermark - DNA Brand Anchor */}
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
                    <div className="relative opacity-[0.03] blur-sm scale-150 grayscale mix-blend-screen">
                        <Dna strokeWidth={0.5} className="w-[800px] h-[800px] text-cyan-500/50" />
                    </div>
                </div>

                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/10 px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        {/* NIRMAY LOGO */}
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
                        <div className="px-3 py-1 rounded border border-cyan-500/20 bg-cyan-950/30 text-xs text-cyan-400 font-mono">
                            SESSION ID: 8X-921
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/20 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20"></div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-8 space-y-8">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Genome Stability"
                            value="98.2%"
                            subtext="Optimal parameters"
                            icon={Shield}
                            trend="up"
                        />
                        <StatCard
                            label="Active Sequences"
                            value="142"
                            subtext="Processing in background"
                            icon={Zap}
                            trend="up"
                        />
                        <StatCard
                            label="Data Integrity"
                            value="100%"
                            subtext="Verified via blockchain"
                            icon={Activity}
                        />
                        <StatCard
                            label="Compute Load"
                            value="12%"
                            subtext="Cluster status normal"
                            icon={Thermometer}
                            trend="down"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                        {/* Main Interaction Area - Upload & Analysis */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* ── Upload Section ── */}
                            <AnimatePresence mode="wait">
                                {!showAnalysis ? (
                                    <motion.div
                                        key="uploader"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <GlassPanel
                                            title="Genomic Sequence Upload"
                                            action={
                                                <span className="text-cyan-400 cursor-pointer hover:underline">
                                                    View History
                                                </span>
                                            }
                                        >
                                            <div className="min-h-[300px] flex flex-col justify-center">
                                                <VcfUploader onUploadComplete={handleUploadComplete} />
                                            </div>
                                        </GlassPanel>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="upload-done"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <GlassPanel title="Sequence Upload">
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-emerald-200">Upload Transmission Complete</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                                                        Sequence data encrypted and stored in secure vault.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleNewScan}
                                                    className="flex-shrink-0 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs uppercase tracking-wide rounded-lg border border-slate-700/80 hover:border-slate-600 transition-all"
                                                >
                                                    New Scan
                                                </button>
                                            </div>
                                        </GlassPanel>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── Genomic Risk Assessment ── */}
                            <GlassPanel title="Genomic Risk Assessment Model">
                                <AnimatePresence mode="wait">
                                    {!showAnalysis ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <EmptyState />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="analysis"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <AnalysisPanel
                                                vcfUrl={uploadedFileUrl}
                                                drugs={[]} // Empty = backend uses all default drugs
                                                onReset={handleNewScan}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassPanel>
                        </div>

                        {/* System Diagnostics Sidebar */}
                        <div className="space-y-6">
                            <GlassPanel title="System Diagnostics" className="h-full">
                                <div className="space-y-6">
                                    <StatusRow label="Database Shard 01" status="Operational" />
                                    <StatusRow label="Encryption Layer" status="Active" isSecure />
                                    <StatusRow
                                        label="AI Inference Engine"
                                        status={showAnalysis ? "Active" : "Standby"}
                                    />
                                    <StatusRow label="API Gateway" status="Operational" />

                                    <div className="pt-6 border-t border-cyan-500/10">
                                        <h4 className="text-xs uppercase text-cyan-500/50 mb-4 tracking-widest">Recent Events</h4>
                                        <div className="space-y-3">
                                            {showAnalysis && (
                                                <EventItem
                                                    time="Now"
                                                    text="VCF analysis dispatched to AI engine"
                                                    type="success"
                                                />
                                            )}
                                            <EventItem time="10:42 AM" text="System backup completed" type="info" />
                                            <EventItem time="09:15 AM" text="New user login verified" type="success" />
                                            <EventItem time="08:30 AM" text="Update patch v2.4 applied" type="info" />
                                        </div>
                                    </div>
                                </div>
                            </GlassPanel>
                        </div>
                    </div>
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

            {/* Active Indicator Line */}
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
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Standby' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_5px_emerald]'}`}></span>
                <span className={status === 'Standby' ? 'text-amber-400' : 'text-emerald-400'}>{status}</span>
            </div>
        </div>
    );
}

function EventItem({ time, text, type }) {
    return (
        <div className="flex gap-3 text-xs">
            <span className="text-slate-500 font-mono w-16 opacity-70">{time}</span>
            <span className={type === 'success' ? 'text-emerald-400' : 'text-cyan-200/80'}>{text}</span>
        </div>
    );
}
