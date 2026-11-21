import angular from "@analogjs/vite-plugin-angular";
import { defineConfig } from "vite";
import {
    builtSourceMaps,
    guardBuild,
} from "../../../scripts/bundle-guard-vite.ts";

// The bundle guard's app (scripts/check-bundle.ts): the packages from their built entries (the
// Angular package's partial compilation, linked by the plugin), zoneless.
export default defineConfig({
    ...guardBuild(import.meta.dirname),
    plugins: [
        builtSourceMaps(),
        angular({ tsconfig: `${import.meta.dirname}/tsconfig.json` }),
    ],
    resolve: {
        dedupe: [
            "@angular/core",
            "@angular/common",
            "@angular/platform-browser",
        ],
    },
});
