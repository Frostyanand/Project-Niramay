"use client";

import { motion } from 'framer-motion';
import {
    FileSearch, AlertCircle, CloudOff, ShieldAlert, RefreshCcw, FileWarning, Dna
} from 'lucide-react';

const variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95 }
};

const StatusView = ({ icon: Icon, title, description, action, type = 'neutral' }) => {
    const colors = {
        neutral: {
            bg: 'bg-slate-900/50',
            border: 'border-slate-800',
            iconBg: 'bg-slate-800/50',
            iconColor: 'text-slate-400',
            title: 'text-slate-200',
            desc: 'text-slate-500',
            button: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        },
        warning: {
            bg: 'bg-amber-950/10',
            border: 'border-amber-500/10',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            title: 'text-amber-100',
            desc: 'text-amber-500/80',
            button: 'text-amber-400 hover:text-amber-200 hover:bg-amber-500/20'
        },
        error: {
            bg: 'bg-rose-950/10',
            border: 'border-rose-500/10',
            iconBg: 'bg-rose-500/10',
            iconColor: 'text-rose-400',
            title: 'text-rose-100',
            desc: 'text-rose-400/80',
            button: 'text-rose-400 hover:text-rose-200 hover:bg-rose-500/20'
        },
        info: {
            bg: 'bg-cyan-950/10',
            border: 'border-cyan-500/10',
            iconBg: 'bg-cyan-500/10',
            iconColor: 'text-cyan-400',
            title: 'text-cyan-100',
            desc: 'text-cyan-500/80',
            button: 'text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/20'
        }
    };

    const theme = colors[type];

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex flex-col items-center justify-center p-8 rounded-xl border ${theme.border} ${theme.bg} text-center h-full min-h-[250px]`}
        >
            <div className={`p-4 rounded-full ${theme.iconBg} mb-4`}>
                <Icon className={`w-8 h-8 ${theme.iconColor}`} strokeWidth={1.5} />
            </div>

            <h3 className={`text-sm font-medium tracking-wide uppercase ${theme.title} mb-2`}>
                {title}
            </h3>

            <p className={`text-sm ${theme.desc} max-w-xs leading-relaxed mb-6`}>
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className={`px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border border-transparent hover:border-current ${theme.button}`}
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
};

export const EmptyState = ({ onAction }) => (
    <StatusView
        icon={FileSearch}
        title="No Clinical Data"
        description="Awaiting genomic sequence upload. Upload a VCF file to initiate risk assessment."
        action={onAction ? { label: "Upload Sequence", onClick: onAction } : null}
        type="neutral"
    />
);

export const InvalidFileState = ({ onRetry }) => (
    <StatusView
        icon={FileWarning}
        title="Format Incompatible"
        description="The uploaded file structure does not match standard VCF 4.2 specifications."
        action={{ label: "View Requirements", onClick: onRetry }}
        type="warning"
    />
);

export const UploadErrorState = ({ onRetry }) => (
    <StatusView
        icon={CloudOff}
        title="Transmission Failed"
        description="Secure connection to the analysis cluster was interrupted. Data integrity check failed."
        action={{ label: "Retry Secure Upload", onClick: onRetry }}
        type="error"
    />
);

export const AuthExpiredState = ({ onLogin }) => (
    <StatusView
        icon={ShieldAlert}
        title="Session Terminated"
        description="Security token has expired. Re-authentication is required to access patient data."
        action={{ label: "Restore Session", onClick: onLogin }}
        type="error" // Could be warning, but security usually warrants higher alert
    />
);

export const LoadingState = () => (
    <div className="flex flex-col items-center justify-center p-12 h-64 min-h-[250px] w-full rounded-xl border border-cyan-500/10 bg-slate-900/30 backdrop-blur-sm">
        <div className="relative mb-6">
            {/* DNA Helix Rotation */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="relative z-10"
            >
                <Dna className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" strokeWidth={1} />
            </motion.div>

            {/* Subtle Pulse Glow */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse -z-10"></div>
        </div>

        <div className="space-y-2 text-center">
            <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-cyan-400 text-xs font-medium tracking-[0.2em] uppercase"
            >
                Analyzing genomic risk...
            </motion.p>
        </div>
    </div>
);
