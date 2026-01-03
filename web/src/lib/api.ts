export interface UpdateResponse {
    status: string;
    latex?: string;
    pdfUrl?: string;
    error?: string;
}

export interface Commit {
    sha: string;
    message: string;
    author: string;
    date: string;
}

export interface CommitResponse {
    status: string;
    message?: string;
    error?: string;
}

export async function updateResume(
    instruction: string,
    job_description: string | undefined,
    baseUrl: string
): Promise<UpdateResponse> {
    if (!baseUrl) throw new Error('API URL not provided');

    // Proxy: Update (returns JSON now)
    const targetUrl = `${baseUrl}/update`;
    const proxyUrl = `/api/proxy?target=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instruction,
            job_description,
            commit: false // Never auto-commit from AI anymore
        }),
    });

    // The proxy always returns JSON for this endpoint now
    return response.json();
}

export async function commitChanges(
    message: string,
    baseUrl: string
): Promise<CommitResponse> {
    if (!baseUrl) throw new Error('API URL not provided');

    const targetUrl = `${baseUrl}/commit`;
    const proxyUrl = `/api/proxy?target=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    return response.json();
}

export async function getHistory(baseUrl: string): Promise<Commit[]> {
    if (!baseUrl) return [];

    const targetUrl = `${baseUrl}/history`;
    const proxyUrl = `/api/proxy?target=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
            return response.json();
        }
    } catch (e) {
        console.error("History fetch failed", e);
    }
    return [];
}
