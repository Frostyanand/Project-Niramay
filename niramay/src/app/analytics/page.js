"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Clock, ChevronRight, FileJson, Eye,
    BarChart3, Pill, Dna, ArrowLeft, Search
} from 'lucide-react';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

/* ══════════════════════════════════════════════════════════════════════════════
   ANALYTICS PAGE — Past queries + visual dashboard
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'json'
    const [searchTerm, setSearchTerm] = useState('');

    /* ── Auth gate ──────────────────────────────────────────────────────── */
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            if (!u) { router.replace('/auth'); return; }
            setUser(u);
        });
    }, []);

    /* ── Fetch past analyses ───────────────────────────────────────────── */
    useEffect(() => {
        if (!user) return;
        const fetchAnalyses = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('analysis_results')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) setAnalyses(data);
            setLoading(false);
        };
        fetchAnalyses();
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/');
    };

    const userEmail = user?.email || '';
    const userInitial = userEmail?.[0]?.toUpperCase() || '?';

    /* ── Filter analyses by search ─────────────────────────────────────── */
    const filteredAnalyses = analyses.filter(a => {
        if (!searchTerm) return true;
        const drugs = (a.drugs_analyzed || []).join(', ').toLowerCase();
        const date = new Date(a.created_at).toLocaleDateString().toLowerCase();
        return drugs.includes(searchTerm.toLowerCase()) || date.includes(searchTerm.toLowerCase());
    });

    /* ── Helpers ────────────────────────────────────────────────────────── */
    const getRiskSummary = (analysis) => {
        const results = analysis.results_data || [];
        let high = 0, mod = 0, low = 0;
        results.forEach(r => {
            if (r.riskLevel === 'HIGH') high++;
            else if (r.riskLevel === 'MODERATE') mod++;
            else low++;
        });
        return { high, mod, low, total: results.length };
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen" style={{ background: '#f0f9ff', fontFamily: "'Inter', sans-serif" }}>

            {/* ── FLOATING PILL NAVBAR ──────────────────────────────────────── */}
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
                    <Link href="/" className="flex items-center gap-2.5 pl-2 group">
                        <div
                            className="flex-shrink-0 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
                            style={{ width: 36, height: 36, background: '#eaf4fb', padding: 3, flexShrink: 0 }}
                        >
                            <Image
                                src="/Logo.jpeg" alt="Niramay" width={30} height={30}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                                priority
                            />
                        </div>
                        <span className="text-[15px] font-semibold tracking-wide hidden sm:block" style={{ color: '#03045e' }}>
                            Niramay
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { label: 'Home', href: '/' },
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Analytics', href: '/analytics' },
                        ].map(({ label, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className="px-4 py-2 text-[13px] font-medium tracking-wide rounded-full transition-all duration-300"
                                style={{
                                    color: href === '/analytics' ? '#03045e' : 'rgba(3,4,94,0.6)',
                                    background: href === '/analytics' ? 'rgba(202,240,248,0.5)' : 'transparent',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#03045e'; e.currentTarget.style.background = 'rgba(202,240,248,0.5)'; }}
                                onMouseLeave={e => {
                                    if (href !== '/analytics') {
                                        e.currentTarget.style.color = 'rgba(3,4,94,0.6)';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

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
                            style={{ background: '#0077b6', color: '#ffffff' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#03045e'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#0077b6'; }}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </nav>
            </header>

            {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">

                {/* Page heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(0,119,182,0.08)', border: '1px solid rgba(0,119,182,0.15)' }}
                    >
                        <BarChart3 className="w-6 h-6" style={{ color: '#0077b6' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: '#03045e' }}>Analysis History</h1>
                        <p className="text-sm mt-0.5" style={{ color: '#0096c7' }}>
                            {analyses.length} past {analyses.length === 1 ? 'analysis' : 'analyses'} found
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT: HISTORY LIST ──────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        {/* Search */}
                        <div
                            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
                            style={{
                                background: '#ffffff',
                                border: '1px solid rgba(0,119,182,0.12)',
                                boxShadow: '0 2px 12px rgba(0,119,182,0.04)',
                            }}
                        >
                            <Search className="w-4 h-4" style={{ color: '#90e0ef' }} />
                            <input
                                type="text"
                                placeholder="Search by drug or date..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm"
                                style={{ color: '#03045e' }}
                            />
                        </div>

                        {/* List */}
                        <div className="space-y-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                            {loading ? (
                                <div className="flex flex-col items-center py-16">
                                    <div className="w-8 h-8 border-2 border-[#90e0ef] border-t-[#0077b6] rounded-full animate-spin" />
                                    <p className="text-xs mt-4" style={{ color: '#90e0ef' }}>Loading history...</p>
                                </div>
                            ) : filteredAnalyses.length === 0 ? (
                                <div
                                    className="text-center py-14 rounded-2xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.7)',
                                        border: '1px dashed rgba(0,119,182,0.15)',
                                    }}
                                >
                                    <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: '#90e0ef' }} />
                                    <p className="text-sm font-medium" style={{ color: '#90a0b0' }}>No analyses yet</p>
                                    <p className="text-xs mt-1" style={{ color: '#c0d0e0' }}>
                                        Run your first analysis from the{" "}
                                        <Link href="/dashboard" className="underline" style={{ color: '#0077b6' }}>Dashboard</Link>
                                    </p>
                                </div>
                            ) : (
                                filteredAnalyses.map((a, i) => {
                                    const risk = getRiskSummary(a);
                                    const isSelected = selectedAnalysis?.id === a.id;

                                    return (
                                        <motion.button
                                            key={a.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            onClick={() => setSelectedAnalysis(a)}
                                            className="w-full text-left rounded-xl p-4 transition-all duration-200 group"
                                            style={{
                                                background: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                                                border: `1px solid ${isSelected ? 'rgba(0,119,182,0.25)' : 'rgba(0,119,182,0.08)'}`,
                                                boxShadow: isSelected
                                                    ? '0 4px 20px rgba(0,119,182,0.1)'
                                                    : '0 2px 8px rgba(0,119,182,0.03)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5" style={{ color: '#0096c7' }} />
                                                    <span className="text-xs font-semibold" style={{ color: '#03045e' }}>
                                                        {formatDate(a.created_at)}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono" style={{ color: '#90e0ef' }}>
                                                    {formatTime(a.created_at)}
                                                </span>
                                            </div>

                                            {/* Drugs */}
                                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                {(a.drugs_analyzed || []).slice(0, 4).map(d => (
                                                    <span
                                                        key={d}
                                                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                        style={{
                                                            color: '#0077b6',
                                                            background: 'rgba(0,119,182,0.06)',
                                                            border: '1px solid rgba(0,119,182,0.1)',
                                                        }}
                                                    >
                                                        {d}
                                                    </span>
                                                ))}
                                                {(a.drugs_analyzed || []).length > 4 && (
                                                    <span className="text-[9px]" style={{ color: '#90a0b0' }}>
                                                        +{(a.drugs_analyzed || []).length - 4} more
                                                    </span>
                                                )}
                                            </div>

                                            {/* Risk badges */}
                                            <div className="flex items-center gap-3">
                                                {risk.high > 0 && (
                                                    <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>⚠ {risk.high} High</span>
                                                )}
                                                {risk.mod > 0 && (
                                                    <span className="text-[10px] font-bold" style={{ color: '#F59E0B' }}>● {risk.mod} Moderate</span>
                                                )}
                                                {risk.low > 0 && (
                                                    <span className="text-[10px] font-bold" style={{ color: '#10B981' }}>✓ {risk.low} Safe</span>
                                                )}
                                                <ChevronRight
                                                    className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ color: '#0096c7' }}
                                                />
                                            </div>
                                        </motion.button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                    {/* ── RIGHT: DETAIL PANEL ──────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <AnimatePresence mode="wait">
                            {!selectedAnalysis ? (
                                /* Empty state */
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center rounded-2xl py-24"
                                    style={{
                                        background: 'rgba(255,255,255,0.5)',
                                        border: '1px dashed rgba(0,119,182,0.12)',
                                    }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                        style={{ background: 'rgba(0,119,182,0.06)', border: '1px solid rgba(0,119,182,0.12)' }}
                                    >
                                        <Eye className="w-7 h-7 opacity-40" style={{ color: '#0096c7' }} />
                                    </div>
                                    <p className="text-sm font-medium" style={{ color: '#90a0b0' }}>Select an analysis to view details</p>
                                    <p className="text-xs mt-1" style={{ color: '#c0d0e0' }}>Click any item from the history panel</p>
                                </motion.div>
                            ) : (
                                /* Detail view */
                                <motion.div
                                    key={selectedAnalysis.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {/* Detail header */}
                                    <div
                                        className="rounded-2xl p-6 mb-4"
                                        style={{
                                            background: '#ffffff',
                                            border: '1px solid rgba(0,119,182,0.12)',
                                            boxShadow: '0 4px 24px rgba(0,119,182,0.06)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelectedAnalysis(null)}
                                                    className="p-2 rounded-lg transition-colors lg:hidden"
                                                    style={{ background: 'rgba(0,119,182,0.06)' }}
                                                >
                                                    <ArrowLeft className="w-4 h-4" style={{ color: '#0077b6' }} />
                                                </button>
                                                <div>
                                                    <h2 className="text-base font-bold" style={{ color: '#03045e' }}>
                                                        Analysis — {formatDate(selectedAnalysis.created_at)}
                                                    </h2>
                                                    <p className="text-xs mt-0.5" style={{ color: '#90e0ef' }}>
                                                        {formatTime(selectedAnalysis.created_at)} • {(selectedAnalysis.drugs_analyzed || []).join(', ')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Visual / JSON toggle */}
                                            <div className="flex rounded-full p-1" style={{ background: '#f0f9ff', border: '1px solid rgba(144,224,239,0.3)' }}>
                                                <button
                                                    onClick={() => setViewMode('visual')}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all ${viewMode === 'visual'
                                                            ? 'bg-white text-[#03045e] shadow-sm'
                                                            : 'text-[#0077b6]/60 hover:text-[#0077b6]'
                                                        }`}
                                                >
                                                    📊 Visual
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('json')}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all ${viewMode === 'json'
                                                            ? 'bg-white text-[#03045e] shadow-sm'
                                                            : 'text-[#0077b6]/60 hover:text-[#0077b6]'
                                                        }`}
                                                >
                                                    {'{ }'} JSON
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <AnimatePresence mode="wait">
                                        {viewMode === 'visual' ? (
                                            <motion.div
                                                key="visual"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <AnalyticsDashboard
                                                    isUnlocked={true}
                                                    reportData={selectedAnalysis.results_data || []}
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="json"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-4"
                                            >
                                                {/* Structured Results */}
                                                <div
                                                    className="rounded-2xl p-6 overflow-hidden"
                                                    style={{
                                                        background: '#ffffff',
                                                        border: '1px solid rgba(0,119,182,0.12)',
                                                        boxShadow: '0 4px 24px rgba(0,119,182,0.06)',
                                                    }}
                                                >
                                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4 pb-3" style={{
                                                        color: '#023e8a',
                                                        borderBottom: '1px solid rgba(0,119,182,0.08)',
                                                    }}>
                                                        Structured Results
                                                    </h3>
                                                    <pre
                                                        className="text-[11px] leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto p-4 rounded-lg"
                                                        style={{
                                                            background: '#f0f9ff',
                                                            color: '#03045e',
                                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                            border: '1px solid rgba(0,119,182,0.08)',
                                                        }}
                                                    >
                                                        {JSON.stringify(selectedAnalysis.results_data, null, 2)}
                                                    </pre>
                                                </div>

                                                {/* Raw Response */}
                                                {selectedAnalysis.raw_response && (
                                                    <div
                                                        className="rounded-2xl p-6"
                                                        style={{
                                                            background: '#ffffff',
                                                            border: '1px solid rgba(0,119,182,0.12)',
                                                            boxShadow: '0 4px 24px rgba(0,119,182,0.06)',
                                                        }}
                                                    >
                                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 pb-3" style={{
                                                            color: '#023e8a',
                                                            borderBottom: '1px solid rgba(0,119,182,0.08)',
                                                        }}>
                                                            Raw JSON Response
                                                        </h3>
                                                        <pre
                                                            className="text-[11px] leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto p-4 rounded-lg"
                                                            style={{
                                                                background: '#f0f9ff',
                                                                color: '#03045e',
                                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                                border: '1px solid rgba(0,119,182,0.08)',
                                                            }}
                                                        >
                                                            {JSON.stringify(selectedAnalysis.raw_response, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
