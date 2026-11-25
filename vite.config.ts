import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildGitHubRepo = (env.VITE_GITHUB_REPO || env.GITHUB_REPO || '').trim();
  const buildGitHubBranch = (env.VITE_GITHUB_BRANCH || env.GITHUB_BRANCH || 'main').trim();
  const buildGitHubPath = (env.VITE_GITHUB_DB_PATH || env.GITHUB_DB_PATH || 'wordfun-database.txt').trim();

  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    define: {
      __BUILD_GITHUB_REPO__: JSON.stringify(buildGitHubRepo),
      __BUILD_GITHUB_BRANCH__: JSON.stringify(buildGitHubBranch),
      __BUILD_GITHUB_DB_PATH__: JSON.stringify(buildGitHubPath),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
