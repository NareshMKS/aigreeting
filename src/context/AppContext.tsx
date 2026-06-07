import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Recipient } from '../types/recipient';
import type { CardTemplate } from '../types/template';
import { parseCSVFile } from '../services/csvParser';
import { generateCardImage } from '../services/cardImageService';

function errorToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const anyErr = err as any;
    if (typeof anyErr.message === 'string') return anyErr.message;
    if (typeof anyErr.error === 'string') return anyErr.error;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return 'Unknown error';
}

export interface AppState {
  recipients: Recipient[];
  selectedTemplate: CardTemplate | null;
  /** Blob of the uploaded template image (used for single-row generation) */
  selectedTemplateBlob: Blob | null;
  /** User-uploaded templates (max 5). Used round-robin in Generate all. */
  templates: CardTemplate[];
  /** Blobs for each template in templates (same length as templates) */
  templateBlobs: Blob[];
  generatingRowIndex: number | null;
  /** True while running \"Generate all\" */
  isBulkGenerating: boolean;
  /** Preview of the last generated image */
  previewImageUrl: string | null;
  previewRecipientName: string | null;
  previewRowIndex: number | null;
  error: string | null;
}

interface AppContextValue extends AppState {
  setRecipients: (r: Recipient[]) => void;
  setSelectedTemplate: (t: CardTemplate | null) => void;
  setSelectedTemplateBlob: (b: Blob | null) => void;
  setTemplates: (t: CardTemplate[]) => void;
  setTemplateBlobs: (b: Blob[]) => void;
  addTemplate: (template: CardTemplate, blob: Blob) => void;
  removeTemplate: (index: number) => void;
  setError: (e: string | null) => void;
  uploadCSV: (file: File) => Promise<void>;
  generateGreetingForRecipient: (index: number) => Promise<void>;
  generateAllGreetings: () => Promise<void>;
  reset: () => void;
}

const initialState: AppState = {
  recipients: [],
  selectedTemplate: null,
  selectedTemplateBlob: null,
  templates: [],
  templateBlobs: [],
  generatingRowIndex: null,
  isBulkGenerating: false,
  previewImageUrl: null,
  previewRecipientName: null,
  previewRowIndex: null,
  error: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  templates: defaultTemplates,
}: {
  children: ReactNode;
  templates: CardTemplate[];
}) {
  const [state, setState] = useState<AppState>({
    ...initialState,
    templates: defaultTemplates,
  });

  const setRecipients = useCallback((recipients: Recipient[]) => {
    setState((s) => ({ ...s, recipients, error: null }));
  }, []);

  const setSelectedTemplate = useCallback((selectedTemplate: CardTemplate | null) => {
    setState((s) => ({ ...s, selectedTemplate, error: null }));
  }, []);

  const setSelectedTemplateBlob = useCallback((selectedTemplateBlob: Blob | null) => {
    setState((s) => ({ ...s, selectedTemplateBlob }));
  }, []);

  const setTemplates = useCallback((templates: CardTemplate[]) => {
    setState((s) => ({ ...s, templates }));
  }, []);

  const setTemplateBlobs = useCallback((templateBlobs: Blob[]) => {
    setState((s) => ({ ...s, templateBlobs }));
  }, []);

  const addTemplate = useCallback((template: CardTemplate, blob: Blob) => {
    setState((s) => {
      if (s.templates.length >= 5) return s;
      return {
        ...s,
        templates: [...s.templates, template],
        templateBlobs: [...s.templateBlobs, blob],
        selectedTemplate: template,
        selectedTemplateBlob: blob,
        error: null,
      };
    });
  }, []);

  const removeTemplate = useCallback((index: number) => {
    setState((s) => {
      if (index < 0 || index >= s.templates.length) return s;
      const templates = s.templates.filter((_, i) => i !== index);
      const templateBlobs = s.templateBlobs.filter((_, i) => i !== index);
      const removedWasSelected = s.selectedTemplate === s.templates[index];
      return {
        ...s,
        templates,
        templateBlobs,
        selectedTemplate: removedWasSelected ? (templates[0] ?? null) : s.selectedTemplate,
        selectedTemplateBlob: removedWasSelected ? (templateBlobs[0] ?? null) : s.selectedTemplateBlob,
      };
    });
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const uploadCSV = useCallback(async (file: File) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const recipients = await parseCSVFile(file);
      setState((s) => ({
        ...s,
        recipients,
        error: null,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error: errorToMessage(e) || 'Invalid CSV',
      }));
    }
  }, []);

  const generateAllGreetings = useCallback(async () => {
    const { recipients, templates, templateBlobs } = state;
    if (!recipients.length) return;
    if (!templates.length || templates.length !== templateBlobs.length) {
      setState((s) => ({
        ...s,
        isBulkGenerating: false,
        generatingRowIndex: null,
        error: 'Please upload at least one template image (up to 5).',
      }));
      return;
    }

    setState((s) => ({
      ...s,
      isBulkGenerating: true,
      generatingRowIndex: 0,
      error: null,
    }));

    for (let i = 0; i < recipients.length; i++) {
      const templateIndex = i % templates.length;
      const template = templates[templateIndex];
      const templateBlob = templateBlobs[templateIndex];
      const r = recipients[i];

      try {
        const imageUrl = await generateCardImage({
          image: templateBlob,
          name: r.name,
          sender: r.sender,
          occasion: r.occasion,
          message: r.message,
        });

        // Update row and preview
        setState((s) => ({
          ...s,
          recipients: s.recipients.map((rec, idx) =>
            idx === i
              ? { ...rec, generatedImageUrl: imageUrl, usedTemplateId: template.id }
              : rec
          ),
          generatingRowIndex: i + 1 < recipients.length ? i + 1 : null,
          previewImageUrl: imageUrl,
          previewRecipientName: r.name,
          previewRowIndex: i,
        }));

        // Auto-download for this row
        const templateId = r.templateId || template.id || 'template';
        const safeName = (r.name || 'recipient').replace(/[^a-zA-Z0-9]/g, '_');
        const safeOcc = (r.occasion || 'occasion').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${templateId}_${safeName}_${safeOcc}.png`;

        try {
          const resp = await fetch(imageUrl);
          const blob = await resp.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Auto-download failed for row', i, e);
        }
      } catch (e) {
        // Stop on first hard failure
        setState((s) => ({
          ...s,
          isBulkGenerating: false,
          generatingRowIndex: null,
          error: errorToMessage(e) || 'Image generation failed',
        }));
        return;
      }
    }

    // Finished all
    setState((s) => ({
      ...s,
      isBulkGenerating: false,
      generatingRowIndex: null,
    }));
  }, [state]);
  const generateGreetingForRecipient = useCallback(async (index: number) => {
    const { recipients, selectedTemplate, selectedTemplateBlob } = state;
    const r = recipients[index];
    const t = selectedTemplate;

    if (!r || !t || !selectedTemplateBlob) {
      setState((s) => ({
        ...s,
        generatingRowIndex: null,
        error: !t || !selectedTemplateBlob ? 'Please upload a template image first.' : s.error,
      }));
      return;
    }

    setState((s) => ({ ...s, generatingRowIndex: index, error: null }));

    try {
      const imageUrl = await generateCardImage({
        image: selectedTemplateBlob,
        name: r.name,
        sender: r.sender,
        occasion: r.occasion,
        message: r.message,
      });

      setState((s) => ({
        ...s,
        recipients: s.recipients.map((rec, i) =>
          i === index
            ? { ...rec, generatedImageUrl: imageUrl, usedTemplateId: t.id }
            : rec
        ),
        generatingRowIndex: null,
        previewImageUrl: imageUrl,
        previewRecipientName: r.name,
        previewRowIndex: index,
      }));
    } catch (e) {
      // Log full error for debugging (keeps UI concise)
      // eslint-disable-next-line no-console
      console.error('Image generation failed:', e);
      setState((s) => ({
        ...s,
        generatingRowIndex: null,
        error: errorToMessage(e) || 'Image generation failed',
      }));
    }
  }, [state]);

  const reset = useCallback(() => {
    setState((s) => ({
      ...initialState,
      templates: s.templates,
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setRecipients,
      setSelectedTemplate,
      setSelectedTemplateBlob,
      setTemplates,
      setTemplateBlobs,
      addTemplate,
      removeTemplate,
      setError,
      uploadCSV,
      generateGreetingForRecipient,
      generateAllGreetings,
      reset,
    }),
    [
      state,
      setRecipients,
      setSelectedTemplate,
      setSelectedTemplateBlob,
      setTemplates,
      setTemplateBlobs,
      addTemplate,
      removeTemplate,
      setError,
      uploadCSV,
      generateGreetingForRecipient,
      generateAllGreetings,
      reset,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
