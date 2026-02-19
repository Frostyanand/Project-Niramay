"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabaseClient';
import {
    User, Building2, Stethoscope, FileText,
    Save, CheckCircle2, AlertCircle, Loader2,
    Mail, Calendar, Hash, Edit3,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
}

// ── Input Field ───────────────────────────────────────────────────────────────

function Field({ label, icon: Icon, children, optional }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-500/60">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
                {optional && <span className="text-slate-600 normal-case tracking-normal">optional</span>}
            </label>
            {children}
        </div>
    );
}

function TextInput({ value, onChange, placeholder, disabled, multiline, rows = 3 }) {
    const base = `w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 
                  focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed`;
    if (multiline) {
        return (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`${base} resize-none`}
            />
        );
    }
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={base}
        />
    );
}

// ── Toast Notification ────────────────────────────────────────────────────────

function Toast({ message, type }) {
    const isSuccess = type === 'success';
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium ${isSuccess
                    ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                }`}
        >
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {message}
        </motion.div>
    );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function AvatarDisplay({ user, profile }) {
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const initials = (profile?.full_name || user?.user_metadata?.full_name || user?.email || '?')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="relative">
            {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-cyan-500/30 object-cover" />
            ) : (
                <div className="w-20 h-20 rounded-full border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-900 to-slate-800 flex items-center justify-center text-2xl font-bold text-cyan-300">
                    {initials}
                </div>
            )}
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950" title="Online" />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProfileView({ user }) {
    const supabase = createClient();

    // Form state
    const [fullName, setFullName] = useState('');
    const [institution, setInstitution] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [bio, setBio] = useState('');

    // UI state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [original, setOriginal] = useState({});

    // ── Load existing profile ──
    useEffect(() => {
        if (!user) return;
        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_profiles')
                .select('full_name, institution, specialty, bio, avatar_url')
                .eq('id', user.id)
                .single();

            if (data) {
                const vals = {
                    fullName: data.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
                    institution: data.institution || '',
                    specialty: data.specialty || '',
                    bio: data.bio || '',
                };
                setFullName(vals.fullName);
                setInstitution(vals.institution);
                setSpecialty(vals.specialty);
                setBio(vals.bio);
                setOriginal(vals);
            } else {
                // No profile row yet — pre-fill from auth metadata
                const fallback = {
                    fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
                    institution: '',
                    specialty: '',
                    bio: '',
                };
                setFullName(fallback.fullName);
                setOriginal(fallback);
            }
            setLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Track dirtiness
    useEffect(() => {
        setIsDirty(
            fullName !== (original.fullName ?? '') ||
            institution !== (original.institution ?? '') ||
            specialty !== (original.specialty ?? '') ||
            bio !== (original.bio ?? '')
        );
    }, [fullName, institution, specialty, bio, original]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSave = async () => {
        if (!user || !isDirty) return;
        setSaving(true);
        try {
            const payload = {
                id: user.id,
                full_name: fullName.trim(),
                institution: institution.trim(),
                specialty: specialty.trim(),
                bio: bio.trim(),
                updated_at: new Date().toISOString(),
            };

            // Upsert into user_profiles
            const { error } = await supabase
                .from('user_profiles')
                .upsert(payload, { onConflict: 'id' });

            if (error) throw error;

            // Also update Supabase Auth display name so the session reflects it
            if (fullName.trim() && fullName.trim() !== user.user_metadata?.full_name) {
                await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
            }

            const newVals = { fullName, institution, specialty, bio };
            setOriginal(newVals);
            setIsDirty(false);
            showToast('Profile saved successfully', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to save profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setFullName(original.fullName ?? '');
        setInstitution(original.institution ?? '');
        setSpecialty(original.specialty ?? '');
        setBio(original.bio ?? '');
        setIsDirty(false);
    };

    const inputProps = (val, setter) => ({
        value: val, onChange: setter, disabled: saving || loading,
    });

    if (!user) return null;

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Page header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                        <User className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest text-slate-100 uppercase">Profile</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage your researcher identity</p>
                    </div>
                    {isDirty && (
                        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                            className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-amber-400 border border-amber-500/20 rounded-full px-3 py-1">
                            <Edit3 className="w-2.5 h-2.5" /> Unsaved changes
                        </motion.div>
                    )}
                </div>

                {/* Avatar + read-only account info */}
                <div className="p-6 rounded-xl border border-cyan-500/10 bg-slate-950/40 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        {loading ? (
                            <div className="w-20 h-20 rounded-full bg-slate-800 animate-pulse" />
                        ) : (
                            <AvatarDisplay user={user} profile={{ avatar_url: null }} />
                        )}
                        <div className="space-y-1.5">
                            <p className="text-slate-100 font-semibold text-lg">
                                {fullName || <span className="text-slate-500 italic">No name set</span>}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail className="w-3 h-3" />
                                <span className="font-mono">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                <span>Member since {formatDate(user.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Hash className="w-3 h-3" />
                                <span className="font-mono truncate max-w-xs">{user.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable fields */}
                <div className="p-6 rounded-xl border border-cyan-500/10 bg-slate-950/40 backdrop-blur-sm space-y-6">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-cyan-500/10 pb-3">
                        Researcher Identity
                    </h3>

                    {loading ? (
                        <div className="space-y-4">
                            {[80, 60, 60, 100].map((w, i) => (
                                <div key={i} className={`h-10 bg-slate-800 rounded-lg animate-pulse w-${w}`} style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <Field label="Full Name" icon={User}>
                                <TextInput {...inputProps(fullName, setFullName)} placeholder="Dr. Jane Smith" />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="Institution" icon={Building2} optional>
                                    <TextInput {...inputProps(institution, setInstitution)} placeholder="AIIMS, IIT Delhi…" />
                                </Field>
                                <Field label="Specialty" icon={Stethoscope} optional>
                                    <TextInput {...inputProps(specialty, setSpecialty)} placeholder="Oncology, Cardiology…" />
                                </Field>
                            </div>

                            <Field label="Bio" icon={FileText} optional>
                                <TextInput {...inputProps(bio, setBio)} placeholder="Brief description of your research focus…" multiline rows={3} />
                            </Field>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <AnimatePresence>
                        {isDirty && (
                            <motion.button
                                key="discard"
                                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                                onClick={handleDiscard}
                                className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs uppercase tracking-widest transition-all"
                            >
                                Discard
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <motion.button
                        whileHover={isDirty ? { scale: 1.015 } : {}}
                        whileTap={isDirty ? { scale: 0.985 } : {}}
                        onClick={handleSave}
                        disabled={!isDirty || saving || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-300 ${isDirty && !saving
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-200 hover:from-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.15)]'
                                : 'bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save Profile'}
                    </motion.button>
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast key="toast" message={toast.message} type={toast.type} />}
            </AnimatePresence>
        </>
    );
}
