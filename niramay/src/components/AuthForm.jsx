"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Dna } from 'lucide-react';

export default function AuthForm() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [method, setMethod] = useState('login'); // 'login' or 'signup'

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) alert(error.message);
        setLoading(false);
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (method === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) alert(error.message);
            else {
                router.replace('/dashboard');
                router.refresh();
            }
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });
            if (error) alert(error.message);
            else alert('Check your email for the login link!');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center w-full space-y-8">
            {/* HERO BRANDING - NIRMAY */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center text-center space-y-4"
            >
                <div className="relative group">
                    <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/30 grid place-items-center shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20 backdrop-blur-xl">
                        <Dna className="w-8 h-8 text-cyan-400" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-cyan-100 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        NIRMAY
                    </h1>
                    <p className="text-sm md:text-base font-light text-cyan-500/60 tracking-wider uppercase">
                        Precision Pharmacogenomics Platform
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-transparent backdrop-blur-xl"
            >
                {/* Animated Border Gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-teal-400/30 animate-pulse -z-10 blur-sm"></div>

                <div className="relative bg-slate-900/80 rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-md">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-white tracking-wide">
                            Nirmay <span className="text-cyan-400">Access</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">Secure Clinical Portal</p>
                    </div>

                    {/* Google Sign In Button */}
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6,182,212,0.15)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full relative group overflow-hidden bg-white hover:bg-slate-50 text-slate-900 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-cyan-900/20"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        <span>Continue with Google</span>

                        {/* Hover sheen effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </motion.button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-cyan-900/20 transition-all duration-300"
                        >
                            {loading ? 'Processing...' : (method === 'login' ? 'Sign In' : 'Create Account')}
                        </motion.button>
                    </form>

                    {/* Toggle Login/Signup */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setMethod(method === 'login' ? 'signup' : 'login')}
                            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            {method === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                            <span>CPIC-Based</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span>No Data Stored</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span>Clinical-Grade</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
