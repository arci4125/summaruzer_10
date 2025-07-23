import { OutputType } from '../components/OutputTypeSelector';

export async function generateContent(
    documentContent: string | { mimeType: string; data: string }[], 
    outputType: OutputType
): Promise<string> {
  try {
    // The backend is expected to be running on the same host or proxied.
    // This relative URL will work if the static host (e.g., Firebase Hosting)
    // is configured to proxy /api requests to the Cloud Run service.
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentContent,
            outputType,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
        // Provide a more user-friendly error message
        throw new Error(`Failed to communicate with the server. Status: ${response.status}. Message: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    if (!data.text) {
        throw new Error("Received an invalid response from the server.");
    }
    
    return data.text;

  } catch (error) {
    console.error(`Error calling backend service:`, error);
    // Re-throw a clean error for the UI to catch
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while communicating with the backend service.");
  }
}
