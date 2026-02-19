"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabaseClient';
import {
    Shield, Lock, KeyRound, Eye, EyeOff,
    CheckCircle2, AlertCircle, Loader2, LogOut,
    Monitor, Globe, Clock, Fingerprint,
} from 'lucide-react';

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, type }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium ${type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                }`}
        >
            {type === 'success'
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {message}
        </motion.div>
    );
}

// ── Password Field ────────────────────────────────────────────────────────────

function PasswordField({ label, value, onChange, placeholder, helper, disabled }) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/60 flex items-center gap-2">
                <Lock className="w-3 h-3" /> {label}
            </label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 pr-11 text-sm text-slate-100 placeholder-slate-600
                               focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200
                               disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {helper && <p className="text-[11px] text-slate-600">{helper}</p>}
        </div>
    );
}

// ── Password Strength ─────────────────────────────────────────────────────────

function PasswordStrength({ password }) {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const label = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score - 1] || 'Very Weak';
    const colors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-400', 'bg-cyan-400', 'bg-emerald-500'];
    const color = colors[score - 1] || 'bg-rose-500';

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-slate-800'}`} />
                ))}
            </div>
            <p className={`text-[10px] font-mono ${color.replace('bg-', 'text-')}`}>{label}</p>
        </div>
    );
}

// ── Session Info ──────────────────────────────────────────────────────────────

function SessionCard({ user }) {
    const signedIn = user?.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : '—';
    const provider = user?.app_metadata?.provider || 'email';

    return (
        <div className="space-y-3">
            {[
                { icon: Fingerprint, label: 'Auth Provider', value: provider.charAt(0).toUpperCase() + provider.slice(1) },
                { icon: Globe, label: 'Email', value: user?.email || '—' },
                { icon: Clock, label: 'Last Sign-In', value: signedIn },
                { icon: Monitor, label: 'User ID', value: user?.id?.slice(0, 20) + '…', mono: true },
            ].map(({ icon: Icon, label, value, mono }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {label}
                    </div>
                    <span className={`text-xs text-slate-200 text-right max-w-[60%] break-all ${mono ? 'font-mono' : ''}`}>
                        {value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SecurityView({ user, onSignOut }) {
    const supabase = createClient();

    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const isOAuthUser = user?.app_metadata?.provider === 'google';

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleChangePassword = async () => {
        if (!newPw) { showToast('Please enter a new password.', 'error'); return; }
        if (newPw !== confirmPw) { showToast('New passwords do not match.', 'error'); return; }
        if (newPw.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }

        setSaving(true);
        try {
            // Supabase Auth updateUser — the user must be authenticated (session cookie is set)
            const { error } = await supabase.auth.updateUser({ password: newPw });
            if (error) throw error;
            setCurrentPw('');
            setNewPw('');
            setConfirmPw('');
            showToast('Password updated successfully', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to update password', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                        <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest text-slate-100 uppercase">Security</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage your password and active session</p>
                    </div>
                </div>

                {/* Current Session */}
                <div className="p-6 rounded-xl border border-cyan-500/10 bg-slate-950/40 backdrop-blur-sm space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-cyan-500/10 pb-3">
                        Active Session
                    </h3>
                    <SessionCard user={user} />

                    {/* Sign Out */}
                    <div className="pt-2">
                        <button
                            onClick={onSignOut}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-950/30 hover:border-rose-500/40 text-xs uppercase tracking-widest transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out of All Devices
                        </button>
                    </div>
                </div>

                {/* Password Change */}
                {isOAuthUser ? (
                    <div className="p-6 rounded-xl border border-slate-700/40 bg-slate-950/20 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 flex-shrink-0">
                            <KeyRound className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-amber-200">Google OAuth Account</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Your account uses Google Sign-In. Password management is handled by Google — visit your Google Account settings to change it.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 rounded-xl border border-cyan-500/10 bg-slate-950/40 backdrop-blur-sm space-y-5">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-cyan-500/10 pb-3">
                            Change Password
                        </h3>

                        <PasswordField
                            label="New Password"
                            value={newPw}
                            onChange={setNewPw}
                            placeholder="Enter new password"
                            helper="Minimum 8 characters"
                            disabled={saving}
                        />
                        {newPw && <PasswordStrength password={newPw} />}

                        <PasswordField
                            label="Confirm New Password"
                            value={confirmPw}
                            onChange={setConfirmPw}
                            placeholder="Repeat new password"
                            disabled={saving}
                        />

                        {/* Match indicator */}
                        <AnimatePresence>
                            {newPw && confirmPw && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className={`flex items-center gap-2 text-xs font-mono ${newPw === confirmPw ? 'text-emerald-400' : 'text-rose-400'}`}
                                >
                                    {newPw === confirmPw
                                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                                        : <><AlertCircle className="w-3.5 h-3.5" /> Passwords do not match</>
                                    }
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={(newPw && confirmPw && newPw === confirmPw) ? { scale: 1.015 } : {}}
                            whileTap={(newPw && confirmPw && newPw === confirmPw) ? { scale: 0.985 } : {}}
                            onClick={handleChangePassword}
                            disabled={saving || !newPw || !confirmPw || newPw !== confirmPw}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-300 ${newPw && confirmPw && newPw === confirmPw && !saving
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-200 hover:from-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.15)]'
                                    : 'bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            {saving ? 'Updating…' : 'Update Password'}
                        </motion.button>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="p-6 rounded-xl border border-rose-500/10 bg-rose-950/5 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-rose-400/70 border-b border-rose-500/10 pb-3">
                        Danger Zone
                    </h3>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-slate-200 font-medium">Delete Account</p>
                            <p className="text-xs text-slate-500 mt-1">Permanently delete your account and all uploaded genomic data. This action is irreversible.</p>
                        </div>
                        <button
                            onClick={() => setDeleteOpen(d => !d)}
                            className="flex-shrink-0 px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/60 text-xs uppercase tracking-widest transition-all"
                        >
                            Delete
                        </button>
                    </div>
                    <AnimatePresence>
                        {deleteOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="border border-rose-500/20 rounded-lg p-4 bg-rose-950/20"
                            >
                                <p className="text-xs text-rose-300 font-mono leading-relaxed">
                                    ⚠ To fully delete your account, please contact the system administrator or submit a data deletion request through your institution. Automated deletion is disabled in this research environment to preserve data integrity.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast key="toast" message={toast.message} type={toast.type} />}
            </AnimatePresence>
        </>
    );
}
