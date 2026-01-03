export interface UpdateResponse {
    status: string;
    new_sha: string;
    conversation_id: string;
}

// Removed static API_URL

export async function updateResume(
    instruction: string,
    job_description: string | undefined,
    baseUrl: string,
    commit: boolean = true
): Promise<UpdateResponse> {
    if (!baseUrl) {
        throw new Error('API URL not provided');
    }

    // Use the local Next.js proxy to avoid Mixed Content (HTTPS -> HTTP)
    const targetUrl = `${baseUrl}/update`;
    const proxyUrl = `/api/proxy?target=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instruction, job_description, commit }),
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

