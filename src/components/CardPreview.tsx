import { useApp } from '../context/AppContext';
import { CardCanvas } from './CardCanvas';

/** Real-time preview of the greeting card for the current or selected recipient. */
export function CardPreview() {
  const { recipients, selectedTemplate } = useApp();

  if (!selectedTemplate) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 p-12 text-center text-slate-500 dark:text-slate-400">
        Select a template to see a preview.
      </div>
    );
  }

  if (!recipients.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 p-12 text-center text-slate-500 dark:text-slate-400">
        Add recipients to see a preview.
      </div>
    );
  }

  const recipient = recipients[0];

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Preview for: {recipient.name}</p>
      <CardCanvas template={selectedTemplate} recipient={recipient} size="preview" />
    </div>
  );
}
