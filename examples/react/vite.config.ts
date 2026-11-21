import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { devManifest, examplesResolve, prePaintTheme } from "./vite.shared.ts";

// The React embed app of the site export (contract v1.7, §5): `<base>?id=<id>&theme=<name>`
// renders one example on the whole viewport, with no chrome. It is built for
// `<base>/embed/react/` (`EMBED_BASE`, set by site/export.ts and the e2e config) into
// `EMBED_OUT_DIR` (default `dist`); `site:dev` serves it on `PORT`.

const base = process.env.EMBED_BASE ?? "/";
const outDir = process.env.EMBED_OUT_DIR;

export default defineConfig(({ command }) => ({
    base,
    plugins: [
        react(),
        tailwindcss(),
        prePaintTheme(),
        devManifest("react", base),
    ],
    resolve: examplesResolve(command, ["react", "react-dom"]),
    build: outDir ? { outDir, emptyOutDir: true } : {},
    server: { port: Number(process.env.PORT ?? 5193), strictPort: true },
}));
