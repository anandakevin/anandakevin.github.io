import { defineConfig } from 'vite'
import injectHTML from 'vite-plugin-html-inject'
import { resolve } from 'path'

export default defineConfig({
    root: resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
        }
    },
    server: {
        port: 8080,
        hot: true,
        open: true
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true
    },
    plugins: [injectHTML()]
})