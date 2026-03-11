"use client";

import { useState, useRef } from "react";
import { Upload, X, FileVideo } from "lucide-react";
import { clsx } from "clsx";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
}

export default function UploadZone({ onFileSelect, selectedFile, onClear }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("video/")) {
            onFileSelect(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    if (selectedFile) {
        return (
            <div className="card p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                    <div className="bg-accent-dim p-3 rounded-lg">
                        <FileVideo className="text-accent w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-mono text-sm uppercase tracking-wider text-text-primary truncate max-w-[200px]">
                            {selectedFile.name}
                        </p>
                        <p className="font-mono text-xs text-text-muted mt-1">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClear}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-error"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
                "card p-12 flex flex-col items-center justify-center gap-4 cursor-pointer border-dashed border-2 transition-all",
                isDragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-border hover:border-border-hover"
            )}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                accept=".mp4,.mov,.webm,.mkv,.m4v"
                className="hidden"
            />
            <div className="bg-elevated p-4 rounded-full">
                <Upload className="text-accent w-8 h-8" />
            </div>
            <div className="text-center">
                <p className="text-text-primary font-syne font-bold uppercase tracking-widest">
                    Drop your video file
                </p>
                <p className="text-text-secondary text-sm mt-1 font-mono">
                    MP4, MOV, WEBM (UP TO 2GB)
                </p>
            </div>
        </div>
    );
}
