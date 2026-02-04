import { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Reusable drag-and-drop CSV uploader.
 * Accepts .csv only, parses via context, shows data preview and errors.
 */
export function CSVUploader() {
  const { uploadCSV, recipients, error, setError } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setError(null);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a .csv file only.');
        return;
      }
      void uploadCSV(file);
    },
    [uploadCSV, setError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a .csv file only.');
        return;
      }
      void uploadCSV(file);
      e.target.value = '';
    },
    [uploadCSV, setError]
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={
          'relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ' +
          (isDragOver ? 'border-violet-500 bg-violet-500/10 scale-[1.01]' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/50 dark:bg-slate-700/20') +
          (error ? ' border-red-400 dark:border-red-500' : '')
        }
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload CSV file"
        />
        <div className="pointer-events-none flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
            <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-medium">
            Drag & drop your CSV here, or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            .csv with name (receiver), sender, occasion, message
          </p>
          <a
            href="/sample-recipients.csv"
            download
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline pointer-events-auto"
          >
            Download sample-recipients.csv
          </a>
        </div>
      </div>

      {recipients.length > 0 && (
        <p className="mt-3 text-sm text-violet-600 dark:text-violet-400 font-medium">
          {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} loaded — go to Step 2 below
        </p>
      )}
    </div>
  );
}
