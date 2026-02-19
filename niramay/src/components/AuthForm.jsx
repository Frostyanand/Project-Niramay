
"use client";


import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
        } else {
            router.replace('/dashboard');
            router.refresh();
        }
        setLoading(false);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) alert(error.message);
        else alert('Check your email for the login link!');
        setLoading(false);
    };

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

    return (
        <div className="flex flex-col gap-4 p-6 border rounded shadow-md max-w-sm mx-auto bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold text-center">Authentication</h2>

            <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 w-full p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={loading}
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span>Sign in with Google</span>
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-px bg-gray-200 w-full"></div>
                <span>OR</span>
                <div className="h-px bg-gray-200 w-full"></div>
            </div>

            <input
                className="border p-2 rounded bg-background text-foreground"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="border p-2 rounded bg-background text-foreground"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2 justify-center">
                <button
                    onClick={handleLogin}
                    className="bg-blue-500 text-white p-2 flex-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Loading' : 'Login'}
                </button>
                <button
                    onClick={handleSignUp}
                    className="bg-green-500 text-white p-2 flex-1 rounded hover:bg-green-600 disabled:opacity-50"
                    disabled={loading}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
}
