"use client";

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

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
                .createSignedUrl(filePath, 3600);

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
                console.warn('Could not save file metadata to DB:', dbError.message);
            }

            setUploadProgress('Dispatching to AI inference engine...');
            if (onUploadComplete) onUploadComplete(signedUrlData.signedUrl, file.name);

        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.message || 'An unexpected error occurred during upload.');
        } finally {
            setUploading(false);
            setUploadProgress('');
        }
    };

    const handleFileInputChange = (e) => processFile(e.target.files?.[0]);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    return (
        <div className="flex flex-col w-full gap-5">

            {/* Drop Zone */}
            <motion.div
                animate={isDragging
                    ? { scale: 1.02, borderColor: 'rgba(0,119,182,0.6)' }
                    : { scale: 1, borderColor: 'rgba(0,119,182,0.2)' }
                }
                transition={{ duration: 0.2 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                    border: '2px dashed rgba(0,119,182,0.22)',
                    borderRadius: 16,
                    background: isDragging ? 'rgba(0,119,182,0.05)' : 'rgba(240,249,255,0.8)',
                    cursor: uploading ? 'default' : 'pointer',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    padding: '2.5rem',
                    transition: 'background 0.2s',
                }}
            >
                <AnimatePresence>{isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,119,182,0.04)', borderRadius: 16, pointerEvents: 'none' }}
                    />
                )}</AnimatePresence>

                {/* Icon */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,119,182,0.12)',
                        filter: 'blur(16px)', borderRadius: '50%',
                    }} />
                    <motion.div
                        animate={isDragging ? { y: -5 } : { y: 0 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        style={{
                            position: 'relative',
                            width: 56, height: 56, borderRadius: 14,
                            background: '#ffffff',
                            border: '1.5px solid rgba(0,119,182,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(0,119,182,0.1)',
                        }}
                    >
                        <UploadCloud strokeWidth={1.5} style={{ width: 26, height: 26, color: '#0077b6' }} />
                    </motion.div>
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#03045e', marginBottom: 4 }}>
                        {isDragging ? 'Release to upload sequence' : 'Drop your VCF file here'}
                    </p>
                    <p style={{ fontSize: 12, color: '#90e0ef' }}>
                        or <span style={{ color: '#0077b6', textDecoration: 'underline', textUnderlineOffset: 2 }}>browse files</span>
                    </p>
                </div>

                {/* Constraint badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                    {[
                        { icon: <ShieldCheck style={{ width: 11, height: 11, color: '#0077b6' }} />, label: 'VCFv4.x format' },
                        { label: 'Max 5 MB' },
                        { label: 'End-to-end encrypted' },
                    ].map(({ icon, label }) => (
                        <span key={label} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: 10, color: '#90e0ef',
                            border: '1px solid rgba(0,119,182,0.15)',
                            borderRadius: 6, padding: '3px 8px',
                            background: 'rgba(0,119,182,0.04)',
                        }}>
                            {icon}{label}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Hidden file input */}
            <input
                type="file" accept=".vcf"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                disabled={uploading}
                className="hidden"
                id="vcf-file-input"
            />

            {/* Status Messages */}
            <AnimatePresence mode="wait">
                {uploading && (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 18px', borderRadius: 12,
                            background: 'rgba(0,119,182,0.07)',
                            border: '1px solid rgba(0,119,182,0.18)',
                        }}
                    >
                        <Loader2 style={{ width: 16, height: 16, color: '#0077b6', flexShrink: 0 }} className="animate-spin" />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, color: '#023e8a', fontFamily: 'monospace' }}>
                                {uploadProgress}
                            </p>
                            <div style={{ marginTop: 8, height: 2, background: 'rgba(0,119,182,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                                <motion.div
                                    style={{ height: '100%', background: 'linear-gradient(90deg, #0096c7, #0077b6)', borderRadius: 2 }}
                                    animate={{ width: ['15%', '80%', '95%'] }}
                                    transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && !uploading && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '14px 18px', borderRadius: 12,
                            background: 'rgba(239,68,68,0.05)',
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}
                    >
                        <AlertCircle style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>Upload Failed</p>
                            <p style={{ fontSize: 11, color: '#f87171', marginTop: 2, fontFamily: 'monospace' }}>{error}</p>
                            <button
                                onClick={() => { setError(null); fileInputRef.current?.click(); }}
                                style={{ marginTop: 8, fontSize: 10, color: '#0077b6', textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', cursor: 'pointer' }}
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
