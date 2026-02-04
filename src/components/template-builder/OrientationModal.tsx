import { Square, RectangleVertical, RectangleHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Orientation } from '@/types/template';
import { ORIENTATION_CANVAS_SIZES } from '@/types/template';

interface OrientationModalProps {
  isOpen: boolean;
  onSelect: (orientation: Orientation) => void;
}

const orientations: Array<{
  value: Orientation;
  label: string;
  icon: typeof Square;
  description: string;
}> = [
  {
    value: 'square',
    label: 'Square',
    icon: Square,
    description: `${ORIENTATION_CANVAS_SIZES.square.width} × ${ORIENTATION_CANVAS_SIZES.square.height}`,
  },
  {
    value: 'portrait',
    label: 'Portrait',
    icon: RectangleVertical,
    description: `${ORIENTATION_CANVAS_SIZES.portrait.width} × ${ORIENTATION_CANVAS_SIZES.portrait.height}`,
  },
  {
    value: 'landscape',
    label: 'Landscape',
    icon: RectangleHorizontal,
    description: `${ORIENTATION_CANVAS_SIZES.landscape.width} × ${ORIENTATION_CANVAS_SIZES.landscape.height}`,
  },
];

export function OrientationModal({ isOpen, onSelect }: OrientationModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Select Template Orientation</DialogTitle>
          <DialogDescription>
            Choose an orientation for your template. This will set the canvas size.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {orientations.map((orientation) => {
            const Icon = orientation.icon;
            return (
              <button
                key={orientation.value}
                onClick={() => onSelect(orientation.value)}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors group"
              >
                <Icon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="text-center">
                  <div className="font-medium text-foreground">{orientation.label}</div>
                  <div className="text-xs text-muted-foreground">{orientation.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
