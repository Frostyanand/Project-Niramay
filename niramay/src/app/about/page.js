"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Dna, ShieldCheck, FlaskConical, Zap, Brain,
    FileSearch, Cpu, GitBranch, ArrowRight, Lock,
    Globe, Heart, Users, ChevronRight
} from "lucide-react";

/* ── Scroll-reveal wrapper ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, ease: "easeOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ── Editorial label ──────────────────────────────────────────────────────── */
function Label({ children }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: "#0096c7" }}>
            {children}
        </p>
    );
}

/* ── Pipeline step ────────────────────────────────────────────────────────── */
function PipelineStep({ number, title, description, icon: Icon }) {
    return (
        <Reveal delay={number * 0.08}>
            <div className="flex gap-6 group">
                {/* Number + line */}
                <div className="flex flex-col items-center">
                    <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110"
                        style={{ background: "linear-gradient(135deg, #0096c7, #023e8a)" }}
                    >
                        {number}
                    </div>
                    {number < 5 && (
                        <div className="w-px flex-1 mt-4" style={{ background: "rgba(0,119,182,0.12)", minHeight: 40 }} />
                    )}
                </div>
                {/* Content */}
                <div className="pb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-4 h-4" style={{ color: "#0077b6" }} strokeWidth={1.5} />
                        <h3 className="text-base font-semibold" style={{ color: "#03045e" }}>{title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#90a0b0", maxWidth: 480 }}>
                        {description}
                    </p>
                </div>
            </div>
        </Reveal>
    );
}

/* ── Feature card ─────────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, delay }) {
    return (
        <Reveal delay={delay}>
            <div
                className="p-7 rounded-2xl h-full transition-all duration-300 hover:-translate-y-1"
                style={{
                    background: "#ffffff",
                    border: "1px solid rgba(0,119,182,0.1)",
                    boxShadow: "0 4px 24px rgba(0,119,182,0.06)",
                }}
            >
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(0,119,182,0.08)" }}
                >
                    <Icon className="w-5 h-5" style={{ color: "#0077b6" }} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#03045e" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#90a0b0" }}>{description}</p>
            </div>
        </Reveal>
    );
}

/* ── Video Background — same pattern as landing page ─────────────────────── */
const ABOUT_VIDEOS = [
    "/neural_network2.mp4",                                                          // LOCAL — user's new video (primary)
    "/209409_medium.mp4",                                                            // LOCAL fallback
    "https://cdn.pixabay.com/video/2020/04/18/36465-408970428_large.mp4",           // CDN fallback
];

function VideoBackground() {
    const [idx, setIdx] = React.useState(0);
    const videoRef = React.useRef(null);

    const handleError = () => {
        if (idx < ABOUT_VIDEOS.length - 1) setIdx((i) => i + 1);
    };

    React.useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.load();
        v.play().catch(() => { });
    }, [idx]);

    const handleCanPlay = () => {
        if (videoRef.current) videoRef.current.playbackRate = 0.65;
    };

    /* Seamless manual loop: seek back before the video reaches its end
       to avoid the blank-frame flicker that native loop causes. */
    const handleTimeUpdate = () => {
        const v = videoRef.current;
        if (v && v.duration && v.currentTime > v.duration - 0.3) {
            v.currentTime = 0;
            v.play().catch(() => { });
        }
    };

    return (
        <video
            ref={videoRef}
            autoPlay muted playsInline
            preload="auto"
            onError={handleError}
            onCanPlay={handleCanPlay}
            onTimeUpdate={handleTimeUpdate}
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23312e81' width='1' height='1'/%3E%3C/svg%3E"
            style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                minWidth: "100%", minHeight: "100%",
                width: "auto", height: "auto", objectFit: "cover",
            }}
        >
            <source src={ABOUT_VIDEOS[idx]} type="video/mp4" />
        </video>
    );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function AboutPage() {
    return (
        <main style={{ background: "#f8fbff", fontFamily: "'Inter', sans-serif" }}>

            {/* ── HERO — full-bleed video (same as landing page) ────────────────── */}
            <section className="relative overflow-hidden" style={{ minHeight: "56vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Video */}
                <div className="absolute inset-0 z-0">
                    <VideoBackground />
                    {/* Purple indigo overlay — identical to landing page */}
                    <div className="absolute inset-0" style={{ background: "rgba(30,27,75,0.30)", mixBlendMode: "multiply" }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(49,46,129,0.45) 0%, rgba(76,29,149,0.10) 55%, rgba(30,27,75,0.85) 100%)" }} />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-28 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 36 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-5 drop-shadow" style={{ color: "#c7d2fe" }}>
                            About Niramay
                        </p>
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6 text-white drop-shadow-lg"
                            style={{ fontFamily: "'Inter', sans-serif", textShadow: "0 2px 24px rgba(0,0,0,0.3)" }}
                        >
                            Precision medicine,<br />
                            <span style={{ color: "#bae6fd" }}>decoded from your genes.</span>
                        </h1>
                        <p className="text-base sm:text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                            Niramay is an AI-powered clinical decision support system that analyses a patient&apos;s genetic
                            profile to predict drug response, prevent adverse reactions, and deliver evidence-based
                            pharmacogenomic guidance — in seconds.
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_8px_32px_rgba(165,180,252,0.4)] hover:-translate-y-0.5"
                                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)" }}
                            >
                                Start Analysis <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
            {/* Divider */}
            <div className="max-w-5xl mx-auto px-6">
                <div style={{ height: 1, background: "rgba(0,119,182,0.08)" }} />
            </div>

            {/* ── THE PROBLEM ───────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <Reveal>
                        <Label>The Problem</Label>
                        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-6" style={{ color: "#03045e" }}>
                            Adverse drug reactions are killing patients — unnoticed.
                        </h2>
                        <p className="text-base leading-relaxed mb-4" style={{ color: "#90a0b0" }}>
                            Adverse Drug Reactions (ADRs) are a leading cause of death globally. Pharmacogenomic (PGx)
                            testing exists — but results are buried in dense, unreadable <code className="text-xs px-1 rounded" style={{ background: "rgba(0,119,182,0.08)", color: "#0077b6" }}>.vcf</code> files
                            that clinicians struggle to interpret during a 15-minute consultation.
                        </p>
                        <p className="text-base leading-relaxed" style={{ color: "#90a0b0" }}>
                            Current AI tools are black boxes. They say &quot;High Risk&quot; with no explanation — no mechanism,
                            no alternative, no guideline citation. Clinicians can&apos;t trust what they can&apos;t understand.
                        </p>
                    </Reveal>

                    {/* Stats */}
                    <Reveal delay={0.1}>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { stat: "1 in 15", label: "Hospital admissions are due to ADRs" },
                                { stat: ">95%", label: "Of patients carry actionable PGx variants" },
                                { stat: "15 min", label: "Average consultation — not enough time to read a VCF" },
                                { stat: "100%", label: "Niramay risk assessments are guideline-compliant" },
                            ].map(({ stat, label }) => (
                                <div
                                    key={stat}
                                    className="p-6 rounded-2xl"
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid rgba(0,119,182,0.1)",
                                        boxShadow: "0 3px 16px rgba(0,119,182,0.05)",
                                    }}
                                >
                                    <p className="text-3xl font-bold mb-2" style={{ color: "#0077b6" }}>{stat}</p>
                                    <p className="text-xs leading-snug" style={{ color: "#90a0b0" }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-5xl mx-auto px-6">
                <div style={{ height: 1, background: "rgba(0,119,182,0.08)" }} />
            </div>

            {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <Reveal>
                    <Label>From VCF to Clinical Clarity</Label>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#03045e" }}>
                        What happens after you upload a VCF file
                    </h2>
                    <p className="text-base leading-relaxed mb-14 max-w-xl" style={{ color: "#90a0b0" }}>
                        Five pipeline stages — from raw genomic data to a trusted clinical report — completed in under 30 seconds.
                    </p>
                </Reveal>

                <PipelineStep
                    number={1}
                    icon={FileSearch}
                    title="Secure Upload & Validation"
                    description="Your .vcf file is encrypted in transit, validated against the VCFv4 standard (format header, mandatory columns), and stored in a signed private vault. It never touches a public server."
                />
                <PipelineStep
                    number={2}
                    icon={Cpu}
                    title="Bio-Parser: Sub-50ms Genomic Processing"
                    description="The backend Bio-Parser service uses cyvcf2 — C-optimised bindings for htslib — to extract genotypic variants from key pharmacogenes: CYP2C9, CYP2C19, CYP2D6, SLCO1B1 and more. Zero Python-level bottlenecks."
                />
                <PipelineStep
                    number={3}
                    icon={ShieldCheck}
                    title="CPIC Rules Engine: Deterministic Risk Assessment"
                    description="A symbolic rules engine maps your variants to Diplotypes (e.g. SLCO1B1 *5/*5) and Phenotypes (e.g. Poor Function). Risk levels — High, Moderate, or Low — are hard-coded to 2025 CPIC Guidelines. It never hallucinates."
                />
                <PipelineStep
                    number={4}
                    icon={Brain}
                    title="Neuro-Symbolic RAG: AI-Generated Explanation"
                    description="For every drug-gene interaction found, an async RAG pipeline fires. Google Gemini 2.0 Flash retrieves the exact paragraph from the 2025 CPIC guideline via Pinecone, then synthesises a plain-English clinical impact statement grounded solely in that evidence."
                />
                <PipelineStep
                    number={5}
                    icon={FlaskConical}
                    title="Structured Clinical Report"
                    description="Results are presented as traffic-light risk cards: the hard safety warning from the rules engine, the nuanced AI explanation, dosing recommendations, and alternative drugs — all in one place, ready to act on."
                />
            </section>

            {/* ── SOLUTION ARCHITECTURE ─────────────────────────────────────────── */}
            <section style={{ background: "#ffffff" }}>
                <div className="max-w-5xl mx-auto px-6 py-20">
                    <Reveal>
                        <Label>The Architecture</Label>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#03045e" }}>
                            Neuro-Symbolic — two engines, one answer you can trust
                        </h2>
                        <p className="text-base leading-relaxed mb-12 max-w-xl" style={{ color: "#90a0b0" }}>
                            Niramay solves the AI black-box problem by combining the precision of deterministic rules with the explanatory power of large language models.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Symbolic */}
                        <Reveal delay={0}>
                            <div className="p-8 rounded-2xl h-full" style={{
                                background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                                border: "1px solid rgba(0,119,182,0.12)",
                            }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                    style={{ background: "rgba(0,119,182,0.12)" }}>
                                    <ShieldCheck className="w-6 h-6" style={{ color: "#0077b6" }} strokeWidth={1.5} />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#0096c7" }}>The Symbolic Engine</p>
                                <h3 className="text-xl font-bold mb-3" style={{ color: "#03045e" }}>Deterministic. Auditable. Safe.</h3>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: "#90a0b0" }}>
                                    A strict rules engine that follows <strong style={{ color: "#0077b6" }}>CPIC guidelines</strong> without deviation. If the guidelines say &quot;Avoid Codeine for Poor Metabolisers&quot;, the system says exactly that — no inference, no probability, no ambiguity.
                                </p>
                                <ul className="space-y-2">
                                    {["Zero hallucination on safety-critical data", "Full CPIC 2025 compliance", "Haplotype + Diplotype mapping", "Sub-50ms using C-bindings"].map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "#90a0b0" }}>
                                            <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "#0077b6" }} />{f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>

                        {/* Neural */}
                        <Reveal delay={0.1}>
                            <div className="p-8 rounded-2xl h-full" style={{
                                background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                                border: "1px solid rgba(76,29,149,0.1)",
                            }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                    style={{ background: "rgba(76,29,149,0.1)" }}>
                                    <Brain className="w-6 h-6" style={{ color: "#7c3aed" }} strokeWidth={1.5} />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#7c3aed" }}>The Neural Cortex</p>
                                <h3 className="text-xl font-bold mb-3" style={{ color: "#03045e" }}>Explainable. Grounded. Trustworthy.</h3>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: "#90a0b0" }}>
                                    A Retrieval-Augmented Generation (RAG) pipeline using <strong style={{ color: "#7c3aed" }}>Google Gemini 2.0 Flash</strong> and <strong style={{ color: "#7c3aed" }}>Pinecone</strong>. The LLM only reads the exact guideline paragraph relevant to your patient&apos;s gene — grounded generation, not free-form speculation.
                                </p>
                                <ul className="space-y-2">
                                    {["Guideline-grounded explanations", "Multi-model cascade for 99.9% uptime", "Gemini embedding-001 (768-dim)", "Asynchronous parallel execution"].map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "#90a0b0" }}>
                                            <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "#7c3aed" }} />{f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ──────────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <Reveal>
                    <Label>Key Capabilities</Label>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12" style={{ color: "#03045e" }}>
                        Built for clinical trust
                    </h2>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <FeatureCard delay={0} icon={ShieldCheck} title="100% Guideline Compliance" description="Risk levels are hard-coded to CPIC 2025 protocols. Zero hallucination on safety-critical assessments." />
                    <FeatureCard delay={0.05} icon={Zap} title="Sub-50ms Parsing" description="Uses C-based htslib bindings via cyvcf2 for ultra-fast genomic processing — even for large VCF files." />
                    <FeatureCard delay={0.1} icon={Brain} title="Explainable AI" description="Doesn't just say 'High Risk' — explains the biological mechanism grounded in actual CPIC literature." />
                    <FeatureCard delay={0.15} icon={GitBranch} title="Resilient Multi-Model" description="Key Cascade + Model Waterfall system tries multiple Gemini models and rotates API keys automatically for 99.9% uptime." />
                    <FeatureCard delay={0.2} icon={Lock} title="End-to-End Encrypted" description="All genomic data is encrypted in transit, stored in private vaults, and accessed via time-limited signed URLs." />
                    <FeatureCard delay={0.25} icon={Globe} title="6 Supported Drugs" description="Full support for Codeine, Warfarin, Clopidogrel, Simvastatin, Azathioprine, and Fluorouracil — with custom drug input." />
                </div>
            </section>

            {/* ── TECH STACK ────────────────────────────────────────────────────── */}
            <section style={{ background: "#ffffff" }}>
                <div className="max-w-5xl mx-auto px-6 py-20">
                    <Reveal>
                        <Label>Technology Stack</Label>
                        <h2 className="text-3xl font-bold mb-12" style={{ color: "#03045e" }}>
                            Built on modern, reliable foundations
                        </h2>
                    </Reveal>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
                            { name: "Next.js 15", desc: "App Router + RSC" },
                            { name: "FastAPI", desc: "Python Microservice" },
                            { name: "Google Gemini 2.0", desc: "LLM Generation" },
                            { name: "Pinecone", desc: "Vector Database" },
                            { name: "Supabase", desc: "Auth + Storage" },
                            { name: "cyvcf2", desc: "VCF Parsing (C)" },
                            { name: "Docker", desc: "Containerisation" },
                            { name: "Framer Motion", desc: "Animations" },
                        ].map(({ name, desc }, i) => (
                            <Reveal key={name} delay={i * 0.04}>
                                <div
                                    className="p-4 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5"
                                    style={{
                                        border: "1px solid rgba(0,119,182,0.1)",
                                        background: "#f8fbff",
                                    }}
                                >
                                    <p className="text-sm font-semibold mb-0.5" style={{ color: "#03045e" }}>{name}</p>
                                    <p className="text-[11px]" style={{ color: "#90e0ef" }}>{desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TEAM & MISSION ────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <Reveal>
                        <Label>Our Mission</Label>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: "#03045e" }}>
                            Precision medicine<br />for everyone.
                        </h2>
                        <p className="text-base leading-relaxed mb-4" style={{ color: "#90a0b0" }}>
                            We believe that the gap between a patient&apos;s genome and their treatment plan should be measured
                            in milliseconds, not months. Niramay was built to close that gap — making pharmacogenomic
                            insights accessible to clinicians during the consultation, not weeks later.
                        </p>
                        <p className="text-base leading-relaxed" style={{ color: "#90a0b0" }}>
                            Built as a hackathon submission with a genuine aim: to demonstrate that neuro-symbolic AI
                            can make clinical AI both <em>safe</em> (rules-based) and <em>understandable</em> (LLM-explained).
                        </p>

                        <div className="mt-8 flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                style={{ background: "linear-gradient(135deg, #0077b6, #023e8a)" }}
                            >
                                A
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: "#03045e" }}>Anuraag</p>
                                <p className="text-xs" style={{ color: "#90a0b0" }}>Full-Stack Developer &amp; AI Engineer</p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Values */}
                    <Reveal delay={0.1}>
                        <div className="space-y-5">
                            {[
                                { icon: Heart, title: "Patient First", desc: "Every design decision is evaluated through one lens: does this help a clinician make a safer choice for their patient?" },
                                { icon: ShieldCheck, title: "Safety by Design", desc: "Risk assessments are deterministic, auditable, and grounded in published clinical guidelines — not statistical inference." },
                                { icon: Users, title: "Open & Trustworthy", desc: "Raw JSON responses are always accessible. No black boxes. Clinicians see exactly what the system found and why." },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex gap-4">
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                                        style={{ background: "rgba(0,119,182,0.08)" }}
                                    >
                                        <Icon className="w-4 h-4" style={{ color: "#0077b6" }} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1" style={{ color: "#03045e" }}>{title}</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: "#90a0b0" }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── CTA FOOTER ────────────────────────────────────────────────────── */}
            <section style={{ background: "linear-gradient(135deg, #03045e 0%, #023e8a 100%)" }}>
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <Reveal>
                        <Dna className="w-10 h-10 mx-auto mb-6 opacity-40" style={{ color: "#90e0ef" }} strokeWidth={1} />
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Ready to analyse your genomic data?
                        </h2>
                        <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
                            Upload a VCF file, select medications, and receive a full pharmacogenomic report in under 30 seconds.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,150,199,0.4)] hover:-translate-y-0.5"
                            style={{ background: "linear-gradient(135deg, #0096c7, #0077b6)" }}
                        >
                            Start Your Analysis
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Reveal>
                </div>
            </section>

        </main>
    );
}
