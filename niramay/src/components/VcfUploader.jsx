
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function VcfUploader({ onUploadComplete }) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const validateFile = async (file) => {
        // 1. Size Check (< 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be strictly less than 5MB");
        }

        // 2. Format Check (First 4KB)
        const chunk = file.slice(0, 4096);
        const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(chunk);
        });

        const lines = text.split('\n');
        const firstLine = lines[0] || "";

        // VCF Header Check
        if (!firstLine.startsWith("##fileformat=VCFv4")) {
            throw new Error("Invalid VCF: First line must convert to VCF version 4 (e.g., ##fileformat=VCFv4.2)");
        }

        // Column Header Check (#CHROM POS ID REF ALT)
        const hasUseableHeader = lines.some(line =>
            line.startsWith("#CHROM") &&
            line.includes("POS") &&
            line.includes("ID") &&
            line.includes("REF") &&
            line.includes("ALT")
        );

        if (!hasUseableHeader) {
            throw new Error("Invalid VCF: Header columns (#CHROM, POS, ID, REF, ALT) not found in first 4KB.");
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);

        try {
            await validateFile(file);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const filePath = `${user.id}/${Date.now()}_${file.name}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('vcf_uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Generate Signed URL
            const { data: signedUrlData, error: urlError } = await supabase.storage
                .from('vcf_uploads')
                .createSignedUrl(filePath, 60 * 60); // 1 hour

            if (urlError) throw urlError;

            // Save Metadata to Database
            const { error: dbError } = await supabase
                .from('genomic_files')
                .insert({
                    user_id: user.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    status: 'completed'
                });

            if (dbError) throw dbError;

            alert("Upload Successful!");
            if (onUploadComplete) onUploadComplete(signedUrlData.signedUrl);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 border rounded border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-medium mb-2">Upload VCF File</h3>
            <p className="text-sm text-muted-foreground mb-4">Max 5MB. Must be valid VCFv4.2 format.</p>

            <input
                type="file"
                accept=".vcf"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
            />

            {uploading && <p className="mt-2 text-blue-500">Uploading and Validating...</p>}
            {error && <p className="mt-2 text-red-500 font-medium">Error: {error}</p>}
        </div>
    );
}
