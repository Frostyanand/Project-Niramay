"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Zap,
  Brain,
  Upload,
  Search,
  FileCheck,
  Lock,
  Dna,
  HeartPulse,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

/* ── Reusable scroll-reveal wrapper ─────────────────────────────────────────── */
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   VIDEO BACKGROUND — tries 5 hospital-grade URLs in order via onError
   ══════════════════════════════════════════════════════════════════════════════ */
// Local 1440p file is tried first; CDN links are fallbacks
const HERO_VIDEOS = [
  "/209409_medium.mp4",                                                           // LOCAL — your 1440p file
  "https://cdn.pixabay.com/video/2020/04/18/36465-408970428_large.mp4",          // DNA helix
  "https://cdn.pixabay.com/video/2017/01/03/7386-197634145_large.mp4",           // Heartbeat wave
  "https://cdn.pixabay.com/video/2016/12/26/6737-197578474_large.mp4",           // Cellular abstract
];

function VideoBackground() {
  const [idx, setIdx] = useState(0);
  const videoRef = useRef(null);

  const handleError = () => {
    if (idx < HERO_VIDEOS.length - 1) {
      setIdx((i) => i + 1);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => { });
  }, [idx]);

  // Slow the video down once it's ready — more cinematic and calming
  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  };

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      onError={handleError}
      onCanPlay={handleCanPlay}
      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23312e81' width='1' height='1'/%3E%3C/svg%3E"
      style={{
        /* True full-bleed cover — works from 320px to 4K/ultrawide */
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        minWidth: "100%",
        minHeight: "100%",
        width: "auto",
        height: "auto",
        objectFit: "cover",
      }}
    >
      <source src={HERO_VIDEOS[idx]} type="video/mp4" />
    </video>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <VideoBackground />
        {/* Purple tint — lighter so video shows through clearly */}
        <div className="absolute inset-0 bg-[#1e1b4b]/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#312e81]/45 via-[#4c1d95]/10 to-[#1e1b4b]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        >
          <p className="text-[#e0e7ff] text-sm font-medium tracking-[0.25em] uppercase mb-6 drop-shadow-md">
            Precision Pharmacogenomics
          </p>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-8 drop-shadow-lg"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Your genes should
            <br />
            guide your medicine.
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-12 font-light drop-shadow">
            Niramay analyzes your genetic profile to predict drug toxicity
            risks — so your doctor prescribes what's safe for{" "}
            <em className="text-[#a5b4fc] not-italic font-semibold">you</em>,
            not just what works on average.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="
                inline-flex items-center gap-2 px-8 py-3.5
                bg-white text-[#312e81] font-semibold text-[15px]
                rounded-full
                hover:bg-[#e0e7ff] transition-all duration-300
                shadow-[0_0_40px_rgba(165,180,252,0.3)] hover:shadow-[0_0_60px_rgba(165,180,252,0.5)]
              "
            >
              Start Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="
                inline-flex items-center gap-2 px-8 py-3.5
                border border-white/30 text-white font-medium text-[15px]
                rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm
              "
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-white/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PROBLEM STATEMENT / ABOUT
   ══════════════════════════════════════════════════════════════════════════════ */
function ProblemSection() {
  const stats = [
    { number: "2M+", label: "Adverse drug reactions per year in the US alone" },
    { number: "95%", label: "Of people carry at least one actionable PGx variant" },
    { number: "15 min", label: "Average consultation time to interpret genetics" },
  ];

  return (
    <section id="about" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#caf0f8]/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Text */}
          <div>
            <Reveal>
              <p className="text-[#0077b6] text-[12px] font-semibold tracking-[0.25em] uppercase mb-4">
                The Problem
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#03045e] leading-tight mb-6 tracking-tight">
                The right drug for the
                <br />
                <span className="text-[#0077b6]">wrong patient</span> can be fatal.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-[#03045e]/50 text-[16px] leading-[1.8] mb-8">
                Adverse Drug Reactions are a leading cause of hospitalization and
                death globally. Your genetic makeup determines how you metabolize
                medications — yet most prescriptions are based on population
                averages, not your unique biology.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-[#03045e]/50 text-[16px] leading-[1.8]">
                Pharmacogenomic testing exists, but the results sit locked inside
                dense VCF files that clinicians can't interpret in a 15-minute
                consultation. <strong className="text-[#03045e] font-semibold">That's the gap Niramay fills.</strong>
              </p>
            </Reveal>
          </div>

          {/* Right: Stats */}
          <div className="space-y-0">
            {stats.map((stat, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className={`py-8 ${i !== stats.length - 1 ? "border-b border-[#03045e]/6" : ""}`}>
                  <span className="text-4xl sm:text-5xl font-bold text-[#0077b6] tracking-tight block mb-2">
                    {stat.number}
                  </span>
                  <span className="text-[15px] text-[#03045e]/45 leading-relaxed">
                    {stat.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ══════════════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      number: "01",
      title: "Upload",
      desc: "Securely upload your VCF file — standard genetic variant data from any clinical lab or direct-to-consumer test.",
    },
    {
      icon: Search,
      number: "02",
      title: "Analyze",
      desc: "Our neuro-symbolic engine cross-references your variants against CPIC clinical guidelines and medical literature in real time.",
    },
    {
      icon: FileCheck,
      number: "03",
      title: "Act",
      desc: "Receive a clear, clinician-ready report with drug-specific risk levels, dosing adjustments, and AI-generated explanations.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-28 lg:py-36 bg-[#f0f9ff] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-20">
            <p className="text-[#0077b6] text-[12px] font-semibold tracking-[0.25em] uppercase mb-4">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#03045e] tracking-tight">
              From genome to guidance in minutes.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-0 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-[#0077b6]/15 z-0" />

          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.2}>
              <div className="relative z-10 text-center px-4 lg:px-10">
                {/* Number circle */}
                <div className="w-24 h-24 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-[#caf0f8] rounded-2xl rotate-6" />
                  <div className="relative w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,119,182,0.06)]">
                    <step.icon className="w-7 h-7 text-[#0077b6] mb-1" strokeWidth={1.5} />
                    <span className="text-[11px] font-mono font-bold text-[#0077b6]/40">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#03045e] mb-3">{step.title}</h3>
                <p className="text-[14px] text-[#03045e]/45 leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FEATURES
   ══════════════════════════════════════════════════════════════════════════════ */
function Features() {
  const features = [
    {
      icon: Shield,
      title: "Zero Hallucination Risk",
      desc: "Risk levels are hard-coded to CPIC clinical guidelines. The AI explains — it never overrides the safety layer.",
    },
    {
      icon: Brain,
      title: "Neuro-Symbolic AI",
      desc: "Combines deterministic rules with RAG-powered Gemini explanations. Get transparency and intelligence together.",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      desc: "C-optimized VCF parsing, parallel LLM calls, and multi-model cascades deliver results in seconds, not hours.",
    },
    {
      icon: Lock,
      title: "Privacy First",
      desc: "No genomic data is stored. End-to-end encryption. Your genetic information stays yours — always.",
    },
    {
      icon: Dna,
      title: "6 Drug Coverage",
      desc: "Covers Codeine, Warfarin, Clopidogrel, Simvastatin, Azathioprine, and Fluorouracil with room to grow.",
    },
    {
      icon: HeartPulse,
      title: "Clinician-Ready Reports",
      desc: "Traffic light risk visualization with dosing recommendations and alternative drugs — actionable in a clinical setting.",
    },
  ];

  return (
    <section id="features" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#90e0ef]/20 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="max-w-2xl mb-20">
            <p className="text-[#0077b6] text-[12px] font-semibold tracking-[0.25em] uppercase mb-4">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#03045e] tracking-tight mb-5 leading-tight">
              Built for clinical precision,
              <br />designed for clarity.
            </h2>
            <p className="text-[16px] text-[#03045e]/45 leading-relaxed">
              Every piece of Niramay is engineered to be trustworthy, fast, and
              transparent. No black boxes. No guesswork.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {features.map((feat, i) => (
            <Reveal key={i} delay={(i % 3) * 0.1}>
              <div className="group">
                <div className="w-11 h-11 bg-[#03045e] rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_16px_rgba(3,4,94,0.2)]">
                  <feat.icon className="w-5 h-5 text-[#90e0ef]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-[#03045e] mb-2">{feat.title}</h3>
                <p className="text-[14px] text-[#03045e]/40 leading-relaxed">{feat.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TRUST SECTION
   ══════════════════════════════════════════════════════════════════════════════ */
function TrustSection() {
  const badges = [
    { label: "CPIC", sublabel: "Guideline Compliant" },
    { label: "E2E", sublabel: "Encrypted" },
    { label: "HIPAA", sublabel: "Ready Architecture" },
    { label: "RAG", sublabel: "Grounded AI" },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-[#03045e] overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-64 h-64 border border-white/4 rounded-full pointer-events-none" />
      <div className="absolute top-20 right-20 w-96 h-96 border border-white/3 rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 text-center">
        <Reveal>
          <p className="text-[#90e0ef] text-[12px] font-semibold tracking-[0.25em] uppercase mb-4">
            Why Trust Niramay
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Safety is not a feature. It&apos;s the foundation.
          </h2>
          <p className="text-white/40 text-[16px] leading-relaxed max-w-xl mx-auto mb-16">
            Every risk assessment is backed by CPIC medical guidelines.
            Our AI generates explanations — it never generates diagnoses.
            The deterministic safety layer cannot be overridden.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {badges.map((badge, i) => (
              <div
                key={i}
                className="py-8 border border-white/6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
              >
                <span className="text-2xl font-bold text-[#00b4d8] block mb-1 tracking-tight">
                  {badge.label}
                </span>
                <span className="text-[12px] text-white/30 tracking-wide uppercase">
                  {badge.sublabel}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FINAL CTA
   ══════════════════════════════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section className="relative py-28 lg:py-36 bg-[#f0f9ff] overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00b4d8]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#03045e] tracking-tight mb-6 leading-tight">
            Ready to put your genetics
            <br />to work?
          </h2>
          <p className="text-[#03045e]/45 text-[16px] leading-relaxed mb-10 max-w-lg mx-auto">
            Upload your VCF file. Get a clinician-ready pharmacogenomic report
            in minutes. No genomic data stored. Ever.
          </p>
          <Link
            href="/dashboard"
            className="
              inline-flex items-center gap-2.5 px-10 py-4
              bg-[#03045e] text-white font-semibold text-[15px]
              rounded-full
              hover:bg-[#0077b6] transition-all duration-300
              hover:shadow-[0_8px_30px_rgba(0,119,182,0.25)]
            "
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[12px] text-[#03045e]/25 mt-6 tracking-wide">
            No credit card required · Results in minutes
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <Features />
      <TrustSection />
      <CTA />
    </main>
  );
}
