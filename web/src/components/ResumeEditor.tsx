'use client';

import { useState, useEffect } from 'react';

interface ResumeEditorProps {
    onPreviewUpdate: (url: string) => void;
    apiUrl: string;
}

export default function ResumeEditor({ onPreviewUpdate, apiUrl }: ResumeEditorProps) {
    const [latex, setLatex] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'compiling'>('idle');

    useEffect(() => {
        // Fetch current resume on mount
        async function fetchResume() {
            if (!apiUrl) return;

            try {
                const res = await fetch(`${apiUrl}/resume`);
                if (res.ok) {
                    const text = await res.text();
                    setLatex(text);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchResume();
    }, [apiUrl]);

    const handleCompile = async () => {
        if (!apiUrl) return;

        setStatus('compiling');
        try {
            const res = await fetch(`${apiUrl}/preview`, {
                method: 'POST',
                body: JSON.stringify({ latex })
            });
            if (res.ok) {
                const data = await res.json(); // Assuming preview returns { url: ... } or raw PDF blob? 
                // Wait, compute/main.ts returns a Response(file). So it's a blob.
                // We need to handle blob URL creation here if main.ts returns raw PDF.
                // Let's assume for now api returns object for consistency or we adjust main.ts.

                // ADJUSTMENT: main.ts returns `new Response(file)`. That is a BLOB.
                // We need to create object URL.
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

    const handleSave = async () => {
        if (!apiUrl) return;

        setStatus('saving');
        try {
            const res = await fetch(`${apiUrl}/save`, {
                method: 'POST',
                body: JSON.stringify({ latex, message: 'Manual update via Editor' })
            });
            if (res.ok) {
                alert('Changes saved successfully!');
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
                        {status === 'saving' ? 'Saving...' : 'Save Changes'}
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
