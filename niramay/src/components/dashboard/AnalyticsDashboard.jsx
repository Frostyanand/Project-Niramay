"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Activity } from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    Legend
} from 'recharts';

/* ── Ocean-blue palette (matches app) ─────────────────────────────────────── */
const COLORS = {
    Safe: '#10B981',
    Adjust: '#F59E0B',
    Toxic: '#EF4444',
    Accent: '#0077b6',
};

export default function AnalyticsDashboard({ isUnlocked, reportData = [] }) {
    const [showVisuals, setShowVisuals] = useState(isUnlocked);

    const derivedData = useMemo(() => {
        if (!reportData || reportData.length === 0) {
            return {
                confidence: 0,
                riskDistribution: [
                    { name: 'Safe', value: 0, color: COLORS.Safe },
                    { name: 'Adjust Dosage', value: 0, color: COLORS.Adjust },
                    { name: 'Toxic', value: 0, color: COLORS.Toxic }
                ],
                drugRisk: [],
                geneInvolvement: [],
                timeline: ['VCF Validation', 'Variant Parsing', 'Rule Engine', 'Risk Classification', 'JSON Output']
            };
        }

        let sumConf = 0, cCount = 0;
        let safeCount = 0, adjustCount = 0, toxicCount = 0;
        const drugMap = [];
        const geneMap = {};

        reportData.forEach(item => {
            if (item.confidence) { sumConf += item.confidence; cCount++; }
            let numLevel = 1;
            if (item.riskLevel === 'HIGH') { toxicCount++; numLevel = 3; }
            else if (item.riskLevel === 'MODERATE') { adjustCount++; numLevel = 2; }
            else { safeCount++; numLevel = 1; }

            if (item.drug) {
                drugMap.push({
                    name: item.drug,
                    RiskLevel: numLevel,
                    color: numLevel === 3 ? COLORS.Toxic : numLevel === 2 ? COLORS.Adjust : COLORS.Safe
                });
            }
            if (item.gene) {
                if (!geneMap[item.gene]) geneMap[item.gene] = { name: item.gene, "High Risk": 0, "Moderate Risk": 0, "Low Risk": 0 };
                if (item.riskLevel === 'HIGH') geneMap[item.gene]["High Risk"]++;
                else if (item.riskLevel === 'MODERATE') geneMap[item.gene]["Moderate Risk"]++;
                else geneMap[item.gene]["Low Risk"]++;
            }
        });

        const confidence = cCount > 0 ? (sumConf / cCount).toFixed(2) : 0.85;

        return {
            confidence,
            riskDistribution: [
                { name: 'Safe', value: safeCount, color: COLORS.Safe },
                { name: 'Adjust Dosage', value: adjustCount, color: COLORS.Adjust },
                { name: 'Toxic', value: toxicCount, color: COLORS.Toxic }
            ],
            drugRisk: drugMap,
            geneInvolvement: Object.values(geneMap),
            timeline: ['VCF Validation', 'Variant Parsing', 'Rule Engine', 'Risk Classification', 'JSON Output']
        };
    }, [reportData]);

    const handleAnalyze = () => setShowVisuals(true);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

    /* ── Shared card style ────────────────────────────────────────────────── */
    const cardStyle = {
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0,119,182,0.12)',
        boxShadow: '0 4px 24px rgba(0,119,182,0.06)',
        borderRadius: 16,
        padding: 24,
    };

    const tooltipStyle = {
        backgroundColor: '#ffffff',
        borderColor: 'rgba(0,119,182,0.15)',
        color: '#03045e',
        fontSize: '11px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,119,182,0.08)',
    };

    return (
        <div
            className="w-full rounded-2xl overflow-hidden mt-6 mb-4"
            style={{
                background: 'rgba(240,249,255,0.6)',
                border: '1px solid rgba(0,119,182,0.1)',
                boxShadow: '0 4px 32px rgba(0,119,182,0.06)',
            }}
        >
            {/* Header */}
            <div
                className="px-8 py-5 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(0,119,182,0.08)', background: 'rgba(255,255,255,0.6)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(0,119,182,0.08)', border: '1px solid rgba(0,119,182,0.15)' }}
                    >
                        <BarChart3 className="w-5 h-5" style={{ color: '#0077b6' }} />
                    </div>
                    <div>
                        <h2
                            className="text-sm font-bold tracking-widest uppercase"
                            style={{ color: '#03045e' }}
                        >
                            Analytics Dashboard
                        </h2>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: '#90e0ef' }}>
                            Pharmacogenomic Visualization Subsystem
                        </p>
                    </div>
                </div>
                {showVisuals && (
                    <span
                        className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded"
                        style={{
                            color: '#0077b6',
                            background: 'rgba(0,119,182,0.06)',
                            border: '1px solid rgba(0,119,182,0.15)',
                        }}
                    >
                        Live
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="relative min-h-[460px] p-8 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {/* LOCKED */}
                    {!isUnlocked && !showVisuals && (
                        <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center"
                            style={{ color: '#90e0ef' }}
                        >
                            <div
                                className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6"
                                style={{ background: 'rgba(0,119,182,0.06)', border: '1px solid rgba(0,119,182,0.12)' }}
                            >
                                <BarChart3 className="w-8 h-8 opacity-40" style={{ color: '#0096c7' }} />
                            </div>
                            <p className="text-sm font-medium tracking-wide" style={{ color: '#90e0ef' }}>
                                Generate analysis to unlock insights.
                            </p>
                        </motion.div>
                    )}

                    {/* UNLOCKED — show "Analyze Insights" button */}
                    {isUnlocked && !showVisuals && (
                        <motion.div key="unlocked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6"
                        >
                            <div style={{ ...cardStyle, maxWidth: 360, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,119,182,0.08)' }} />
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto relative z-10"
                                    style={{ background: 'rgba(0,119,182,0.08)', border: '1px solid rgba(0,119,182,0.15)' }}
                                >
                                    <BarChart3 className="w-7 h-7" style={{ color: '#0077b6' }} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 relative z-10" style={{ color: '#03045e' }}>📊 Genomic Analytics Ready</h3>
                                <p className="text-xs mb-8 leading-relaxed relative z-10 font-light" style={{ color: '#0096c7' }}>
                                    JSON successfully generated and validated. The payload is primed for visual rendering.
                                </p>
                                <button
                                    onClick={handleAnalyze}
                                    className="relative w-full py-4 rounded-xl font-semibold text-sm tracking-wide text-white outline-none"
                                    style={{
                                        background: 'linear-gradient(135deg, #0096c7, #0077b6)',
                                        boxShadow: '0 4px 20px rgba(0,119,182,0.3)',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Analyze Insights
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* VISUALS */}
                    {showVisuals && (
                        <motion.div key="visual" variants={containerVariants} initial="hidden" animate="show" className="w-full flex justify-center">
                            <div className="w-full max-w-5xl flex flex-col gap-6">

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Risk Distribution Pie + Confidence */}
                                    <motion.div variants={itemVariants} className="lg:col-span-1" style={cardStyle}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#023e8a' }}>Risk Distribution</h4>
                                            <div className="flex items-center gap-2" title="System Confidence">
                                                <svg width="24" height="24" viewBox="0 0 36 36" className="transform -rotate-90">
                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,119,182,0.15)" strokeWidth="4" />
                                                    <motion.path
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none" stroke="#0077b6" strokeWidth="4" strokeLinecap="round"
                                                        initial={{ strokeDasharray: "0, 100" }}
                                                        animate={{ strokeDasharray: `${derivedData.confidence * 100}, 100` }}
                                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                                    />
                                                </svg>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-mono font-bold leading-none" style={{ color: '#0077b6' }}>{derivedData.confidence}</span>
                                                    <span className="text-[8px] uppercase font-bold leading-none mt-0.5" style={{ color: '#90e0ef' }}>Conf.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex justify-center items-center h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={derivedData.riskDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} stroke="none">
                                                        {derivedData.riskDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip contentStyle={tooltipStyle} itemStyle={{ color: '#03045e' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <p className="text-xs leading-relaxed text-center mt-4 px-2 font-light" style={{ color: '#90a0b0' }}>
                                            Risk categories across analyzed drug–gene interactions.
                                        </p>
                                    </motion.div>

                                    {/* Drug-wise Risk Bar Chart */}
                                    <motion.div variants={itemVariants} className="lg:col-span-2" style={cardStyle}>
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 pb-3" style={{ color: '#023e8a', borderBottom: '1px solid rgba(0,119,182,0.08)' }}>Drug-wise Risk Severity</h4>
                                        <div className="h-[220px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart layout="vertical" data={derivedData.drugRisk} margin={{ top: 0, right: 30, left: 45, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,119,182,0.08)" />
                                                    <XAxis type="number" domain={[0, 3]} ticks={[0, 1, 2, 3]}
                                                        tickFormatter={v => v === 1 ? 'Safe' : v === 2 ? 'Adjust' : v === 3 ? 'Toxic' : ''}
                                                        stroke="#90a0b0" fontSize={10} axisLine={false} tickLine={false}
                                                    />
                                                    <YAxis type="category" dataKey="name" stroke="#03045e" fontSize={11} axisLine={false} tickLine={false} width={75} />
                                                    <RechartsTooltip
                                                        cursor={{ fill: 'rgba(0,119,182,0.04)' }}
                                                        contentStyle={tooltipStyle}
                                                        formatter={(value) => [value === 1 ? 'Safe' : value === 2 ? 'Adjust Dosage' : 'Toxic', 'Severity']}
                                                    />
                                                    <Bar dataKey="RiskLevel" radius={[0, 4, 4, 0]} barSize={22}>
                                                        {derivedData.drugRisk.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Gene Involvement Map */}
                                <motion.div variants={itemVariants} className="w-full" style={cardStyle}>
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 pb-3" style={{ color: '#023e8a', borderBottom: '1px solid rgba(0,119,182,0.08)' }}>Gene Involvement Map</h4>
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={derivedData.geneInvolvement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,119,182,0.08)" />
                                                <XAxis dataKey="name" stroke="#03045e" fontSize={11} axisLine={false} tickLine={false} dy={8} />
                                                <YAxis stroke="#90a0b0" fontSize={10} axisLine={false} tickLine={false} />
                                                <RechartsTooltip cursor={{ fill: 'rgba(0,119,182,0.04)' }} contentStyle={tooltipStyle} />
                                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: '#03045e' }} iconType="circle" />
                                                <Bar dataKey="High Risk" stackId="a" fill="#EF4444" fillOpacity={0.85} radius={[0, 0, 0, 0]} barSize={38} />
                                                <Bar dataKey="Moderate Risk" stackId="a" fill="#F59E0B" fillOpacity={0.85} radius={[0, 0, 0, 0]} />
                                                <Bar dataKey="Low Risk" stackId="a" fill="#10B981" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>

                                {/* Analysis Pipeline Timeline */}
                                <motion.div variants={itemVariants} className="w-full overflow-x-auto" style={cardStyle}>
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 pb-3" style={{ color: '#023e8a', borderBottom: '1px solid rgba(0,119,182,0.08)' }}>Analysis Pipeline Trajectory</h4>
                                    <div className="flex items-center justify-between min-w-[700px] px-4 pt-2 pb-4">
                                        {derivedData.timeline.map((step, index, arr) => (
                                            <div key={step} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center gap-3 z-10">
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center relative"
                                                        style={{ background: 'rgba(0,119,182,0.06)', border: '1.5px solid #0077b6' }}
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.6 + index * 0.15, type: "spring", stiffness: 300, damping: 20 }}
                                                            className="w-2.5 h-2.5 rounded-full relative z-10"
                                                            style={{ background: '#0077b6' }}
                                                        />
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.6 + index * 0.15 }}
                                                            className="absolute inset-0 rounded-full blur-sm -z-10"
                                                            style={{ background: 'rgba(0,119,182,0.15)' }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold whitespace-nowrap" style={{ color: '#0077b6' }}>{step}</span>
                                                </div>
                                                {index < arr.length - 1 && (
                                                    <div className="flex-1 h-[2px] mx-3 relative top-[-11px]" style={{ background: 'rgba(0,119,182,0.1)' }}>
                                                        <motion.div
                                                            className="absolute inset-y-0 left-0"
                                                            style={{ background: 'rgba(0,119,182,0.5)' }}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '100%' }}
                                                            transition={{ duration: 0.4, delay: 0.8 + index * 0.15 }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
