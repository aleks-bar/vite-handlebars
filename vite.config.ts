import {
  getRollupInputFromDirectory,
  setPathForAssetsFiles,
  setPathForChunkJsFiles,
  setPathForEntryJsFiles,
} from "./system/actions";
import { defineConfig, loadEnv } from 'vite';
import { UserConfig } from 'vite';
import { resolve } from "path";
import viteHandlebars from "./system/plugins/vite-handlebars";
import liveReload from 'vite-plugin-live-reload'
import viteRewriteUrlInCss from "./system/plugins/vite-rewrite-url-in-css";

interface EnvFile {
  MODE: "development" | "production"
  PORT: string
  HOST: string
  DOMAIN: string
}
export default defineConfig( ( configEnv ) => {
  const { mode } = configEnv;

  // @ts-ignore
  const env = loadEnv( mode, process.cwd(), '' ) as EnvFile

  const isDev = mode === 'development'

  const userConfig: UserConfig  = {
    plugins: [
      liveReload( resolve(__dirname, 'src') ),
      viteHandlebars({ partialsDir: resolve(__dirname, 'src', 'templates') }),
      viteRewriteUrlInCss({ paths: { '/media': '../../media', '/fonts': '../../fonts' } })
    ],
    base: './',
    server: {
      cors: false,
      strictPort: true,
      port: +env.PORT,
      hmr: true,
      origin: !isDev ? env.DOMAIN : undefined,
      watch: {
        usePolling: true,
      }
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      rollupOptions: {
        input: getRollupInputFromDirectory(resolve(__dirname, 'pages')),
        output: {
          entryFileNames: setPathForEntryJsFiles,
          chunkFileNames: setPathForChunkJsFiles,
          assetFileNames: setPathForAssetsFiles,
        }
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // additionalData: `@import "@common/styles/settings";`,
        },
      },
    },
    resolve: {
      alias: {
        "/src": resolve(process.cwd(), "src"),
        "@common": resolve(__dirname, 'src', 'common'),
        "@layouts": resolve(__dirname, 'src', 'templates', 'layouts'),
        "@sections": resolve(__dirname, 'src', 'templates', 'sections'),
        "@shared": resolve(__dirname, 'src', 'templates', 'shared'),
        "@media": resolve(__dirname, 'public', 'media'),
        "@fonts": resolve(__dirname, 'public', 'fonts'),
        "@jsHelpers": resolve(__dirname, 'src', 'js', 'helpers'),
      },
    },
  }

  if ( isDev ) {
    userConfig.root = 'pages/main'
    userConfig.publicDir = '../../public'
  }

  return userConfig;
});