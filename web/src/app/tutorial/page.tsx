'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Example {
    title: string;
    code: string;
    description: string;
}

const EXAMPLES: Example[] = [
    {
        title: 'Add a new job entry',
        code: `\\cventry
  {2024 -- Present}
  {Software Engineer}
  {Google}
  {Mountain View, CA}
  {}
  {
  \\begin{itemize}\\setlength{\\itemsep}{2pt}
    \\item Designed and implemented distributed systems serving 1M+ users.
    \\item Led migration from monolith to microservices architecture.
  \\end{itemize}
  }`,
        description: 'Use \\cventry for job entries. Format: {dates}{title}{company}{location}{}{description}',
    },
    {
        title: 'Add a skill item',
        code: `\\cvitem{Languages}{Python, TypeScript, Go, Rust}`,
        description: 'Use \\cvitem for simple key-value pairs like skills.',
    },
    {
        title: 'Add a certification',
        code: `\\cvitem{}{AWS Solutions Architect Professional}`,
        description: 'Leave the first argument empty for list-style items.',
    },
    {
        title: 'Add a project',
        code: `\\cventry
  {}
  {Open Source Contribution}
  {Kubernetes}
  {\\textit{\\url{https://github.com/kubernetes/kubernetes}}}
  {}
  {
  \\begin{itemize}\\setlength{\\itemsep}{2pt}
    \\item Contributed 50+ PRs to the scheduler component.
    \\item Fixed critical memory leak affecting large clusters.
  \\end{itemize}
  }`,
        description: 'Projects use the same \\cventry format. Use \\url{} for links.',
    },
];

const AI_PROMPTS = [
    {
        prompt: 'Add experience at Microsoft as a Senior SDE for 2 years working on Azure',
        result: 'AI will add a new \\cventry with Microsoft details.',
    },
    {
        prompt: 'Change my title from Cloud Engineer to DevOps Engineer',
        result: 'AI will find and replace the title in \\title{}.',
    },
    {
        prompt: 'Add AWS Solutions Architect certification',
        result: 'AI will add a \\cvitem under the Certifications section.',
    },
    {
        prompt: 'Remove the education section',
        result: 'AI will delete the \\section{Education} block.',
    },
];

const PDFLATEX_TIPS = [
    {
        title: 'Supported Packages',
        items: [
            'moderncv - Resume template',
            'newtxtext, newtxmath - professional fonts',
            'geometry - page margins',
            'hyperref - clickable links',
        ],
    },
    {
        title: 'Common Errors',
        items: [
            'Missing $ - math mode characters like % or _ need escaping (\\% or \\_)',
            'Undefined control sequence - typo in command name',
            'Missing \\end{itemize} - unclosed environment',
        ],
    },
    {
        title: 'pdflatex Limits',
        items: [
            'No custom system fonts (use newtx instead)',
            'Limited Unicode support',
            'Use fontenc for encoding',
        ],
    },
];

export default function TutorialPage() {
    const [selectedCode, setSelectedCode] = useState(EXAMPLES[0].code);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePreview = async () => {
        setIsLoading(true);
        setError(null);
        setPreviewUrl(null);

        // Wrap snippet in minimal document
        const fullDoc = `\\documentclass[10pt, a4paper, sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage{newtxtext}
\\usepackage[a4paper, margin=1.5cm]{geometry}
\\name{Example}{Resume}
\\begin{document}
\\makecvtitle
${selectedCode}
\\end{document}`;

        try {
            const res = await fetch('/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latex: fullDoc }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Compilation failed');
            }

            const blob = await res.blob();
            setPreviewUrl(URL.createObjectURL(blob));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="border-b border-zinc-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">LaTeX Resume Tutorial</h1>
                    <Link
                        href="/"
                        className="text-blue-400 hover:text-blue-300 transition"
                    >
                        ← Back to Editor
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">

                {/* Intro */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                    <p className="text-zinc-400 mb-4">
                        This editor uses <strong>TeX Live</strong> with <strong>pdflatex</strong> and
                        the <strong>moderncv</strong> package. Below are examples and tips to help you
                        edit your resume effectively.
                    </p>
                    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                        <p className="text-sm text-zinc-300">
                            <strong>Engine:</strong> pdflatex (fast, reliable)<br />
                            <strong>Template:</strong> moderncv with classic style<br />
                            <strong>Fonts:</strong> newtxtext (Times-like professional font)
                        </p>
                    </div>
                </section>

                {/* Interactive Examples */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">LaTeX Examples</h2>
                    <p className="text-zinc-400 mb-6">
                        Click an example to load it, edit if needed, then hit &quot;Try it&quot; to see a live preview.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left: Example selector + editor */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {EXAMPLES.map((ex, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedCode(ex.code)}
                                        className={`px-3 py-1.5 text-sm rounded transition ${selectedCode === ex.code
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                            }`}
                                    >
                                        {ex.title}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={selectedCode}
                                onChange={(e) => setSelectedCode(e.target.value)}
                                className="w-full h-64 bg-zinc-900 border border-zinc-700 rounded-lg p-4 font-mono text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                                spellCheck={false}
                            />

                            <button
                                onClick={handlePreview}
                                disabled={isLoading}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 rounded-lg font-medium transition"
                            >
                                {isLoading ? 'Compiling...' : 'Try it →'}
                            </button>

                            {error && (
                                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Right: Preview */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                            {previewUrl ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-96"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="h-96 flex items-center justify-center text-zinc-500">
                                    Click &quot;Try it&quot; to see preview
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* AI Prompts */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">AI Prompt Examples</h2>
                    <p className="text-zinc-400 mb-6">
                        The AI understands natural language. Here are some example prompts:
                    </p>

                    <div className="space-y-3">
                        {AI_PROMPTS.map((p, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                <p className="font-mono text-blue-400 mb-2">&quot;{p.prompt}&quot;</p>
                                <p className="text-sm text-zinc-500">→ {p.result}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* pdflatex Tips */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">pdflatex Tips</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {PDFLATEX_TIPS.map((section, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                <h3 className="font-bold mb-3 text-zinc-200">{section.title}</h3>
                                <ul className="space-y-2 text-sm text-zinc-400">
                                    {section.items.map((item, j) => (
                                        <li key={j}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Reference */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Quick Reference</h2>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 font-mono text-sm">
                        <pre className="text-zinc-300 overflow-x-auto">{`\\section{Section Name}        % Creates a section header

\\cventry                      % Job/Education/Project entry
  {dates}                     % When
  {title}                     % Job title
  {company}                   % Organization
  {location}                  % City, Country
  {}                          % Grade (optional)
  {description}               % Details (use \\begin{itemize}...)

\\cvitem{Label}{Value}        % Simple key-value pair

\\url{https://...}            % Clickable link
\\textit{text}                % Italic text
\\textbf{text}                % Bold text
\\%                            % Escaped percent sign
\\_                            % Escaped underscore`}</pre>
                    </div>
                </section>

            </main>
        </div>
    );
}
