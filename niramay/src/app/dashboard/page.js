
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import VcfUploader from '@/components/VcfUploader';
import { FileText, User, Activity, LogOut } from 'lucide-react';

export default function Dashboard() {
    const supabase = createClient();
    const router = useRouter();
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.replace('/');
    };

    const handleUploadScale = (url) => {
        setUploadedFileUrl(url);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">Nirmay</h1>
                    <p className="text-xs text-gray-500 mt-1">Clinical Genomics Platform</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<Activity className="w-5 h-5" />} label="Analysis Dashboard" active />
                    <NavItem icon={<FileText className="w-5 h-5" />} label="My Files" />
                    <NavItem icon={<User className="w-5 h-5" />} label="Profile" />
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                        <p className="text-gray-500 mt-2">Upload your genomic data to begin risk analysis.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Upload VCF Data
                                </h3>

                                {uploadedFileUrl ? (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-green-900 dark:text-green-100">Upload Complete</h4>
                                                <p className="text-sm text-green-700 dark:text-green-300">Your file has been securely stored and is ready for processing.</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800 flex justify-end">
                                            <button
                                                onClick={() => setUploadedFileUrl(null)}
                                                className="text-sm font-medium text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 underline"
                                            >
                                                Upload Another File
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <VcfUploader onUploadComplete={handleUploadScale} />
                                )}
                            </div>
                        </div>

                        {/* Recent Activity / Status */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Status</h3>
                                <div className="space-y-4">
                                    <StatusItem label="Database" status="Operational" color="green" />
                                    <StatusItem label="Storage" status="Operational" color="green" />
                                    <StatusItem label="Analysis Engine" status="Idle" color="blue" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
            {icon}
            {label}
        </button>
    );
}

function StatusItem({ label, status, color }) {
    const colors = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        yellow: 'bg-yellow-500',
    };

    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors[color]}`}></span>
                <span className="font-medium text-gray-900 dark:text-white">{status}</span>
            </div>
        </div>
    );
}
