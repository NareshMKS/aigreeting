import { buildGreetingContent, type GreetingContentInput } from './greetingContent';

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load template image.'));
    };
    img.src = url;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

/**
 * Renders greeting text onto a template image in the browser.
 * Free — no API key or billing required.
 */
export async function renderGreetingOnImage(
  image: Blob,
  input: GreetingContentInput
): Promise<string> {
  const img = await loadImageFromBlob(image);
  const { heading, message, closing } = buildGreetingContent(input);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is not supported in this browser.');
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const padding = Math.max(24, Math.round(canvas.width * 0.06));
  const maxTextWidth = canvas.width - padding * 2;
  const centerX = canvas.width / 2;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = Math.max(4, Math.round(canvas.width * 0.008));

  const headingSize = Math.max(28, Math.round(canvas.width * 0.065));
  const messageSize = Math.max(16, Math.round(canvas.width * 0.032));
  const closingSize = Math.max(14, Math.round(canvas.width * 0.026));
  const lineGap = Math.round(messageSize * 0.45);

  ctx.font = `700 ${headingSize}px Georgia, "Times New Roman", serif`;
  const headingLines = wrapText(ctx, heading, maxTextWidth);

  ctx.font = `400 ${messageSize}px Georgia, "Times New Roman", serif`;
  const messageLines = wrapText(ctx, message, maxTextWidth);

  ctx.font = `italic 400 ${closingSize}px Georgia, "Times New Roman", serif`;
  const closingLines = wrapText(ctx, closing, maxTextWidth);

  const totalLines =
    headingLines.length + messageLines.length + closingLines.length;
  const blockHeight =
    headingSize * headingLines.length +
    messageSize * messageLines.length +
    closingSize * closingLines.length +
    lineGap * (totalLines - 1) +
    lineGap * 2;

  let y = (canvas.height - blockHeight) / 2 + headingSize * 0.85;

  const drawLines = (lines: string[], font: string, size: number) => {
    ctx.font = font;
    for (const line of lines) {
      ctx.fillText(line, centerX, y);
      y += size + lineGap;
    }
  };

  drawLines(
    headingLines,
    `700 ${headingSize}px Georgia, "Times New Roman", serif`,
    headingSize
  );
  y += lineGap * 0.5;
  drawLines(
    messageLines,
    `400 ${messageSize}px Georgia, "Times New Roman", serif`,
    messageSize
  );
  y += lineGap * 0.5;
  drawLines(
    closingLines,
    `italic 400 ${closingSize}px Georgia, "Times New Roman", serif`,
    closingSize
  );

  return canvas.toDataURL('image/png');
}
