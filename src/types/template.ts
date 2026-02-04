/**
 * Greeting card template definition.
 * Each template defines layout, typography, colors, and background.
 */
export interface CardTemplate {
  /** Unique template identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description for the selector */
  description: string;
  /** CSS font-family value */
  fontFamily: string;
  /** Primary text color (hex or CSS color) */
  textColor: string;
  /** Accent/secondary color */
  accentColor: string;
  /** Background: CSS color or image URL */
  background: string;
  /** Layout variant for positioning (e.g. 'centered', 'top-left') */
  layout: 'centered' | 'top-left' | 'bottom-right' | 'split';
  /** Preview thumbnail URL or inline style */
  thumbnail?: string;
}
