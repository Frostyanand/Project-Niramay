"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const isDashboard = pathname?.startsWith("/dashboard");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
        const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
            setUser(session?.user || null);
        });
        return () => listener?.subscription?.unsubscribe();
    }, []);

    if (isDashboard) return null;

    const handleDashboardClick = (e) => {
        e.preventDefault();
        router.push(user ? "/dashboard" : "/auth");
    };

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Features", href: "/#features" },
    ];

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
        >
            <nav
                className={`
          flex items-center justify-between w-full max-w-5xl
          px-3 py-2 transition-all duration-500 ease-out
          ${scrolled
                        ? "bg-white/70 shadow-[0_8px_32px_rgba(0,119,182,0.08)] border border-[#90e0ef]/30"
                        : "bg-white/40 border border-white/20"
                    }
          backdrop-blur-xl backdrop-saturate-150 rounded-full
        `}
            >
                {/* Brand with Logo */}
                <Link href="/" className="flex items-center gap-2.5 pl-2 group">
                    {/* Logo — contained, no clipping */}
                    <div
                        className="flex-shrink-0 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
                        style={{ width: 36, height: 36, background: '#eaf4fb', padding: 3 }}
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
                    <span className="text-[#03045e] font-semibold text-[15px] tracking-wide hidden sm:block">
                        Niramay
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`
                px-4 py-2 text-[13px] font-medium tracking-wide
                rounded-full transition-all duration-300
                ${pathname === link.href
                                    ? "text-[#03045e] bg-[#caf0f8]/60"
                                    : "text-[#03045e]/60 hover:text-[#03045e] hover:bg-[#caf0f8]/40"
                                }
              `}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-2 pr-1">
                    <button
                        onClick={handleDashboardClick}
                        className="px-5 py-2 text-[13px] font-semibold tracking-wide text-white bg-[#0077b6] hover:bg-[#03045e] rounded-full transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,119,182,0.3)]"
                    >
                        {user ? "Dashboard" : "Get Started"}
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-2 rounded-full hover:bg-[#caf0f8]/40 transition-colors mr-1"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X className="w-5 h-5 text-[#03045e]" /> : <Menu className="w-5 h-5 text-[#03045e]" />}
                </button>
            </nav>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-4 right-4 mt-2 bg-white/90 backdrop-blur-xl border border-[#90e0ef]/30 rounded-2xl shadow-[0_12px_40px_rgba(0,119,182,0.1)] p-4 md:hidden"
                    >
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="px-4 py-3 text-[14px] font-medium text-[#03045e]/70 hover:text-[#03045e] hover:bg-[#caf0f8]/40 rounded-xl transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="mt-2 pt-2 border-t border-[#90e0ef]/20">
                                <button
                                    onClick={() => { setMenuOpen(false); handleDashboardClick(new Event('click')); }}
                                    className="w-full px-4 py-3 text-[14px] font-semibold text-white bg-[#0077b6] rounded-xl"
                                >
                                    {user ? "Dashboard" : "Get Started"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
