import { Trash2, AlertCircle, Check } from 'lucide-react';
import type { TextArea, TemplateState } from '@/types/template';
import { TEXT_ALIGN_OPTIONS } from '@/types/template';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FontSelector } from './FontSelector';

interface ConfigPanelProps {
  state: TemplateState;
  onUpdateTextArea: (id: string, updates: Partial<TextArea>) => void;
  onDeleteTextArea: (id: string) => void;
  onUpdateTemplateId: (id: string) => void;
}

export function ConfigPanel({
  state,
  onUpdateTextArea,
  onDeleteTextArea,
  onUpdateTemplateId,
}: ConfigPanelProps) {
  const selectedArea = state.textAreas.find((a) => a.id === state.selectedTextAreaId);

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto">
      {/* Template Settings */}
      <div className="panel-section">
        <h3 className="font-semibold text-sm text-foreground mb-3">Template Settings</h3>
        
        <div className="space-y-3">
          <div>
            <Label className="panel-label">Template ID</Label>
            <Input
              value={state.templateId}
              onChange={(e) => onUpdateTemplateId(e.target.value)}
              placeholder="template_01"
              className="h-9"
            />
          </div>

          <div>
            <Label className="panel-label">Orientation</Label>
            <div className="h-9 px-3 rounded-md border border-input bg-muted flex items-center text-sm">
              {state.orientation ? (
                <span className="text-foreground capitalize">{state.orientation}</span>
              ) : (
                <span className="text-muted-foreground">Not selected</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="panel-label">Canvas Width</Label>
              <div className="h-9 px-3 rounded-md border border-input bg-muted flex items-center text-sm text-muted-foreground">
                {state.canvas.width}px
              </div>
            </div>
            <div>
              <Label className="panel-label">Canvas Height</Label>
              <div className="h-9 px-3 rounded-md border border-input bg-muted flex items-center text-sm text-muted-foreground">
                {state.canvas.height}px
              </div>
            </div>
          </div>

          <div>
            <Label className="panel-label">Background</Label>
            <div className="h-9 px-3 rounded-md border border-input bg-muted flex items-center text-sm">
              {state.backgroundImage ? (
                <span className="text-foreground truncate flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  {state.backgroundImage}
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  No image uploaded
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Text Areas List */}
      <div className="panel-section">
        <h3 className="font-semibold text-sm text-foreground mb-3">
          Text Areas ({state.textAreas.length})
        </h3>
        
        {state.textAreas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No text areas defined. Click "Add Text Area" to create one.
          </p>
        ) : (
          <div className="space-y-1">
            {state.textAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => onUpdateTextArea(area.id, {})} // Triggers selection via parent
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  state.selectedTextAreaId === area.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="font-medium truncate">{area.id}</div>
                <div className="text-xs text-muted-foreground">
                  {area.x}, {area.y} · {area.width}×{area.height}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Text Area Config */}
      {selectedArea && (
        <TextAreaConfig
          area={selectedArea}
          onUpdate={(updates) => onUpdateTextArea(selectedArea.id, updates)}
          onDelete={() => onDeleteTextArea(selectedArea.id)}
        />
      )}
    </div>
  );
}

interface TextAreaConfigProps {
  area: TextArea;
  onUpdate: (updates: Partial<TextArea>) => void;
  onDelete: () => void;
}

function TextAreaConfig({ area, onUpdate, onDelete }: TextAreaConfigProps) {
  const handleNumberChange = (field: keyof TextArea, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onUpdate({ [field]: num });
    }
  };

  return (
    <div className="panel-section bg-panel-header">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-foreground">Edit Text Area</h3>
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
          title="Delete text area"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* ID - Read only since we use predefined IDs */}
        <div>
          <Label className="panel-label">ID (Predefined)</Label>
          <div className="h-9 px-3 rounded-md border border-input bg-muted flex items-center text-sm text-foreground font-medium">
            {area.id}
          </div>
        </div>

        {/* Position */}
        <div>
          <Label className="panel-label">Position</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">X</Label>
              <Input
                type="number"
                value={area.x}
                onChange={(e) => handleNumberChange('x', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={area.y}
                onChange={(e) => handleNumberChange('y', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <Label className="panel-label">Size</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Width</Label>
              <Input
                type="number"
                value={area.width}
                onChange={(e) => handleNumberChange('width', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Height</Label>
              <Input
                type="number"
                value={area.height}
                onChange={(e) => handleNumberChange('height', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Font Family */}
        <div>
          <Label className="panel-label">Font Family</Label>
          <FontSelector
            value={area.fontFamily}
            onChange={(fontFamily) => onUpdate({ fontFamily })}
          />
        </div>

        {/* Font Color */}
        <div>
          <Label className="panel-label">Font Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={area.fontColor}
              onChange={(e) => onUpdate({ fontColor: e.target.value })}
              className="w-9 h-9 rounded border border-input cursor-pointer"
            />
            <Input
              value={area.fontColor}
              onChange={(e) => onUpdate({ fontColor: e.target.value })}
              placeholder="#FFFFFF"
              className="h-9 flex-1 uppercase"
            />
          </div>
        </div>

        {/* Font Size Range */}
        <div>
          <Label className="panel-label">Font Size Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                value={area.minFontSize}
                onChange={(e) => handleNumberChange('minFontSize', e.target.value)}
                min={1}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                value={area.maxFontSize}
                onChange={(e) => handleNumberChange('maxFontSize', e.target.value)}
                min={1}
                className="h-8 text-sm"
              />
            </div>
          </div>
          {area.minFontSize > area.maxFontSize && (
            <p className="text-xs text-destructive mt-1">Min must be ≤ Max</p>
          )}
        </div>

        {/* Text Align */}
        <div>
          <Label className="panel-label">Text Alignment</Label>
          <Select value={area.textAlign} onValueChange={(v: TextArea['textAlign']) => onUpdate({ textAlign: v })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEXT_ALIGN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Line Height */}
        <div>
          <Label className="panel-label">Line Height</Label>
          <Input
            type="number"
            step="0.1"
            value={area.lineHeight}
            onChange={(e) => handleNumberChange('lineHeight', e.target.value)}
            min={0.5}
            max={3}
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
}
