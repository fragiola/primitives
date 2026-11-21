import angular from "@analogjs/vite-plugin-angular";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { devManifest, examplesResolve, prePaintTheme } from "./vite.shared.ts";

// The Angular embed app of the site export (contract v1.7, §5): `<base>?id=<id>&theme=<name>`
// renders one example on the whole viewport, with no chrome. It is built for
// `<base>/embed/angular/` (`EMBED_BASE`, set by site/export.ts and the e2e config) into
// `EMBED_OUT_DIR` (default `dist`); `site:dev` serves it on `PORT`. The Angular compiler is this
// app's TypeScript 6.0.3, zoneless: no zone.js anywhere.

const base = process.env.EMBED_BASE ?? "/";
const outDir = process.env.EMBED_OUT_DIR;

export default defineConfig(({ command }) => ({
    base,
    plugins: [
        angular({ tsconfig: "tsconfig.app.json" }),
        tailwindcss(),
        prePaintTheme(),
        devManifest("angular", base),
    ],
    resolve: examplesResolve(command, [
        "@angular/core",
        "@angular/common",
        "@angular/platform-browser",
    ]),
    build: outDir ? { outDir, emptyOutDir: true } : {},
    server: { port: Number(process.env.PORT ?? 5195), strictPort: true },
}));
