'use client';

import { useState } from 'react';

interface ResumeEditorProps {
    latex: string;
    setLatex: (val: string) => void;
    onPreviewUpdate: (url: string) => void;
    apiUrl: string;
}

export default function ResumeEditor({ latex, setLatex, onPreviewUpdate, apiUrl }: ResumeEditorProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'compiling'>('idle');

    const handleCompile = async () => {
        if (!apiUrl) return;

        setStatus('compiling');
        try {
            // Proxy: Compile/Preview
            const target = `${apiUrl}/preview`;
            const res = await fetch(`/api/proxy?target=${encodeURIComponent(target)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latex })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                onPreviewUpdate(url);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setStatus('idle');
        }
    };

    /**
     * "Save" in manual editor context acts as a "Checkpoint" locally for now, 
     * OR acts as a soft-save to filesystem.
     * Use POST /save explicitly if we want to persist to disk without committing.
     */
    const handleSave = async () => {
        if (!apiUrl) return;

        setStatus('saving');
        try {
            // Proxy: Save using POST /save (filesystem only, no commit)
            const target = `${apiUrl}/save`;
            const res = await fetch(`/api/proxy?target=${encodeURIComponent(target)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latex })
            });

            if (res.ok) {
                alert('Changes saved to server (not committed).');
            } else {
                alert('Failed to save changes.');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving changes.');
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-full">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <h3 className="text-white font-bold">Manual Editor</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={status !== 'idle'}
                        className="px-3 py-1 bg-green-700 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                        {status === 'saving' ? 'Saving...' : 'Save (Disk)'}
                    </button>
                    <button
                        onClick={handleCompile}
                        disabled={status !== 'idle'}
                        className="px-3 py-1 bg-zinc-800 text-white text-xs rounded hover:bg-zinc-700 disabled:opacity-50"
                    >
                        {status === 'compiling' ? 'Compiling...' : 'Refresh Preview'}
                    </button>
                </div>
            </div>
            <textarea
                className="flex-1 w-full bg-zinc-900 text-zinc-300 p-4 font-mono text-sm resize-none focus:outline-none"
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                spellCheck={false}
            />
        </div>
    );
}
