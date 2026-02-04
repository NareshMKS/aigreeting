/**
 * AI Greeting Service – abstracted layer for AI text generation.
 *
 * Provider name and endpoint are configurable (placeholder implementation).
 * Replace the implementation with a real API client when integrating
 * OpenAI, Anthropic, or another provider.
 */

/** Configurable provider name – change when wiring a real API */
export const AI_PROVIDER_NAME = 'OpenAI'; // e.g. 'OpenAI' | 'Anthropic' | 'Custom'

export interface GreetingInput {
  name: string;
  occasion: string;
  tone: string;
  customMessage?: string;
}

export interface GreetingResult {
  text: string;
  provider: string;
}

/**
 * Generate a short greeting using the configured AI provider.
 * Current implementation is a placeholder that returns deterministic
 * text based on inputs. Replace with actual API calls.
 *
 * @param input - Name, occasion, tone, optional custom message
 * @returns Short greeting text and provider name
 */
export async function generateGreeting(input: GreetingInput): Promise<GreetingResult> {
  // Placeholder: simulate network delay
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));

  // Placeholder logic – replace with real API call, e.g.:
  // const response = await fetch(AI_API_ENDPOINT, { ... });
  const parts: string[] = [];
  if (input.tone.toLowerCase().includes('formal')) {
    parts.push(`Dear ${input.name},`);
    parts.push(`Wishing you a wonderful ${input.occasion}.`);
  } else if (input.tone.toLowerCase().includes('funny')) {
    parts.push(`Hey ${input.name}!`);
    parts.push(`Happy ${input.occasion}! Hope it’s the best one yet.`);
  } else {
    parts.push(`Hi ${input.name}!`);
    parts.push(`Happy ${input.occasion}! Sending you warm wishes.`);
  }
  if (input.customMessage?.trim()) {
    parts.push(input.customMessage.trim());
  }

  return {
    text: parts.join('\n\n'),
    provider: AI_PROVIDER_NAME,
  };
}

/**
 * Generate greetings for multiple recipients (e.g. from CSV rows).
 * Processes in sequence to avoid rate limits; can be extended to batch.
 */
export async function generateGreetingsForRecipients(
  inputs: GreetingInput[],
  onProgress?: (index: number, total: number) => void
): Promise<{ index: number; text: string }[]> {
  const results: { index: number; text: string }[] = [];
  const total = inputs.length;

  for (let i = 0; i < total; i++) {
    onProgress?.(i, total);
    const { text } = await generateGreeting(inputs[i]);
    results.push({ index: i, text });
  }

  onProgress?.(total, total);
  return results;
}
