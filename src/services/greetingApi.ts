import { GenerationResponse, SingleGreetingRequest } from '@/types/greeting';

const API_BASE = '/api/greetings';

export async function generateSingleGreeting(data: SingleGreetingRequest): Promise<GenerationResponse> {
  const response = await fetch(`${API_BASE}/single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate greeting');
  }

  return response.json();
}

export async function generateBulkGreetings(file: File, templateId: string): Promise<GenerationResponse> {
  const formData = new FormData();
  formData.append('File', file);
  formData.append('templateId', templateId);

  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate greetings');
  }

  return response.json();
}