import { AlertTriangle } from 'lucide-react';
import type { ValidationError } from '@/hooks/useTemplateReducer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ValidationErrorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
}

export function ValidationErrorsModal({ isOpen, onClose, errors }: ValidationErrorsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Validation Failed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Please fix the following issues before exporting:
          </p>
          
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li
                key={index}
                className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                <span className="text-foreground">{error.message}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="toolbar-button">
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
