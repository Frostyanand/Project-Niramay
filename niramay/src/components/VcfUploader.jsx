
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VcfUploader() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        setError(null);
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit.");
            return;
        }
        // Basic extension check
        if (!selectedFile.name.toLowerCase().endsWith('.vcf') && !selectedFile.name.toLowerCase().endsWith('.vcf.gz')) {
            setError("Invalid file type. Please upload a .vcf or .vcf.gz file.");
            return;
        }

        setFile(selectedFile);
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Upload Genetic Data</CardTitle>
                <CardDescription>Drag and drop your VCF file here to begin analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:bg-muted/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={onButtonClick}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".vcf,.vcf.gz"
                        onChange={handleChange}
                    />

                    {file ? (
                        <div className="text-center p-4 space-y-2">
                            <FileText className="w-12 h-12 mx-auto text-primary" />
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</Button>
                        </div>
                    ) : (
                        <div className="text-center p-4 space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-sm font-medium">Drag & drop or click to upload</p>
                            <p className="text-xs text-muted-foreground">Supported formats: .vcf, .vcf.gz</p>
                        </div>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Max file size: 5MB</span>
                <Button disabled={!file}>Analyze Data</Button>
            </CardFooter>
        </Card>
    );
}
