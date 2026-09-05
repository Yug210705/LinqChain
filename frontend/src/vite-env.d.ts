/// <reference types="vite/client" />

// Vite client (src/main.tsx / src/pages) environment typings — kept local so
// the merged Vite app type-checks even when @vitejs/plugin-react is absent.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}