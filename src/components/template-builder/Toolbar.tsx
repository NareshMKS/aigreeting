import { useRef, useState } from 'react';
import { Upload, Plus, Download, Trash2, ChevronDown, User, Gift, MessageSquare, Pen, Loader2 } from 'lucide-react';
import type { TemplateState, Orientation } from '@/types/template';
import { PREDEFINED_TEXT_AREA_IDS } from '@/types/template';
import { validateTemplate, type ValidationError } from '@/hooks/useTemplateReducer';
import { OrientationModal } from './OrientationModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ToolbarProps {
  state: TemplateState;
  onUploadImage: (file: File, filename: string, dataUrl: string) => void;
  onResetTemplate: () => void;
  onAddTextArea: (predefinedId: string) => void;
  onExport: (json: string) => void;
  onValidationErrors: (errors: ValidationError[]) => void;
  onSetOrientation: (orientation: Orientation) => void;
}

const TEXT_AREA_ICONS: Record<string, React.ReactNode> = {
  recipientName: <User className="w-4 h-4" />,
  occasion: <Gift className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
  senderName: <Pen className="w-4 h-4" />,
};

export function Toolbar({
  state,
  onUploadImage,
  onResetTemplate,
  onAddTextArea,
  onExport,
  onValidationErrors,
  onSetOrientation,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUploadClick = () => {
    if (!state.orientation) {
      // First, select orientation
      setShowOrientationModal(true);
    } else {
      // Orientation already set, proceed to file selection
      fileInputRef.current?.click();
    }
  };

  const handleOrientationSelect = (orientation: Orientation) => {
    onSetOrientation(orientation);
    setShowOrientationModal(false);
    
    // If there was a pending file, process it now
    if (pendingFile) {
      processFile(pendingFile);
      setPendingFile(null);
    } else {
      // Trigger file selection after orientation is set
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUploadImage(file, file.name, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (!state.orientation) {
      // Store file and show orientation picker
      setPendingFile(file);
      setShowOrientationModal(true);
    } else {
      processFile(file);
    }

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleSaveTemplate = async () => {
    if (isSaving) return;
    const errors = validateTemplate(state);
    if (errors.length > 0) {
      onValidationErrors(errors);
      return;
    }

    if (!state.backgroundImageFile) {
      onValidationErrors([{ field: 'backgroundImage', message: 'Background image file is missing' }]);
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('file', state.backgroundImageFile);

      const res = await fetch('/api/templates/assets', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Asset upload failed (${res.status}): ${text || res.statusText}`);
      }

      const asset: { assetId: string; imageUrl: string } = await res.json();

      const output = {
        templateId: state.templateId,
        orientation: state.orientation!,
        canvas: state.canvas,
        backgroundImage: {
          assetId: asset.assetId,
          url: asset.imageUrl,
        },
        textAreas: state.textAreas.map((area) => ({
          id: area.id,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          fontFamily: area.fontFamily,
          fontWeight: area.fontWeight ?? 400,
          fontColor: area.fontColor.toLowerCase(),
          minFontSize: area.minFontSize,
          maxFontSize: area.maxFontSize,
          textAlign: area.textAlign,
          lineHeight: area.lineHeight,
        })),
      };

      onExport(JSON.stringify(output, null, 2));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save template');
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const getOrientationLabel = () => {
    if (!state.orientation) return '';
    return state.orientation.charAt(0).toUpperCase() + state.orientation.slice(1);
  };

  // Get available text area IDs (not already used)
  const availableTextAreaIds = PREDEFINED_TEXT_AREA_IDS.filter(
    (item) => !state.textAreas.some((area) => area.id === item.id)
  );

  return (
    <>
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <button
            onClick={handleUploadClick}
            className="toolbar-button flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>

          {state.backgroundImage && (
            <button
              onClick={onResetTemplate}
              className="toolbar-button flex items-center gap-2 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Clear Template
            </button>
          )}

          <div className="h-6 w-px bg-border mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={!state.orientation || availableTextAreaIds.length === 0}
                className="toolbar-button-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Text Area
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover z-50">
              {availableTextAreaIds.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onAddTextArea(item.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {TEXT_AREA_ICONS[item.id]}
                  {item.label}
                </DropdownMenuItem>
              ))}
              {availableTextAreaIds.length === 0 && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  All text areas added
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {state.orientation && (
            <div className="text-sm text-muted-foreground mr-4">
              {getOrientationLabel()}: {state.canvas.width} × {state.canvas.height}
            </div>
          )}
          
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="toolbar-button-success flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <OrientationModal
        isOpen={showOrientationModal}
        onSelect={handleOrientationSelect}
      />
    </>
  );
}
