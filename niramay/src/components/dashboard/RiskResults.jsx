"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle, Info, ChevronDown,
    ChevronUp, Download, Copy, FileJson, Activity, FlaskConical, BookOpen
} from 'lucide-react';
import { EmptyState } from '@/components/dashboard/StatusStates';

export default function RiskResults({ data, rawResponse }) {
    const [expandedCards, setExpandedCards] = useState([]);
    const [jsonOpen, setJsonOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    if (!data || data.length === 0) {
        return <EmptyState />;
    }

    // Auto-expand high risk cards on mount
    useEffect(() => {
        if (data) {
            const highRiskIds = data.filter(d => d.riskLevel === 'HIGH').map(d => d.id);
            setExpandedCards(highRiskIds);
        }
    }, [data]);

    const toggleCard = (id) => {
        setExpandedCards(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCopy = () => {
        const exportData = rawResponse || data;
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleDownload = () => {
        const exportData = rawResponse || data;
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `niramay-pharmacogenomic-report-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getRiskStyles = (level) => {
        switch (level) {
            case 'HIGH':
                return {
                    border: 'border-rose-500/50',
                    bg: 'bg-rose-950/20 hover:bg-rose-900/30',
                    text: 'text-rose-400',
                    icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
                    shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
                    glow: {
                        boxShadow: ["0 0 0px rgba(244,63,94,0)", "0 0 20px rgba(244,63,94,0.2)", "0 0 0px rgba(244,63,94,0)"]
                    }
                };
            case 'MODERATE':
                return {
                    border: 'border-amber-500/40',
                    bg: 'bg-amber-950/20 hover:bg-amber-900/30',
                    text: 'text-amber-400',
                    icon: <Activity className="w-5 h-5 text-amber-500" />,
                    shadow: 'shadow-none',
                    glow: {}
                };
            case 'LOW':
                return {
                    border: 'border-emerald-500/30',
                    bg: 'bg-emerald-950/20 hover:bg-emerald-900/30',
                    text: 'text-emerald-400',
                    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
                    shadow: 'shadow-none',
                    glow: {}
                };
            default:
                return {};
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-widest text-slate-400 font-semibold">
                    Clinical Risk Assessment
                </h3>
                <button
                    onClick={() => setJsonOpen(!jsonOpen)}
                    className="flex items-center gap-2 text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                    <FileJson className="w-4 h-4" />
                    {jsonOpen ? 'Hide Source' : 'View Source'}
                </button>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {data.map((item, index) => {
                        const styles = getRiskStyles(item.riskLevel);
                        const isExpanded = expandedCards.includes(item.id);

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.4,
                                    ease: "easeOut"
                                }}
                                layout
                                className={`relative rounded-xl border ${styles.border} ${styles.bg} ${styles.shadow} backdrop-blur-sm overflow-hidden transition-colors duration-300`}
                            >
                                {/* High Risk Glow Animation */}
                                {item.riskLevel === 'HIGH' && (
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none rounded-xl"
                                        animate={styles.glow}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                )}

                                {/* Card Header */}
                                <div
                                    onClick={() => toggleCard(item.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer relative z-10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-slate-950/50 border border-white/5`}>
                                            {styles.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h4 className="text-slate-100 font-medium tracking-wide">
                                                    {item.gene}
                                                </h4>
                                                {item.drug && (
                                                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-slate-700 text-slate-400 font-mono bg-slate-950/50">
                                                        <FlaskConical className="w-2.5 h-2.5" />
                                                        {item.drug}
                                                    </span>
                                                )}
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${styles.border} ${styles.text} font-mono uppercase bg-slate-950/50`}>
                                                    {item.riskLevel}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 font-mono">
                                                {item.phenotype} · Variant: {item.variant}
                                            </p>
                                        </div>
                                    </div>

                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-slate-500"
                                    >
                                        <ChevronDown className="w-5 h-5" />
                                    </motion.div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="relative z-10 border-t border-white/5 bg-slate-950/30"
                                        >
                                            <div className="p-4 space-y-4 text-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Impact Analysis</span>
                                                        <p className="text-slate-300 leading-relaxed font-light">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Phenotype</span>
                                                            <p className="text-slate-300">{item.phenotype}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Clinical Action</span>
                                                            <p className={`text-xs ${styles.text} bg-slate-950/50 p-2 rounded border border-white/5 leading-relaxed`}>
                                                                {item.recommendation}
                                                            </p>
                                                        </div>
                                                        {item.dosingRecommendation && (
                                                            <div>
                                                                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Dosing Recommendation</span>
                                                                <p className="text-xs text-slate-300 bg-slate-950/50 p-2 rounded border border-white/5 leading-relaxed">
                                                                    {item.dosingRecommendation}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {item.alternativeDrugs && item.alternativeDrugs.length > 0 && (
                                                            <div>
                                                                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Alternative Drugs</span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {item.alternativeDrugs.map((alt, i) => (
                                                                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-400/80 bg-cyan-950/30">
                                                                            {alt}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {(item.confidence || item.guidelineSource) && (
                                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                {item.confidence && (
                                                                    <span className="text-[10px] font-mono text-slate-600 border border-slate-800 rounded px-2 py-0.5">
                                                                        Confidence: {(item.confidence * 100).toFixed(0)}%
                                                                    </span>
                                                                )}
                                                                {item.guidelineSource && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-600 border border-slate-800 rounded px-2 py-0.5">
                                                                        <BookOpen className="w-2.5 h-2.5" />
                                                                        {item.guidelineSource}
                                                                    </span>
                                                                )}
                                                                {item.citations && item.citations.map((c, i) => (
                                                                    <span key={i} className="text-[10px] font-mono text-cyan-700/60 border border-cyan-900/30 rounded px-2 py-0.5">
                                                                        {c}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* JSON Output Panel */}
            <AnimatePresence>
                {jsonOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-6 rounded-xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/10 bg-cyan-950/10">
                            <span className="text-xs font-mono text-cyan-500">JSON Output</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 hover:bg-cyan-500/10 rounded text-cyan-400 transition-colors flex items-center gap-1"
                                    title="Copy to Clipboard"
                                >
                                    <Copy className="w-4 h-4" />
                                    {copySuccess && <span className="text-[10px] text-emerald-400">Copied!</span>}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-1.5 hover:bg-cyan-500/10 rounded text-cyan-400 transition-colors"
                                    title="Download JSON"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 overflow-x-auto max-h-96">
                            <pre className="text-[10px] font-mono text-cyan-200/70 leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(rawResponse || data, null, 2)}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
