"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Loader2, ServerCrash, AlertCircle, FlaskConical } from 'lucide-react';
import RiskResults from '@/components/dashboard/RiskResults';

// ─── Severity → Risk Level mapping from the backend ─────────────────────────
const SEVERITY_TO_RISK = {
    critical: 'HIGH',
    high: 'HIGH',
    moderate: 'MODERATE',
    low: 'LOW',
    none: 'LOW',
};

// ─── Transform backend results to format expected by RiskResults ─────────────
function transformBackendData(backendResults) {
    if (!backendResults || !Array.isArray(backendResults)) return [];

    return backendResults.map((item, index) => {
        const profile = item.pharmacogenomic_profile;
        const risk = item.risk_assessment;
        const rec = item.clinical_recommendation;
        // explanation is an object: { summary, citations, rag_source, model_used }
        // OR a string fallback. Handle both safely.
        const explanation = item.llm_generated_explanation;
        const explanationText = explanation
            ? (typeof explanation === 'object' ? explanation.summary : explanation)
            : null;
        const citations = explanation?.citations || [];
        const modelUsed = explanation?.model_used;

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
            modelUsed,
        };
    });
}

// ─── Status stages for the visual pipeline ───────────────────────────────────
const PIPELINE_STAGES = [
    { id: 'fetch', label: 'Fetching genomic sequence from vault...' },
    { id: 'parse', label: 'Parsing variant call format data...' },
    { id: 'rules', label: 'Running CPIC neuro-symbolic rules engine...' },
    { id: 'ai', label: 'Generating LLM clinical explanations...' },
    { id: 'compile', label: 'Compiling pharmacogenomic report...' },
];

function AnalysisLoadingState({ stage }) {
    return (
        <div className="flex flex-col items-center justify-center p-10 min-h-[300px] w-full gap-6">
            {/* Animated DNA Spinner with glow */}
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="relative z-10"
                >
                    <Dna className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]" strokeWidth={1} />
                </motion.div>
            </div>

            {/* Pipeline progress */}
            <div className="w-full max-w-sm space-y-3">
                {PIPELINE_STAGES.map((s, i) => {
                    const isDone = i < stage;
                    const isCurrent = i === stage;
                    return (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: isDone || isCurrent ? 1 : 0.25, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-center gap-3"
                        >
                            <div className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isDone
                                ? 'bg-emerald-500 border-emerald-400'
                                : isCurrent
                                    ? 'border-cyan-400 bg-cyan-950'
                                    : 'border-slate-700 bg-slate-900'
                                }`}>
                                {isDone && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-1.5 h-1.5 rounded-full bg-emerald-200"
                                    />
                                )}
                                {isCurrent && (
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        className="w-1.5 h-1.5 rounded-full bg-cyan-300"
                                    />
                                )}
                            </div>
                            <span className={`text-xs font-mono transition-colors ${isDone ? 'text-emerald-400' : isCurrent ? 'text-cyan-300' : 'text-slate-600'
                                }`}>
                                {s.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function AnalysisErrorState({ message, isOffline, onRetry }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-10 min-h-[300px] gap-5 text-center"
        >
            <div className="p-4 rounded-full bg-rose-950/30 border border-rose-500/20">
                {isOffline ? (
                    <ServerCrash className="w-8 h-8 text-rose-400" strokeWidth={1.5} />
                ) : (
                    <AlertCircle className="w-8 h-8 text-rose-400" strokeWidth={1.5} />
                )}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-rose-300 uppercase tracking-widest mb-2">
                    {isOffline ? 'AI Engine Offline' : 'Analysis Failed'}
                </h4>
                <p className="text-xs text-rose-400/80 max-w-xs leading-relaxed font-mono">
                    {isOffline
                        ? 'The Python inference engine is not reachable. Ensure the backend service is running on port 8000.'
                        : message || 'An unknown error occurred during analysis.'}
                </p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-5 py-2 rounded-lg text-xs uppercase tracking-widest font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/40 hover:border-cyan-500/60 transition-all"
                >
                    Retry Analysis
                </button>
            )}
        </motion.div>
    );
}

// ─── Main Analysis Panel Component ───────────────────────────────────────────
export default function AnalysisPanel({ vcfUrl, drugs, onReset }) {
    const [status, setStatus] = useState('idle'); // idle | analyzing | done | error
    const [pipelineStage, setPipelineStage] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        if (vcfUrl) {
            runAnalysis();
        }
    }, [vcfUrl]);

    const runAnalysis = async () => {
        setStatus('analyzing');
        setError(null);
        setPipelineStage(0);

        // Simulate pipeline stage progression for UX
        const stageTimer = setInterval(() => {
            setPipelineStage(prev => {
                if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
                clearInterval(stageTimer);
                return prev;
            });
        }, 900);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vcf_url: vcfUrl,
                    drugs: drugs || [],
                }),
            });

            clearInterval(stageTimer);
            setPipelineStage(PIPELINE_STAGES.length); // Mark all as done visually

            const data = await response.json();

            if (!response.ok) {
                setIsOffline(data.offline === true);
                throw new Error(data.error || data.detail || 'Backend returned an error.');
            }

            // Transform the backend results to the RiskResults format
            const transformed = transformBackendData(data.results);
            setResults(transformed);
            setStatus('done');

        } catch (err) {
            clearInterval(stageTimer);
            console.error('Analysis error:', err);
            setError(err.message);
            setIsOffline(err.message?.includes('fetch') || err.message?.includes('network'));
            setStatus('error');
        }
    };

    const handleRetry = () => {
        runAnalysis();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {status === 'analyzing' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <AnalysisLoadingState stage={pipelineStage} />
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <AnalysisErrorState
                            message={error}
                            isOffline={isOffline}
                            onRetry={handleRetry}
                        />
                    </motion.div>
                )}

                {status === 'done' && results && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Report header */}
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-cyan-500/10">
                            <FlaskConical className="w-4 h-4 text-cyan-400" />
                            <p className="text-xs font-mono text-cyan-300/70 flex-1">
                                Analysis complete — {results.length} drug-gene interactions assessed
                            </p>
                            <button
                                onClick={onReset}
                                className="text-[10px] text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors border border-slate-800 hover:border-cyan-500/30 rounded px-2 py-1"
                            >
                                New Scan
                            </button>
                        </div>

                        <RiskResults data={results} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
