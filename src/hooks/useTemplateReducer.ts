import { useReducer, useCallback } from 'react';
import type { TemplateState, TemplateAction, TextArea, TemplateConfig, Orientation, DEFAULT_FONT_FAMILY } from '@/types/template';
import { ORIENTATION_CANVAS_SIZES, PREDEFINED_TEXT_AREA_IDS } from '@/types/template';

const DEFAULT_CANVAS = { width: 1080, height: 1080 };

const initialState: TemplateState = {
  templateId: 'template_01',
  orientation: null,
  canvas: DEFAULT_CANVAS,
  backgroundImage: null,
  backgroundImageData: null,
  backgroundImageFile: null,
  textAreas: [],
  selectedTextAreaId: null,
};

function createDefaultTextArea(id: string, canvas: { width: number; height: number }): TextArea {
  return {
    id,
    x: Math.round(canvas.width / 2 - 200),
    y: Math.round(canvas.height / 2 - 50),
    width: 400,
    height: 100,
    fontFamily: 'Playfair Display',
    fontWeight: 400,
    fontColor: '#FFFFFF',
    maxFontSize: 48,
    minFontSize: 16,
    textAlign: 'center',
    lineHeight: 1.2,
  };
}

function clampToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  canvas: { width: number; height: number }
): { x: number; y: number; width: number; height: number } {
  const clampedWidth = Math.min(width, canvas.width);
  const clampedHeight = Math.min(height, canvas.height);
  const clampedX = Math.max(0, Math.min(x, canvas.width - clampedWidth));
  const clampedY = Math.max(0, Math.min(y, canvas.height - clampedHeight));
  
  return {
    x: Math.round(clampedX),
    y: Math.round(clampedY),
    width: Math.round(clampedWidth),
    height: Math.round(clampedHeight),
  };
}

function templateReducer(state: TemplateState, action: TemplateAction): TemplateState {
  switch (action.type) {
    case 'SET_TEMPLATE_ID':
      return { ...state, templateId: action.payload };

    case 'SET_ORIENTATION': {
      const canvas = ORIENTATION_CANVAS_SIZES[action.payload];
      return {
        ...state,
        orientation: action.payload,
        canvas,
        // Clear text areas when orientation changes as they may be out of bounds
        textAreas: [],
        selectedTextAreaId: null,
      };
    }

    case 'SET_BACKGROUND_IMAGE':
      return {
        ...state,
        backgroundImage: action.payload.filename,
        backgroundImageData: action.payload.dataUrl,
        backgroundImageFile: action.payload.file,
      };

    case 'CLEAR_BACKGROUND_IMAGE':
      return {
        ...state,
        backgroundImage: null,
        backgroundImageData: null,
        backgroundImageFile: null,
      };

    case 'ADD_TEXT_AREA': {
      // payload is the predefined id
      const newId = action.payload;
      // Check if this predefined ID already exists
      if (state.textAreas.some(a => a.id === newId)) {
        return state; // Don't add duplicate
      }
      const newTextArea = createDefaultTextArea(newId, state.canvas);
      return {
        ...state,
        textAreas: [...state.textAreas, newTextArea],
        selectedTextAreaId: newId,
      };
    }

    case 'RESET_TEMPLATE':
      return { ...initialState };

    case 'SELECT_TEXT_AREA':
      return { ...state, selectedTextAreaId: action.payload };

    case 'UPDATE_TEXT_AREA':
      return {
        ...state,
        textAreas: state.textAreas.map(area =>
          area.id === action.payload.id
            ? { ...area, ...action.payload.updates }
            : area
        ),
      };

    case 'DELETE_TEXT_AREA':
      return {
        ...state,
        textAreas: state.textAreas.filter(area => area.id !== action.payload),
        selectedTextAreaId:
          state.selectedTextAreaId === action.payload ? null : state.selectedTextAreaId,
      };

    case 'MOVE_TEXT_AREA': {
      const area = state.textAreas.find(a => a.id === action.payload.id);
      if (!area) return state;
      
      const clamped = clampToBounds(
        action.payload.x,
        action.payload.y,
        area.width,
        area.height,
        state.canvas
      );
      
      return {
        ...state,
        textAreas: state.textAreas.map(a =>
          a.id === action.payload.id
            ? { ...a, x: clamped.x, y: clamped.y }
            : a
        ),
      };
    }

    case 'RESIZE_TEXT_AREA': {
      const clamped = clampToBounds(
        action.payload.x,
        action.payload.y,
        action.payload.width,
        action.payload.height,
        state.canvas
      );
      
      return {
        ...state,
        textAreas: state.textAreas.map(a =>
          a.id === action.payload.id
            ? { ...a, ...clamped }
            : a
        ),
      };
    }

    default:
      return state;
  }
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateTemplate(state: TemplateState): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!state.orientation) {
    errors.push({ field: 'orientation', message: 'Orientation must be selected' });
  }

  if (!state.backgroundImage || !state.backgroundImageFile) {
    errors.push({ field: 'backgroundImage', message: 'Background image is required' });
  }

  if (state.textAreas.length === 0) {
    errors.push({ field: 'textAreas', message: 'At least one text area is required' });
  }

  const idSet = new Set<string>();
  state.textAreas.forEach((area, index) => {
    if (!area.id.trim()) {
      errors.push({ field: `textArea_${index}_id`, message: `Text area ${index + 1} must have an ID` });
    } else if (idSet.has(area.id)) {
      errors.push({ field: `textArea_${index}_id`, message: `Duplicate ID: "${area.id}"` });
    } else {
      idSet.add(area.id);
    }

    if (area.minFontSize > area.maxFontSize) {
      errors.push({
        field: `textArea_${index}_fontSize`,
        message: `"${area.id}": minFontSize (${area.minFontSize}) cannot exceed maxFontSize (${area.maxFontSize})`,
      });
    }

    if (area.x < 0 || area.y < 0 || area.x + area.width > state.canvas.width || area.y + area.height > state.canvas.height) {
      errors.push({
        field: `textArea_${index}_bounds`,
        message: `"${area.id}" is outside canvas bounds`,
      });
    }
  });

  return errors;
}

export function exportTemplateJSON(state: TemplateState): TemplateConfig | null {
  const errors = validateTemplate(state);
  if (errors.length > 0) return null;

  // NOTE: backgroundImage is now an uploaded asset (assetId + url),
  // so this function is not used for the final "Save Template" output anymore.
  // It remains here for legacy "export" flows if needed.
  return null;
}

export function useTemplateReducer() {
  const [state, dispatch] = useReducer(templateReducer, initialState);

  const setTemplateId = useCallback((id: string) => {
    dispatch({ type: 'SET_TEMPLATE_ID', payload: id });
  }, []);

  const setOrientation = useCallback((orientation: Orientation) => {
    dispatch({ type: 'SET_ORIENTATION', payload: orientation });
  }, []);

  const setBackgroundImage = useCallback((file: File, filename: string, dataUrl: string) => {
    dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: { file, filename, dataUrl } });
  }, []);

  const resetTemplate = useCallback(() => {
    dispatch({ type: 'RESET_TEMPLATE' });
  }, []);

  const addTextArea = useCallback((predefinedId: string) => {
    dispatch({ type: 'ADD_TEXT_AREA', payload: predefinedId });
  }, []);

  const selectTextArea = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_TEXT_AREA', payload: id });
  }, []);

  const updateTextArea = useCallback((id: string, updates: Partial<TextArea>) => {
    dispatch({ type: 'UPDATE_TEXT_AREA', payload: { id, updates } });
  }, []);

  const deleteTextArea = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEXT_AREA', payload: id });
  }, []);

  const moveTextArea = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_TEXT_AREA', payload: { id, x, y } });
  }, []);

  const resizeTextArea = useCallback((id: string, x: number, y: number, width: number, height: number) => {
    dispatch({ type: 'RESIZE_TEXT_AREA', payload: { id, x, y, width, height } });
  }, []);

  return {
    state,
    actions: {
      setTemplateId,
      setOrientation,
      setBackgroundImage,
      resetTemplate,
      addTextArea,
      selectTextArea,
      updateTextArea,
      deleteTextArea,
      moveTextArea,
      resizeTextArea,
    },
  };
}
