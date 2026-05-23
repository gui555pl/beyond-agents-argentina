/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL da API backend.
   * - Dev: deixar vazio → cai no proxy do vite.config.ts (localhost:4001).
   * - Prod: setar com a URL pública do backend (ex: https://api.exemplo.com).
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
