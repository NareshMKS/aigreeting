import { useEffect, useRef } from 'react';
import * as React from 'react';
import { useApp } from './context/AppContext';
import { CSVUploader } from './components/CSVUploader';
import { TemplateDropZone } from './components/TemplateDropZone';
import { RecipientsTable } from './components/RecipientsTable';

/**
 * Single-page app: CSV upload → template upload → table with per-row Generate.
 * Scrolls to the next step after each action; one coherent visual flow.
 */
export default function App() {
  const { recipients, templates, error, previewImageUrl } = useApp();
  const hasCsv = recipients.length > 0;
  const hasTemplate = templates.length > 0;

  const templateSectionRef = useRef<HTMLElement | null>(null);
  const tableSectionRef = useRef<HTMLElement | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasCsv && templateSectionRef.current) {
      setTimeout(() => {
        templateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hasCsv]);

  useEffect(() => {
    if (hasTemplate && tableSectionRef.current) {
      setTimeout(() => {
        tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hasTemplate]);

  useEffect(() => {
    if (previewImageUrl && previewSectionRef.current) {
      setTimeout(() => {
        previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [previewImageUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Greeting Card Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Upload CSV → add a template → generate text per recipient
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-14">
        {/* Show errors near the active step, not at the top */}
        {error && !hasTemplate && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm"
          >
            {error}
          </div>
        )}

        {/* Step 1: CSV */}
        <section
          aria-label="Upload CSV"
          className="scroll-mt-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600/80 shadow-sm overflow-hidden"
          style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
        >
          <div className="px-5 pt-5 pb-1">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Step 1
            </span>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">
              Upload recipient list (CSV)
            </h2>
          </div>
          <div className="p-5 pt-2">
            <CSVUploader />
          </div>
        </section>

        {/* Step 2: Template — appears after CSV, scroll target */}
        {hasCsv && (
          <section
            ref={templateSectionRef}
            aria-label="Upload template"
            className="scroll-mt-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600/80 shadow-sm overflow-hidden"
            style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
          >
            <div className="px-5 pt-5 pb-1">
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Step 2
              </span>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">
                Upload greeting card templates (up to 5)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Use images as card backgrounds. Templates rotate per recipient when you Generate all.
              </p>
            </div>
            <div className="p-5 pt-2">
              <TemplateDropZone />
            </div>
          </section>
        )}

        {/* Step 3: Table — appears after template, scroll target */}
        {hasTemplate && (
          <section
            ref={tableSectionRef}
            aria-label="Recipients and generate"
            className="scroll-mt-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600/80 shadow-sm overflow-hidden"
            style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
          >
            <div className="px-5 pt-5 pb-1">
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Step 3
              </span>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">
                Generate image per recipient
              </h2>
            </div>
            <div className="p-5 pt-2 space-y-6">
              {error && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm"
                >
                  {error}
                </div>
              )}
              <RecipientsTable />
              <GeneratedImagePreview ref={previewSectionRef} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const GeneratedImagePreview = React.forwardRef<HTMLDivElement, {}>((_props, ref) => {
  const { recipients, selectedTemplate } = useApp();

  const generated = recipients.filter((r) => r.generatedImageUrl);
  if (generated.length === 0) return null;

  const handleDownload = async (imageUrl: string, r: typeof generated[number]) => {
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      const templateId = r.usedTemplateId || r.templateId || selectedTemplate?.id || 'template';
      const safeName = (r.name || 'recipient').replace(/[^a-zA-Z0-9]/g, '_');
      const safeOccasion = (r.occasion || 'occasion').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${templateId}_${safeName}_${safeOccasion}.png`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Download failed:', e);
    }
  };

  return (
    <div
      ref={ref}
      className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 p-6 scroll-mt-24"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Generated Images
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {generated.length} image{generated.length !== 1 ? 's' : ''} generated
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {generated.map((r) => (
          <div
            key={r.id}
            className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm"
          >
            <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <img
                src={r.generatedImageUrl!}
                alt={`Generated card for ${r.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 space-y-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {r.name} — {r.occasion}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                templateId: {r.templateId || selectedTemplate?.id || 'template'}
              </p>
              <button
                type="button"
                onClick={() => void handleDownload(r.generatedImageUrl!, r)}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-violet-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

GeneratedImagePreview.displayName = 'GeneratedImagePreview';
