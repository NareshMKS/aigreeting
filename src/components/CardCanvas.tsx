import type { CardTemplate } from '../types/template';
import type { Recipient } from '../types/recipient';

/**
 * Renders a single greeting card using template styles and recipient data.
 * Used by CardPreview and OutputGallery for consistent layout.
 */
interface CardCanvasProps {
  template: CardTemplate;
  recipient: Recipient;
  greetingText?: string;
  size?: 'preview' | 'export';
  className?: string;
}

export function CardCanvas({
  template,
  recipient,
  greetingText,
  size = 'preview',
  className = '',
}: CardCanvasProps) {
  const text = greetingText ?? recipient.generatedGreeting ?? `Dear ${recipient.name},\n\nWarm wishes.`;
  const isExport = size === 'export';

  const bgStyle =
    template.background.startsWith('http') || template.background.startsWith('/')
      ? { backgroundImage: `url(${template.background})`, backgroundSize: 'cover' as const }
      : { backgroundColor: template.background };

  const layoutClasses = {
    centered: 'items-center justify-center text-center',
    'top-left': 'items-start justify-start text-left p-6',
    'bottom-right': 'items-end justify-end text-right p-6',
    split: 'items-center justify-center text-center p-6',
  }[template.layout];

  const sizeClasses = isExport ? 'w-[600px] min-h-[400px]' : 'w-full min-h-[280px] max-w-md';

  return (
    <div
      className={`rounded-2xl overflow-hidden flex ${layoutClasses} ${sizeClasses} ${className}`}
      style={bgStyle}
      data-card-canvas
    >
      <div
        className="p-6 max-w-[90%]"
        style={{ fontFamily: template.fontFamily, color: template.textColor }}
      >
        <p className="whitespace-pre-line text-lg leading-relaxed">{text}</p>
        {template.accentColor && (
          <p className="mt-4 text-sm opacity-90" style={{ color: template.accentColor }}>
            — Your sender
          </p>
        )}
      </div>
    </div>
  );
}
