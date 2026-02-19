"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FlaskConical, FileCheck2, Dna, Play, RotateCcw,
    CheckCircle2, AlertTriangle, Activity, Clock,
    ChevronRight, HardDriveUpload, Pill, Loader2,
    AlertCircle, ServerCrash, BookOpen, Copy, Download,
    FileJson, ChevronDown, Zap, FileText as FileTextIcon,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DRUGS = [
    { id: 'warfarin', label: 'Warfarin', category: 'Anticoagulant' },
    { id: 'clopidogrel', label: 'Clopidogrel', category: 'Antiplatelet' },
    { id: 'simvastatin', label: 'Simvastatin', category: 'Statin' },
    { id: 'codeine', label: 'Codeine', category: 'Opioid' },
    { id: 'azathioprine', label: 'Azathioprine', category: 'Immunosuppressant' },
    { id: 'fluorouracil', label: 'Fluorouracil', category: 'Antineoplastic' },
    { id: 'tamoxifen', label: 'Tamoxifen', category: 'Antineoplastic' },
    { id: 'ondansetron', label: 'Ondansetron', category: 'Antiemetic' },
    { id: 'sertraline', label: 'Sertraline', category: 'Antidepressant' },
    { id: 'metoprolol', label: 'Metoprolol', category: 'Beta Blocker' },
];

const PIPELINE_STAGES = [
    { id: 'fetch', label: 'Fetching genomic sequence from vault…' },
    { id: 'parse', label: 'Parsing VCF variant call format data…' },
    { id: 'rules', label: 'Running CPIC neuro-symbolic rules engine…' },
    { id: 'ai', label: 'Generating LLM clinical explanations…' },
    { id: 'compile', label: 'Compiling pharmacogenomic report…' },
];

const SEVERITY_TO_RISK = { critical: 'HIGH', high: 'HIGH', moderate: 'MODERATE', low: 'LOW', none: 'LOW' };

function transformBackendData(backendResults) {
    if (!backendResults || !Array.isArray(backendResults)) return [];
    return backendResults.map((item, index) => {
        const profile = item.pharmacogenomic_profile;
        const risk = item.risk_assessment;
        const rec = item.clinical_recommendation;
        const explanation = item.llm_generated_explanation;
        const explanationText = explanation
            ? (typeof explanation === 'object' ? explanation.summary : explanation)
            : null;
        const citations = explanation?.citations || [];
        const riskLevel = SEVERITY_TO_RISK[risk?.severity] || 'LOW';
        return {
            id: String(index + 1),
            gene: profile?.primary_gene || item.drug,
            variant: profile?.diplotype || risk?.risk_label || 'N/A',
            riskLevel,
            phenotype: profile?.phenotype || risk?.risk_label || 'Unknown',
            drug: item.drug,
            description: explanationText || rec?.action || 'No additional clinical description available.',
            recommendation: rec?.action || 'Follow standard clinical protocols.',
            confidence: risk?.confidence_score,
            guidelineSource: rec?.guideline_source || 'CPIC',
            detectedVariants: profile?.detected_variants || [],
            citations,
        };
    });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBadge({ number, current, done }) {
    return (
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${done ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' :
                current ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]' :
                    'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : number}
        </div>
    );
}

function SectionHeader({ step, current, done, title, subtitle }) {
    return (
        <div className="flex items-center gap-4 mb-5">
            <StepBadge number={step} current={current} done={done} />
            <div>
                <h3 className={`text-sm font-semibold uppercase tracking-widest ${current ? 'text-cyan-200' : done ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}

function FileCard({ file, selected, onClick }) {
    const isProcessing = file.status === 'processing';
    const isDone = file.status === 'done';
    const date = new Date(file.created_at);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${selected
                    ? 'border-cyan-500/60 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/40'
                }`}
        >
            {selected && (
                <motion.div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    animate={{ boxShadow: ["0 0 0px rgba(6,182,212,0)", "0 0 18px rgba(6,182,212,0.18)", "0 0 0px rgba(6,182,212,0)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                />
            )}
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${selected ? 'bg-cyan-500/15 border border-cyan-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                    <FileCheck2 className={`w-4 h-4 ${selected ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${selected ? 'text-cyan-100' : 'text-slate-200'}`}>
                        {file.file_name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{dateStr} · {timeStr}</p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${isDone ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30' :
                        isProcessing ? 'border-amber-500/30 text-amber-400 bg-amber-950/20' :
                            'border-slate-600 text-slate-400 bg-slate-900'
                    }`}>
                    {file.status || 'uploaded'}
                </span>
            </div>
        </motion.button>
    );
}

function DrugChip({ drug, selected, onToggle }) {
    return (
        <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onToggle(drug.id)}
            className={`relative flex flex-col items-start px-4 py-3 rounded-xl border text-xs transition-all duration-200 ${selected
                    ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'border-slate-700/60 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
        >
            <span className="font-semibold tracking-wide">{drug.label}</span>
            <span className={`text-[10px] mt-0.5 ${selected ? 'text-cyan-400/70' : 'text-slate-600'}`}>
                {drug.category}
            </span>
            {selected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
            )}
        </motion.button>
    );
}

function PipelineProgress({ stage }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 gap-8 min-h-[340px]">
            {/* Rotating DNA */}
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    className="relative z-10"
                >
                    <Dna className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,0.6)]" strokeWidth={1} />
                </motion.div>
            </div>

            {/* Stage list */}
            <div className="w-full max-w-sm space-y-3">
                {PIPELINE_STAGES.map((s, i) => {
                    const isDone = i < stage;
                    const isCurrent = i === stage;
                    return (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: isDone || isCurrent ? 1 : 0.2, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3"
                        >
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-400' :
                                    isCurrent ? 'border-cyan-400 bg-cyan-950' :
                                        'border-slate-700 bg-slate-900'
                                }`}>
                                {isDone && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-emerald-100" />}
                                {isCurrent && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-cyan-300" />}
                            </div>
                            <span className={`text-xs font-mono ${isDone ? 'text-emerald-400' :
                                    isCurrent ? 'text-cyan-300' :
                                        'text-slate-600'
                                }`}>
                                {s.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-sm h-0.5 bg-slate-800 rounded overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 rounded shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                    animate={{ width: `${Math.round(((stage + 1) / PIPELINE_STAGES.length) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
}

function RiskSummaryBar({ results }) {
    const high = results.filter(r => r.riskLevel === 'HIGH').length;
    const moderate = results.filter(r => r.riskLevel === 'MODERATE').length;
    const low = results.filter(r => r.riskLevel === 'LOW').length;
    return (
        <div className="flex items-center gap-3 flex-wrap mb-6 p-4 rounded-xl border border-cyan-500/10 bg-cyan-950/10">
            <FlaskConical className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs font-mono text-slate-400 flex-1">
                {results.length} drug–gene interactions assessed
            </span>
            {high > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/30 text-rose-400">
                    <AlertTriangle className="w-3 h-3" /> {high} HIGH
                </span>
            )}
            {moderate > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-400">
                    <Activity className="w-3 h-3" /> {moderate} MODERATE
                </span>
            )}
            {low > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {low} LOW
                </span>
            )}
        </div>
    );
}

function RiskCard({ item, index }) {
    const [expanded, setExpanded] = useState(item.riskLevel === 'HIGH');

    const styles = {
        HIGH: { border: 'border-rose-500/50', bg: 'hover:bg-rose-900/20', text: 'text-rose-400', icon: <AlertTriangle className="w-5 h-5 text-rose-400" />, badge: 'border-rose-500/40 text-rose-400 bg-rose-950/30' },
        MODERATE: { border: 'border-amber-500/40', bg: 'hover:bg-amber-900/20', text: 'text-amber-400', icon: <Activity className="w-5 h-5 text-amber-400" />, badge: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
        LOW: { border: 'border-emerald-500/30', bg: 'hover:bg-emerald-900/20', text: 'text-emerald-400', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' },
    }[item.riskLevel] || {};

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
            layout
            className={`relative rounded-xl border ${styles.border} bg-slate-950/60 backdrop-blur-sm overflow-hidden transition-colors duration-300`}
        >
            {item.riskLevel === 'HIGH' && (
                <motion.div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    animate={{ boxShadow: ["0 0 0px rgba(244,63,94,0)", "0 0 22px rgba(244,63,94,0.18)", "0 0 0px rgba(244,63,94,0)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                />
            )}
            {/* Header */}
            <div
                onClick={() => setExpanded(e => !e)}
                className={`p-4 flex items-center justify-between cursor-pointer ${styles.bg} transition-colors`}
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5 flex-shrink-0">
                        {styles.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-100 font-semibold tracking-wide">{item.gene}</span>
                            {item.drug && (
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-slate-700 text-slate-400 font-mono bg-slate-950/50">
                                    <Pill className="w-2.5 h-2.5" /> {item.drug}
                                </span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase ${styles.badge}`}>
                                {item.riskLevel}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                            {item.phenotype} · Variant: {item.variant}
                        </p>
                    </div>
                </div>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-slate-500 flex-shrink-0">
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </div>

            {/* Expanded */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="border-t border-white/5 bg-slate-950/40"
                    >
                        <div className="p-5 space-y-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1.5">Impact Analysis</span>
                                    <p className="text-slate-300 leading-relaxed font-light text-xs">{item.description}</p>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1.5">Clinical Action</span>
                                        <p className={`text-xs ${styles.text} bg-slate-950/60 p-3 rounded-lg border border-white/5 leading-relaxed`}>
                                            {item.recommendation}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {item.confidence && (
                                            <span className="text-[10px] font-mono text-slate-500 border border-slate-800 rounded px-2 py-0.5">
                                                Confidence: {(item.confidence * 100).toFixed(0)}%
                                            </span>
                                        )}
                                        {item.guidelineSource && (
                                            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 border border-slate-800 rounded px-2 py-0.5">
                                                <BookOpen className="w-2.5 h-2.5" /> {item.guidelineSource}
                                            </span>
                                        )}
                                        {item.citations?.map((c, i) => (
                                            <span key={i} className="text-[10px] font-mono text-cyan-700/60 border border-cyan-900/30 rounded px-2 py-0.5">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function AnalysisLabView({ genomicFiles, onGoToUpload }) {
    // Step tracking: 'select' | 'drugs' | 'run' | 'analyzing' | 'done' | 'error'
    const [step, setStep] = useState('select');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDrugs, setSelectedDrugs] = useState(new Set());
    const [pipelineStage, setPipelineStage] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [jsonOpen, setJsonOpen] = useState(false);

    const toggleDrug = (id) => setSelectedDrugs(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const handleSelectAll = () => setSelectedDrugs(new Set(DEFAULT_DRUGS.map(d => d.id)));
    const handleClearDrugs = () => setSelectedDrugs(new Set());

    const handleRun = async () => {
        if (!selectedFile) return;
        setStep('analyzing');
        setError(null);
        setPipelineStage(0);

        // Generate signed URL for the selected file
        let vcfUrl = null;
        try {
            // Import client-side supabase
            const { createClient } = await import('@/lib/supabaseClient');
            const supabase = createClient();
            const { data, error: urlErr } = await supabase.storage
                .from('vcf_uploads')
                .createSignedUrl(selectedFile.file_path, 3600);
            if (urlErr || !data?.signedUrl) throw new Error('Could not generate signed URL for your VCF file.');
            vcfUrl = data.signedUrl;
        } catch (err) {
            setError(err.message);
            setIsOffline(false);
            setStep('error');
            return;
        }

        // Animate pipeline stages
        const stageTimer = setInterval(() => {
            setPipelineStage(prev => {
                if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
                clearInterval(stageTimer);
                return prev;
            });
        }, 950);

        try {
            const drugsToSend = selectedDrugs.size > 0
                ? DEFAULT_DRUGS.filter(d => selectedDrugs.has(d.id)).map(d => d.label)
                : [];

            const resp = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vcf_url: vcfUrl, drugs: drugsToSend }),
            });

            clearInterval(stageTimer);
            setPipelineStage(PIPELINE_STAGES.length);

            const data = await resp.json();
            if (!resp.ok) {
                setIsOffline(data.offline === true);
                throw new Error(data.error || data.detail || 'Backend returned an error.');
            }

            const transformed = transformBackendData(data.results);
            setResults(transformed);
            setStep('done');
        } catch (err) {
            clearInterval(stageTimer);
            setError(err.message);
            setIsOffline(err.message?.includes('fetch') || err.message?.includes('network'));
            setStep('error');
        }
    };

    const handleReset = () => {
        setStep('select');
        setSelectedFile(null);
        setSelectedDrugs(new Set());
        setResults(null);
        setError(null);
        setIsOffline(false);
        setJsonOpen(false);
        setPipelineStage(0);
    };

    const handleCopyJson = () => navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    const handleDownloadJson = () => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'pharmacogenomic-report.json'; a.click();
        URL.revokeObjectURL(url);
    };

    const isAnalyzing = step === 'analyzing';
    const isDone = step === 'done';
    const isError = step === 'error';
    const isSetup = !isAnalyzing && !isDone && !isError;

    return (
        <div className="space-y-8">

            {/* ── Page title ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                        <FlaskConical className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest text-slate-100 uppercase">Analysis Lab</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Pharmacogenomic risk assessment engine</p>
                    </div>
                </div>
                {(isDone || isError) && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 text-xs uppercase tracking-widest transition-all"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> New Analysis
                    </button>
                )}
            </div>

            {/* ── SETUP FLOW ── */}
            <AnimatePresence mode="wait">
                {isSetup && (
                    <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
                    >
                        {/* Step 1 — File */}
                        <div className="xl:col-span-1 p-6 rounded-xl border border-cyan-500/10 bg-slate-950/40 backdrop-blur space-y-4">
                            <SectionHeader step={1} current={!selectedFile} done={!!selectedFile}
                                title="Select VCF File" subtitle="Choose from your uploaded genomic sequences" />

                            {genomicFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                                    <div className="p-4 rounded-full bg-slate-800 border border-slate-700">
                                        <HardDriveUpload className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <p className="text-xs text-slate-500">No VCF files uploaded yet.</p>
                                    {onGoToUpload && (
                                        <button onClick={onGoToUpload}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">
                                            Upload a file first →
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                    {genomicFiles.map(f => (
                                        <FileCard key={f.id} file={f} selected={selectedFile?.id === f.id} onClick={() => setSelectedFile(f)} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 2 — Drugs */}
                        <div className="xl:col-span-2 p-6 rounded-xl border border-cyan-500/10 bg-slate-950/40 backdrop-blur space-y-4">
                            <div className="flex items-start justify-between">
                                <SectionHeader step={2} current={!!selectedFile} done={false}
                                    title="Drug Panel" subtitle="Select drugs to screen — leave empty for all defaults" />
                                <div className="flex gap-2 mt-0.5">
                                    <button onClick={handleSelectAll}
                                        className="text-[10px] text-cyan-500 hover:text-cyan-300 uppercase tracking-widest px-2 py-1 border border-cyan-500/20 rounded hover:border-cyan-500/40 transition-all">
                                        All
                                    </button>
                                    <button onClick={handleClearDrugs}
                                        className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest px-2 py-1 border border-slate-700 rounded hover:border-slate-600 transition-all">
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5">
                                {DEFAULT_DRUGS.map(drug => (
                                    <DrugChip key={drug.id} drug={drug} selected={selectedDrugs.has(drug.id)} onToggle={toggleDrug} />
                                ))}
                            </div>

                            {/* Run button */}
                            <div className="pt-4 border-t border-cyan-500/10">
                                <SectionHeader step={3} current={!!selectedFile} done={false}
                                    title="Launch Analysis" subtitle="Dispatches to the AI pharmacogenomics engine" />
                                <motion.button
                                    whileHover={selectedFile ? { scale: 1.015 } : {}}
                                    whileTap={selectedFile ? { scale: 0.985 } : {}}
                                    onClick={handleRun}
                                    disabled={!selectedFile}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-sm uppercase tracking-widest transition-all duration-300 ${selectedFile
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-200 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                                            : 'bg-slate-900/50 border border-slate-700 text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    {selectedFile ? (
                                        <>
                                            <Play className="w-4 h-4 fill-current" />
                                            Run Pharmacogenomic Analysis
                                            <ChevronRight className="w-4 h-4 opacity-60" />
                                        </>
                                    ) : (
                                        <>
                                            <FileTextIcon className="w-4 h-4" />
                                            Select a file to continue
                                        </>
                                    )}
                                </motion.button>
                                {selectedFile && (
                                    <p className="text-center text-[10px] text-slate-600 font-mono mt-2">
                                        {selectedFile.file_name} · {selectedDrugs.size > 0 ? `${selectedDrugs.size} drugs selected` : 'all default drugs'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── PIPELINE ANIMATION ── */}
                {isAnalyzing && (
                    <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-xl border border-cyan-500/15 bg-slate-950/40 backdrop-blur"
                    >
                        <div className="px-6 py-4 border-b border-cyan-500/10 bg-cyan-950/10 flex items-center gap-3">
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                            <span className="text-xs font-mono text-cyan-300 uppercase tracking-widest">AI Engine Processing</span>
                            <span className="ml-auto text-[10px] font-mono text-slate-500 truncate max-w-xs">{selectedFile?.file_name}</span>
                        </div>
                        <div className="px-8">
                            <PipelineProgress stage={pipelineStage} />
                        </div>
                    </motion.div>
                )}

                {/* ── ERROR ── */}
                {isError && (
                    <motion.div key="error" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center gap-5 py-16 text-center rounded-xl border border-rose-500/20 bg-rose-950/10"
                    >
                        <div className="p-4 rounded-full bg-rose-950/30 border border-rose-500/20">
                            {isOffline
                                ? <ServerCrash className="w-8 h-8 text-rose-400" strokeWidth={1.5} />
                                : <AlertCircle className="w-8 h-8 text-rose-400" strokeWidth={1.5} />}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-rose-300 uppercase tracking-widest mb-2">
                                {isOffline ? 'AI Engine Offline' : 'Analysis Failed'}
                            </h4>
                            <p className="text-xs text-rose-400/80 max-w-sm leading-relaxed font-mono">
                                {isOffline
                                    ? 'Python inference engine not reachable. Ensure the backend service is running on port 8000.'
                                    : error || 'An unknown error occurred.'}
                            </p>
                        </div>
                        <button onClick={handleReset}
                            className="px-5 py-2 rounded-lg text-xs uppercase tracking-widest font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/40 hover:border-cyan-500/60 transition-all">
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* ── RESULTS ── */}
                {isDone && results && (
                    <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary bar */}
                        <RiskSummaryBar results={results} />

                        {/* Action bar */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Clinical Risk Results
                            </h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setJsonOpen(o => !o)}
                                    className="flex items-center gap-1.5 text-[10px] text-cyan-500 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 rounded px-2.5 py-1.5 transition-all">
                                    <FileJson className="w-3.5 h-3.5" />
                                    {jsonOpen ? 'Hide Source' : 'View JSON'}
                                </button>
                                <button onClick={handleCopyJson}
                                    className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded px-2.5 py-1.5 transition-all">
                                    <Copy className="w-3.5 h-3.5" /> Copy
                                </button>
                                <button onClick={handleDownloadJson}
                                    className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded px-2.5 py-1.5 transition-all">
                                    <Download className="w-3.5 h-3.5" /> Export
                                </button>
                            </div>
                        </div>

                        {/* Risk cards */}
                        <div className="space-y-3">
                            {results.map((item, i) => <RiskCard key={item.id} item={item} index={i} />)}
                        </div>

                        {/* JSON panel */}
                        <AnimatePresence>
                            {jsonOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                                    className="rounded-xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/10 bg-cyan-950/10">
                                        <span className="text-xs font-mono text-cyan-400">JSON Output</span>
                                        <div className="flex gap-2">
                                            <button onClick={handleCopyJson} className="p-1.5 hover:bg-cyan-500/10 rounded text-cyan-400 transition-colors" title="Copy">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleDownloadJson} className="p-1.5 hover:bg-cyan-500/10 rounded text-cyan-400 transition-colors" title="Download">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                                        <pre className="text-[10px] font-mono text-cyan-200/70 leading-relaxed">
                                            {JSON.stringify(results, null, 2)}
                                        </pre>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
