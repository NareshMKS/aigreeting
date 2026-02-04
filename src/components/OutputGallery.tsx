import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CardCanvas } from './CardCanvas';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Displays generated cards in a grid and provides PNG / PDF export.
 */
export function OutputGallery() {
  const { recipients, selectedTemplate } = useApp();
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  if (!selectedTemplate) {
    return (
      <div className="text-slate-500 dark:text-slate-400 text-center py-8">
        No template selected.
      </div>
    );
  }

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  const downloadPNG = async (recipientId: string) => {
    const el = cardRefs.current.get(recipientId);
    if (!el) return;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `card-${recipientId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadAllPNG = async () => {
    for (const r of recipients) {
      await downloadPNG(r.id);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [600, 400] });
    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      const el = cardRefs.current.get(r.id);
      if (!el) continue;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const img = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      pdf.addImage(img, 'PNG', 0, 0, 600, 400);
    }
    pdf.save('greeting-cards.pdf');
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Your greeting cards
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadAllPNG}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Download all as PNG
          </button>
          <button
            type="button"
            onClick={downloadPDF}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Download as PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipients.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800 shadow-lg"
          >
            <div ref={setRef(r.id)} className="bg-white dark:bg-slate-800">
              <CardCanvas
                template={selectedTemplate}
                recipient={r}
                size="export"
              />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
              <span className="font-medium text-slate-700 dark:text-slate-300">{r.name}</span>
              <button
                type="button"
                onClick={() => downloadPNG(r.id)}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Save PNG
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
