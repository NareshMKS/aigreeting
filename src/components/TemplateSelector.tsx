import type { CardTemplate } from '../types/template';
import { useApp } from '../context/AppContext';

/** Reusable template selector: displays templates as selectable cards. */
export function TemplateSelector() {
  const { templates, selectedTemplate, setSelectedTemplate } = useApp();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Choose a template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            isSelected={selectedTemplate?.id === t.id}
            onSelect={() => setSelectedTemplate(t)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: CardTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const bgStyle =
    template.background.startsWith('http') || template.background.startsWith('/')
      ? { backgroundImage: `url(${template.background})`, backgroundSize: 'cover' as const }
      : { backgroundColor: template.background };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        'text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ' +
        (isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg' : 'border-slate-200 dark:border-slate-600')
      }
    >
      <div className="h-32 w-full" style={bgStyle} />
      <div className="p-4 bg-white dark:bg-slate-800">
        <p className="font-semibold text-slate-800 dark:text-slate-200" style={{ fontFamily: template.fontFamily }}>
          {template.name}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.description}</p>
        {isSelected && (
          <span className="inline-block mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">Selected</span>
        )}
      </div>
    </button>
  );
}
