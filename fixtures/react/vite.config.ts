import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// The packages from their sources (the source export condition): the conformance suite tests the
// code as it is, with no package build first.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { conditions: withSourceCondition(defaultClientConditions) },
});
