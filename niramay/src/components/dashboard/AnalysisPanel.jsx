"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Loader2, ServerCrash, AlertCircle, FlaskConical, Pill } from 'lucide-react';
import RiskResults from '@/components/dashboard/RiskResults';

// ─── Supported drugs ─────────────────────────────────────────────────────────
const SUPPORTED_DRUGS = ['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL'];

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
            dosingRecommendation: rec?.dosing_recommendation || '',
            alternativeDrugs: rec?.alternative_drugs || [],
            confidence: risk?.confidence_score,
            guidelineSource: rec?.guideline_source || 'CPIC',
            detectedVariants: profile?.detected_variants || [],
            citations,
            modelUsed,
        };
    });
}

// ─── Drug Selector ────────────────────────────────────────────────────────────
function DrugSelector({ selectedDrugs, onToggle, customDrug, onCustomChange }) {
    return (
        <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Pill style={{ width: 15, height: 15, color: '#0077b6' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#023e8a' }}>
                    Select Drugs to Analyse
                </span>
            </div>

            {/* Drug pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {SUPPORTED_DRUGS.map(drug => {
                    const isSelected = selectedDrugs.includes(drug);
                    return (
                        <button
                            key={drug}
                            onClick={() => onToggle(drug)}
                            style={{
                                padding: '7px 16px',
                                borderRadius: 999,
                                fontSize: 11, fontWeight: 600,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                                border: isSelected ? 'none' : '1.5px solid rgba(0,119,182,0.25)',
                                background: isSelected
                                    ? 'linear-gradient(135deg, #0096c7, #0077b6)'
                                    : 'rgba(240,249,255,0.8)',
                                color: isSelected ? '#ffffff' : '#0096c7',
                                boxShadow: isSelected ? '0 2px 12px rgba(0,119,182,0.25)' : 'none',
                            }}
                        >
                            {isSelected && <span style={{ marginRight: 4 }}>✓</span>}
                            {drug}
                        </button>
                    );
                })}
            </div>

            {/* Custom drug input */}
            <input
                type="text"
                placeholder="Or type custom drugs (comma-separated)..."
                value={customDrug}
                onChange={(e) => onCustomChange(e.target.value)}
                style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: 10, fontSize: 12,
                    border: '1.5px solid rgba(0,119,182,0.18)',
                    background: 'rgba(240,249,255,0.8)',
                    color: '#03045e', outline: 'none',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,119,182,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,119,182,0.18)'; }}
            />
            <p style={{ fontSize: 10, color: '#90e0ef', marginTop: 6, fontFamily: 'monospace' }}>
                {selectedDrugs.length === 0
                    ? 'No drugs selected — all 6 will be analysed by default'
                    : `${selectedDrugs.length} drug(s) selected`}
            </p>
        </div>
    );
}

// ─── Pipeline stages ──────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
    { id: 'fetch', label: 'Fetching genomic sequence from vault...' },
    { id: 'parse', label: 'Parsing variant call format data...' },
    { id: 'rules', label: 'Running CPIC neuro-symbolic rules engine...' },
    { id: 'ai', label: 'Generating LLM clinical explanations...' },
    { id: 'compile', label: 'Compiling pharmacogenomic report...' },
];

function AnalysisLoadingState({ stage }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 32, minHeight: 260 }}>
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,119,182,0.15)',
                    filter: 'blur(24px)', borderRadius: '50%',
                }} />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'relative', zIndex: 10 }}
                >
                    <Dna
                        strokeWidth={1}
                        style={{ width: 48, height: 48, color: '#0077b6', filter: 'drop-shadow(0 0 10px rgba(0,119,182,0.4))' }}
                    />
                </motion.div>
            </div>

            <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PIPELINE_STAGES.map((s, i) => {
                    const isDone = i < stage;
                    const isCurrent = i === stage;
                    return (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: isDone || isCurrent ? 1 : 0.2, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                        >
                            <div style={{
                                flexShrink: 0, width: 16, height: 16, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: isDone ? 'none' : isCurrent ? '1.5px solid #0077b6' : '1.5px solid rgba(0,119,182,0.2)',
                                background: isDone ? '#0077b6' : isCurrent ? 'rgba(0,119,182,0.08)' : '#f0f9ff',
                                transition: 'all 0.3s',
                            }}>
                                {isDone && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff' }} />
                                )}
                                {isCurrent && (
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#0077b6' }}
                                    />
                                )}
                            </div>
                            <span style={{
                                fontSize: 12, fontFamily: 'monospace',
                                color: isDone ? '#0077b6' : isCurrent ? '#023e8a' : '#90e0ef',
                                transition: 'color 0.3s',
                            }}>
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
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 20, textAlign: 'center', minHeight: 260 }}
        >
            <div style={{ padding: 16, borderRadius: '50%', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                {isOffline
                    ? <ServerCrash strokeWidth={1.5} style={{ width: 32, height: 32, color: '#ef4444' }} />
                    : <AlertCircle strokeWidth={1.5} style={{ width: 32, height: 32, color: '#ef4444' }} />
                }
            </div>
            <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                    {isOffline ? 'AI Engine Offline' : 'Analysis Failed'}
                </h4>
                <p style={{ fontSize: 12, color: '#f87171', maxWidth: 320, lineHeight: 1.7, fontFamily: 'monospace' }}>
                    {isOffline
                        ? 'The Python inference engine is not reachable. Ensure the backend service is running on port 8000.'
                        : message || 'An unknown error occurred during analysis.'}
                </p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        padding: '8px 20px', borderRadius: 999, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                        color: '#0077b6', border: '1.5px solid rgba(0,119,182,0.3)',
                        background: 'transparent', cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0077b6'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0077b6'; }}
                >
                    Retry Analysis
                </button>
            )}
        </motion.div>
    );
}

// ─── Main Analysis Panel ──────────────────────────────────────────────────────
export default function AnalysisPanel({ vcfUrl, drugs: initialDrugs, onReset }) {
    const [status, setStatus] = useState('idle'); // idle | selecting | analyzing | done | error
    const [pipelineStage, setPipelineStage] = useState(0);
    const [results, setResults] = useState(null);
    const [rawResponse, setRawResponse] = useState(null);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);

    const [selectedDrugs, setSelectedDrugs] = useState(SUPPORTED_DRUGS);
    const [customDrug, setCustomDrug] = useState('');

    useEffect(() => {
        if (vcfUrl) setStatus('selecting');
    }, [vcfUrl]);

    const handleToggleDrug = (drug) => {
        setSelectedDrugs(prev =>
            prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
        );
    };

    const getEffectiveDrugs = () => {
        let drugs = [...selectedDrugs];
        if (customDrug.trim()) {
            const custom = customDrug.split(',').map(d => d.trim().toUpperCase()).filter(Boolean);
            drugs = [...drugs, ...custom];
        }
        return drugs.length > 0 ? drugs : SUPPORTED_DRUGS;
    };

    const runAnalysis = async () => {
        setStatus('analyzing');
        setError(null);
        setPipelineStage(0);

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
                    drugs: getEffectiveDrugs(),
                }),
            });

            clearInterval(stageTimer);
            setPipelineStage(PIPELINE_STAGES.length);

            const data = await response.json();

            if (!response.ok) {
                setIsOffline(data.offline === true);
                throw new Error(data.error || data.detail || 'Backend returned an error.');
            }

            setRawResponse(data);
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

    const handleRetry = () => runAnalysis();

    return (
        <div style={{ width: '100%' }}>
            <AnimatePresence mode="wait">

                {status === 'selecting' && (
                    <motion.div
                        key="selecting"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                        <DrugSelector
                            selectedDrugs={selectedDrugs}
                            onToggle={handleToggleDrug}
                            customDrug={customDrug}
                            onCustomChange={setCustomDrug}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={runAnalysis}
                                style={{
                                    padding: '12px 32px', borderRadius: 999, fontSize: 12,
                                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                                    color: '#ffffff', border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #0096c7, #0077b6)',
                                    boxShadow: '0 4px 20px rgba(0,119,182,0.35)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,119,182,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,119,182,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                ▶ Run Analysis
                            </button>
                        </div>
                    </motion.div>
                )}

                {status === 'analyzing' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AnalysisLoadingState stage={pipelineStage} />
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AnalysisErrorState message={error} isOffline={isOffline} onRetry={handleRetry} />
                    </motion.div>
                )}

                {status === 'done' && results && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    >
                        {/* Results header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            marginBottom: 20, paddingBottom: 16,
                            borderBottom: '1px solid rgba(0,119,182,0.1)',
                        }}>
                            <FlaskConical style={{ width: 15, height: 15, color: '#0077b6' }} />
                            <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#0096c7', flex: 1 }}>
                                Analysis complete — {results.length} drug-gene interaction{results.length !== 1 ? 's' : ''} assessed
                            </p>
                            <button
                                onClick={onReset}
                                style={{
                                    fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
                                    fontWeight: 600, color: '#90a0b0',
                                    border: '1px solid rgba(0,119,182,0.15)',
                                    borderRadius: 6, padding: '4px 10px',
                                    background: 'transparent', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#0077b6'; e.currentTarget.style.borderColor = 'rgba(0,119,182,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#90a0b0'; e.currentTarget.style.borderColor = 'rgba(0,119,182,0.15)'; }}
                            >
                                New Scan
                            </button>
                        </div>

                        <RiskResults data={results} rawResponse={rawResponse} />
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
