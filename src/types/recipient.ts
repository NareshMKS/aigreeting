/**
 * Recipient data parsed from CSV upload.
 * Expected CSV columns:
 * - templateId
 * - recipientName (mapped to name)
 * - senderName    (mapped to sender)
 * - message
 * - occasion
 */
export interface Recipient {
  /** Unique id for React keys */
  id: string;
  /** Template id from CSV (templateId column) */
  templateId: string;
  /** Name of the receiver (recipientName column) */
  name: string;
  /** Sender name (senderName / sender column) */
  sender: string;
  /** Occasion (e.g. Birthday, Holiday) */
  occasion: string;
  /** Message / custom text from CSV */
  message: string;
  /** Desired tone for AI (e.g. Formal, Casual) — optional */
  tone?: string;
  /** AI-generated greeting text (filled after generation) */
  generatedGreeting?: string;
  /** URL of generated image for this row (if any) */
  generatedImageUrl?: string;
  /** Template id used when generating this row (set during generate) */
  usedTemplateId?: string;
}
