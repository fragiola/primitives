import angular from "@analogjs/vite-plugin-angular";
import tailwindcss from "@tailwindcss/vite";
import { defaultClientConditions, defineConfig } from "vite";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// the Angular compiler (TypeScript 6.0.x, this app's), zoneless: no zone.js anywhere. The packages
// from their sources (the source export condition): the conformance suite tests the code as it
// is, with no package build first.
export default defineConfig({
    plugins: [angular({ tsconfig: "tsconfig.app.json" }), tailwindcss()],
    resolve: {
        conditions: withSourceCondition(defaultClientConditions),
        dedupe: [
            "@angular/core",
            "@angular/common",
            "@angular/platform-browser",
        ],
    },
});
