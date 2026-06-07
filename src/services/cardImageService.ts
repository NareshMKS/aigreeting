import { buildGreetingPrompt, type GreetingContentInput } from './greetingContent';
import { generateEditedImage } from './imageEditService';
import { renderGreetingOnImage } from './localCardRenderer';

export type ImageGenerationMode = 'free' | 'gemini' | 'auto';

export interface CardImageRequest extends GreetingContentInput {
  image: Blob;
}

function getImageMode(): ImageGenerationMode {
  const raw = (import.meta.env.VITE_IMAGE_MODE as string | undefined)?.trim().toLowerCase();
  if (raw === 'free' || raw === 'gemini' || raw === 'auto') return raw;
  return 'auto';
}

function isQuotaUnavailableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /limit:\s*0/i.test(message) || /not available on your current plan/i.test(message);
}

/**
 * Generate a personalized greeting card image.
 * - free: browser canvas only (no API, always works)
 * - gemini: Gemini image API only
 * - auto (default): try Gemini, fall back to free canvas on quota errors
 */
export async function generateCardImage(request: CardImageRequest): Promise<string> {
  const mode = getImageMode();
  const { image, ...content } = request;

  if (mode === 'free') {
    return renderGreetingOnImage(image, content);
  }

  try {
    return await generateEditedImage({
      image,
      prompt: buildGreetingPrompt(content),
    });
  } catch (err) {
    if (mode === 'auto' && isQuotaUnavailableError(err)) {
      // eslint-disable-next-line no-console
      console.warn('Gemini image quota unavailable — using free local generation.');
      return renderGreetingOnImage(image, content);
    }
    throw err;
  }
}
