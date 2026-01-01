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

    const response = await fetch(`${baseUrl}/update`, {
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

