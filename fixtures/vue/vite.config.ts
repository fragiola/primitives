import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defaultClientConditions, defineConfig } from "vite";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// The packages from their sources (the source export condition): the conformance suite tests the
// code as it is, with no package build first.
export default defineConfig({
    plugins: [vue(), tailwindcss()],
    resolve: { conditions: withSourceCondition(defaultClientConditions) },
});
