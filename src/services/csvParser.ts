import type { Recipient } from '../types/recipient';

/**
 * Normalize header: trim and lowercase for matching.
 */
function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Map CSV headers to Recipient fields.
 * Accepts:
 * - templateId / template_id / template
 * - recipientName / name / receiver / to
 * - senderName / sender / from / from_name
 * - occasion / event / holiday
 * - message / custom_message / note / text
 */
function mapRowToRecipient(row: Record<string, string>, index: number): Recipient {
  const get = (keys: string[]) => {
    for (const k of keys) {
      const val = row[k];
      if (val != null && String(val).trim() !== '') return String(val).trim();
    }
    return '';
  };

  const templateId = get(['templateid', 'template_id', 'template']);
  const name = get(['recipientname', 'name', 'names', 'recipient', 'receiver', 'to']);
  const sender = get(['sendername', 'sender', 'from', 'from_name', 'sent_by']);
  const occasion = get(['occasion', 'event', 'holiday']);
  const message = get(['message', 'custom_message', 'custom message', 'note', 'text']);
  const tone = get(['tone', 'style', 'mood']) || undefined;

  return {
    id: `recipient-${index}`,
    templateId: templateId || '',
    name: name || `Recipient ${index + 1}`,
    sender: sender || '',
    occasion: occasion || 'Greeting',
    message: message || '',
    tone,
  };
}

/**
 * Parse CSV text into an array of Recipient objects.
 * Uses first row as headers. Supports quoted fields and commas inside quotes.
 *
 * @param csvText - Raw CSV file content
 * @returns Array of Recipient objects
 * @throws Error if CSV is empty or invalid
 */
export function parseCSV(csvText: string): Recipient[] {
  const trimmed = csvText.trim();
  if (!trimmed) {
    throw new Error('CSV file is empty');
  }

  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row');
  }

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' && !inQuotes) || (char === '\n' && !inQuotes)) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headerCells = parseRow(lines[0]);
  const headers = headerCells.map(normalizeHeader);
  const recipients: Recipient[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = cells[j] ?? '';
    });
    recipients.push(mapRowToRecipient(row, i - 1));
  }

  return recipients;
}

/**
 * Read a File (e.g. from drag-and-drop) and parse as CSV.
 */
export function parseCSVFile(file: File): Promise<Recipient[]> {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('Please upload a .csv file'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        resolve(parseCSV(text));
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Failed to parse CSV'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file, 'UTF-8');
  });
}
