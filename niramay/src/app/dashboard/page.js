"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import VcfUploader from '@/components/VcfUploader';
import AnalysisPanel from '@/components/dashboard/AnalysisPanel';
import { LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════════════════════
   VIDEO BACKGROUND — same pattern as landing page
   ══════════════════════════════════════════════════════════════════════════════ */
const DASHBOARD_VIDEOS = [
    "/matrix.mp4",                                                                 // LOCAL — matrix video (primary)
    "/neural_network2.mp4",                                                        // LOCAL fallback
    "https://cdn.pixabay.com/video/2020/04/18/36465-408970428_large.mp4",         // CDN fallback
];

function VideoBackground() {
    const [idx, setIdx] = useState(0);
    const videoRef = useRef(null);

    const handleError = () => {
        if (idx < DASHBOARD_VIDEOS.length - 1) setIdx((i) => i + 1);
    };

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.load();
        v.play().catch(() => { });
    }, [idx]);

    const handleCanPlay = () => {
        if (videoRef.current) videoRef.current.playbackRate = 0.65;
    };

    return (
        <video
            ref={videoRef}
            autoPlay muted loop playsInline
            onError={handleError}
            onCanPlay={handleCanPlay}
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23312e81' width='1' height='1'/%3E%3C/svg%3E"
            style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                minWidth: "100%", minHeight: "100%",
                width: "auto", height: "auto", objectFit: "cover",
            }}
        >
            <source src={DASHBOARD_VIDEOS[idx]} type="video/mp4" />
        </video>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   STEP BADGE
   ══════════════════════════════════════════════════════════════════════════════ */
function StepBadge({ number, label, active }) {
    return (
        <div className={`flex items-center gap-3 mb-6 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tracking-wider"
                style={{
                    background: active ? 'linear-gradient(135deg, #0077b6, #023e8a)' : 'transparent',
                    border: active ? 'none' : '1.5px solid #90e0ef',
                    color: active ? '#ffffff' : '#0096c7',
                }}
            >
                {String(number).padStart(2, '0')}
            </span>
            <span
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: active ? '#03045e' : '#90e0ef' }}
            >
                {label}
            </span>
            {active && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ height: 1, flex: 1, background: '#0077b6', transformOrigin: 'left', opacity: 0.3 }}
                />
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            if (!u) { router.replace('/auth'); return; }
            setUser(u);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/');
    };

    const handleUploadComplete = (url) => {
        setUploadedFileUrl(url);
        setShowAnalysis(true);
    };

    const handleNewScan = () => {
        setUploadedFileUrl(null);
        setShowAnalysis(false);
    };

    const userEmail = user?.email || '';
    const userInitial = userEmail?.[0]?.toUpperCase() || '?';

    return (
        <div className="min-h-screen" style={{ background: '#f0f9ff', fontFamily: "'Inter', sans-serif" }}>

            {/* ── FLOATING PILL NAVBAR — matches landing page ─────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
                <nav
                    className="flex items-center justify-between w-full max-w-5xl px-3 py-2 pointer-events-auto"
                    style={{
                        background: 'rgba(240,249,255,0.75)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(144,224,239,0.3)',
                        boxShadow: '0 8px 32px rgba(0,119,182,0.08)',
                        borderRadius: 9999,
                    }}
                >
                    {/* Brand with Logo */}
                    <Link href="/" className="flex items-center gap-2.5 pl-2 group">
                        <div
                            className="flex-shrink-0 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
                            style={{ width: 36, height: 36, background: '#eaf4fb', padding: 3, flexShrink: 0 }}
                        >
                            <Image
                                src="/Logo.jpeg"
                                alt="Niramay"
                                width={30}
                                height={30}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                                priority
                            />
                        </div>
                        <span className="text-[15px] font-semibold tracking-wide hidden sm:block" style={{ color: '#03045e' }}>
                            Niramay
                        </span>
                    </Link>

                    {/* Centre nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }].map(({ label, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className="px-4 py-2 text-[13px] font-medium tracking-wide rounded-full transition-all duration-300"
                                style={{ color: 'rgba(3,4,94,0.6)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#03045e'; e.currentTarget.style.background = 'rgba(202,240,248,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(3,4,94,0.6)'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: user avatar + sign out */}
                    <div className="flex items-center gap-2.5 pr-1">
                        {userEmail && (
                            <div className="hidden sm:flex items-center gap-2">
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #0077b6, #023e8a)' }}
                                >
                                    {userInitial}
                                </div>
                                <span className="text-[13px] font-medium max-w-[140px] truncate" style={{ color: '#023e8a' }}>
                                    {userEmail}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-full transition-all duration-300"
                            style={{
                                background: '#0077b6',
                                color: '#ffffff',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#03045e'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#0077b6'; }}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </nav>
            </header>

            {/* ── HERO PANEL ────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden" style={{ height: '38vh', minHeight: 260 }}>
                {/* Video */}
                <div className="absolute inset-0">
                    <VideoBackground />
                    {/* Purple tint overlay — matches landing page */}
                    <div className="absolute inset-0" style={{ background: 'rgba(30,27,75,0.32)', mixBlendMode: 'multiply' }} />
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to bottom, rgba(49,46,129,0.45) 0%, rgba(76,29,149,0.1) 60%, rgba(30,27,75,0.82) 100%)'
                    }} />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: '#c7d2fe' }}>
                            Pharmacogenomics Analysis Workspace
                        </p>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4"
                            style={{ fontFamily: "'Inter', sans-serif", textShadow: '0 2px 24px rgba(0,0,0,0.3)' }}>
                            Precision medicine,<br />
                            <span style={{ color: '#bae6fd' }}>personalised for you.</span>
                        </h1>
                        <p className="text-sm sm:text-base font-light max-w-xl mx-auto" style={{ color: '#c7d2fe', lineHeight: 1.8 }}>
                            Upload your genomic data, select medications, and receive evidence-based pharmacogenomic guidance in seconds.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── MAIN CONTENT FLOW ─────────────────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-12">

                {/* STEP 1 — UPLOAD */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                >
                    <StepBadge number={1} label="Upload VCF File" active={!showAnalysis} />

                    <AnimatePresence mode="wait">
                        {!showAnalysis ? (
                            <motion.div
                                key="uploader"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-2xl overflow-hidden"
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid rgba(0,119,182,0.12)',
                                    boxShadow: '0 4px 32px rgba(0,119,182,0.07)',
                                }}
                            >
                                <div className="p-8">
                                    <VcfUploader onUploadComplete={handleUploadComplete} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="uploaded"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-4 px-6 py-4 rounded-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                                    border: '1px solid rgba(16,185,129,0.2)',
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(16,185,129,0.15)' }}
                                >
                                    <Sparkles className="w-5 h-5" style={{ color: '#059669' }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold" style={{ color: '#065f46' }}>Genomic file secured & ready</p>
                                    <p className="text-xs mt-0.5" style={{ color: '#6ee7b7' }}>Encrypted and transmitted to secure vault.</p>
                                </div>
                                <button
                                    onClick={handleNewScan}
                                    className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200"
                                    style={{ border: '1.5px solid rgba(5,150,105,0.3)', color: '#059669' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#059669'; }}
                                >
                                    New Scan
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* STEP 2+3 — ANALYSIS (drug selection → results) */}
                <AnimatePresence>
                    {showAnalysis && (
                        <motion.section
                            key="analysis"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <StepBadge number={2} label="Select Drugs & Run Analysis" active={true} />

                            <div
                                className="rounded-2xl overflow-hidden"
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid rgba(0,119,182,0.12)',
                                    boxShadow: '0 4px 32px rgba(0,119,182,0.07)',
                                }}
                            >
                                <div className="p-8">
                                    <AnalysisPanel
                                        vcfUrl={uploadedFileUrl}
                                        drugs={[]}
                                        onReset={handleNewScan}
                                    />
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Bottom spacer / trust text */}
                {!showAnalysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-6 pt-4"
                    >
                        {['CPIC Guidelines', 'End-to-End Encrypted', 'Evidence-Based'].map((badge) => (
                            <span
                                key={badge}
                                className="flex items-center gap-1.5 text-xs font-medium"
                                style={{ color: '#90e0ef' }}
                            >
                                <ArrowRight className="w-3 h-3" style={{ color: '#0096c7' }} />
                                {badge}
                            </span>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
