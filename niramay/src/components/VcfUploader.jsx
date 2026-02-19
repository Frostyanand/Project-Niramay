"use client";

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileCheck2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function VcfUploader({ onUploadComplete }) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef(null);

    const validateFile = async (file) => {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be strictly less than 5MB.");
        }
        const chunk = file.slice(0, 4096);
        const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(chunk);
        });

        const lines = text.split('\n');
        const firstLine = lines[0] || "";

        if (!firstLine.startsWith("##fileformat=VCFv4")) {
            throw new Error("Invalid VCF: First line must be '##fileformat=VCFv4.x'.");
        }

        const hasHeader = lines.some(line =>
            line.startsWith("#CHROM") &&
            line.includes("POS") &&
            line.includes("ID") &&
            line.includes("REF") &&
            line.includes("ALT")
        );

        if (!hasHeader) {
            throw new Error("Invalid VCF: Missing required column header (#CHROM, POS, ID, REF, ALT).");
        }
    };

    const processFile = async (file) => {
        if (!file) return;

        setError(null);
        setUploading(true);
        setUploadProgress('Validating genomic format...');

        try {
            await validateFile(file);

            setUploadProgress('Authenticating session...');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User authentication required. Please sign in again.");

            const filePath = `${user.id}/${Date.now()}_${file.name}`;

            setUploadProgress('Encrypting & transmitting to secure vault...');
            const { error: uploadError } = await supabase.storage
                .from('vcf_uploads')
                .upload(filePath, file, { upsert: false });

            if (uploadError) throw uploadError;

            setUploadProgress('Generating secure signed URL...');
            const { data: signedUrlData, error: urlError } = await supabase.storage
                .from('vcf_uploads')
                .createSignedUrl(filePath, 3600); // 1-hour token

            if (urlError) throw urlError;

            setUploadProgress('Recording metadata...');
            const { error: dbError } = await supabase
                .from('genomic_files')
                .insert({
                    user_id: user.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    status: 'processing',
                });

            if (dbError) {
                // Non-critical: log the DB error but don't block the analysis flow
                console.warn('Could not save file metadata to DB:', dbError.message);
            }

            setUploadProgress('Dispatching to AI inference engine...');
            if (onUploadComplete) onUploadComplete(signedUrlData.signedUrl);

        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.message || 'An unexpected error occurred during upload.');
        } finally {
            setUploading(false);
            setUploadProgress('');
        }
    };

    const handleFileInputChange = (e) => {
        processFile(e.target.files?.[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4 py-4">
            {/* Drop Zone */}
            <motion.div
                animate={isDragging
                    ? { scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.7)' }
                    : { scale: 1, borderColor: 'rgba(6, 182, 212, 0.2)' }}
                transition={{ duration: 0.2 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
                    relative w-full border-2 border-dashed rounded-xl
                    flex flex-col items-center justify-center gap-4 p-8
                    cursor-pointer group transition-colors duration-300
                    min-h-[200px]
                    ${isDragging
                        ? 'bg-cyan-950/30'
                        : 'bg-slate-900/50 hover:bg-cyan-950/10 hover:border-cyan-500/50'
                    }
                `}
            >
                {/* Animated background glow on drag */}
                <AnimatePresence>
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-cyan-500/5 rounded-xl pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-500/30 transition-colors" />
                    <motion.div
                        animate={isDragging ? { y: -4 } : { y: 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        className="relative w-14 h-14 rounded-xl bg-slate-800/80 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors"
                    >
                        <UploadCloud className="w-7 h-7 text-cyan-400" strokeWidth={1.5} />
                    </motion.div>
                </div>

                {/* Text */}
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {isDragging ? 'Release to upload sequence' : 'Drop VCF file here'}
                    </p>
                    <p className="text-xs text-slate-500">
                        or <span className="text-cyan-400 underline underline-offset-2">browse files</span>
                    </p>
                </div>

                {/* Constraints */}
                <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 border border-slate-800 rounded px-2 py-1">
                        <ShieldCheck className="w-3 h-3 text-cyan-700" />
                        VCFv4.x format
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 border border-slate-800 rounded px-2 py-1">
                        Max 5 MB
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 border border-slate-800 rounded px-2 py-1">
                        End-to-end encrypted
                    </span>
                </div>
            </motion.div>

            {/* Hidden file input */}
            <input
                type="file"
                accept=".vcf"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                disabled={uploading}
                className="hidden"
                id="vcf-file-input"
            />

            {/* Upload Status */}
            <AnimatePresence mode="wait">
                {uploading && (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20"
                    >
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-cyan-300 font-mono">{uploadProgress}</p>
                            <div className="mt-1.5 h-0.5 w-full bg-slate-800 rounded overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded"
                                    animate={{ width: ['20%', '80%', '95%'] }}
                                    transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && !uploading && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-3 w-full px-4 py-3 rounded-lg bg-rose-950/20 border border-rose-500/30"
                    >
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-rose-300">Upload Failed</p>
                            <p className="text-xs text-rose-400/80 mt-0.5 font-mono">{error}</p>
                            <button
                                onClick={() => { setError(null); fileInputRef.current?.click(); }}
                                className="mt-2 text-[10px] text-rose-400 hover:text-rose-200 underline underline-offset-2"
                            >
                                Try again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
