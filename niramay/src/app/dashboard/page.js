
"use client";
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Update route protection
    };

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button
                    onClick={handleSignOut}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Sign Out
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded shadow-sm bg-card text-card-foreground">
                    <h2 className="text-xl font-semibold mb-2">My Profile</h2>
                    <p className="text-muted-foreground">Manage your personal information.</p>
                </div>
                <div className="p-6 border rounded shadow-sm bg-card text-card-foreground">
                    <h2 className="text-xl font-semibold mb-2">Medical Records</h2>
                    <p className="text-muted-foreground">View your secure health data.</p>
                </div>
                <div className="p-6 border rounded shadow-sm bg-card text-card-foreground">
                    <h2 className="text-xl font-semibold mb-2">Appointments</h2>
                    <p className="text-muted-foreground">Upcoming consultations.</p>
                </div>
            </div>
        </div>
    );
}
