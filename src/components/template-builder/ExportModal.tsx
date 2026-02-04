import { useState } from 'react';
import { Copy, UploadCloud, X, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  json: string;
  onUploadedSuccess?: () => void;
}

export function ExportModal({ isOpen, onClose, json, onUploadedSuccess }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadTemplate = async () => {
    if (isUploading) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Invalid JSON',
        description: 'Cannot upload because the generated template JSON is not valid.',
      });
      return;
    }

    try {
      setIsUploading(true);
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || res.statusText);
      }

      toast({
        title: 'Template uploaded',
        description: 'Your template has been uploaded successfully.',
      });
      onUploadedSuccess?.();
      onClose();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: e instanceof Error ? e.message : 'Failed to upload template.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Export Template JSON</span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleCopy}
              className="toolbar-button flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              onClick={handleUploadTemplate}
              disabled={isUploading}
              className="toolbar-button-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {isUploading ? 'Uploading...' : 'Upload Template'}
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-muted rounded-lg border border-border">
            <pre className="p-4 text-sm font-mono text-foreground whitespace-pre overflow-x-auto">
              {json}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
