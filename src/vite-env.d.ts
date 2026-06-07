/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_IMAGE_MODE?: 'free' | 'gemini' | 'auto';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
