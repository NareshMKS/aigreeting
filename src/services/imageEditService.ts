const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

function getGeminiApiKey(): string | undefined {
  const raw = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!raw) return undefined;
  return raw.trim().replace(/^["']|["']$/g, "");
}

/** New AQ.* keys from AI Studio may need Bearer auth; legacy AIza* keys use x-goog-api-key. */
function getGeminiAuthAttempts(apiKey: string): Record<string, string>[] {
  if (apiKey.startsWith("AQ.")) {
    return [
      { Authorization: `Bearer ${apiKey}` },
      { "x-goog-api-key": apiKey },
    ];
  }
  return [{ "x-goog-api-key": apiKey }];
}

function formatGeminiError(status: number, errorText: string): string {
  let message = `Gemini API request failed with status ${status}`;
  try {
    const errorJson = JSON.parse(errorText);
    message = errorJson.error?.message || message;
  } catch {
    message = errorText || message;
  }

  if (status === 429 && /limit:\s*0/i.test(message)) {
    return (
      "Gemini image generation is not available on your current plan (free-tier limit is 0). " +
      "Enable billing in Google AI Studio (https://aistudio.google.com/) and link a payment method, " +
      "then create a new API key and try again. Monitor usage at https://ai.dev/rate-limit"
    );
  }

  if (status === 429) {
    const retryMatch = message.match(/retry in ([\d.]+)s/i);
    if (retryMatch) {
      const seconds = Math.ceil(Number(retryMatch[1]));
      return `Gemini rate limit reached. Wait about ${seconds} seconds and try again.`;
    }
  }

  return message;
}

async function callGeminiApi(
  apiKey: string,
  payload: Record<string, unknown>
): Promise<Response> {
  const attempts = getGeminiAuthAttempts(apiKey);
  let lastResponse: Response | null = null;

  for (const authHeaders of attempts) {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response;
    }

    lastResponse = response;
    if (response.status !== 401 && response.status !== 403) {
      return response;
    }
  }

  return lastResponse!;
}

/**
 * Converts a Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1] || base64String;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Determines MIME type from Blob
 */
function getMimeType(blob: Blob): string {
  return blob.type || "image/jpeg";
}

export interface ImageEditRequest {
  image: Blob;
  prompt: string;
  loraAdapter?: string;
  seed?: number;
  randomizeSeed?: boolean;
  guidanceScale?: number;
  steps?: number;
}

/**
 * Call the Gemini API for image editing.
 * Expects a Blob image and a fully-formed prompt string.
 * Returns a data URL string of the generated image.
 * 
 * Note: loraAdapter, seed, randomizeSeed, guidanceScale, and steps parameters
 * are kept for interface compatibility but are not used by the Gemini API.
 */
export async function generateEditedImage({
  image,
  prompt,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loraAdapter: _loraAdapter = "Photo-to-Anime",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  seed: _seed = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  randomizeSeed: _randomizeSeed = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  guidanceScale: _guidanceScale = 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  steps: _steps = 4,
}: ImageEditRequest): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key (VITE_GEMINI_API_KEY). Add it to your .env file to call the Gemini API."
    );
  }

  try {
    // Convert Blob to base64
    const base64Image = await blobToBase64(image);
    const mimeType = getMimeType(image);

    // Prepare the request payload according to Gemini API format
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    const response = await callGeminiApi(apiKey, payload);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(formatGeminiError(response.status, errorText));
    }

    const result = await response.json();

    // Extract image from Gemini response
    // Gemini typically returns images in candidates[0].content.parts array
    const candidates = result.candidates;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      throw new Error("Gemini API returned no candidates in the response.");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("Gemini API response missing content parts.");
    }

    // Find the image part in the response
    // Gemini API returns camelCase (inlineData) not snake_case (inline_data)
    const imagePart = content.parts.find(
      (part: any) => 
        (part.inlineData && part.inlineData.data) || 
        (part.inline_data && part.inline_data.data)
    );

    if (!imagePart) {
      throw new Error("Gemini API response does not contain image data.");
    }

    // Handle both camelCase and snake_case formats
    const inlineData = imagePart.inlineData || imagePart.inline_data;
    if (!inlineData || !inlineData.data) {
      throw new Error("Gemini API response does not contain image data.");
    }

    const imageData = inlineData.data;
    const imageMimeType = inlineData.mimeType || inlineData.mime_type || "image/png";

    // Convert base64 to data URL
    const dataUrl = `data:${imageMimeType};base64,${imageData}`;

    return dataUrl;
  } catch (e) {
    const msg =
      (e instanceof Error && e.message) ||
      "Failed to call Gemini API. Check your VITE_GEMINI_API_KEY and network.";
    throw new Error(msg);
  }
}

