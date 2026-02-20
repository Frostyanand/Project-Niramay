"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/analytics");

    if (isDashboard) return null;

    return (
        <footer className="relative bg-[#03045e] text-white overflow-hidden">
            {/* Subtle top border accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#00b4d8]/40 to-transparent" />

            <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-12 border-b border-white/8">

                    {/* Brand Column */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105" style={{ background: '#eaf4fb', padding: 2 }}>
                                <Image
                                    src="/Logo.jpeg"
                                    alt="Niramay"
                                    width={32}
                                    height={32}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                                />
                            </div>
                            <span className="text-xl font-semibold tracking-wide">Niramay</span>
                        </div>
                        <p className="text-[15px] leading-relaxed text-white/50 max-w-sm">
                            Bridging the gap between genetic data and clinical action.
                            Precision pharmacogenomics powered by neuro-symbolic AI.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="md:col-span-3">
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-5">
                            Platform
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Features", href: "/#features" },
                                { label: "How it Works", href: "/#how-it-works" },
                                { label: "Dashboard", href: "/dashboard" },
                                { label: "Analytics", href: "/analytics" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/40 hover:text-[#90e0ef] transition-colors duration-300"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact / Legal */}
                    <div className="md:col-span-4">
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-5">
                            Clinical Standards
                        </h4>
                        <ul className="space-y-3">
                            <li className="text-sm text-white/40">CPIC Guidelines Compliant</li>
                            <li className="text-sm text-white/40">End-to-End Encrypted</li>
                            <li className="text-sm text-white/40">No Genomic Data Stored</li>
                            <li className="text-sm text-white/40">SOC 2 Ready Architecture</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                    <p className="text-[13px] text-white/25">
                        © {new Date().getFullYear()} Niramay. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-[12px] text-white/20 font-mono tracking-wider">
                            PRECISION MEDICINE FOR EVERYONE
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
