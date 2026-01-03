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

// Same-origin API calls - no proxy needed
export async function updateResume(
    instruction: string,
    job_description: string | undefined,
    baseUrl: string
): Promise<UpdateResponse> {
    const response = await fetch(`${baseUrl}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instruction,
            job_description,
            commit: false
        }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    } else {
        const text = await response.text();
        throw new Error(text || `API Error: ${response.statusText}`);
    }
}

export async function commitChanges(
    message: string,
    baseUrl: string
): Promise<CommitResponse> {
    const response = await fetch(`${baseUrl}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    return response.json();
}

export async function getHistory(baseUrl: string): Promise<Commit[]> {
    try {
        const response = await fetch(`${baseUrl}/history`);
        if (response.ok) {
            return response.json();
        }
    } catch (e) {
        console.error("History fetch failed", e);
    }
    return [];
}
