import { useState } from 'react';
import { useTemplateReducer, type ValidationError } from '@/hooks/useTemplateReducer';
import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { ConfigPanel } from './ConfigPanel';
import { ExportModal } from './ExportModal';
import { ValidationErrorsModal } from './ValidationErrorsModal';

export function TemplateBuilder() {
  const { state, actions } = useTemplateReducer();
  const [exportJson, setExportJson] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleUpdateTextArea = (id: string, updates: Record<string, unknown>) => {
    if (Object.keys(updates).length === 0) {
      // This is a selection trigger from the list
      actions.selectTextArea(id);
    } else {
      actions.updateTextArea(id, updates);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar
        state={state}
        onUploadImage={actions.setBackgroundImage}
        onResetTemplate={actions.resetTemplate}
        onAddTextArea={actions.addTextArea}
        onExport={setExportJson}
        onValidationErrors={setValidationErrors}
        onSetOrientation={actions.setOrientation}
      />

      <div className="flex-1 flex overflow-hidden">
        <Canvas
          state={state}
          onSelectTextArea={actions.selectTextArea}
          onMoveTextArea={actions.moveTextArea}
          onResizeTextArea={actions.resizeTextArea}
        />

        <ConfigPanel
          state={state}
          onUpdateTextArea={handleUpdateTextArea}
          onDeleteTextArea={actions.deleteTextArea}
          onUpdateTemplateId={actions.setTemplateId}
        />
      </div>

      <ExportModal
        isOpen={!!exportJson}
        onClose={() => setExportJson(null)}
        json={exportJson || ''}
        onUploadedSuccess={actions.resetTemplate}
      />

      <ValidationErrorsModal
        isOpen={validationErrors.length > 0}
        onClose={() => setValidationErrors([])}
        errors={validationErrors}
      />
    </div>
  );
}
