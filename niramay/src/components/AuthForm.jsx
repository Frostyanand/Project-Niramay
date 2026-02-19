"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AuthForm() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [method, setMethod] = useState("login");

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
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

        if (method === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) alert(error.message);
            else {
                router.replace("/dashboard");
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
            else alert("Check your email for the login link!");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center w-full space-y-8">
            {/* Branding */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
            >
                <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                    <div className="w-10 h-10 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105" style={{ background: '#eaf4fb', padding: 3 }}>
                        <Image
                            src="/Logo.jpeg"
                            alt="Niramay"
                            width={34}
                            height={34}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                            priority
                        />
                    </div>
                    <span className="text-2xl font-semibold text-[#03045e] tracking-wide">
                        Niramay
                    </span>
                </Link>
                <p className="text-[#03045e]/40 text-sm">
                    {method === "login"
                        ? "Welcome back. Sign in to continue."
                        : "Create your account to get started."}
                </p>
            </motion.div>

            {/* Form Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="w-full bg-white border border-[#03045e]/6 shadow-[0_4px_24px_rgba(3,4,94,0.04)] p-8"
            >
                {/* Google Sign In */}
                <motion.button
                    whileHover={{
                        scale: 1.01,
                        boxShadow: "0 4px 16px rgba(0,119,182,0.08)",
                    }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="
            w-full relative overflow-hidden
            bg-white border border-[#03045e]/8
            hover:border-[#0077b6]/30
            text-[#03045e] font-medium text-[14px]
            py-3 px-4 flex items-center justify-center gap-3
            transition-all duration-300
          "
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span>Continue with Google</span>
                </motion.button>

                {/* Divider */}
                <div className="relative my-7">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#03045e]/6" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-[#03045e]/25 tracking-wider text-[11px]">
                            Or continue with email
                        </span>
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
                            className="
                w-full bg-[#f0f9ff] border border-[#03045e]/6
                px-4 py-3 text-[#03045e] text-[14px]
                placeholder-[#03045e]/25
                focus:outline-none focus:border-[#0077b6]/40
                focus:ring-2 focus:ring-[#0077b6]/10
                transition-all
              "
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="
                w-full bg-[#f0f9ff] border border-[#03045e]/6
                px-4 py-3 text-[#03045e] text-[14px]
                placeholder-[#03045e]/25
                focus:outline-none focus:border-[#0077b6]/40
                focus:ring-2 focus:ring-[#0077b6]/10
                transition-all
              "
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="
              w-full bg-[#03045e] hover:bg-[#0077b6]
              text-white font-semibold text-[14px]
              py-3 transition-all duration-300
              hover:shadow-[0_4px_20px_rgba(0,119,182,0.2)]
              disabled:opacity-50
            "
                    >
                        {loading
                            ? "Processing..."
                            : method === "login"
                                ? "Sign In"
                                : "Create Account"}
                    </motion.button>
                </form>

                {/* Toggle */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setMethod(method === "login" ? "signup" : "login")}
                        className="text-sm text-[#03045e]/35 hover:text-[#0077b6] transition-colors duration-300"
                    >
                        {method === "login"
                            ? "Don't have an account? Sign up"
                            : "Already have an account? Sign in"}
                    </button>
                </div>
            </motion.div>

            {/* Trust */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 text-[11px] text-[#03045e]/20 font-medium tracking-wider uppercase"
            >
                <span>CPIC-Based</span>
                <span className="w-1 h-1 rounded-full bg-[#03045e]/10" />
                <span>Encrypted</span>
                <span className="w-1 h-1 rounded-full bg-[#03045e]/10" />
                <span>Clinical-Grade</span>
            </motion.div>
        </div>
    );
}
