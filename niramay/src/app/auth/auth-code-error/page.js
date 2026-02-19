import Link from "next/link";

export default function AuthCodeError({ searchParams }) {
    const error = searchParams?.error || "Unknown error";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background text-foreground">
            <div className="p-8 border rounded-lg shadow-xl bg-card max-w-md w-full">
                <h1 className="text-2xl font-bold text-red-500 mb-4 text-center">Authentication Error</h1>

                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded mb-6 text-sm text-red-800 dark:text-red-200 break-words">
                    {error}
                </div>

                <p className="mb-4 text-muted-foreground">This might be due to:</p>
                <ul className="list-disc pl-5 space-y-2 mb-8 text-muted-foreground text-sm">
                    <li><strong>Supabase URL/Key mismatch</strong>: Check your .env.local</li>
                    <li><strong>Redirect URL missing</strong>: Add <code>{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback</code> to Supabase &gt; Auth &gt; URL Configuration.</li>
                    <li><strong>Google OAuth not enabled</strong>: Check Supabase &gt; Auth &gt; Providers.</li>
                </ul>

                <Link href="/" className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                    Return to Login
                </Link>
            </div>
        </div>
    );
}
