/**
 * Greeting card template definition.
 * Each template defines layout, typography, colors, and background.
 */
export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  textColor: string;
  accentColor: string;
  background: string;
  layout: 'centered' | 'top-left' | 'bottom-right' | 'split';
  thumbnail?: string;
}

/** Template builder canvas orientation */
export type Orientation = 'square' | 'portrait' | 'landscape';

export const ORIENTATION_CANVAS_SIZES: Record<Orientation, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1350, height: 1080 },
};

export const DEFAULT_FONT_FAMILY = 'Playfair Display';

export type TextAlign = 'left' | 'center' | 'right';

export const TEXT_ALIGN_OPTIONS: Array<{ value: TextAlign; label: string }> = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export const PREDEFINED_TEXT_AREA_IDS: Array<{ id: string; label: string }> = [
  { id: 'recipientName', label: 'Recipient Name' },
  { id: 'occasion', label: 'Occasion' },
  { id: 'message', label: 'Message' },
  { id: 'senderName', label: 'Sender Name' },
];

export interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  fontWeight: number;
  fontColor: string;
  maxFontSize: number;
  minFontSize: number;
  textAlign: TextAlign;
  lineHeight: number;
}

export interface TemplateState {
  templateId: string;
  orientation: Orientation | null;
  canvas: { width: number; height: number };
  backgroundImage: string | null;
  backgroundImageData: string | null;
  backgroundImageFile: File | null;
  textAreas: TextArea[];
  selectedTextAreaId: string | null;
}

export type TemplateAction =
  | { type: 'SET_TEMPLATE_ID'; payload: string }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | {
      type: 'SET_BACKGROUND_IMAGE';
      payload: { file: File; filename: string; dataUrl: string };
    }
  | { type: 'CLEAR_BACKGROUND_IMAGE' }
  | { type: 'ADD_TEXT_AREA'; payload: string }
  | { type: 'RESET_TEMPLATE' }
  | { type: 'SELECT_TEXT_AREA'; payload: string | null }
  | { type: 'UPDATE_TEXT_AREA'; payload: { id: string; updates: Partial<TextArea> } }
  | { type: 'DELETE_TEXT_AREA'; payload: string }
  | { type: 'MOVE_TEXT_AREA'; payload: { id: string; x: number; y: number } }
  | {
      type: 'RESIZE_TEXT_AREA';
      payload: { id: string; x: number; y: number; width: number; height: number };
    };

export interface TemplateConfig {
  templateId: string;
  orientation: Orientation;
  canvas: { width: number; height: number };
  backgroundImage: {
    assetId: string;
    url: string;
  };
  textAreas: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontFamily: string;
    fontWeight: number;
    fontColor: string;
    minFontSize: number;
    maxFontSize: number;
    textAlign: TextAlign;
    lineHeight: number;
  }>;
}
