/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REACT_APP_BASE_URL?: string;
  readonly VITE_REACT_BACKEND_URL?: string;
  readonly VITE_REAL_WORLD_ENGINE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
